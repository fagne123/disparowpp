import { NextRequest, NextResponse } from 'next/server'
import { evolutionManager } from '@/lib/whatsapp/evolution-manager'

export async function POST(request: NextRequest) {
  try {
    const { instanceId, action } = await request.json()
    
    if (!instanceId) {
      return NextResponse.json({ error: 'instanceId required' }, { status: 400 })
    }
    
    console.log(`🧪 Testing webhook for instance: ${instanceId}, action: ${action}`)
    
    let webhookData
    
    switch (action) {
      case 'connect':
        webhookData = {
          instance: instanceId,
          event: 'CONNECTION_UPDATE',
          data: {
            state: 'open',
            phoneNumber: '+5511999999999'
          }
        }
        break
        
      case 'disconnect':
        webhookData = {
          instance: instanceId,
          event: 'CONNECTION_UPDATE',
          data: {
            state: 'close'
          }
        }
        break
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
    console.log(`📤 Sending test webhook:`, webhookData)
    
    // Simulate webhook
    await evolutionManager.handleWebhook(webhookData)
    
    return NextResponse.json({
      success: true,
      message: `Webhook ${action} simulated for instance ${instanceId}`,
      webhookData
    })
    
  } catch (error) {
    console.error(`❌ Test webhook error:`, error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
