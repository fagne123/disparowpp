import { NextRequest, NextResponse } from 'next/server'
import { evolutionManager } from '@/lib/whatsapp/evolution-manager'

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Evolution webhook received')
    
    // Verify webhook token if configured
    const webhookToken = process.env.EVOLUTION_WEBHOOK_TOKEN
    if (webhookToken) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader || authHeader !== `Bearer ${webhookToken}`) {
        console.error('❌ Invalid webhook token')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const data = await request.json()
    console.log('🔔 Webhook data:', JSON.stringify(data, null, 2))

    // Handle the webhook event
    await evolutionManager.handleWebhook(data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Evolution API Webhook Endpoint',
    status: 'active',
    timestamp: new Date().toISOString()
  })
}
