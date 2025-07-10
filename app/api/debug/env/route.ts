import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: NextRequest) {
  try {
    // Remove authentication for debugging
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    // }

    // Debug environment variables
    const envDebug = {
      EVOLUTION_API_URL: process.env.EVOLUTION_API_URL || 'NOT_SET',
      EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY ? 
        `${process.env.EVOLUTION_API_KEY.substring(0, 10)}...` : 'NOT_SET',
      EVOLUTION_WEBHOOK_URL: process.env.EVOLUTION_WEBHOOK_URL || 'NOT_SET',
      EVOLUTION_WEBHOOK_TOKEN: process.env.EVOLUTION_WEBHOOK_TOKEN ? 'SET' : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
    }

    console.log('🔍 Environment Debug:', envDebug)

    return NextResponse.json({
      success: true,
      environment: envDebug,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Debug env error:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao obter variáveis de ambiente'
    }, { status: 500 })
  }
}
