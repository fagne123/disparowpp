'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Users, 
  CheckCircle, 
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

interface CampaignStatsData {
  totalCampaigns: number
  activeCampaigns: number
  totalContacts: number
  messagesSent: number
  messagesDelivered: number
  messagesFailed: number
  deliveryRate: number
  avgResponseTime: number
}

export function CampaignStats() {
  const [stats, setStats] = useState<CampaignStatsData>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalContacts: 0,
    messagesSent: 0,
    messagesDelivered: 0,
    messagesFailed: 0,
    deliveryRate: 0,
    avgResponseTime: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/campaigns/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching campaign stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Campanhas Ativas',
      value: stats.activeCampaigns,
      total: stats.totalCampaigns,
      icon: Send,
      color: 'blue',
      description: `${stats.totalCampaigns} total`
    },
    {
      title: 'Contatos Ativos',
      value: stats.totalContacts.toLocaleString(),
      icon: Users,
      color: 'green',
      description: 'Base de contatos'
    },
    {
      title: 'Taxa de Entrega',
      value: `${stats.deliveryRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: stats.deliveryRate >= 90 ? 'green' : stats.deliveryRate >= 70 ? 'yellow' : 'red',
      description: `${stats.messagesDelivered}/${stats.messagesSent} entregues`
    },
    {
      title: 'Mensagens Enviadas',
      value: stats.messagesSent.toLocaleString(),
      icon: TrendingUp,
      color: 'purple',
      description: `${stats.messagesFailed} falharam`
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        const colorClasses = {
          blue: 'bg-blue-100 text-blue-600 border-blue-200',
          green: 'bg-green-100 text-green-600 border-green-200',
          yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
          red: 'bg-red-100 text-red-600 border-red-200',
          purple: 'bg-purple-100 text-purple-600 border-purple-200'
        }

        return (
          <Card key={index} className={`border-2 ${colorClasses[stat.color as keyof typeof colorClasses].split(' ')[2]} hover:shadow-lg transition-shadow`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses].split(' ').slice(0, 2).join(' ')}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
