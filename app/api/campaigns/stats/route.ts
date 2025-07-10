import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectDB from '@/lib/mongodb/connection'
import { Campaign, Contact, CampaignMessage } from '@/lib/mongodb/models'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const companyId = session.user.companyId

    // Buscar estatísticas das campanhas
    const [
      totalCampaigns,
      activeCampaigns,
      totalContacts,
      campaignStats
    ] = await Promise.all([
      // Total de campanhas
      Campaign.countDocuments({ companyId }),
      
      // Campanhas ativas (running, scheduled)
      Campaign.countDocuments({ 
        companyId, 
        status: { $in: ['running', 'scheduled'] } 
      }),
      
      // Total de contatos ativos
      Contact.countDocuments({ 
        companyId, 
        status: 'active',
        isBlacklisted: false 
      }),
      
      // Estatísticas agregadas das campanhas
      Campaign.aggregate([
        { $match: { companyId } },
        {
          $group: {
            _id: null,
            totalSent: { $sum: '$stats.sent' },
            totalDelivered: { $sum: '$stats.delivered' },
            totalFailed: { $sum: '$stats.failed' },
            totalPending: { $sum: '$stats.pending' }
          }
        }
      ])
    ])

    const stats = campaignStats[0] || {
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      totalPending: 0
    }

    // Calcular taxa de entrega
    const deliveryRate = stats.totalSent > 0 
      ? (stats.totalDelivered / stats.totalSent) * 100 
      : 0

    return NextResponse.json({
      totalCampaigns,
      activeCampaigns,
      totalContacts,
      messagesSent: stats.totalSent,
      messagesDelivered: stats.totalDelivered,
      messagesFailed: stats.totalFailed,
      messagesPending: stats.totalPending,
      deliveryRate: Math.round(deliveryRate * 10) / 10, // Arredondar para 1 casa decimal
      avgResponseTime: 0 // TODO: Implementar quando tivermos dados de resposta
    })

  } catch (error) {
    console.error('Error fetching campaign stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
