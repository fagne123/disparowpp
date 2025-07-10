import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectDB from '@/lib/mongodb/connection'
import { WhatsAppInstance } from '@/lib/mongodb/models'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🗑️ Simple Delete API called')
    
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log('❌ Unauthorized delete attempt')
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    console.log(`🗑️ Deleting instance: ${id}`)
    
    await connectDB()
    console.log('✅ Database connected')

    // Find instance and verify ownership
    const instance = await WhatsAppInstance.findOne({
      _id: id,
      companyId: session.user.companyId
    })

    if (!instance) {
      console.log(`❌ Instance ${id} not found`)
      return NextResponse.json(
        { message: 'Instância não encontrada' },
        { status: 404 }
      )
    }

    console.log(`🗑️ Deleting instance ${id} (${instance.name}) - Simple version`)

    try {
      // Simple delete - just remove from database
      await WhatsAppInstance.findByIdAndDelete(id)
      console.log(`✅ Instance ${id} deleted from database`)

      return NextResponse.json({
        message: 'Instância deletada com sucesso (versão simples)',
        instanceId: id,
        instanceName: instance.name
      })

    } catch (deleteError) {
      console.error('Simple delete error:', deleteError)
      
      return NextResponse.json({
        message: 'Erro ao deletar instância',
        error: deleteError instanceof Error ? deleteError.message : 'Erro desconhecido'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Simple delete API error:', error)
    return NextResponse.json(
      { 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
