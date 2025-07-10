import { NextRequest, NextResponse } from 'next/server'
import { evolutionManager } from '@/lib/whatsapp/evolution-manager'

export async function POST(request: NextRequest) {
  try {
    const testInstanceId = `test_${Date.now()}`
    
    console.log(`🧪 Testing QR Code creation for: ${testInstanceId}`)
    
    // Test Evolution API directly
    const evolutionData = await evolutionManager.createInstance({
      instanceId: testInstanceId,
      companyId: 'test-company'
    })
    
    console.log(`📋 Raw Evolution data:`, JSON.stringify(evolutionData, null, 2))
    
    const result = {
      success: true,
      testInstanceId,
      evolutionData,
      qrCodeFound: !!evolutionData?.qrcode?.base64,
      qrCodeLength: evolutionData?.qrcode?.base64?.length || 0,
      qrCodePreview: evolutionData?.qrcode?.base64?.substring(0, 100) || null,
      availableKeys: evolutionData ? Object.keys(evolutionData) : [],
      qrcodeKeys: evolutionData?.qrcode ? Object.keys(evolutionData.qrcode) : []
    }
    
    console.log(`🧪 Test result:`, result)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error(`❌ Test QR creation error:`, error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}
