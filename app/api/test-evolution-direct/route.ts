import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Evolution API directly...')

    // Force reload environment variables
    const apiUrl = process.env.EVOLUTION_API_URL
    const apiKey = process.env.EVOLUTION_API_KEY

    console.log('🔍 Environment variables:')
    console.log(`📡 EVOLUTION_API_URL: ${apiUrl}`)
    console.log(`🔑 EVOLUTION_API_KEY: ${apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 10)}` : 'NOT_SET'}`)
    console.log(`🔑 Full API Key length: ${apiKey ? apiKey.length : 0}`)
    console.log(`🔑 API Key starts with: ${apiKey ? apiKey.substring(0, 5) : 'N/A'}`)
    
    console.log(`📡 API URL: ${apiUrl}`)
    console.log(`🔑 API Key: ${apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT_SET'}`)
    
    if (!apiUrl || !apiKey) {
      return NextResponse.json({
        success: false,
        message: 'Environment variables not configured',
        apiUrl: apiUrl || 'NOT_SET',
        hasApiKey: !!apiKey
      }, { status: 400 })
    }

    const response = await fetch(`${apiUrl}/instance/fetchInstances`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    })

    console.log(`📊 Response status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Evolution API error: ${response.status} - ${errorText}`)
      
      return NextResponse.json({
        success: false,
        message: `Evolution API error: ${response.status}`,
        details: errorText,
        apiUrl,
        hasApiKey: !!apiKey
      }, { status: response.status })
    }

    const data = await response.json()
    console.log(`✅ Found ${Array.isArray(data) ? data.length : 0} instances`)

    return NextResponse.json({
      success: true,
      message: 'Evolution API connection successful',
      instanceCount: Array.isArray(data) ? data.length : 0,
      apiUrl,
      hasApiKey: !!apiKey,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Connection error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
