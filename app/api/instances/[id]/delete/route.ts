import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectDB from '@/lib/mongodb/connection'
import { WhatsAppInstance } from '@/lib/mongodb/models'
import { whatsappManager } from '@/lib/whatsapp/manager'
import { evolutionManager } from '@/lib/whatsapp/evolution-manager'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🗑️ Delete API called')

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

    console.log(`🗑️ Deleting instance ${id} (${instance.name})`)

    try {
      // 1. Disconnect from WhatsApp Web.js if connected
      const whatsappStatus = whatsappManager.getClientStatus(id)
      if (whatsappStatus) {
        console.log(`🔌 Disconnecting WhatsApp Web.js client for ${id}`)
        try {
          await whatsappManager.disconnectClient(id)
        } catch (error) {
          console.log(`⚠️ WhatsApp Web.js disconnect error (continuing): ${error}`)
        }
      }

      // 2. Disconnect from Evolution API if connected
      const evolutionStatus = evolutionManager.getInstanceStatus(id)
      if (evolutionStatus) {
        console.log(`🔌 Disconnecting Evolution API instance for ${id}`)
        try {
          await evolutionManager.disconnectInstance(id)
        } catch (error) {
          console.log(`⚠️ Evolution API disconnect error (continuing): ${error}`)
        }
      }

      // 3. Delete Evolution API instance completely
      try {
        console.log(`🗑️ Deleting Evolution API instance ${id}`)
        const response = await fetch(`${process.env.EVOLUTION_API_URL}/instance/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'apikey': process.env.EVOLUTION_API_KEY || ''
          }
        })
        
        if (response.ok) {
          console.log(`✅ Evolution API instance ${id} deleted`)
        } else {
          console.log(`⚠️ Evolution API delete failed: ${response.status}`)
        }
      } catch (error) {
        console.log(`⚠️ Evolution API delete error (continuing): ${error}`)
      }

      // 4. Clean up WhatsApp Web.js session files
      try {
        const fs = require('fs')
        const path = require('path')
        const sessionPath = path.join(process.cwd(), '.wwebjs_auth', `session_${id}`)
        
        if (fs.existsSync(sessionPath)) {
          console.log(`🧹 Cleaning up session files for ${id}`)
          fs.rmSync(sessionPath, { recursive: true, force: true })
          console.log(`✅ Session files cleaned for ${id}`)
        }
      } catch (error) {
        console.log(`⚠️ Session cleanup error (continuing): ${error}`)
      }

      // 5. Delete from database
      await WhatsAppInstance.findByIdAndDelete(id)
      console.log(`✅ Instance ${id} deleted from database`)

      return NextResponse.json({
        message: 'Instância deletada com sucesso',
        instanceId: id,
        instanceName: instance.name
      })

    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError)
      
      // Even if cleanup fails, still delete from database
      await WhatsAppInstance.findByIdAndDelete(id)
      
      return NextResponse.json({
        message: 'Instância deletada do banco de dados (alguns recursos podem não ter sido limpos)',
        instanceId: id,
        instanceName: instance.name,
        warning: 'Cleanup parcial'
      })
    }

  } catch (error) {
    console.error('Delete instance error:', error)
    return NextResponse.json(
      { 
        message: 'Erro ao deletar instância',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
