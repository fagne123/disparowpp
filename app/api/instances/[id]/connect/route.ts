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
      console.log(`🚀 Starting WhatsApp connection for instance ${id}`)
      console.log(`📊 WhatsApp Manager instance:`, !!whatsappManager)

      // Create and connect WhatsApp client
      const clientStatus = whatsappManager.getClientStatus(id)
      console.log(`📱 Client status for ${id}:`, clientStatus)

      if (!clientStatus) {
        console.log(`🔧 Creating new WhatsApp client for ${id}`)
        await whatsappManager.createClient({
          instanceId: id,
          companyId: session.user.companyId
        })
        console.log(`✅ WhatsApp client created for ${id}`)

        // Verify client was created
        const newStatus = whatsappManager.getClientStatus(id)
        console.log(`🔍 Status after creation:`, newStatus)
      }

      // Start connection process
      console.log(`🔗 Connecting WhatsApp client for ${id}`)
      await whatsappManager.connectClient(id)
      console.log(`🎉 WhatsApp connection initiated for ${id}`)

      // Verify status after connection attempt
      const finalStatus = whatsappManager.getClientStatus(id)
      console.log(`🏁 Final status:`, finalStatus)

      return NextResponse.json({
        message: 'Processo de conexão iniciado',
        status: 'connecting'
      })
    } catch (whatsappError) {
      // Revert status on error
      instance.status = 'disconnected'
      await instance.save()

      console.error('WhatsApp connection error:', whatsappError)
      return NextResponse.json(
        {
          message: 'Erro ao iniciar conexão WhatsApp',
          error: whatsappError instanceof Error ? whatsappError.message : 'Erro desconhecido'
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
