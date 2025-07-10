import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectDB from '@/lib/mongodb/connection'
import { WhatsAppInstance, Company } from '@/lib/mongodb/models'
import { evolutionManager } from '@/lib/whatsapp/evolution-manager'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    await connectDB()

    const instances = await WhatsAppInstance.find({
      companyId: session.user.companyId
    }).sort({ createdAt: -1 })

    return NextResponse.json({ instances })
  } catch (error) {
    console.error('Error fetching instances:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: 'Nome da instância é obrigatório' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check company limits
    const company = await Company.findById(session.user.companyId)
    if (!company) {
      return NextResponse.json(
        { message: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    const instanceCount = await WhatsAppInstance.countDocuments({
      companyId: session.user.companyId
    })

    if (instanceCount >= company.maxInstances) {
      return NextResponse.json(
        { message: `Limite de ${company.maxInstances} instâncias atingido` },
        { status: 400 }
      )
    }

    // Check if name already exists for this company
    const existingInstance = await WhatsAppInstance.findOne({
      companyId: session.user.companyId,
      name: name.trim()
    })

    if (existingInstance) {
      return NextResponse.json(
        { message: 'Já existe uma instância com este nome' },
        { status: 400 }
      )
    }

    // Create new instance in database
    const instance = new WhatsAppInstance({
      companyId: session.user.companyId,
      name: name.trim(),
      status: 'disconnected'
    })

    await instance.save()
    console.log(`✅ Instance created in database: ${instance._id}`)

    // Create instance in Evolution API
    try {
      console.log(`🔧 Creating instance in Evolution API: ${instance._id}`)
      const evolutionData = await evolutionManager.createInstance({
        instanceId: instance._id.toString(),
        companyId: session.user.companyId
      })
      console.log(`✅ Instance created in Evolution API: ${instance._id}`)
      console.log(`📋 Evolution data received:`, JSON.stringify(evolutionData, null, 2))

      // Update status and save QR Code if available
      instance.status = 'connecting'

      // Debug QR Code data
      console.log(`🔍 Checking QR Code data...`)
      console.log(`📊 evolutionData exists:`, !!evolutionData)
      console.log(`📊 evolutionData.qrcode exists:`, !!evolutionData?.qrcode)
      console.log(`📊 evolutionData.qrcode.base64 exists:`, !!evolutionData?.qrcode?.base64)

      if (evolutionData?.qrcode?.base64) {
        console.log(`📱 QR Code found! Length: ${evolutionData.qrcode.base64.length}`)
        console.log(`📱 QR Code preview: ${evolutionData.qrcode.base64.substring(0, 50)}...`)

        instance.qrCode = evolutionData.qrcode.base64
        console.log(`💾 QR Code assigned to instance.qrCode`)
        console.log(`🔍 instance.qrCode length: ${instance.qrCode.length}`)
      } else {
        console.log(`⚠️ No QR Code found in Evolution data`)
        console.log(`📋 Available keys in evolutionData:`, evolutionData ? Object.keys(evolutionData) : 'null')
        if (evolutionData?.qrcode) {
          console.log(`📋 Available keys in qrcode:`, Object.keys(evolutionData.qrcode))
        }
      }

      console.log(`💾 Saving instance to database...`)
      await instance.save()
      console.log(`✅ Instance saved successfully`)

    } catch (evolutionError) {
      console.error(`❌ Failed to create instance in Evolution API:`, evolutionError)

      // Update status to disconnected (valid status) but don't delete from database
      instance.status = 'disconnected'
      console.error(`❌ Instance ${instance._id} creation failed in Evolution API`)
      await instance.save()
    }

    return NextResponse.json(
      {
        message: 'Instância criada com sucesso',
        instance: {
          _id: instance._id.toString(),
          name: instance.name,
          status: instance.status,
          createdAt: instance.createdAt.toISOString(),
          // error field removed as it's not in the model
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating instance:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
