import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectDB from '@/lib/mongodb/connection'
import { Contact } from '@/lib/mongodb/models'

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
    const tag = searchParams.get('tag') || ''
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    // Build query
    const query: any = { companyId: session.user.companyId }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (tag) {
      query.tags = { $in: [tag] }
    }
    
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true'
    }

    // Get contacts with pagination
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count
    const total = await Contact.countDocuments(query)

    // Get all tags for filters
    const allTags = await Contact.distinct('tags', { companyId: session.user.companyId })

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        tags: allTags
      }
    })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar contatos' },
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
    const { name, phoneNumber, email, tags, customFields, notes } = body

    // Validate required fields
    if (!name || !phoneNumber) {
      return NextResponse.json(
        { message: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Format phone number (remove non-digits)
    const formattedPhone = phoneNumber.replace(/\D/g, '')

    // Check if contact already exists
    const existingContact = await Contact.findOne({
      companyId: session.user.companyId,
      phoneNumber: formattedPhone
    })

    if (existingContact) {
      return NextResponse.json(
        { message: 'Contato com este telefone já existe' },
        { status: 409 }
      )
    }

    // Create new contact
    const contact = new Contact({
      companyId: session.user.companyId,
      name: name.trim(),
      phoneNumber: formattedPhone,
      email: email?.trim(),
      tags: tags || [],
      customFields: customFields || new Map(),
      notes: notes?.trim(),
      isActive: true
    })

    await contact.save()

    return NextResponse.json({
      message: 'Contato criado com sucesso',
      contact
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { message: 'Erro ao criar contato' },
      { status: 500 }
    )
  }
}
