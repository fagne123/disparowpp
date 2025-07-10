import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js'
import QRCode from 'qrcode'
import { EventEmitter } from 'events'
import path from 'path'
import fs from 'fs'

export interface WhatsAppClientConfig {
  instanceId: string
  companyId: string
  sessionPath?: string
}

export interface ClientStatus {
  instanceId: string
  status: 'disconnected' | 'connecting' | 'connected' | 'banned' | 'error'
  phoneNumber?: string
  lastActivity?: Date
  qrCode?: string
  error?: string
}

export class WhatsAppClientManager extends EventEmitter {
  private clients: Map<string, Client> = new Map()
  private clientStatus: Map<string, ClientStatus> = new Map()
  private sessionBasePath: string

  constructor() {
    super()
    this.sessionBasePath = path.join(process.cwd(), '.wwebjs_auth')
    
    // Ensure session directory exists
    if (!fs.existsSync(this.sessionBasePath)) {
      fs.mkdirSync(this.sessionBasePath, { recursive: true })
    }
  }

  async createClient(config: WhatsAppClientConfig): Promise<void> {
    const { instanceId, companyId } = config

    console.log(`Creating WhatsApp client for ${instanceId}`)

    if (this.clients.has(instanceId)) {
      throw new Error(`Client ${instanceId} already exists`)
    }

    const sessionPath = path.join(this.sessionBasePath, `session_${instanceId}`)
    console.log(`Session path for ${instanceId}: ${sessionPath}`)

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: instanceId,
        dataPath: sessionPath
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        timeout: 60000
      }
    })

    // Set initial status
    const initialStatus = {
      instanceId,
      status: 'disconnected' as const
    }
    this.clientStatus.set(instanceId, initialStatus)
    console.log(`Initial status set for ${instanceId}:`, initialStatus)

    // Verify status was set
    const verifyStatus = this.clientStatus.get(instanceId)
    console.log(`✅ Status verification for ${instanceId}:`, verifyStatus)

    if (!verifyStatus) {
      console.error(`❌ CRITICAL: Status not set for ${instanceId}!`)
      throw new Error(`Failed to set initial status for ${instanceId}`)
    }

    // Setup event listeners
    this.setupClientEvents(client, instanceId, companyId)

    // Store client
    this.clients.set(instanceId, client)
    console.log(`Client stored for ${instanceId}`)

    this.emit('clientCreated', { instanceId, companyId })
  }

  private setupClientEvents(client: Client, instanceId: string, companyId: string): void {
    console.log(`Setting up events for client ${instanceId}`)

    // Add all possible events for debugging
    client.on('loading_screen', (percent, message) => {
      console.log(`Loading screen for ${instanceId}: ${percent}% - ${message}`)
    })

    client.on('qr', async (qr) => {
      console.log(`🔥 QR code received for ${instanceId}! QR length: ${qr.length}`)
      try {
        const qrCodeDataURL = await QRCode.toDataURL(qr, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })

        console.log(`✅ QR code generated for ${instanceId}, data URL length: ${qrCodeDataURL.length}`)
        this.updateStatus(instanceId, {
          status: 'connecting',
          qrCode: qrCodeDataURL
        })

        this.emit('qrCode', { instanceId, companyId, qrCode: qrCodeDataURL })
      } catch (error) {
        console.error(`❌ Error generating QR code for ${instanceId}:`, error)
        this.updateStatus(instanceId, {
          status: 'error',
          error: 'Failed to generate QR code'
        })
      }
    })

    client.on('ready', () => {
      console.log(`Client ${instanceId} is ready`)
      const info = client.info
      console.log(`Client info for ${instanceId}:`, info)

      this.updateStatus(instanceId, {
        status: 'connected',
        phoneNumber: info?.wid?.user ? `+${info.wid.user}` : undefined,
        lastActivity: new Date(),
        qrCode: undefined
      })

      this.emit('clientReady', { instanceId, companyId, phoneNumber: info?.wid?.user })
    })

    client.on('authenticated', () => {
      console.log(`Client ${instanceId} authenticated`)
      this.emit('clientAuthenticated', { instanceId, companyId })
    })

    client.on('auth_failure', (msg) => {
      console.error(`Auth failure for ${instanceId}:`, msg)
      this.updateStatus(instanceId, {
        status: 'error',
        error: 'Authentication failed'
      })
      this.emit('authFailure', { instanceId, companyId, error: msg })
    })

    client.on('disconnected', (reason) => {
      console.log(`Client ${instanceId} disconnected:`, reason)
      this.updateStatus(instanceId, {
        status: 'disconnected',
        qrCode: undefined
      })
      this.emit('clientDisconnected', { instanceId, companyId, reason })
    })

    client.on('message', (message) => {
      this.updateStatus(instanceId, {
        lastActivity: new Date()
      })
      this.emit('messageReceived', { instanceId, companyId, message })
    })

    client.on('message_create', (message) => {
      if (message.fromMe) {
        this.updateStatus(instanceId, {
          lastActivity: new Date()
        })
        this.emit('messageSent', { instanceId, companyId, message })
      }
    })
  }

  async connectClient(instanceId: string): Promise<void> {
    console.log(`Connecting client ${instanceId}`)
    const client = this.clients.get(instanceId)
    if (!client) {
      throw new Error(`Client ${instanceId} not found`)
    }

    console.log(`Setting status to connecting for ${instanceId}`)
    this.updateStatus(instanceId, { status: 'connecting' })

    try {
      console.log(`Initializing WhatsApp client for ${instanceId}`)

      // Add timeout to prevent hanging
      const initPromise = client.initialize()
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Initialization timeout after 60 seconds')), 60000)
      })

      await Promise.race([initPromise, timeoutPromise])
      console.log(`WhatsApp client initialized for ${instanceId}`)
    } catch (error) {
      console.error(`Error connecting client ${instanceId}:`, error)
      this.updateStatus(instanceId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Connection failed'
      })
      throw error
    }
  }

  async disconnectClient(instanceId: string): Promise<void> {
    const client = this.clients.get(instanceId)
    if (!client) {
      throw new Error(`Client ${instanceId} not found`)
    }

    try {
      await client.destroy()
      this.updateStatus(instanceId, {
        status: 'disconnected',
        phoneNumber: undefined,
        qrCode: undefined
      })
    } catch (error) {
      console.error(`Error disconnecting client ${instanceId}:`, error)
      throw error
    }
  }

  getClientStatus(instanceId: string): ClientStatus | undefined {
    const status = this.clientStatus.get(instanceId)
    console.log(`Getting client status for ${instanceId}:`, status)
    return status
  }

  getAllClientsStatus(): ClientStatus[] {
    return Array.from(this.clientStatus.values())
  }

  isClientConnected(instanceId: string): boolean {
    const status = this.getClientStatus(instanceId)
    return status?.status === 'connected'
  }

  private updateStatus(instanceId: string, updates: Partial<ClientStatus>): void {
    console.log(`🔄 Updating status for ${instanceId}:`, updates)
    const currentStatus = this.clientStatus.get(instanceId)
    console.log(`📊 Current status for ${instanceId}:`, currentStatus)

    if (currentStatus) {
      const newStatus = { ...currentStatus, ...updates }
      this.clientStatus.set(instanceId, newStatus)
      console.log(`✅ New status set for ${instanceId}:`, newStatus)

      // Verify the status was actually set
      const verifyStatus = this.clientStatus.get(instanceId)
      console.log(`🔍 Status verification after update:`, verifyStatus)

      if (!verifyStatus) {
        console.error(`❌ CRITICAL: Status update failed for ${instanceId}!`)
      }

      this.emit('statusUpdate', newStatus)
    } else {
      console.error(`❌ No current status found for ${instanceId} - creating new status`)

      // Create new status if none exists
      const newStatus = { instanceId, status: 'disconnected' as const, ...updates }
      this.clientStatus.set(instanceId, newStatus)
      console.log(`🆕 Created new status for ${instanceId}:`, newStatus)
    }
  }

  async sendMessage(instanceId: string, to: string, message: string): Promise<any> {
    const client = this.clients.get(instanceId)
    if (!client) {
      throw new Error(`Client ${instanceId} not found`)
    }

    const status = this.getClientStatus(instanceId)
    if (status?.status !== 'connected') {
      throw new Error(`Client ${instanceId} is not connected`)
    }

    try {
      const chatId = to.includes('@') ? to : `${to}@c.us`
      return await client.sendMessage(chatId, message)
    } catch (error) {
      console.error(`Error sending message from ${instanceId}:`, error)
      throw error
    }
  }
}

// Singleton instance
export const whatsappManager = new WhatsAppClientManager()
