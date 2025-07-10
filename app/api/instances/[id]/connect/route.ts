import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectDB from '@/lib/mongodb/connection'
import { WhatsAppInstance } from '@/lib/mongodb/models'
import { whatsappManager } from '@/lib/whatsapp/manager'
import { evolutionManager } from '@/lib/whatsapp/evolution-manager'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    // Find instance and verify ownership
    const instance = await WhatsAppInstance.findOne({
      _id: id,
      companyId: session.user.companyId
    })

    if (!instance) {
      return NextResponse.json(
        { message: 'Instância não encontrada' },
        { status: 404 }
      )
    }

    if (instance.status === 'connected') {
      return NextResponse.json(
        { message: 'Instância já está conectada' },
        { status: 400 }
      )
    }

    // Update status to connecting
    instance.status = 'connecting'
    await instance.save()

    try {
      console.log(`🚀 Starting Evolution API 2.3.0 connection for instance ${id}`)

      // Use Evolution API 2.3.0 with WhatsApp Baileys
      await evolutionManager.connectInstance(id)
      console.log(`🎉 Evolution API 2.3.0 connection initiated for ${id}`)

      return NextResponse.json({
        message: 'Conexão iniciada via Evolution API 2.3.0 com WhatsApp Baileys',
        status: 'connecting',
        integration: 'WHATSAPP-BAILEYS'
      })
    } catch (evolutionError) {
      // Revert status on error
      instance.status = 'disconnected'
      await instance.save()

      console.error('Evolution API connection error:', evolutionError)
      return NextResponse.json(
        {
          message: 'Erro ao iniciar conexão Evolution API',
          error: evolutionError instanceof Error ? evolutionError.message : 'Erro desconhecido'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error connecting instance:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
