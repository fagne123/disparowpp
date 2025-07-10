const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { Client, LocalAuth } = require('whatsapp-web.js')
const QRCode = require('qrcode')
const path = require('path')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// WhatsApp Manager implementation
class WhatsAppManager {
  constructor() {
    this.clients = new Map()
    this.clientStatus = new Map()
    this.sessionBasePath = path.join(process.cwd(), '.wwebjs_auth')

    // Ensure session directory exists
    if (!fs.existsSync(this.sessionBasePath)) {
      fs.mkdirSync(this.sessionBasePath, { recursive: true })
    }
  }

  async createClient(instanceId, companyId) {
    if (this.clients.has(instanceId)) {
      throw new Error(`Client ${instanceId} already exists`)
    }

    const sessionPath = path.join(this.sessionBasePath, `session_${instanceId}`)

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
          '--disable-gpu'
        ]
      }
    })

    // Set initial status
    this.clientStatus.set(instanceId, {
      instanceId,
      status: 'disconnected'
    })

    // Store client
    this.clients.set(instanceId, { client, companyId })

    return instanceId
  }

  async connectClient(instanceId, io) {
    const clientData = this.clients.get(instanceId)
    if (!clientData) {
      throw new Error(`Client ${instanceId} not found`)
    }

    const { client, companyId } = clientData

    // Update status
    this.updateStatus(instanceId, { status: 'connecting' })

    // Setup event listeners
    client.on('qr', async (qr) => {
      try {
        const qrCodeDataURL = await QRCode.toDataURL(qr, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })

        this.updateStatus(instanceId, {
          status: 'connecting',
          qrCode: qrCodeDataURL
        })

        io.to(`company:${companyId}`).emit('instance:qr', {
          instanceId,
          qrCode: qrCodeDataURL
        })
      } catch (error) {
        console.error(`Error generating QR code for ${instanceId}:`, error)
      }
    })

    client.on('ready', () => {
      const info = client.info
      this.updateStatus(instanceId, {
        status: 'connected',
        phoneNumber: info?.wid?.user ? `+${info.wid.user}` : undefined,
        lastActivity: new Date(),
        qrCode: undefined
      })

      io.to(`company:${companyId}`).emit('instance:connected', {
        instanceId,
        phoneNumber: info?.wid?.user
      })
    })

    client.on('authenticated', () => {
      console.log(`Client ${instanceId} authenticated`)
    })

    client.on('auth_failure', (msg) => {
      console.error(`Auth failure for ${instanceId}:`, msg)
      this.updateStatus(instanceId, {
        status: 'error',
        error: 'Authentication failed'
      })

      io.to(`company:${companyId}`).emit('instance:auth:failure', {
        instanceId,
        error: msg
      })
    })

    client.on('disconnected', (reason) => {
      console.log(`Client ${instanceId} disconnected:`, reason)
      this.updateStatus(instanceId, {
        status: 'disconnected',
        qrCode: undefined
      })

      io.to(`company:${companyId}`).emit('instance:disconnected', {
        instanceId,
        reason
      })
    })

    // Initialize client
    try {
      await client.initialize()
      return true
    } catch (error) {
      console.error(`Error initializing client ${instanceId}:`, error)
      this.updateStatus(instanceId, {
        status: 'error',
        error: error.message
      })
      throw error
    }
  }

  async disconnectClient(instanceId, io) {
    const clientData = this.clients.get(instanceId)
    if (!clientData) {
      throw new Error(`Client ${instanceId} not found`)
    }

    const { client, companyId } = clientData

    try {
      await client.destroy()
      this.updateStatus(instanceId, {
        status: 'disconnected',
        phoneNumber: undefined,
        qrCode: undefined
      })

      io.to(`company:${companyId}`).emit('instance:disconnected', {
        instanceId
      })

      return true
    } catch (error) {
      console.error(`Error disconnecting client ${instanceId}:`, error)
      throw error
    }
  }

  getClientStatus(instanceId) {
    return this.clientStatus.get(instanceId)
  }

  updateStatus(instanceId, updates) {
    const currentStatus = this.clientStatus.get(instanceId)
    if (currentStatus) {
      const newStatus = { ...currentStatus, ...updates }
      this.clientStatus.set(instanceId, newStatus)
      return newStatus
    }
    return null
  }

  async cleanup() {
    for (const [instanceId, clientData] of this.clients.entries()) {
      try {
        await clientData.client.destroy()
      } catch (error) {
        console.error(`Error destroying client ${instanceId}:`, error)
      }
    }
    this.clients.clear()
    this.clientStatus.clear()
  }
}

// Create WhatsApp manager instance
const whatsappManager = new WhatsAppManager()

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || `http://localhost:${port}`,
      methods: ["GET", "POST"],
      credentials: true
    },
    path: '/api/socket',
    transports: ['websocket', 'polling']
  })

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    // Join company room (simplified for now)
    socket.on('join:company', (data) => {
      const { companyId } = data
      socket.join(`company:${companyId}`)
      console.log(`Socket ${socket.id} joined company:${companyId}`)
    })

    // Instance connection events
    socket.on('instance:connect', async (data) => {
      try {
        const { instanceId, companyId } = data
        console.log(`Connecting instance ${instanceId} for company ${companyId}`)

        // Create client if it doesn't exist
        const status = whatsappManager.getClientStatus(instanceId)
        if (!status) {
          await whatsappManager.createClient(instanceId, companyId)
        }

        // Connect the client
        await whatsappManager.connectClient(instanceId, io)

        socket.emit('instance:connect:success', { instanceId })
      } catch (error) {
        console.error('Instance connect error:', error)
        socket.emit('instance:connect:error', {
          instanceId: data.instanceId,
          error: error.message
        })
      }
    })

    // Instance disconnection events
    socket.on('instance:disconnect', async (data) => {
      try {
        const { instanceId } = data
        console.log(`Disconnecting instance ${instanceId}`)

        await whatsappManager.disconnectClient(instanceId, io)
        socket.emit('instance:disconnect:success', { instanceId })
      } catch (error) {
        console.error('Instance disconnect error:', error)
        socket.emit('instance:disconnect:error', {
          instanceId: data.instanceId,
          error: error.message
        })
      }
    })

    // Get instance status
    socket.on('instance:status:get', (data) => {
      const { instanceId } = data
      const status = whatsappManager.getClientStatus(instanceId)
      socket.emit('instance:status:update', { instanceId, status })
    })

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })

  // Socket.io connection handling only
  // WhatsApp integration will be added later

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully')
    await whatsappManager.cleanup()
    httpServer.close(() => {
      console.log('Server closed')
      process.exit(0)
    })
  })

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully')
    await whatsappManager.cleanup()
    httpServer.close(() => {
      console.log('Server closed')
      process.exit(0)
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log(`> Socket.io server running on /api/socket`)
    })
})
