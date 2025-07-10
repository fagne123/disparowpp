'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  Clock, 
  Smartphone, 
  Shield,
  Calendar,
  Info,
  Zap
} from 'lucide-react'

interface CampaignData {
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
  [key: string]: any
}

interface CampaignSettingsProps {
  data: CampaignData
  onUpdate: (updates: Partial<CampaignData>) => void
}

export function CampaignSettings({ data, onUpdate }: CampaignSettingsProps) {
  const [availableInstances, setAvailableInstances] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchInstances()
  }, [])

  const fetchInstances = async () => {
    try {
      const response = await fetch('/api/instances')
      if (response.ok) {
        const result = await response.json()
        const connectedInstances = result.instances.filter((instance: any) => 
          instance.status === 'connected'
        )
        setAvailableInstances(connectedInstances)
        
        // Auto-select first instance if none selected
        if (data.sendConfig.instanceIds.length === 0 && connectedInstances.length > 0) {
          onUpdate({
            sendConfig: {
              ...data.sendConfig,
              instanceIds: [connectedInstances[0]._id]
            }
          })
        }
      }
    } catch (error) {
      console.error('Error fetching instances:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInstanceToggle = (instanceId: string) => {
    const newInstanceIds = data.sendConfig.instanceIds.includes(instanceId)
      ? data.sendConfig.instanceIds.filter(id => id !== instanceId)
      : [...data.sendConfig.instanceIds, instanceId]
    
    onUpdate({
      sendConfig: {
        ...data.sendConfig,
        instanceIds: newInstanceIds
      }
    })
  }

  const handleSendConfigChange = (key: string, value: any) => {
    onUpdate({
      sendConfig: {
        ...data.sendConfig,
        [key]: value
      }
    })
  }

  const handleSettingsChange = (key: string, value: any) => {
    onUpdate({
      settings: {
        ...data.settings,
        [key]: value
      }
    })
  }

  const handleScheduleChange = (type: 'now' | 'later') => {
    onUpdate({ 
      scheduleType: type,
      scheduledAt: type === 'now' ? undefined : new Date()
    })
  }

  const formatDateTime = (date: Date) => {
    return date.toISOString().slice(0, 16)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Configurações de Envio
        </h3>
        <p className="text-gray-600">
          Configure como e quando sua campanha será executada
        </p>
      </div>

      {/* Instâncias WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Instâncias WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Carregando instâncias...</p>
            </div>
          ) : availableInstances.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Nenhuma instância conectada encontrada</p>
              <p className="text-sm text-gray-400 mt-1">
                Conecte pelo menos uma instância WhatsApp para continuar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-3">
                Selecione as instâncias que serão usadas para envio:
              </p>
              {availableInstances.map((instance) => {
                const isSelected = data.sendConfig.instanceIds.includes(instance._id)
                
                return (
                  <div
                    key={instance._id}
                    onClick={() => handleInstanceToggle(instance._id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-medium ${
                          isSelected ? 'text-green-900' : 'text-gray-900'
                        }`}>
                          {instance.name}
                        </h4>
                        <p className={`text-sm ${
                          isSelected ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {instance.phoneNumber || 'Número não disponível'}
                        </p>
                      </div>
                      <Badge variant={isSelected ? "default" : "secondary"}>
                        {instance.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações de Velocidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Controle de Velocidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="delayBetweenMessages">
                Intervalo entre mensagens (segundos)
              </Label>
              <Input
                id="delayBetweenMessages"
                type="number"
                min="1"
                max="300"
                value={data.sendConfig.delayBetweenMessages}
                onChange={(e) => handleSendConfigChange('delayBetweenMessages', parseInt(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recomendado: 5-10 segundos para evitar bloqueios
              </p>
            </div>

            <div>
              <Label htmlFor="maxMessagesPerInstance">
                Máximo por instância
              </Label>
              <Input
                id="maxMessagesPerInstance"
                type="number"
                min="1"
                max="1000"
                value={data.sendConfig.maxMessagesPerInstance}
                onChange={(e) => handleSendConfigChange('maxMessagesPerInstance', parseInt(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Limite de mensagens por instância
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agendamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={data.scheduleType === 'now' ? 'default' : 'outline'}
              onClick={() => handleScheduleChange('now')}
              className="h-auto p-4 flex flex-col items-center"
            >
              <Zap className="h-6 w-6 mb-2" />
              <span className="font-medium">Enviar Agora</span>
              <span className="text-xs opacity-75">Iniciar imediatamente</span>
            </Button>

            <Button
              variant={data.scheduleType === 'later' ? 'default' : 'outline'}
              onClick={() => handleScheduleChange('later')}
              className="h-auto p-4 flex flex-col items-center"
            >
              <Clock className="h-6 w-6 mb-2" />
              <span className="font-medium">Agendar</span>
              <span className="text-xs opacity-75">Escolher data/hora</span>
            </Button>
          </div>

          {data.scheduleType === 'later' && (
            <div>
              <Label htmlFor="scheduledAt">
                Data e Hora do Envio
              </Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={data.scheduledAt ? formatDateTime(data.scheduledAt) : ''}
                onChange={(e) => onUpdate({ scheduledAt: new Date(e.target.value) })}
                className="mt-1"
                min={formatDateTime(new Date())}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações Avançadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configurações Avançadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="retryFailedMessages">
                  Tentar reenviar mensagens falhadas
                </Label>
                <p className="text-sm text-gray-500">
                  Reenviar automaticamente mensagens que falharam
                </p>
              </div>
              <Switch
                id="retryFailedMessages"
                checked={data.sendConfig.retryFailedMessages}
                onCheckedChange={(checked) => handleSendConfigChange('retryFailedMessages', checked)}
              />
            </div>

            {data.sendConfig.retryFailedMessages && (
              <div>
                <Label htmlFor="maxRetries">
                  Máximo de tentativas
                </Label>
                <Input
                  id="maxRetries"
                  type="number"
                  min="1"
                  max="10"
                  value={data.sendConfig.maxRetries}
                  onChange={(e) => handleSendConfigChange('maxRetries', parseInt(e.target.value))}
                  className="mt-1 w-24"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="blacklistCheck">
                  Verificar lista negra
                </Label>
                <p className="text-sm text-gray-500">
                  Não enviar para contatos bloqueados
                </p>
              </div>
              <Switch
                id="blacklistCheck"
                checked={data.settings.blacklistCheck}
                onCheckedChange={(checked) => handleSettingsChange('blacklistCheck', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="duplicateCheck">
                  Verificar duplicatas
                </Label>
                <p className="text-sm text-gray-500">
                  Evitar enviar múltiplas mensagens para o mesmo contato
                </p>
              </div>
              <Switch
                id="duplicateCheck"
                checked={data.settings.duplicateCheck}
                onCheckedChange={(checked) => handleSettingsChange('duplicateCheck', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">
                📊 Resumo das Configurações
              </h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• <strong>{data.sendConfig.instanceIds.length}</strong> instância(s) selecionada(s)</p>
                <p>• Intervalo de <strong>{data.sendConfig.delayBetweenMessages}s</strong> entre mensagens</p>
                <p>• Máximo de <strong>{data.sendConfig.maxMessagesPerInstance}</strong> mensagens por instância</p>
                <p>• Envio: <strong>{data.scheduleType === 'now' ? 'Imediato' : 'Agendado'}</strong></p>
                {data.scheduleType === 'later' && data.scheduledAt && (
                  <p>• Data: <strong>{data.scheduledAt.toLocaleString('pt-BR')}</strong></p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
