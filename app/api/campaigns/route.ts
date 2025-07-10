import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectDB from '@/lib/mongodb/connection'
import { Campaign } from '@/lib/mongodb/models'

// GET - Listar campanhas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const query: any = { companyId: session.user.companyId }
    if (status) {
      query.status = status
    }

    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    const total = await Campaign.countDocuments(query)

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Criar nova campanha
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const {
      name,
      description,
      messageTemplate,
      mediaUrl,
      mediaType,
      sendConfig,
      scheduledAt,
      settings
    } = body

    // Validações básicas
    if (!name || !messageTemplate) {
      return NextResponse.json(
        { error: 'Nome e mensagem são obrigatórios' },
        { status: 400 }
      )
    }

    if (!sendConfig?.instanceIds || sendConfig.instanceIds.length === 0) {
      return NextResponse.json(
        { error: 'Pelo menos uma instância deve ser selecionada' },
        { status: 400 }
      )
    }

    // Criar campanha
    const campaign = new Campaign({
      companyId: session.user.companyId,
      name: name.trim(),
      description: description?.trim(),
      messageTemplate: messageTemplate.trim(),
      mediaUrl: mediaUrl?.trim(),
      mediaType: mediaType || 'text',
      status: scheduledAt ? 'scheduled' : 'draft',
      sendConfig: {
        delayBetweenMessages: sendConfig.delayBetweenMessages || 5,
        maxMessagesPerInstance: sendConfig.maxMessagesPerInstance || 100,
        instanceIds: sendConfig.instanceIds,
        retryFailedMessages: sendConfig.retryFailedMessages !== false,
        maxRetries: sendConfig.maxRetries || 3
      },
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      stats: {
        totalContacts: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        pending: 0
      },
      settings: {
        personalizeMessage: settings?.personalizeMessage !== false,
        variables: settings?.variables || [],
        blacklistCheck: settings?.blacklistCheck !== false,
        duplicateCheck: settings?.duplicateCheck !== false
      },
      createdBy: session.user.id
    })

    await campaign.save()

    return NextResponse.json(
      {
        message: 'Campanha criada com sucesso',
        campaign: {
          _id: campaign._id.toString(),
          name: campaign.name,
          description: campaign.description,
          status: campaign.status,
          createdAt: campaign.createdAt.toISOString()
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
