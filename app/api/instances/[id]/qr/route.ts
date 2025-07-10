import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectDB from '@/lib/mongodb/connection'
import { WhatsAppInstance } from '@/lib/mongodb/models'
import { whatsappManager } from '@/lib/whatsapp/manager'

export async function GET(
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

    if (instance.status !== 'connecting') {
      return NextResponse.json(
        { message: 'Instância não está em processo de conexão' },
        { status: 400 }
      )
    }

    // Get real QR code from WhatsApp manager
    const clientStatus = whatsappManager.getClientStatus(id)
    console.log(`QR request for ${id}, status:`, clientStatus)

    if (clientStatus?.qrCode) {
      console.log(`QR Code found for ${id}`)
      return NextResponse.json({
        qrCode: clientStatus.qrCode,
        instanceId: id
      })
    } else {
      console.log(`QR Code not available for ${id}, current status:`, clientStatus?.status)
      return NextResponse.json(
        {
          message: 'QR Code não disponível ainda. Aguarde a conexão ser iniciada.',
          status: clientStatus?.status || 'unknown'
        },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error fetching QR code:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
