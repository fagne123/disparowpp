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

    // Get real status from WhatsApp manager
    const clientStatus = whatsappManager.getClientStatus(id)

    if (clientStatus) {
      // Update database with real status
      if (instance.status !== clientStatus.status) {
        instance.status = clientStatus.status
        if (clientStatus.phoneNumber) {
          instance.phoneNumber = clientStatus.phoneNumber
        }
        if (clientStatus.lastActivity) {
          instance.lastActivity = clientStatus.lastActivity
        }
        await instance.save()
      }

      return NextResponse.json({
        status: clientStatus.status,
        phoneNumber: clientStatus.phoneNumber,
        lastActivity: clientStatus.lastActivity
      })
    } else {
      // Return database status if no WhatsApp client
      return NextResponse.json({
        status: instance.status,
        phoneNumber: instance.phoneNumber,
        lastActivity: instance.lastActivity
      })
    }
  } catch (error) {
    console.error('Error fetching instance status:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
