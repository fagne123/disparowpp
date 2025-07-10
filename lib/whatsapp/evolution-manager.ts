// Evolution API Manager for WhatsApp connections
import { EventEmitter } from 'events'

interface EvolutionInstance {
  instanceId: string
  companyId: string
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
  phoneNumber?: string
  qrCode?: string
  lastActivity?: Date
  error?: string
}

interface EvolutionConfig {
  instanceId: string
  companyId: string
  webhookUrl?: string
}

class EvolutionAPIManager extends EventEmitter {
  private instances: Map<string, EvolutionInstance> = new Map()
  private apiUrl: string
  private apiKey: string
  private webhookUrl: string

  constructor() {
    super()
    this.apiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080'
    this.apiKey = process.env.EVOLUTION_API_KEY || ''
    this.webhookUrl = process.env.EVOLUTION_WEBHOOK_URL || 'http://localhost:3000/api/webhooks/evolution'

    console.log('🚀 Evolution API Manager initialized')
    console.log(`📡 API URL: ${this.apiUrl}`)
    console.log(`🔗 Webhook URL: ${this.webhookUrl}`)
    console.log(`🔑 API Key: ${this.apiKey ? 'Set' : 'Not set'}`)
    console.log(`🌐 Server Type: ${this.apiUrl.includes('localhost') ? 'Local' : 'External'}`)

    // Validate configuration
    this.validateConfiguration()
  }

  private validateConfiguration(): void {
    if (!this.apiUrl) {
      console.error('❌ EVOLUTION_API_URL not configured')
      return
    }

    if (!this.apiKey) {
      console.error('❌ EVOLUTION_API_KEY not configured')
      return
    }

    // Test if URL is accessible (don't await to avoid blocking constructor)
    this.testConnection().catch(error => {
      console.error('❌ Evolution API connection test failed:', error.message)
    })
  }

  private async testConnection(): Promise<void> {
    try {
      console.log('🔍 Testing Evolution API connection...')

      const response = await fetch(`${this.apiUrl}/instance/fetchInstances`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Evolution API connection successful')
      console.log(`📊 Found ${Array.isArray(data) ? data.length : 0} existing instances`)

    } catch (error) {
      console.error('❌ Evolution API connection failed:', error)
      throw error
    }
  }

  async createInstance(config: EvolutionConfig): Promise<void> {
    const { instanceId, companyId } = config
    
    console.log(`🔧 Creating Evolution instance: ${instanceId}`)

    try {
      // Payload que funcionou no teste
      const payload = {
        instanceName: instanceId,
        integration: "WHATSAPP-BAILEYS",
        qrcode: true,
        webhook: {
          url: this.webhookUrl,
          by_events: true,
          base64: true,
          events: [
            "APPLICATION_STARTUP",
            "QRCODE_UPDATED",
            "CONNECTION_UPDATE",
            "MESSAGES_UPSERT",
            "MESSAGES_UPDATE",
            "SEND_MESSAGE"
          ]
        }
      }

      console.log(`📤 Creating instance with tested payload:`, JSON.stringify(payload, null, 2))

      const response = await fetch(`${this.apiUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Evolution API error: ${response.status} - ${errorText}`)
        throw new Error(`Evolution API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`✅ Evolution instance created:`, data)

      // Save QR Code if available in creation response
      let instanceStatus = 'disconnected'
      if (data.qrcode?.base64) {
        console.log(`📱 QR Code available in creation response for ${instanceId}`)
        instanceStatus = 'connecting'
        this.emit('qrCode', { instanceId, qrCode: data.qrcode.base64 })
      }

      // Store instance info
      this.instances.set(instanceId, {
        instanceId,
        companyId,
        status: instanceStatus,
        lastActivity: new Date(),
        qrCode: data.qrcode?.base64 || null
      })

      this.emit('instanceCreated', { instanceId, companyId, data })

      // Return the data so it can be used by the caller
      return data
    } catch (error) {
      console.error(`❌ Error creating Evolution instance ${instanceId}:`, error)
      throw error
    }
  }

  async connectInstance(instanceId: string): Promise<void> {
    console.log(`🔗 Connecting Evolution instance: ${instanceId}`)

    try {
      // Check if instance exists first
      const statusResponse = await fetch(`${this.apiUrl}/instance/fetchInstances?instanceName=${instanceId}`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey
        }
      })

      let instanceExists = false
      if (statusResponse.ok) {
        const instances = await statusResponse.json()
        instanceExists = Array.isArray(instances) && instances.length > 0
      }

      if (!instanceExists) {
        console.log(`🔧 Instance ${instanceId} doesn't exist, creating it first`)
        await this.createInstance({ instanceId, companyId: 'default' })

        // Wait a bit for instance to be created
        await new Promise(resolve => setTimeout(resolve, 3000))
      }

      // Connect using official Evolution API endpoint
      console.log(`🔗 Connecting to Evolution API: GET /instance/connect/${instanceId}`)
      const connectResponse = await fetch(`${this.apiUrl}/instance/connect/${instanceId}`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey
        }
      })

      if (!connectResponse.ok) {
        const errorText = await connectResponse.text()
        console.error(`❌ Connect failed: ${connectResponse.status} - ${errorText}`)
        throw new Error(`Connect failed: ${connectResponse.status} - ${errorText}`)
      }

      const connectData = await connectResponse.json()
      console.log(`✅ Connect response:`, connectData)

      // Update instance status to connecting
      this.updateInstanceStatus(instanceId, { status: 'connecting' })

      // Start polling for QR code
      console.log(`📱 Starting QR code polling for ${instanceId}`)
      this.pollForQRCode(instanceId)

    } catch (error) {
      console.error(`❌ Error connecting Evolution instance ${instanceId}:`, error)
      this.updateInstanceStatus(instanceId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Connection failed'
      })
      throw error
    }
  }

  async getConnectionState(instanceId: string): Promise<any> {
    console.log(`🔍 Getting connection state for instance: ${instanceId}`)

    try {
      // Using official Evolution API endpoint
      const response = await fetch(`${this.apiUrl}/instance/connectionState/${instanceId}`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey
        }
      })

      if (!response.ok) {
        console.log(`⚠️ Connection state not available for ${instanceId}: ${response.status}`)
        return null
      }

      const data = await response.json()
      console.log(`🔍 Connection state for ${instanceId}:`, data)
      return data
    } catch (error) {
      console.error(`❌ Error getting connection state for ${instanceId}:`, error)
      return null
    }
  }

  async getQRCode(instanceId: string): Promise<string | null> {
    console.log(`📱 Getting QR code for instance: ${instanceId}`)

    // First, check if we have QR code in local cache
    const instance = this.instances.get(instanceId)
    if (instance?.qrCode) {
      console.log(`✅ QR Code found in cache for ${instanceId}`)
      return instance.qrCode
    }

    try {
      // Try QR code endpoint (not in official docs but commonly used)
      const response = await fetch(`${this.apiUrl}/instance/qrcode/${instanceId}`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey
        }
      })

      if (!response.ok) {
        console.log(`⚠️ QR code not ready for ${instanceId}: ${response.status}`)
        return null
      }

      const data = await response.json()
      console.log(`📱 QR code response for ${instanceId}:`, data)

      // A Evolution API pode retornar diferentes formatos
      let qrCodeData = null

      if (data.qrcode) {
        qrCodeData = data.qrcode
      } else if (data.base64) {
        qrCodeData = data.base64
      } else if (data.code) {
        qrCodeData = data.code
      }

      if (qrCodeData) {
        // Garantir que é um data URL válido
        if (!qrCodeData.startsWith('data:image/')) {
          qrCodeData = `data:image/png;base64,${qrCodeData}`
        }

        this.updateInstanceStatus(instanceId, {
          status: 'connecting',
          qrCode: qrCodeData
        })

        this.emit('qrCode', { instanceId, qrCode: qrCodeData })
        console.log(`✅ QR code successfully processed for ${instanceId}`)
        return qrCodeData
      }

      console.log(`⚠️ No QR code data found in response for ${instanceId}`)
      return null
    } catch (error) {
      console.error(`❌ Error getting QR code for ${instanceId}:`, error)
      return null
    }
  }

  async disconnectInstance(instanceId: string): Promise<void> {
    console.log(`🔌 Disconnecting Evolution instance: ${instanceId}`)
    
    try {
      const response = await fetch(`${this.apiUrl}/instance/logout/${instanceId}`, {
        method: 'DELETE',
        headers: {
          'apikey': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`Evolution API disconnect error: ${response.status} ${response.statusText}`)
      }

      this.updateInstanceStatus(instanceId, { 
        status: 'disconnected',
        phoneNumber: undefined,
        qrCode: undefined 
      })

      this.emit('instanceDisconnected', { instanceId })
    } catch (error) {
      console.error(`❌ Error disconnecting Evolution instance ${instanceId}:`, error)
      throw error
    }
  }

  async sendMessage(instanceId: string, to: string, message: string): Promise<any> {
    console.log(`📤 Sending message from ${instanceId} to ${to}`)

    try {
      // Format phone number according to Evolution API documentation
      // Should be: country code + number (ex: 559999999999)
      let formattedNumber = to.replace(/\D/g, '')

      // Add Brazil country code if not present
      if (formattedNumber.length === 11 && !formattedNumber.startsWith('55')) {
        formattedNumber = '55' + formattedNumber
      }

      console.log(`📱 Formatted number: ${to} -> ${formattedNumber}`)

      // Payload according to official Evolution API documentation
      const payload = {
        number: formattedNumber,
        text: message
      }

      const response = await fetch(`${this.apiUrl}/message/sendText/${instanceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Evolution API send error response:`, errorText)
        throw new Error(`Evolution API send message error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`✅ Message sent from ${instanceId}:`, data)

      this.emit('messageSent', { instanceId, to, message, response: data })
      return data
    } catch (error) {
      console.error(`❌ Error sending message from ${instanceId}:`, error)
      throw error
    }
  }

  async deleteInstance(instanceId: string): Promise<void> {
    console.log(`🗑️ Deleting Evolution instance: ${instanceId}`)

    try {
      // First disconnect if connected
      try {
        await this.disconnectInstance(instanceId)
      } catch (error) {
        console.log(`⚠️ Disconnect before delete failed (continuing): ${error}`)
      }

      // Delete the instance completely
      const response = await fetch(`${this.apiUrl}/instance/delete/${instanceId}`, {
        method: 'DELETE',
        headers: {
          'apikey': this.apiKey
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Evolution API delete error: ${response.status} - ${errorText}`)
      }

      // Remove from local storage
      this.instances.delete(instanceId)
      console.log(`✅ Evolution instance ${instanceId} deleted completely`)

      this.emit('instanceDeleted', { instanceId })
    } catch (error) {
      console.error(`❌ Error deleting Evolution instance ${instanceId}:`, error)
      throw error
    }
  }

  getInstanceStatus(instanceId: string): EvolutionInstance | undefined {
    const instance = this.instances.get(instanceId)
    console.log(`📊 Getting status for ${instanceId}:`, instance)
    return instance
  }

  private updateInstanceStatus(instanceId: string, updates: Partial<EvolutionInstance>): void {
    console.log(`🔄 Updating Evolution instance ${instanceId}:`, updates)
    
    const current = this.instances.get(instanceId)
    if (current) {
      const updated = { ...current, ...updates, lastActivity: new Date() }
      this.instances.set(instanceId, updated)
      console.log(`✅ Evolution instance updated:`, updated)
      this.emit('statusUpdate', updated)
    } else {
      console.error(`❌ Evolution instance ${instanceId} not found for update`)
    }
  }

  // Webhook handler for Evolution API events
  async handleWebhook(data: any): Promise<void> {
    console.log('🔔 Evolution webhook received:', JSON.stringify(data, null, 2))

    // Evolution API 2.3.0 pode ter diferentes estruturas de webhook
    const instanceName = data.instance || data.instanceName
    const eventType = data.event || data.type
    const eventData = data.data || data

    if (!instanceName) {
      console.error('❌ No instance name found in webhook data')
      return
    }

    console.log(`🔔 Processing event: ${eventType} for instance: ${instanceName}`)

    switch (eventType) {
      case 'QRCODE_UPDATED':
      case 'qrcode.updated':
        console.log('📱 QR Code updated event received')
        let qrCodeData = eventData.qrcode || eventData.base64 || eventData.code

        if (qrCodeData && !qrCodeData.startsWith('data:image/')) {
          qrCodeData = `data:image/png;base64,${qrCodeData}`
        }

        if (qrCodeData) {
          this.updateInstanceStatus(instanceName, {
            status: 'connecting',
            qrCode: qrCodeData
          })
          this.emit('qrCode', { instanceId: instanceName, qrCode: qrCodeData })
        }
        break

      case 'CONNECTION_UPDATE':
      case 'connection.update':
        console.log('🔗 Connection update event received:', eventData)

        if (eventData.state === 'open' || eventData.status === 'open') {
          const phoneNumber = eventData.number || eventData.phoneNumber
          this.updateInstanceStatus(instanceName, {
            status: 'connected',
            phoneNumber: phoneNumber,
            qrCode: undefined
          })

          // Update database
          await this.updateInstanceInDatabase(instanceName, {
            status: 'connected',
            phoneNumber: phoneNumber,
            qrCode: null
          })

          this.emit('instanceConnected', { instanceId: instanceName, phoneNumber })
          console.log(`✅ Instance ${instanceName} connected with number: ${phoneNumber}`)
        } else if (eventData.state === 'close' || eventData.status === 'close') {
          this.updateInstanceStatus(instanceName, {
            status: 'disconnected',
            phoneNumber: undefined,
            qrCode: undefined
          })

          // Update database
          await this.updateInstanceInDatabase(instanceName, {
            status: 'disconnected',
            phoneNumber: null,
            qrCode: null
          })

          this.emit('instanceDisconnected', { instanceId: instanceName })
          console.log(`❌ Instance ${instanceName} disconnected`)
        }
        break

      case 'MESSAGES_UPSERT':
      case 'messages.upsert':
        console.log('💬 Message received event')
        this.emit('messageReceived', { instanceId: instanceName, message: eventData })
        break

      case 'APPLICATION_STARTUP':
        console.log('🚀 Application startup event')
        this.updateInstanceStatus(instanceName, {
          status: 'connecting'
        })
        break

      default:
        console.log(`🔔 Unhandled Evolution event: ${eventType}`)
        console.log('📋 Event data:', eventData)
    }
  }

  // Update instance in database
  private async updateInstanceInDatabase(instanceId: string, updates: {
    status?: string
    phoneNumber?: string | null
    qrCode?: string | null
  }): Promise<void> {
    try {
      // Dynamic import to avoid circular dependencies
      const { default: connectDB } = await import('@/lib/mongodb/connection')
      const { WhatsAppInstance } = await import('@/lib/mongodb/models')

      await connectDB()

      const updateData: any = {}
      if (updates.status) updateData.status = updates.status
      if (updates.phoneNumber !== undefined) updateData.phoneNumber = updates.phoneNumber
      if (updates.qrCode !== undefined) updateData.qrCode = updates.qrCode
      updateData.lastActivity = new Date()

      const result = await WhatsAppInstance.findByIdAndUpdate(
        instanceId,
        updateData,
        { new: true }
      )

      if (result) {
        console.log(`💾 Database updated for instance ${instanceId}:`, updateData)
      } else {
        console.error(`❌ Instance ${instanceId} not found in database`)
      }
    } catch (error) {
      console.error(`❌ Error updating database for instance ${instanceId}:`, error)
    }
  }

  // Get all instances
  getAllInstances(): EvolutionInstance[] {
    return Array.from(this.instances.values())
  }
}

// Singleton instance
export const evolutionManager = new EvolutionAPIManager()
export type { EvolutionInstance, EvolutionConfig }
