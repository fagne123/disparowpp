import { whatsappManager } from './client-manager'
import connectDB from '@/lib/mongodb/connection'
import { Campaign, CampaignContact, Contact, WhatsAppInstance } from '@/lib/mongodb/models'

export interface MessageJob {
  id: string
  campaignId: string
  contactId: string
  instanceId: string
  phoneNumber: string
  message: string
  mediaUrl?: string
  priority: number
  scheduledAt: Date
  retryCount: number
  maxRetries: number
}

export interface SendingConfig {
  minDelay: number // minimum delay between messages (seconds)
  maxDelay: number // maximum delay between messages (seconds)
  batchSize: number // messages per batch
  batchDelay: number // delay between batches (minutes)
  maxRetries: number // maximum retry attempts
  dailyLimit: number // maximum messages per instance per day
}

export class MessageSender {
  private queue: MessageJob[] = []
  private isProcessing = false
  private config: SendingConfig
  private dailyCounters: Map<string, number> = new Map()
  private lastResetDate = new Date().toDateString()

  constructor(config?: Partial<SendingConfig>) {
    this.config = {
      minDelay: 30, // 30 seconds
      maxDelay: 300, // 5 minutes
      batchSize: 100, // 100 messages per batch
      batchDelay: 15, // 15 minutes between batches
      maxRetries: 3,
      dailyLimit: 1000, // 1000 messages per instance per day
      ...config
    }

    this.startProcessing()
    this.setupDailyReset()
  }

  async addCampaignToQueue(campaignId: string): Promise<void> {
    await connectDB()

    // Get campaign details
    const campaign = await Campaign.findById(campaignId).lean()
    if (!campaign) {
      throw new Error('Campaign not found')
    }

    // Get campaign contacts
    const campaignContacts = await CampaignContact.find({
      campaignId,
      status: 'pending'
    }).populate('contactId').lean()

    if (!campaignContacts || campaignContacts.length === 0) {
      throw new Error('No pending contacts found for campaign')
    }

    // Get available instances for the company
    const instances = await WhatsAppInstance.find({
      companyId: campaign.companyId,
      status: 'connected'
    }).lean()

    if (!instances || instances.length === 0) {
      throw new Error('No connected instances available')
    }

    // Create message jobs
    const jobs: MessageJob[] = []
    let instanceIndex = 0

    for (const campaignContact of campaignContacts) {
      const contact = campaignContact.contactId as any
      if (!contact) continue

      // Round-robin instance selection
      const instance = instances[instanceIndex % instances.length]
      instanceIndex++

      // Process message template with variables
      const processedMessage = this.processMessageTemplate(
        campaign.messageTemplate,
        contact
      )

      const job: MessageJob = {
        id: `${campaignId}-${campaignContact._id}`,
        campaignId,
        contactId: campaignContact.contactId.toString(),
        instanceId: instance._id.toString(),
        phoneNumber: this.formatPhoneNumber(contact.phoneNumber),
        message: processedMessage,
        mediaUrl: campaign.mediaUrl || undefined,
        priority: 1,
        scheduledAt: new Date(),
        retryCount: 0,
        maxRetries: this.config.maxRetries
      }

      jobs.push(job)
    }

    // Add jobs to queue with smart scheduling
    this.addJobsWithSmartScheduling(jobs)

    // Update campaign status
    await Campaign.findByIdAndUpdate(campaignId, { status: 'running' })
  }

  private addJobsWithSmartScheduling(jobs: MessageJob[]): void {
    const now = new Date()
    let currentTime = now.getTime()

    // Group jobs by instance
    const jobsByInstance = new Map<string, MessageJob[]>()
    for (const job of jobs) {
      if (!jobsByInstance.has(job.instanceId)) {
        jobsByInstance.set(job.instanceId, [])
      }
      jobsByInstance.get(job.instanceId)!.push(job)
    }

    // Schedule jobs with delays
    for (const [instanceId, instanceJobs] of jobsByInstance.entries()) {
      let batchCount = 0
      
      for (let i = 0; i < instanceJobs.length; i++) {
        const job = instanceJobs[i]
        
        // Add random delay between messages
        const delay = this.getRandomDelay()
        currentTime += delay * 1000

        // Add batch delay every batchSize messages
        if (i > 0 && i % this.config.batchSize === 0) {
          currentTime += this.config.batchDelay * 60 * 1000
          batchCount++
        }

        job.scheduledAt = new Date(currentTime)
        this.queue.push(job)
      }
    }

    // Sort queue by scheduled time
    this.queue.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
  }

  private async startProcessing(): Promise<void> {
    if (this.isProcessing) return
    this.isProcessing = true

    while (this.isProcessing) {
      try {
        await this.processNextJob()
        await this.sleep(1000) // Check every second
      } catch (error) {
        console.error('Error processing message queue:', error)
        await this.sleep(5000) // Wait 5 seconds on error
      }
    }
  }

  private async processNextJob(): Promise<void> {
    const now = new Date()
    const job = this.queue.find(j => j.scheduledAt <= now)
    
    if (!job) return

    // Remove job from queue
    this.queue = this.queue.filter(j => j.id !== job.id)

    try {
      // Check daily limit
      if (!this.canSendMessage(job.instanceId)) {
        await this.handleJobFailure(job, 'Daily limit reached')
        return
      }

      // Send message
      await whatsappManager.sendMessage(
        job.instanceId,
        job.phoneNumber,
        job.message,
        job.mediaUrl
      )

      // Update daily counter
      this.incrementDailyCounter(job.instanceId)

      // Mark as sent
      await this.markMessageAsSent(job)

    } catch (error) {
      await this.handleJobFailure(job, error.toString())
    }
  }

  private async markMessageAsSent(job: MessageJob): Promise<void> {
    await connectDB()

    await CampaignContact.findOneAndUpdate(
      {
        campaignId: job.campaignId,
        contactId: job.contactId
      },
      {
        status: 'sent',
        sentAt: new Date(),
        instanceId: job.instanceId
      }
    )
  }

  private async handleJobFailure(job: MessageJob, error: string): Promise<void> {
    await connectDB()

    if (job.retryCount < job.maxRetries) {
      // Retry with exponential backoff
      job.retryCount++
      job.scheduledAt = new Date(Date.now() + Math.pow(2, job.retryCount) * 60000)
      this.queue.push(job)
      this.queue.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
    } else {
      // Mark as failed
      await CampaignContact.findOneAndUpdate(
        {
          campaignId: job.campaignId,
          contactId: job.contactId
        },
        {
          status: 'failed',
          errorMessage: error
        }
      )
    }
  }

  private processMessageTemplate(template: string, contact: any): string {
    let message = template

    // Replace variables
    message = message.replace(/\{\{nome\}\}/g, contact.name || '')
    message = message.replace(/\{\{telefone\}\}/g, contact.phoneNumber || '')
    message = message.replace(/\{\{campo1\}\}/g, contact.customField1 || '')
    message = message.replace(/\{\{campo2\}\}/g, contact.customField2 || '')
    message = message.replace(/\{\{campo3\}\}/g, contact.customField3 || '')
    message = message.replace(/\{\{campo4\}\}/g, contact.customField4 || '')

    return message
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '')
    
    // Add country code if not present
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned
    }

    // Add @c.us suffix for WhatsApp
    return cleaned + '@c.us'
  }

  private getRandomDelay(): number {
    return Math.floor(
      Math.random() * (this.config.maxDelay - this.config.minDelay) + this.config.minDelay
    )
  }

  private canSendMessage(instanceId: string): boolean {
    const count = this.dailyCounters.get(instanceId) || 0
    return count < this.config.dailyLimit
  }

  private incrementDailyCounter(instanceId: string): void {
    const count = this.dailyCounters.get(instanceId) || 0
    this.dailyCounters.set(instanceId, count + 1)
  }

  private setupDailyReset(): void {
    setInterval(() => {
      const today = new Date().toDateString()
      if (today !== this.lastResetDate) {
        this.dailyCounters.clear()
        this.lastResetDate = today
      }
    }, 60000) // Check every minute
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Public methods for queue management
  getQueueStatus(): { total: number; pending: number; processing: boolean } {
    return {
      total: this.queue.length,
      pending: this.queue.filter(j => j.scheduledAt <= new Date()).length,
      processing: this.isProcessing
    }
  }

  pauseProcessing(): void {
    this.isProcessing = false
  }

  resumeProcessing(): void {
    if (!this.isProcessing) {
      this.startProcessing()
    }
  }

  clearQueue(): void {
    this.queue = []
  }

  getDailyStats(): Map<string, number> {
    return new Map(this.dailyCounters)
  }
}

// Singleton instance
export const messageSender = new MessageSender()
