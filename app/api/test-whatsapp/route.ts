import { NextRequest, NextResponse } from 'next/server'
import { Client, LocalAuth } from 'whatsapp-web.js'
import QRCode from 'qrcode'
import path from 'path'

export async function POST(request: NextRequest) {
  console.log('🧪 Starting WhatsApp Web.js test...')
  
  try {
    const testId = `test_${Date.now()}`
    const sessionPath = path.join(process.cwd(), '.wwebjs_auth', `test_${testId}`)
    
    console.log(`📁 Session path: ${sessionPath}`)
    
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: testId,
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
        ],
        timeout: 30000
      }
    })

    let qrCodeGenerated = false
    let qrCodeData = ''
    let clientReady = false
    let errorOccurred = false
    let errorMessage = ''

    // Setup event listeners
    client.on('qr', async (qr) => {
      console.log('🔥 QR Code received in test!')
      try {
        qrCodeData = await QRCode.toDataURL(qr)
        qrCodeGenerated = true
        console.log('✅ QR Code generated successfully in test')
      } catch (error) {
        console.error('❌ Error generating QR in test:', error)
        errorOccurred = true
        errorMessage = `QR generation error: ${error}`
      }
    })

    client.on('ready', () => {
      console.log('✅ Client ready in test!')
      clientReady = true
    })

    client.on('authenticated', () => {
      console.log('✅ Client authenticated in test!')
    })

    client.on('auth_failure', (msg) => {
      console.error('❌ Auth failure in test:', msg)
      errorOccurred = true
      errorMessage = `Auth failure: ${msg}`
    })

    client.on('disconnected', (reason) => {
      console.log('🔌 Client disconnected in test:', reason)
    })

    client.on('loading_screen', (percent, message) => {
      console.log(`📱 Loading: ${percent}% - ${message}`)
    })

    // Initialize client
    console.log('🚀 Initializing WhatsApp client...')
    
    const initPromise = client.initialize()
    
    // Wait for QR code or timeout
    const waitForQR = new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (qrCodeGenerated || clientReady || errorOccurred) {
          clearInterval(checkInterval)
          resolve(true)
        }
      }, 1000)
      
      // Timeout after 45 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!qrCodeGenerated && !clientReady && !errorOccurred) {
          errorOccurred = true
          errorMessage = 'Timeout waiting for QR code (45 seconds)'
        }
        resolve(true)
      }, 45000)
    })

    await Promise.race([initPromise, waitForQR])

    // Cleanup
    try {
      await client.destroy()
      console.log('🧹 Client destroyed')
    } catch (cleanupError) {
      console.error('⚠️ Cleanup error:', cleanupError)
    }

    // Return results
    const result = {
      success: qrCodeGenerated || clientReady,
      qrCodeGenerated,
      clientReady,
      errorOccurred,
      errorMessage,
      qrCodeData: qrCodeGenerated ? qrCodeData : null,
      testId,
      timestamp: new Date().toISOString()
    }

    console.log('🧪 Test completed:', result)

    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 Test failed with exception:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'WhatsApp Web.js Test API',
    usage: 'POST to this endpoint to run a test'
  })
}
