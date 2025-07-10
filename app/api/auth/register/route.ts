import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb/connection'
import { User, Company } from '@/lib/mongodb/models'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, companyName, companyEmail } = await request.json()

    // Validate required fields
    if (!name || !email || !password || !companyName || !companyEmail) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { message: 'Usuário já existe com este email' },
        { status: 400 }
      )
    }

    // Check if company email already exists
    const existingCompany = await Company.findOne({ email: companyEmail })
    if (existingCompany) {
      return NextResponse.json(
        { message: 'Empresa já existe com este email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create company
    const company = new Company({
      name: companyName,
      email: companyEmail,
      status: 'pending',
      maxInstances: 5,
      trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
    })

    await company.save()

    // Create user
    const user = new User({
      companyId: company._id.toString(),
      role: 'company_admin',
      name,
      email,
      password: hashedPassword
    })

    await user.save()

    return NextResponse.json(
      { 
        message: 'Conta criada com sucesso! Aguarde aprovação da empresa.',
        success: true 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
