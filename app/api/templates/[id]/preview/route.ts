import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectDB from '@/lib/mongodb/connection'
import { MessageTemplate } from '@/lib/mongodb/models'

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

    const body = await request.json()
    const { variables } = body

    // Find template
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

    // Replace variables in content
    let previewContent = template.content
    
    if (variables && typeof variables === 'object') {
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
        previewContent = previewContent.replace(regex, variables[key] || `{{${key}}}`)
      })
    }

    // Get list of unreplaced variables
    const unreplacedVariables = previewContent.match(/\{\{([^}]+)\}\}/g)?.map((match: string) => 
      match.replace(/[{}]/g, '').trim()
    ) || []

    return NextResponse.json({
      preview: previewContent,
      originalContent: template.content,
      variables: template.variables,
      unreplacedVariables,
      mediaType: template.mediaType,
      mediaUrl: template.mediaUrl,
      mediaCaption: template.mediaCaption
    })
  } catch (error) {
    console.error('Error generating template preview:', error)
    return NextResponse.json(
      { message: 'Erro ao gerar preview do template' },
      { status: 500 }
    )
  }
}

// Preview without saving (for editor)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { content, variables } = body

    if (!content) {
      return NextResponse.json(
        { message: 'Conteúdo é obrigatório' },
        { status: 400 }
      )
    }

    // Replace variables in content
    let previewContent = content
    
    if (variables && typeof variables === 'object') {
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
        previewContent = previewContent.replace(regex, variables[key] || `{{${key}}}`)
      })
    }

    // Extract all variables from content
    const extractedVariables = content.match(/\{\{([^}]+)\}\}/g)?.map((match: string) => 
      match.replace(/[{}]/g, '').trim()
    ) || []

    // Get list of unreplaced variables
    const unreplacedVariables = previewContent.match(/\{\{([^}]+)\}\}/g)?.map((match: string) => 
      match.replace(/[{}]/g, '').trim()
    ) || []

    return NextResponse.json({
      preview: previewContent,
      originalContent: content,
      variables: extractedVariables,
      unreplacedVariables
    })
  } catch (error) {
    console.error('Error generating live preview:', error)
    return NextResponse.json(
      { message: 'Erro ao gerar preview' },
      { status: 500 }
    )
  }
}
