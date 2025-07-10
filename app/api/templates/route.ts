import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectDB from '@/lib/mongodb/connection'
import { MessageTemplate } from '@/lib/mongodb/models'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    // Build query
    const query: any = { companyId: session.user.companyId }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (category) {
      query.category = category
    }
    
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true'
    }

    // Get templates with pagination
    const templates = await MessageTemplate.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count
    const total = await MessageTemplate.countDocuments(query)

    // Get all categories for filters
    const allCategories = await MessageTemplate.distinct('category', { companyId: session.user.companyId })

    return NextResponse.json({
      templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        categories: allCategories
      }
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar templates' },
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

    await connectDB()

    const body = await request.json()
    const { name, content, category, variables, mediaType, mediaUrl, mediaCaption } = body

    // Validate required fields
    if (!name || !content) {
      return NextResponse.json(
        { message: 'Nome e conteúdo são obrigatórios' },
        { status: 400 }
      )
    }

    // Check if template name already exists
    const existingTemplate = await MessageTemplate.findOne({
      companyId: session.user.companyId,
      name: name.trim()
    })

    if (existingTemplate) {
      return NextResponse.json(
        { message: 'Já existe um template com este nome' },
        { status: 409 }
      )
    }

    // Extract variables from content ({{variable}} format)
    const extractedVariables = content.match(/\{\{([^}]+)\}\}/g)?.map((match: string) => 
      match.replace(/[{}]/g, '').trim()
    ) || []

    // Create new template
    const template = new MessageTemplate({
      companyId: session.user.companyId,
      name: name.trim(),
      content: content.trim(),
      category: category?.trim() || 'geral',
      variables: variables || extractedVariables,
      mediaType: mediaType || 'text',
      mediaUrl: mediaUrl?.trim(),
      mediaCaption: mediaCaption?.trim(),
      isActive: true,
      usageCount: 0
    })

    await template.save()

    return NextResponse.json({
      message: 'Template criado com sucesso',
      template
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { message: 'Erro ao criar template' },
      { status: 500 }
    )
  }
}
