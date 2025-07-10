'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  FileText, 
  MessageSquare, 
  Users, 
  Settings,
  Calendar,
  Smartphone,
  Clock,
  Shield,
  Edit
} from 'lucide-react'

interface CampaignData {
  name: string
  description: string
  messageTemplate: string
  mediaUrl?: string
  mediaType: 'text' | 'image' | 'audio' | 'video' | 'document'
  contactSelection: 'all' | 'groups' | 'upload'
  selectedGroups: string[]
  uploadedContacts: any[]
  sendConfig: {
    delayBetweenMessages: number
    maxMessagesPerInstance: number
    instanceIds: string[]
    retryFailedMessages: boolean
    maxRetries: number
  }
  scheduleType: 'now' | 'later'
  scheduledAt?: Date
  settings: {
    personalizeMessage: boolean
    variables: string[]
    blacklistCheck: boolean
    duplicateCheck: boolean
  }
}

interface CampaignReviewProps {
  data: CampaignData
  onUpdate: (updates: Partial<CampaignData>) => void
}

export function CampaignReview({ data, onUpdate }: CampaignReviewProps) {
  const getTotalContacts = () => {
    switch (data.contactSelection) {
      case 'all':
        return 1234 // TODO: Buscar do banco
      case 'groups':
        return data.selectedGroups.length * 100 // Placeholder
      case 'upload':
        return data.uploadedContacts.length
      default:
        return 0
    }
  }

  const getContactSelectionText = () => {
    switch (data.contactSelection) {
      case 'all':
        return 'Todos os contatos ativos'
      case 'groups':
        return `${data.selectedGroups.length} grupo(s) selecionado(s)`
      case 'upload':
        return 'Lista importada via upload'
      default:
        return 'Não definido'
    }
  }

  const previewMessage = () => {
    let preview = data.messageTemplate
    data.settings.variables.forEach(variable => {
      const placeholder = `{${variable}}`
      const sampleValue = variable === 'nome' ? 'João Silva' : 
                         variable === 'empresa' ? 'Empresa XYZ' : 
                         `[${variable}]`
      preview = preview.replace(new RegExp(`\\{${variable}\\}`, 'g'), sampleValue)
    })
    return preview
  }

  const estimatedDuration = () => {
    const totalContacts = getTotalContacts()
    const instanceCount = data.sendConfig.instanceIds.length
    const delayPerMessage = data.sendConfig.delayBetweenMessages
    
    if (instanceCount === 0) return 'Não calculado'
    
    const messagesPerInstance = Math.ceil(totalContacts / instanceCount)
    const totalTimeSeconds = messagesPerInstance * delayPerMessage
    
    const hours = Math.floor(totalTimeSeconds / 3600)
    const minutes = Math.floor((totalTimeSeconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`
    } else {
      return `${minutes}min`
    }
  }

  const reviewSections = [
    {
      title: 'Informações Básicas',
      icon: FileText,
      content: (
        <div className="space-y-2">
          <div>
            <span className="font-medium text-gray-700">Nome:</span>
            <p className="text-gray-900">{data.name}</p>
          </div>
          {data.description && (
            <div>
              <span className="font-medium text-gray-700">Descrição:</span>
              <p className="text-gray-900">{data.description}</p>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Mensagem',
      icon: MessageSquare,
      content: (
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-700">Tipo:</span>
            <Badge className="ml-2">
              {data.mediaType === 'text' ? 'Apenas Texto' : 
               data.mediaType === 'image' ? 'Imagem' : 
               data.mediaType === 'document' ? 'Documento' : data.mediaType}
            </Badge>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Preview:</span>
            <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-sm whitespace-pre-wrap">
                  {previewMessage()}
                </p>
                {data.mediaUrl && (
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
                    📎 {data.mediaType}: {data.mediaUrl}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Destinatários',
      icon: Users,
      content: (
        <div className="space-y-2">
          <div>
            <span className="font-medium text-gray-700">Seleção:</span>
            <p className="text-gray-900">{getContactSelectionText()}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Total de contatos:</span>
            <p className="text-gray-900 font-semibold text-lg">
              {getTotalContacts().toLocaleString()}
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Configurações de Envio',
      icon: Settings,
      content: (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-700">Instâncias:</span>
              <p className="text-gray-900">{data.sendConfig.instanceIds.length}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Intervalo:</span>
              <p className="text-gray-900">{data.sendConfig.delayBetweenMessages}s</p>
            </div>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Agendamento:</span>
            <p className="text-gray-900">
              {data.scheduleType === 'now' ? 'Envio imediato' : 
               data.scheduledAt ? `Agendado para ${data.scheduledAt.toLocaleString('pt-BR')}` : 
               'Agendado (data não definida)'}
            </p>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Duração estimada:</span>
            <p className="text-gray-900">{estimatedDuration()}</p>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Revisar Campanha
        </h3>
        <p className="text-gray-600">
          Confira todos os detalhes antes de criar sua campanha
        </p>
      </div>

      {/* Review Sections */}
      <div className="space-y-4">
        {reviewSections.map((section, index) => {
          const Icon = section.icon
          
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {section.title}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {section.content}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary Card */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-700 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Resumo Final
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800">
                {getTotalContacts().toLocaleString()}
              </div>
              <p className="text-sm text-green-600">Contatos</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800">
                {data.sendConfig.instanceIds.length}
              </div>
              <p className="text-sm text-green-600">Instâncias</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800">
                {estimatedDuration()}
              </div>
              <p className="text-sm text-green-600">Duração estimada</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
            <p className="text-sm text-green-700 text-center">
              ✅ Sua campanha está pronta para ser criada!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {getTotalContacts() === 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-700">
                <strong>Atenção:</strong> Nenhum contato foi selecionado para esta campanha.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {data.sendConfig.instanceIds.length === 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-700">
                <strong>Atenção:</strong> Nenhuma instância WhatsApp foi selecionada.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!data.messageTemplate.trim() && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-700">
                <strong>Atenção:</strong> A mensagem da campanha está vazia.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
