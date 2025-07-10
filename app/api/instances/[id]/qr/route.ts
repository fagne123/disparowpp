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

    if (instance.status !== 'connecting') {
      return NextResponse.json(
        { message: 'Instância não está em processo de conexão' },
        { status: 400 }
      )
    }

    // First, try to get QR code from database
    console.log(`📱 Getting QR code for instance: ${id}`)

    try {
      await connectDB()

      // Check database first
      const instance = await WhatsAppInstance.findById(id)
      if (instance?.qrCode) {
        console.log(`✅ QR Code found in database for ${id}`)
        return NextResponse.json({
          qrCode: instance.qrCode,
          instanceId: id,
          source: 'database'
        })
      }

      // If not in database, try Evolution API
      console.log(`🔍 QR Code not in database, trying Evolution API for ${id}`)
      const qrCode = await evolutionManager.getQRCode(id)

      if (qrCode) {
        console.log(`✅ QR Code found in Evolution API for ${id}`)

        // Save to database for future use
        if (instance) {
          instance.qrCode = qrCode
          await instance.save()
          console.log(`💾 QR Code saved to database for ${id}`)
        }

        return NextResponse.json({
          qrCode: qrCode,
          instanceId: id,
          source: 'evolution-api'
        })
      } else {
        console.log(`⚠️ QR Code not ready for ${id}`)
        return NextResponse.json(
          {
            message: 'QR Code não disponível ainda. Aguarde a conexão ser iniciada.',
            status: instance?.status || 'connecting'
          },
          { status: 404 }
        )
      }
    } catch (error) {
      console.error(`❌ Error getting QR Code for ${id}:`, error)
      return NextResponse.json(
        {
          message: 'Erro ao obter QR Code',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
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
