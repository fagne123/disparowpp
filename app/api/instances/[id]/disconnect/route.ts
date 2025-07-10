import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectDB from '@/lib/mongodb/connection'
import { WhatsAppInstance } from '@/lib/mongodb/models'
import { whatsappManager } from '@/lib/whatsapp/manager'

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

    if (instance.status === 'disconnected') {
      return NextResponse.json(
        { message: 'Instância já está desconectada' },
        { status: 400 }
      )
    }

    try {
      // Check if client exists before trying to disconnect
      const clientStatus = whatsappManager.getClientStatus(id)

      if (clientStatus) {
        console.log(`Disconnecting WhatsApp client for ${id}`)
        await whatsappManager.disconnectClient(id)
        console.log(`WhatsApp client disconnected for ${id}`)
      } else {
        console.log(`No WhatsApp client found for ${id}, updating database only`)
      }

      // Update database status regardless
      instance.status = 'disconnected'
      instance.phoneNumber = undefined
      instance.lastActivity = new Date()
      await instance.save()

      return NextResponse.json({
        message: 'Instância desconectada com sucesso',
        status: 'disconnected'
      })
    } catch (whatsappError) {
      console.error('WhatsApp disconnection error:', whatsappError)

      // Still update database even if WhatsApp disconnect fails
      try {
        instance.status = 'disconnected'
        instance.phoneNumber = undefined
        await instance.save()
      } catch (dbError) {
        console.error('Database update error:', dbError)
      }

      return NextResponse.json(
        {
          message: 'Erro ao desconectar WhatsApp, mas status atualizado',
          error: whatsappError instanceof Error ? whatsappError.message : 'Erro desconhecido'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error disconnecting instance:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
