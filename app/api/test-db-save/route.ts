import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb/connection'
import { WhatsAppInstance } from '@/lib/mongodb/models'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const testQrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    
    console.log(`🧪 Testing database save with QR Code`)
    console.log(`📱 Test QR Code length: ${testQrCode.length}`)
    
    // Create test instance
    const testInstance = new WhatsAppInstance({
      companyId: 'test-company',
      name: `TestDB_${Date.now()}`,
      status: 'connecting',
      qrCode: testQrCode
    })
    
    console.log(`💾 Saving test instance...`)
    await testInstance.save()
    console.log(`✅ Test instance saved with ID: ${testInstance._id}`)
    
    // Retrieve and verify
    const retrieved = await WhatsAppInstance.findById(testInstance._id)
    console.log(`🔍 Retrieved instance:`, {
      id: retrieved?._id,
      name: retrieved?.name,
      status: retrieved?.status,
      hasQrCode: !!retrieved?.qrCode,
      qrCodeLength: retrieved?.qrCode?.length || 0
    })
    
    const result = {
      success: true,
      testInstanceId: testInstance._id.toString(),
      saved: {
        name: testInstance.name,
        status: testInstance.status,
        qrCodeLength: testInstance.qrCode?.length || 0,
        hasQrCode: !!testInstance.qrCode
      },
      retrieved: {
        name: retrieved?.name,
        status: retrieved?.status,
        qrCodeLength: retrieved?.qrCode?.length || 0,
        hasQrCode: !!retrieved?.qrCode,
        qrCodeMatches: testInstance.qrCode === retrieved?.qrCode
      }
    }
    
    console.log(`🧪 Database test result:`, result)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error(`❌ Database test error:`, error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}
