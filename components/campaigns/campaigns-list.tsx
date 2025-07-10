'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  MoreHorizontal, 
  Calendar,
  Users,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye
} from 'lucide-react'
// Dropdown menu temporariamente removido
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'

interface Campaign {
  _id: string
  name: string
  description?: string
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled'
  messageTemplate: string
  stats: {
    totalContacts: number
    sent: number
    delivered: number
    failed: number
    pending: number
  }
  scheduledAt?: string
  createdAt: string
  updatedAt: string
}

export function CampaignsList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns')
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: Campaign['status']) => {
    const statusConfig = {
      draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800' },
      scheduled: { label: 'Agendada', color: 'bg-blue-100 text-blue-800' },
      running: { label: 'Executando', color: 'bg-green-100 text-green-800' },
      paused: { label: 'Pausada', color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Concluída', color: 'bg-purple-100 text-purple-800' },
      cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' }
    }

    const config = statusConfig[status]
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-green-600" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-purple-600" />
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Send className="h-4 w-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateProgress = (stats: Campaign['stats']) => {
    if (stats.totalContacts === 0) return 0
    return ((stats.sent + stats.delivered + stats.failed) / stats.totalContacts) * 100
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <Send className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma campanha encontrada
        </h3>
        <p className="text-gray-500 mb-6">
          Comece criando sua primeira campanha de mensagens.
        </p>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Criar Primeira Campanha
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(campaign.status)}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {campaign.name}
                  </h3>
                  {getStatusBadge(campaign.status)}
                </div>
                
                {campaign.description && (
                  <p className="text-gray-600 mb-3 text-sm">
                    {campaign.description}
                  </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {campaign.stats.totalContacts} contatos
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      {campaign.stats.sent} enviadas
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">
                      {campaign.stats.delivered} entregues
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formatDate(campaign.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                {campaign.stats.totalContacts > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progresso</span>
                      <span>{calculateProgress(campaign.stats).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateProgress(campaign.stats)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Button>

                {campaign.status === 'draft' && (
                  <Button variant="outline" size="sm" className="text-green-600">
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar
                  </Button>
                )}

                {campaign.status === 'running' && (
                  <Button variant="outline" size="sm" className="text-yellow-600">
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
