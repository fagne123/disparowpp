import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb/connection'
import { User, Company } from '@/lib/mongodb/models'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await connectDB()

          // Find user by email
          const user = await User.findOne({ email: credentials.email }).lean()
          if (!user) {
            return null
          }

          // Check password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) {
            return null
          }

          // Get company information
          const company = await Company.findById(user.companyId).lean()
          if (!company) {
            return null
          }

          // Check company status
          if (company.status === 'suspended') {
            throw new Error('Empresa suspensa')
          }

          if (company.status === 'pending') {
            throw new Error('Empresa aguardando aprovação')
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId,
            companyName: company.name,
            companyStatus: company.status
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.companyId = user.companyId
        token.companyName = user.companyName
        token.companyStatus = user.companyStatus
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
        session.user.companyName = token.companyName as string
        session.user.companyStatus = token.companyStatus as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    signUp: '/register'
  },
  secret: process.env.NEXTAUTH_SECRET
}

declare module 'next-auth' {
  interface User {
    role: string
    companyId: string
    companyName: string
    companyStatus: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      companyId: string
      companyName: string
      companyStatus: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    companyId: string
    companyName: string
    companyStatus: string
  }
}
