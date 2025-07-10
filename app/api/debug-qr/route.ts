import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb/connection'
import { WhatsAppInstance } from '@/lib/mongodb/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Get all instances with their QR codes
    const instances = await WhatsAppInstance.find({}, {
      _id: 1,
      name: 1,
      status: 1,
      qrCode: 1,
      createdAt: 1
    }).sort({ createdAt: -1 }).limit(10)

    const debugInfo = instances.map(instance => ({
      id: instance._id.toString(),
      name: instance.name,
      status: instance.status,
      hasQrCode: !!instance.qrCode,
      qrCodeLength: instance.qrCode ? instance.qrCode.length : 0,
      qrCodePreview: instance.qrCode ? instance.qrCode.substring(0, 50) + '...' : null,
      createdAt: instance.createdAt
    }))

    return NextResponse.json({
      success: true,
      totalInstances: instances.length,
      instances: debugInfo,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Debug QR error:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao obter informações de debug',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
