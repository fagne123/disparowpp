import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectDB from '@/lib/mongodb/connection'
import { WhatsAppInstance } from '@/lib/mongodb/models'
import { whatsappManager } from '@/lib/whatsapp/manager'
import { evolutionManager } from '@/lib/whatsapp/evolution-manager'

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

    // Get status from Evolution API
    const evolutionStatus = evolutionManager.getInstanceStatus(id)

    if (evolutionStatus) {
      // Update database with Evolution API status
      if (instance.status !== evolutionStatus.status) {
        instance.status = evolutionStatus.status
        if (evolutionStatus.phoneNumber) {
          instance.phoneNumber = evolutionStatus.phoneNumber
        }
        if (evolutionStatus.lastActivity) {
          instance.lastActivity = evolutionStatus.lastActivity
        }
        await instance.save()
      }

      return NextResponse.json({
        status: evolutionStatus.status,
        phoneNumber: evolutionStatus.phoneNumber,
        lastActivity: evolutionStatus.lastActivity
      })
    } else {
      // Return database status if no Evolution instance
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
