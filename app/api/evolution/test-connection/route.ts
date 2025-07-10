import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { apiUrl, apiKey } = body

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { message: 'URL da API e API Key são obrigatórios' },
        { status: 400 }
      )
    }

    console.log(`🔍 Testing connection to external Evolution API: ${apiUrl}`)

    // Test basic connection
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    try {
      const response = await fetch(`${apiUrl}/instance/fetchInstances`, {
        method: 'GET',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Evolution API error: ${response.status} - ${errorText}`)
        
        return NextResponse.json({
          success: false,
          message: `Erro HTTP ${response.status}: ${response.statusText}`,
          details: errorText,
          status: response.status
        }, { status: 400 })
      }

      const data = await response.json()
      console.log(`✅ Connection successful, found ${Array.isArray(data) ? data.length : 0} instances`)

      // Test server info endpoint if available
      let serverInfo = null
      try {
        const infoResponse = await fetch(`${apiUrl}/`, {
          method: 'GET',
          headers: {
            'apikey': apiKey,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(5000)
        })
        
        if (infoResponse.ok) {
          serverInfo = await infoResponse.json()
        }
      } catch (infoError) {
        console.log('ℹ️ Server info endpoint not available')
      }

      return NextResponse.json({
        success: true,
        message: 'Conexão estabelecida com sucesso!',
        data: {
          instanceCount: Array.isArray(data) ? data.length : 0,
          serverUrl: apiUrl,
          serverInfo: serverInfo,
          timestamp: new Date().toISOString()
        }
      })

    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          console.error('❌ Connection timeout')
          return NextResponse.json({
            success: false,
            message: 'Timeout: Servidor não respondeu em 15 segundos',
            details: 'Verifique se a URL está correta e o servidor está online'
          }, { status: 408 })
        }
        
        console.error('❌ Connection error:', fetchError.message)
        return NextResponse.json({
          success: false,
          message: 'Erro de conexão',
          details: fetchError.message
        }, { status: 500 })
      }
      
      throw fetchError
    }

  } catch (error) {
    console.error('❌ Test connection error:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    // Return current configuration status
    const apiUrl = process.env.EVOLUTION_API_URL
    const apiKey = process.env.EVOLUTION_API_KEY
    const webhookUrl = process.env.EVOLUTION_WEBHOOK_URL

    return NextResponse.json({
      configured: !!(apiUrl && apiKey),
      apiUrl: apiUrl || null,
      hasApiKey: !!apiKey,
      webhookUrl: webhookUrl || null,
      serverType: apiUrl?.includes('localhost') ? 'local' : 'external'
    })

  } catch (error) {
    console.error('❌ Get configuration error:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao obter configuração'
    }, { status: 500 })
  }
}
