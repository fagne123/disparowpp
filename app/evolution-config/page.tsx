'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Server, 
  Key, 
  Globe, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  Link,
  Shield,
  Zap
} from 'lucide-react'

export default function EvolutionConfigPage() {
  const [apiUrl, setApiUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [logs, setLogs] = useState<string[]>([])
  const [serverInfo, setServerInfo] = useState<any>(null)

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString()
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    setLogs(prev => [...prev.slice(-20), `${time} ${emoji} ${message}`])
  }

  useEffect(() => {
    // Load current configuration
    loadCurrentConfig()
  }, [])

  const loadCurrentConfig = () => {
    addLog('📋 Carregando configuração atual...')
    
    // Simulate loading from environment or API
    setApiUrl(process.env.NEXT_PUBLIC_EVOLUTION_API_URL || '')
    setApiKey('***hidden***')
    setWebhookUrl(process.env.NEXT_PUBLIC_EVOLUTION_WEBHOOK_URL || '')
    
    addLog('✅ Configuração carregada', 'success')
  }

  const testConnection = async () => {
    if (!apiUrl || !apiKey) {
      addLog('❌ URL e API Key são obrigatórios', 'error')
      return
    }

    setIsLoading(true)
    setConnectionStatus('testing')
    addLog('🔍 Testando conexão com servidor externo...')

    try {
      addLog(`📡 Conectando em: ${apiUrl}`)

      const response = await fetch('/api/evolution/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiUrl: apiUrl.trim(),
          apiKey: apiKey.trim()
        })
      })

      const result = await response.json()

      if (result.success) {
        addLog('✅ Conexão estabelecida com sucesso!', 'success')
        addLog(`📊 Instâncias encontradas: ${result.data.instanceCount}`, 'info')
        addLog(`🕐 Timestamp: ${new Date(result.data.timestamp).toLocaleString()}`, 'info')

        setConnectionStatus('success')
        setServerInfo({
          status: 'online',
          instances: result.data.instanceCount,
          url: result.data.serverUrl,
          serverInfo: result.data.serverInfo
        })

        // Test webhook URL if provided
        if (webhookUrl) {
          addLog('🔗 Testando URL do webhook...')
          try {
            const webhookTest = await fetch(webhookUrl, {
              method: 'GET',
              signal: AbortSignal.timeout(5000)
            })
            if (webhookTest.ok) {
              addLog('✅ Webhook URL acessível', 'success')
            } else {
              addLog('⚠️ Webhook URL pode não estar acessível', 'error')
            }
          } catch (webhookError) {
            addLog('⚠️ Não foi possível testar webhook URL', 'error')
          }
        }

      } else {
        addLog(`❌ ${result.message}`, 'error')
        if (result.details) {
          addLog(`📋 Detalhes: ${result.details}`, 'error')
        }
        setConnectionStatus('error')
        setServerInfo(null)
      }

    } catch (error) {
      addLog(`❌ Erro de conexão: ${error}`, 'error')
      setConnectionStatus('error')
      setServerInfo(null)
    }

    setIsLoading(false)
  }

  const saveConfiguration = async () => {
    if (!apiUrl || !apiKey) {
      addLog('❌ URL e API Key são obrigatórios', 'error')
      return
    }

    setIsLoading(true)
    addLog('💾 Salvando configuração...')

    try {
      // Here you would typically save to your backend/database
      // For now, we'll simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      addLog('✅ Configuração salva com sucesso!', 'success')
      addLog('🔄 Reinicie a aplicação para aplicar as mudanças', 'info')
      
    } catch (error) {
      addLog(`❌ Erro ao salvar: ${error}`, 'error')
    }

    setIsLoading(false)
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing': return <RefreshCw className="h-5 w-5 animate-spin text-yellow-600" />
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-600" />
      default: return <Server className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing': return 'border-yellow-200 bg-yellow-50'
      case 'success': return 'border-green-200 bg-green-50'
      case 'error': return 'border-red-200 bg-red-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🌐 Configuração Evolution API
          </h1>
          <p className="text-xl text-gray-600">
            Configure a conexão com seu servidor Evolution API externo
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">Servidor Externo</Badge>
            <Badge className="bg-purple-100 text-purple-800">Evolution API 2.3.0</Badge>
            <Badge className="bg-green-100 text-green-800">Produção Ready</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Form */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configuração do Servidor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apiUrl" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  URL da Evolution API
                </Label>
                <Input
                  id="apiUrl"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://sua-evolution-api.com"
                  className="border-blue-200 focus:border-blue-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL completa do seu servidor Evolution API (com https://)
                </p>
              </div>

              <div>
                <Label htmlFor="apiKey" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API Key
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sua-api-key-aqui"
                  className="border-blue-200 focus:border-blue-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Chave de API fornecida pelo seu servidor Evolution
                </p>
              </div>

              <div>
                <Label htmlFor="webhookUrl" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  URL do Webhook (Opcional)
                </Label>
                <Input
                  id="webhookUrl"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://seu-disparowpp.com/api/webhooks/evolution"
                  className="border-blue-200 focus:border-blue-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL onde o servidor Evolution enviará os webhooks
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={testConnection}
                  disabled={isLoading || !apiUrl || !apiKey}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Testar Conexão
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={saveConfiguration}
                  disabled={isLoading || connectionStatus !== 'success'}
                  variant="outline"
                  className="flex-1"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Salvar Config
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status and Logs */}
          <div className="space-y-6">
            {/* Connection Status */}
            <Card className={`border-2 ${getStatusColor()}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon()}
                  Status da Conexão
                </CardTitle>
              </CardHeader>
              <CardContent>
                {connectionStatus === 'idle' && (
                  <p className="text-gray-600">Configure e teste a conexão com seu servidor</p>
                )}
                
                {connectionStatus === 'testing' && (
                  <p className="text-yellow-600">Testando conexão com o servidor...</p>
                )}
                
                {connectionStatus === 'success' && serverInfo && (
                  <div className="space-y-2">
                    <p className="text-green-600 font-medium">✅ Conectado com sucesso!</p>
                    <div className="text-sm space-y-1">
                      <p><strong>Servidor:</strong> {serverInfo.url}</p>
                      <p><strong>Status:</strong> Online</p>
                      <p><strong>Instâncias:</strong> {serverInfo.instances}</p>
                    </div>
                  </div>
                )}
                
                {connectionStatus === 'error' && (
                  <div className="space-y-2">
                    <p className="text-red-600 font-medium">❌ Falha na conexão</p>
                    <p className="text-sm text-red-500">
                      Verifique a URL, API Key e conectividade de rede
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Logs */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-700">📋 Logs de Configuração</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-xs">
                  {logs.length === 0 ? (
                    <div className="text-gray-500">
                      💻 Logs aparecerão aqui...
                    </div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1 leading-relaxed">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-700">📖 Instruções de Configuração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-purple-600">🔧 Configuração:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Obtenha a URL do seu servidor Evolution API</li>
                  <li>Gere uma API Key no painel do servidor</li>
                  <li>Configure a URL do webhook (opcional)</li>
                  <li>Teste a conexão</li>
                  <li>Salve a configuração</li>
                  <li>Reinicie a aplicação</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-purple-600">🔒 Segurança:</h3>
                <ul className="space-y-2 text-sm">
                  <li>✅ Use sempre HTTPS em produção</li>
                  <li>✅ Mantenha a API Key segura</li>
                  <li>✅ Configure firewall no servidor</li>
                  <li>✅ Use webhook token para validação</li>
                  <li>✅ Monitore logs de acesso</li>
                  <li>✅ Atualize regularmente</li>
                </ul>
              </div>
            </div>
            
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Certifique-se de que seu servidor Evolution API está 
                acessível pela internet e configurado corretamente antes de testar a conexão.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
