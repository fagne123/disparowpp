'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Server, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  ExternalLink,
  Settings
} from 'lucide-react'

interface ConnectionStatusProps {
  showActions?: boolean
}

export default function ConnectionStatus({ showActions = true }: ConnectionStatusProps) {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error' | 'unconfigured'>('loading')
  const [config, setConfig] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    setIsRefreshing(true)
    
    try {
      const response = await fetch('/api/evolution/test-connection')
      const data = await response.json()
      
      if (response.ok) {
        setConfig(data)
        setStatus(data.configured ? 'connected' : 'unconfigured')
      } else {
        setStatus('error')
      }
    } catch (error) {
      console.error('Error checking connection:', error)
      setStatus('error')
    }
    
    setIsRefreshing(false)
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading': return <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
      case 'connected': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'unconfigured': return <Settings className="h-5 w-5 text-yellow-600" />
      default: return <Server className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading': return 'border-blue-200 bg-blue-50'
      case 'connected': return 'border-green-200 bg-green-50'
      case 'error': return 'border-red-200 bg-red-50'
      case 'unconfigured': return 'border-yellow-200 bg-yellow-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'loading': return 'Verificando conexão...'
      case 'connected': return 'Conectado ao servidor externo'
      case 'error': return 'Erro de conexão'
      case 'unconfigured': return 'Não configurado'
      default: return 'Status desconhecido'
    }
  }

  const getServerTypeText = () => {
    if (!config) return ''
    return config.serverType === 'local' ? 'Servidor Local' : 'Servidor Externo'
  }

  return (
    <Card className={`border-2 ${getStatusColor()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            Status Evolution API
          </div>
          {showActions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={checkConnection}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{getStatusText()}</span>
          <Badge variant={status === 'connected' ? 'default' : 'secondary'}>
            {status === 'connected' ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {config && (
          <div className="space-y-2 text-sm">
            {config.apiUrl && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Servidor:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs">{config.apiUrl}</span>
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tipo:</span>
              <Badge variant="outline" className="text-xs">
                {getServerTypeText()}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Key:</span>
              <Badge variant={config.hasApiKey ? 'default' : 'destructive'} className="text-xs">
                {config.hasApiKey ? 'Configurada' : 'Não configurada'}
              </Badge>
            </div>
            
            {config.webhookUrl && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Webhook:</span>
                <Badge variant="outline" className="text-xs">
                  Configurado
                </Badge>
              </div>
            )}
          </div>
        )}

        {status === 'unconfigured' && showActions && (
          <div className="pt-2 border-t">
            <Button
              size="sm"
              className="w-full"
              onClick={() => window.open('/evolution-config', '_blank')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar Agora
            </Button>
          </div>
        )}

        {status === 'error' && showActions && (
          <div className="pt-2 border-t">
            <div className="space-y-2">
              <p className="text-xs text-red-600">
                Verifique a configuração e conectividade
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={checkConnection}
                >
                  Tentar Novamente
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open('/evolution-config', '_blank')}
                >
                  Configurar
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
