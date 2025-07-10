import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectDB from '@/lib/mongodb/connection'
import { WhatsAppInstance } from '@/lib/mongodb/models'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { to, message } = await request.json()
    const { id } = await params

    if (!to || !message) {
      return NextResponse.json(
        { message: 'Destinatário e mensagem são obrigatórios' },
        { status: 400 }
      )
    }

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

    if (instance.status !== 'connected') {
      return NextResponse.json(
        { message: 'Instância não está conectada' },
        { status: 400 }
      )
    }

    // Send message via WhatsApp manager
    try {
      const result = await whatsappManager.sendMessage(id, to, message)

      return NextResponse.json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        to,
        content: message,
        timestamp: new Date().toISOString(),
        messageId: result.id?.id
      })
    } catch (error) {
      console.error('Error sending message:', error)
      return NextResponse.json(
        { message: error instanceof Error ? error.message : 'Erro ao enviar mensagem' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
