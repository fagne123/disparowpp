import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectDB from '@/lib/mongodb/connection'
import { Contact } from '@/lib/mongodb/models'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { contacts, skipDuplicates = true } = body

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json(
        { message: 'Lista de contatos é obrigatória' },
        { status: 400 }
      )
    }

    const results = {
      total: contacts.length,
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    }

    for (let i = 0; i < contacts.length; i++) {
      const contactData = contacts[i]
      
      try {
        // Validate required fields
        if (!contactData.name || !contactData.phoneNumber) {
          results.errors.push(`Linha ${i + 1}: Nome e telefone são obrigatórios`)
          continue
        }

        // Format phone number
        const formattedPhone = contactData.phoneNumber.replace(/\D/g, '')
        
        if (formattedPhone.length < 10) {
          results.errors.push(`Linha ${i + 1}: Telefone inválido`)
          continue
        }

        // Check for duplicates
        const existingContact = await Contact.findOne({
          companyId: session.user.companyId,
          phoneNumber: formattedPhone
        })

        if (existingContact) {
          if (skipDuplicates) {
            results.skipped++
            continue
          } else {
            results.errors.push(`Linha ${i + 1}: Contato já existe`)
            continue
          }
        }

        // Create contact
        const contact = new Contact({
          companyId: session.user.companyId,
          name: contactData.name.trim(),
          phoneNumber: formattedPhone,
          email: contactData.email?.trim(),
          tags: contactData.tags || [],
          customFields: contactData.customFields || new Map(),
          notes: contactData.notes?.trim(),
          isActive: true,
          // Support legacy fields
          customField1: contactData.customField1?.trim(),
          customField2: contactData.customField2?.trim(),
          customField3: contactData.customField3?.trim(),
          customField4: contactData.customField4?.trim()
        })

        await contact.save()
        results.imported++

      } catch (error) {
        results.errors.push(`Linha ${i + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }

    return NextResponse.json({
      message: 'Importação concluída',
      results
    })
  } catch (error) {
    console.error('Error importing contacts:', error)
    return NextResponse.json(
      { message: 'Erro ao importar contatos' },
      { status: 500 }
    )
  }
}

// Export template for CSV import
export async function GET() {
  const csvTemplate = `name,phoneNumber,email,tags,notes,customField1,customField2,customField3,customField4
João Silva,11999999999,joao@email.com,"cliente,vip",Cliente importante,Campo1,Campo2,Campo3,Campo4
Maria Santos,11888888888,maria@email.com,cliente,Cliente regular,,,,""`

  return new Response(csvTemplate, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="template_contatos.csv"'
    }
  })
}
