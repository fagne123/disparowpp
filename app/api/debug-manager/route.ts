import { NextRequest, NextResponse } from 'next/server'
import { whatsappManager } from '@/lib/whatsapp/manager'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Manager API called')
    
    // Get all client statuses
    const allStatuses: any = {}
    
    // Access private properties for debugging (not recommended in production)
    const manager = whatsappManager as any
    
    if (manager.clientStatus) {
      for (const [instanceId, status] of manager.clientStatus.entries()) {
        allStatuses[instanceId] = status
      }
    }
    
    const clientsCount = manager.clients ? manager.clients.size : 0
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      managerExists: !!whatsappManager,
      clientsCount,
      statusesCount: Object.keys(allStatuses).length,
      allStatuses,
      managerType: typeof whatsappManager,
      hasClientStatusMap: !!(manager.clientStatus),
      hasClientsMap: !!(manager.clients)
    }
    
    console.log('🔍 Debug info:', debugInfo)
    
    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error('❌ Debug Manager error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { instanceId } = await request.json()
    
    if (!instanceId) {
      return NextResponse.json({ error: 'instanceId required' }, { status: 400 })
    }
    
    console.log(`🔍 Checking specific instance: ${instanceId}`)
    
    const status = whatsappManager.getClientStatus(instanceId)
    const manager = whatsappManager as any
    const hasClient = manager.clients ? manager.clients.has(instanceId) : false
    
    const result = {
      instanceId,
      status,
      hasClient,
      timestamp: new Date().toISOString()
    }
    
    console.log(`🔍 Instance ${instanceId} debug:`, result)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Debug specific instance error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
