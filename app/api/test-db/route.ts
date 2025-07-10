import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb/connection'
import { Company, User, WhatsAppInstance } from '@/lib/mongodb/models'

export async function GET() {
  try {
    await connectDB()
    
    // Test database connection by counting documents
    const [companiesCount, usersCount, instancesCount] = await Promise.all([
      Company.countDocuments(),
      User.countDocuments(),
      WhatsAppInstance.countDocuments()
    ])

    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful!',
      data: {
        companies: companiesCount,
        users: usersCount,
        instances: instancesCount,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
