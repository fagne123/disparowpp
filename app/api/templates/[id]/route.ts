import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectDB from '@/lib/mongodb/connection'
import { MessageTemplate } from '@/lib/mongodb/models'

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

    const template = await MessageTemplate.findOne({
      _id: id,
      companyId: session.user.companyId
    })

    if (!template) {
      return NextResponse.json(
        { message: 'Template não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar template' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const body = await request.json()
    const { name, content, category, variables, mediaType, mediaUrl, mediaCaption, isActive } = body

    // Find template and verify ownership
    const template = await MessageTemplate.findOne({
      _id: id,
      companyId: session.user.companyId
    })

    if (!template) {
      return NextResponse.json(
        { message: 'Template não encontrado' },
        { status: 404 }
      )
    }

    // If name is being changed, check for duplicates
    if (name && name !== template.name) {
      const existingTemplate = await MessageTemplate.findOne({
        companyId: session.user.companyId,
        name: name.trim(),
        _id: { $ne: id }
      })

      if (existingTemplate) {
        return NextResponse.json(
          { message: 'Já existe um template com este nome' },
          { status: 409 }
        )
      }
      template.name = name.trim()
    }

    // Update fields
    if (content) {
      template.content = content.trim()
      // Re-extract variables from content
      const extractedVariables = content.match(/\{\{([^}]+)\}\}/g)?.map((match: string) => 
        match.replace(/[{}]/g, '').trim()
      ) || []
      template.variables = variables || extractedVariables
    }
    if (category) template.category = category.trim()
    if (mediaType) template.mediaType = mediaType
    if (mediaUrl !== undefined) template.mediaUrl = mediaUrl?.trim()
    if (mediaCaption !== undefined) template.mediaCaption = mediaCaption?.trim()
    if (isActive !== undefined) template.isActive = isActive

    await template.save()

    return NextResponse.json({
      message: 'Template atualizado com sucesso',
      template
    })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar template' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const template = await MessageTemplate.findOneAndDelete({
      _id: id,
      companyId: session.user.companyId
    })

    if (!template) {
      return NextResponse.json(
        { message: 'Template não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Template deletado com sucesso',
      templateId: id
    })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { message: 'Erro ao deletar template' },
      { status: 500 }
    )
  }
}
