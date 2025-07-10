import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { whatsappManager } from '@/lib/whatsapp/manager'
import { messageSender } from '@/lib/whatsapp/message-sender'
import connectDB from '@/lib/mongodb/connection'
import { User, WhatsAppInstance, Campaign } from '@/lib/mongodb/models'

export interface SocketUser {
  id: string
  companyId: string
  role: string
}

export class SocketServer {
  private io: SocketIOServer
  private connectedUsers: Map<string, SocketUser> = new Map()

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXTAUTH_URL 
          : "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    })

    this.setupEventHandlers()
    this.setupWhatsAppEvents()
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Handle user authentication
      socket.on('authenticate', async (data: { userId: string, companyId: string, role: string }) => {
        try {
          // Verify user authentication with MongoDB
          await connectDB()
          const user = await User.findOne({
            _id: data.userId,
            companyId: data.companyId
          }).lean()

          if (!user) {
            socket.emit('auth_error', { message: 'Invalid authentication' })
            return
          }

          // Store user info
          this.connectedUsers.set(socket.id, {
            id: data.userId,
            companyId: data.companyId,
            role: data.role
          })

          // Join company room
          socket.join(`company:${data.companyId}`)

          // Send current instances status
          const instances = whatsappManager.getInstancesByCompany(data.companyId)
          socket.emit('instances_status', instances.map(instance => ({
            id: instance.id,
            status: instance.status,
            qrCode: instance.qrCode,
            lastActivity: instance.lastActivity
          })))

          // Send queue status
          socket.emit('queue_status', messageSender.getQueueStatus())

          socket.emit('authenticated', { success: true })
        } catch (error) {
          socket.emit('auth_error', { message: 'Authentication failed' })
        }
      })

      // Handle WhatsApp instance management
      socket.on('create_instance', async (data: { instanceId: string, name: string }) => {
        const user = this.connectedUsers.get(socket.id)
        if (!user) {
          socket.emit('error', { message: 'Not authenticated' })
          return
        }

        try {
          // Create instance in database
          await connectDB()
          const instance = new WhatsAppInstance({
            _id: data.instanceId,
            companyId: user.companyId,
            name: data.name,
            status: 'disconnected'
          })

          await instance.save()

          // Create WhatsApp client
          await whatsappManager.createInstance(data.instanceId, user.companyId)
          
          socket.emit('instance_created', { instanceId: data.instanceId })
        } catch (error) {
          socket.emit('error', { message: error.toString() })
        }
      })

      socket.on('connect_instance', async (data: { instanceId: string }) => {
        const user = this.connectedUsers.get(socket.id)
        if (!user) {
          socket.emit('error', { message: 'Not authenticated' })
          return
        }

        try {
          await whatsappManager.connectInstance(data.instanceId)
          socket.emit('instance_connecting', { instanceId: data.instanceId })
        } catch (error) {
          socket.emit('error', { message: error.toString() })
        }
      })

      socket.on('disconnect_instance', async (data: { instanceId: string }) => {
        const user = this.connectedUsers.get(socket.id)
        if (!user) {
          socket.emit('error', { message: 'Not authenticated' })
          return
        }

        try {
          await whatsappManager.disconnectInstance(data.instanceId)
          socket.emit('instance_disconnected', { instanceId: data.instanceId })
        } catch (error) {
          socket.emit('error', { message: error.toString() })
        }
      })

      // Handle campaign management
      socket.on('start_campaign', async (data: { campaignId: string }) => {
        const user = this.connectedUsers.get(socket.id)
        if (!user) {
          socket.emit('error', { message: 'Not authenticated' })
          return
        }

        try {
          await messageSender.addCampaignToQueue(data.campaignId)
          socket.emit('campaign_started', { campaignId: data.campaignId })
          
          // Broadcast to company room
          this.io.to(`company:${user.companyId}`).emit('campaign_status_update', {
            campaignId: data.campaignId,
            status: 'running'
          })
        } catch (error) {
          socket.emit('error', { message: error.toString() })
        }
      })

      socket.on('pause_campaign', async (data: { campaignId: string }) => {
        const user = this.connectedUsers.get(socket.id)
        if (!user) {
          socket.emit('error', { message: 'Not authenticated' })
          return
        }

        try {
          // Update campaign status in database
          await connectDB()
          await Campaign.findOneAndUpdate(
            {
              _id: data.campaignId,
              companyId: user.companyId
            },
            { status: 'paused' }
          )

          // Broadcast to company room
          this.io.to(`company:${user.companyId}`).emit('campaign_status_update', {
            campaignId: data.campaignId,
            status: 'paused'
          })
        } catch (error) {
          socket.emit('error', { message: error.toString() })
        }
      })

      // Handle queue management
      socket.on('get_queue_status', () => {
        const status = messageSender.getQueueStatus()
        socket.emit('queue_status', status)
      })

      socket.on('pause_queue', () => {
        const user = this.connectedUsers.get(socket.id)
        if (!user || user.role === 'company_user') {
          socket.emit('error', { message: 'Insufficient permissions' })
          return
        }

        messageSender.pauseProcessing()
        this.io.to(`company:${user.companyId}`).emit('queue_paused')
      })

      socket.on('resume_queue', () => {
        const user = this.connectedUsers.get(socket.id)
        if (!user || user.role === 'company_user') {
          socket.emit('error', { message: 'Insufficient permissions' })
          return
        }

        messageSender.resumeProcessing()
        this.io.to(`company:${user.companyId}`).emit('queue_resumed')
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
        this.connectedUsers.delete(socket.id)
      })
    })
  }

  private setupWhatsAppEvents(): void {
    // Forward WhatsApp events to connected clients
    whatsappManager.on('qr', (data) => {
      this.broadcastToInstance(data.instanceId, 'qr_code', data)
    })

    whatsappManager.on('ready', (data) => {
      this.broadcastToInstance(data.instanceId, 'instance_ready', data)
    })

    whatsappManager.on('disconnected', (data) => {
      this.broadcastToInstance(data.instanceId, 'instance_disconnected', data)
    })

    whatsappManager.on('banned', (data) => {
      this.broadcastToInstance(data.instanceId, 'instance_banned', data)
    })

    whatsappManager.on('auth_failure', (data) => {
      this.broadcastToInstance(data.instanceId, 'auth_failure', data)
    })

    whatsappManager.on('message', (data) => {
      this.broadcastToInstance(data.instanceId, 'message_received', data)
    })
  }

  private async broadcastToInstance(instanceId: string, event: string, data: any): Promise<void> {
    try {
      // Get instance company
      await connectDB()
      const instance = await WhatsAppInstance.findById(instanceId).select('companyId').lean()

      if (!instance) return

      // Broadcast to company room
      this.io.to(`company:${instance.companyId}`).emit(event, data)
    } catch (error) {
      console.error('Failed to broadcast to instance:', error)
    }
  }

  // Public methods for external use
  broadcastToCompany(companyId: string, event: string, data: any): void {
    this.io.to(`company:${companyId}`).emit(event, data)
  }

  broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data)
  }

  getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values())
  }

  getUsersByCompany(companyId: string): SocketUser[] {
    return Array.from(this.connectedUsers.values())
      .filter(user => user.companyId === companyId)
  }
}

let socketServer: SocketServer | null = null

export function initializeSocketServer(httpServer: HTTPServer): SocketServer {
  if (!socketServer) {
    socketServer = new SocketServer(httpServer)
  }
  return socketServer
}

export function getSocketServer(): SocketServer | null {
  return socketServer
}
