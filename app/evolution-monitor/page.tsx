'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  RefreshCw,
  MessageSquare,
  QrCode,
  Phone
} from 'lucide-react'

export default function EvolutionMonitorPage() {
  const [instanceName, setInstanceName] = useState('Monitor-Test')
  const [instanceId, setInstanceId] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('🚀 Teste via Evolution API 2.3.0!')
  const [to, setTo] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [status, setStatus] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isMonitoring, setIsMonitoring] = useState(false)

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString()
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    setLogs(prev => [...prev.slice(-50), `${time} ${emoji} ${message}`]) // Keep last 50 logs
  }

  const createInstance = async () => {
    setIsLoading(true)
    addLog('🔧 Criando instância via Evolution API 2.3.0...')
    
    try {
      const response = await fetch('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: instanceName })
      })
      
      const data = await response.json()
      if (response.ok) {
        setInstanceId(data.instance._id)
        addLog(`✅ Instância criada: ${data.instance._id}`, 'success')
        addLog(`📋 Nome: ${data.instance.name}`, 'info')
      } else {
        addLog(`❌ Erro: ${data.message}`, 'error')
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
    }
    setIsLoading(false)
  }

  const connectInstance = async () => {
    if (!instanceId) return
    
    setIsLoading(true)
    addLog('🔗 Conectando via Evolution API 2.3.0 com WhatsApp Baileys...')
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/connect`, {
        method: 'POST'
      })
      
      const data = await response.json()
      if (response.ok) {
        addLog(`✅ Conexão iniciada: ${data.message}`, 'success')
        addLog(`🔧 Integração: ${data.integration}`, 'info')
        
        // Start monitoring
        startMonitoring()
      } else {
        addLog(`❌ Erro: ${data.message}`, 'error')
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
    }
    setIsLoading(false)
  }

  const startMonitoring = () => {
    setIsMonitoring(true)
    addLog('📊 Iniciando monitoramento em tempo real...', 'info')
    
    // Poll for QR code and status
    const interval = setInterval(async () => {
      try {
        // Get QR code
        const qrResponse = await fetch(`/api/instances/${instanceId}/qr`)
        if (qrResponse.ok) {
          const qrData = await qrResponse.json()
          if (qrData.qrCode && qrData.qrCode !== qrCode) {
            setQrCode(qrData.qrCode)
            addLog('📱 QR Code atualizado!', 'success')
          }
        }

        // Get status
        const statusResponse = await fetch(`/api/instances/${instanceId}/status`)
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          
          if (statusData.status !== status) {
            setStatus(statusData.status)
            addLog(`🔄 Status: ${statusData.status}`, 'info')
            
            if (statusData.status === 'connected') {
              setPhoneNumber(statusData.phoneNumber || '')
              addLog(`🎉 Conectado! Número: ${statusData.phoneNumber}`, 'success')
              clearInterval(interval)
              setIsMonitoring(false)
            }
          }
        }
      } catch (error) {
        console.error('Monitoring error:', error)
      }
    }, 2000)

    // Stop monitoring after 2 minutes
    setTimeout(() => {
      clearInterval(interval)
      setIsMonitoring(false)
      addLog('⏰ Monitoramento finalizado (timeout)', 'info')
    }, 120000)
  }

  const sendMessage = async () => {
    if (!instanceId || !to || !message) return
    
    addLog(`📤 Enviando mensagem via Evolution API 2.3.0 para ${to}...`)
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message })
      })
      
      const data = await response.json()
      if (response.ok) {
        addLog(`✅ Mensagem enviada via Evolution API 2.3.0!`, 'success')
        addLog(`📋 ID: ${data.messageId || 'N/A'}`, 'info')
      } else {
        addLog(`❌ Erro ao enviar: ${data.message}`, 'error')
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'connecting': return <Clock className="h-5 w-5 text-yellow-600 animate-spin" />
      case 'disconnected': return <WifiOff className="h-5 w-5 text-gray-600" />
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-600" />
      default: return <Smartphone className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200'
      case 'connecting': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'disconnected': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            📊 Evolution API 2.3.0 Monitor
          </h1>
          <p className="text-xl text-gray-600">
            Monitoramento em Tempo Real - WhatsApp Baileys Integration
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <Badge className="bg-purple-100 text-purple-800">Evolution API 2.3.0</Badge>
            <Badge className="bg-green-100 text-green-800">WhatsApp Baileys</Badge>
            <Badge className="bg-blue-100 text-blue-800">Real-time Monitor</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-700 flex items-center">
                <Smartphone className="h-5 w-5 mr-2" />
                Controles da Instância
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instanceName">Nome da Instância</Label>
                <Input
                  id="instanceName"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  disabled={isLoading}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={createInstance} 
                  disabled={!instanceName || isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Smartphone className="h-4 w-4 mr-2" />
                      Criar Instância
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={connectInstance} 
                  disabled={!instanceId || isLoading || isMonitoring}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isMonitoring ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Monitorando...
                    </>
                  ) : (
                    <>
                      <Wifi className="h-4 w-4 mr-2" />
                      Conectar & Monitorar
                    </>
                  )}
                </Button>
              </div>

              {/* Status Display */}
              {instanceId && (
                <Alert className="border-purple-200 bg-purple-50">
                  <AlertDescription>
                    <div className="space-y-2">
                      <div>
                        <strong>Instance ID:</strong> {instanceId}
                      </div>
                      {status && (
                        <div className="flex items-center gap-2">
                          <strong>Status:</strong>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                            {getStatusIcon(status)}
                            {status}
                          </div>
                        </div>
                      )}
                      {phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <strong>Número:</strong> {phoneNumber}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Message Test */}
              {status === 'connected' && (
                <div className="border-t border-purple-200 pt-4 space-y-3">
                  <h3 className="font-medium text-purple-700 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Enviar Mensagem
                  </h3>
                  
                  <div>
                    <Label htmlFor="to">Número (com DDD)</Label>
                    <Input
                      id="to"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="5511999999999"
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Input
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>
                  
                  <Button 
                    onClick={sendMessage}
                    disabled={!to || !message}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Enviar via Evolution API
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                QR Code Evolution API
              </CardTitle>
            </CardHeader>
            <CardContent>
              {qrCode ? (
                <div className="text-center space-y-4">
                  <img 
                    src={qrCode} 
                    alt="QR Code Evolution API" 
                    className="mx-auto border-2 border-blue-300 rounded-lg shadow-lg max-w-full"
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-600">
                      ✅ QR Code da Evolution API 2.3.0!
                    </p>
                    <p className="text-xs text-gray-600">
                      Escaneie com o WhatsApp do seu celular
                    </p>
                    <div className="bg-blue-100 p-2 rounded text-xs text-blue-700">
                      🔥 WhatsApp Baileys Integration
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">📱</div>
                  <p>QR Code aparecerá aqui</p>
                  {isMonitoring && (
                    <div className="mt-4">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                      <p className="text-sm mt-2">Aguardando QR Code...</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logs */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center justify-between">
                <span className="flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Logs em Tempo Real
                </span>
                {isMonitoring && (
                  <Badge className="bg-green-100 text-green-800 animate-pulse">
                    Monitorando
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-80 overflow-y-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-gray-500">
                    💻 Logs da Evolution API aparecerão aqui...
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

        {/* Instructions */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-700">📖 Evolution API 2.3.0 - Instruções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-purple-600">🎯 Passos:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Certifique-se que Evolution API 2.3.0 está rodando</li>
                  <li>Clique em "Criar Instância"</li>
                  <li>Clique em "Conectar & Monitorar"</li>
                  <li>Aguarde o QR Code (WhatsApp Baileys)</li>
                  <li>Escaneie com o WhatsApp</li>
                  <li>Monitore a conexão em tempo real</li>
                  <li>Envie mensagens de teste!</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-purple-600">⚡ Recursos:</h3>
                <ul className="space-y-2 text-sm">
                  <li>✅ Evolution API 2.3.0 oficial</li>
                  <li>✅ WhatsApp Baileys integration</li>
                  <li>✅ Monitoramento em tempo real</li>
                  <li>✅ Webhooks automáticos</li>
                  <li>✅ QR Code dinâmico</li>
                  <li>✅ Logs detalhados</li>
                  <li>✅ Status de conexão</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>📋 Pré-requisito:</strong> Evolution API 2.3.0 deve estar configurada e acessível no servidor externo
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Configure a URL e API Key em: <a href="/evolution-config" className="underline">Configurações Evolution API</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
