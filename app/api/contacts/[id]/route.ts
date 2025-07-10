import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectDB from '@/lib/mongodb/connection'
import { Contact } from '@/lib/mongodb/models'

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

    const contact = await Contact.findOne({
      _id: id,
      companyId: session.user.companyId
    })

    if (!contact) {
      return NextResponse.json(
        { message: 'Contato não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('Error fetching contact:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar contato' },
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
    const { name, phoneNumber, email, tags, customFields, notes, isActive } = body

    // Find contact and verify ownership
    const contact = await Contact.findOne({
      _id: id,
      companyId: session.user.companyId
    })

    if (!contact) {
      return NextResponse.json(
        { message: 'Contato não encontrado' },
        { status: 404 }
      )
    }

    // If phone number is being changed, check for duplicates
    if (phoneNumber && phoneNumber !== contact.phoneNumber) {
      const formattedPhone = phoneNumber.replace(/\D/g, '')
      const existingContact = await Contact.findOne({
        companyId: session.user.companyId,
        phoneNumber: formattedPhone,
        _id: { $ne: id }
      })

      if (existingContact) {
        return NextResponse.json(
          { message: 'Já existe um contato com este telefone' },
          { status: 409 }
        )
      }
      contact.phoneNumber = formattedPhone
    }

    // Update fields
    if (name) contact.name = name.trim()
    if (email !== undefined) contact.email = email?.trim()
    if (tags) contact.tags = tags
    if (customFields) contact.customFields = customFields
    if (notes !== undefined) contact.notes = notes?.trim()
    if (isActive !== undefined) contact.isActive = isActive

    await contact.save()

    return NextResponse.json({
      message: 'Contato atualizado com sucesso',
      contact
    })
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar contato' },
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

    const contact = await Contact.findOneAndDelete({
      _id: id,
      companyId: session.user.companyId
    })

    if (!contact) {
      return NextResponse.json(
        { message: 'Contato não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Contato deletado com sucesso',
      contactId: id
    })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json(
      { message: 'Erro ao deletar contato' },
      { status: 500 }
    )
  }
}
