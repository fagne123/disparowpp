import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { instanceName } = body

    if (!instanceName) {
      return NextResponse.json({
        success: false,
        message: 'instanceName is required'
      }, { status: 400 })
    }

    console.log('🔧 Testing instance creation...')
    
    const apiUrl = process.env.EVOLUTION_API_URL
    const apiKey = process.env.EVOLUTION_API_KEY
    const webhookUrl = process.env.EVOLUTION_WEBHOOK_URL

    console.log(`📡 API URL: ${apiUrl}`)
    console.log(`🔑 API Key: ${apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT_SET'}`)
    console.log(`🔗 Webhook URL: ${webhookUrl}`)

    if (!apiUrl || !apiKey) {
      return NextResponse.json({
        success: false,
        message: 'Environment variables not configured'
      }, { status: 400 })
    }

    // Test 1: Original payload (what we were using)
    console.log('🧪 Test 1: Original payload format')
    const originalPayload = {
      instanceName: instanceName,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
      webhook: {
        url: webhookUrl,
        by_events: true,
        base64: false,
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

    console.log('📤 Sending payload:', JSON.stringify(originalPayload, null, 2))

    const response1 = await fetch(`${apiUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify(originalPayload)
    })

    console.log(`📊 Response status: ${response1.status}`)
    const responseText1 = await response1.text()
    console.log(`📋 Response body: ${responseText1}`)

    if (response1.ok) {
      return NextResponse.json({
        success: true,
        message: 'Instance created successfully with original payload',
        payload: originalPayload,
        response: JSON.parse(responseText1)
      })
    }

    // Test 2: Minimal payload (documentation format)
    console.log('🧪 Test 2: Minimal payload format')
    const minimalPayload = {
      instanceName: instanceName + '_minimal',
      integration: "WHATSAPP-BAILEYS",
      qrcode: true
    }

    console.log('📤 Sending minimal payload:', JSON.stringify(minimalPayload, null, 2))

    const response2 = await fetch(`${apiUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify(minimalPayload)
    })

    console.log(`📊 Minimal response status: ${response2.status}`)
    const responseText2 = await response2.text()
    console.log(`📋 Minimal response body: ${responseText2}`)

    if (response2.ok) {
      return NextResponse.json({
        success: true,
        message: 'Instance created successfully with minimal payload',
        payload: minimalPayload,
        response: JSON.parse(responseText2)
      })
    }

    // Test 3: Check existing instances to see format
    console.log('🧪 Test 3: Checking existing instances format')
    const listResponse = await fetch(`${apiUrl}/instance/fetchInstances`, {
      method: 'GET',
      headers: {
        'apikey': apiKey
      }
    })

    if (listResponse.ok) {
      const instances = await listResponse.json()
      console.log(`📋 Found ${instances.length} existing instances`)
      if (instances.length > 0) {
        console.log('📋 First instance structure:', JSON.stringify(instances[0], null, 2))
      }
    }

    return NextResponse.json({
      success: false,
      message: 'Both payload formats failed',
      originalError: responseText1,
      minimalError: responseText2,
      originalStatus: response1.status,
      minimalStatus: response2.status
    }, { status: 400 })

  } catch (error) {
    console.error('❌ Test create instance error:', error)
    return NextResponse.json({
      success: false,
      message: 'Connection error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
