import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectDB from '@/lib/mongodb/connection'
import { WhatsAppInstance, Company } from '@/lib/mongodb/models'

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

    // Create new instance
    const instance = new WhatsAppInstance({
      companyId: session.user.companyId,
      name: name.trim(),
      status: 'disconnected'
    })

    await instance.save()

    return NextResponse.json(
      { 
        message: 'Instância criada com sucesso',
        instance: {
          _id: instance._id.toString(),
          name: instance.name,
          status: instance.status,
          createdAt: instance.createdAt.toISOString()
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
