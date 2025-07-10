'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
// import { Progress } from '@/components/ui/progress'
import { 
  Smartphone, 
  Wifi, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  QrCode,
  Send,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

interface Instance {
  _id: string
  name: string
  status: string
  phoneNumber?: string
}

export default function WhatsAppTestPage() {
  const [instanceName, setInstanceName] = useState('Teste WhatsApp')
  const [instance, setInstance] = useState<Instance | null>(null)
  const [qrCode, setQrCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('Olá! Esta é uma mensagem de teste do DisparoWPP.')
  const [to, setTo] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [step, setStep] = useState(0)

  const steps = [
    'Criar Instância',
    'Conectar WhatsApp',
    'Gerar QR Code',
    'Aguardar Conexão',
    'Pronto para Usar'
  ]

  const addLog = (log: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    setLogs(prev => [...prev, `${timestamp} ${emoji} ${log}`])
  }

  const createInstance = async () => {
    setIsLoading(true)
    setStep(1)
    setProgress(20)
    addLog('Criando nova instância WhatsApp...')
    
    try {
      const response = await fetch('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: instanceName })
      })
      
      const data = await response.json()
      if (response.ok) {
        setInstance(data.instance)
        addLog(`Instância criada: ${data.instance.name}`, 'success')
        setProgress(40)
        setStep(2)
      } else {
        addLog(`Erro ao criar instância: ${data.message}`, 'error')
        setIsLoading(false)
      }
    } catch (error) {
      addLog(`Erro de conexão: ${error}`, 'error')
      setIsLoading(false)
    }
  }

  const connectInstance = async () => {
    if (!instance) return
    
    addLog('Iniciando processo de conexão...')
    setProgress(60)
    setStep(3)
    
    try {
      const response = await fetch(`/api/instances/${instance._id}/connect`, {
        method: 'POST'
      })
      
      if (response.ok) {
        addLog('Conexão iniciada. Gerando QR Code...', 'success')
        
        // Get QR code
        setTimeout(async () => {
          try {
            const qrResponse = await fetch(`/api/instances/${instance._id}/qr`)
            if (qrResponse.ok) {
              const qrData = await qrResponse.json()
              setQrCode(qrData.qrCode)
              addLog('QR Code gerado! Escaneie com seu WhatsApp.', 'success')
              setProgress(80)
              setStep(4)
              
              // Start polling for connection
              pollForConnection()
            }
          } catch (error) {
            addLog('Erro ao gerar QR Code', 'error')
          }
        }, 2000)
      } else {
        addLog('Erro ao iniciar conexão', 'error')
        setIsLoading(false)
      }
    } catch (error) {
      addLog(`Erro: ${error}`, 'error')
      setIsLoading(false)
    }
  }

  const pollForConnection = () => {
    if (!instance) return
    
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch(`/api/instances/${instance._id}/status`)
        const statusData = await statusResponse.json()
        
        setInstance(prev => prev ? { ...prev, ...statusData } : null)
        
        if (statusData.status === 'connected') {
          addLog(`Conectado com sucesso! Número: ${statusData.phoneNumber}`, 'success')
          setProgress(100)
          setStep(5)
          setIsLoading(false)
          clearInterval(pollInterval)
        }
      } catch (error) {
        addLog('Erro ao verificar status', 'error')
      }
    }, 3000)
    
    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
      if (instance?.status !== 'connected') {
        addLog('Timeout: Conexão não estabelecida em 2 minutos', 'error')
        setIsLoading(false)
      }
    }, 120000)
  }

  const sendTestMessage = async () => {
    if (!instance || !to || !message) return
    
    addLog(`Enviando mensagem para ${to}...`)
    
    try {
      const response = await fetch(`/api/instances/${instance._id}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message })
      })
      
      const data = await response.json()
      if (response.ok) {
        addLog(`Mensagem enviada com sucesso!`, 'success')
      } else {
        addLog(`Erro ao enviar: ${data.message}`, 'error')
      }
    } catch (error) {
      addLog(`Erro: ${error}`, 'error')
    }
  }

  const startFullProcess = async () => {
    setLogs([])
    setProgress(0)
    setStep(0)
    setQrCode('')
    setInstance(null)
    
    await createInstance()
  }

  // Auto-connect after instance creation
  useEffect(() => {
    if (instance && step === 2) {
      setTimeout(connectInstance, 1000)
    }
  }, [instance, step])

  const getStatusBadge = (status: string) => {
    const configs = {
      connected: { variant: 'default' as const, icon: CheckCircle, label: 'Conectado' },
      connecting: { variant: 'secondary' as const, icon: Clock, label: 'Conectando' },
      disconnected: { variant: 'outline' as const, icon: Wifi, label: 'Desconectado' }
    }
    
    const config = configs[status as keyof typeof configs] || configs.disconnected
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 DisparoWPP - Teste Completo
          </h1>
          <p className="text-xl text-gray-600">
            Sistema de WhatsApp Business em Ação
          </p>
        </div>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Progresso da Configuração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                {steps.map((stepName, index) => (
                  <div 
                    key={index}
                    className={`flex flex-col items-center ${
                      index <= step ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      index <= step ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {index < step ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : index === step ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    <span className="text-xs text-center">{stepName}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Controles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instanceName">Nome da Instância</Label>
                <Input
                  id="instanceName"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  placeholder="Ex: WhatsApp Principal"
                  disabled={isLoading}
                />
              </div>

              <Button 
                onClick={startFullProcess} 
                disabled={!instanceName || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Smartphone className="mr-2 h-4 w-4" />
                    Iniciar Teste Completo
                  </>
                )}
              </Button>

              {instance && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span><strong>Status:</strong></span>
                        {getStatusBadge(instance.status)}
                      </div>
                      {instance.phoneNumber && (
                        <div>
                          <strong>Número:</strong> {instance.phoneNumber}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Message Test */}
              {instance?.status === 'connected' && (
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Teste de Mensagem
                  </h3>
                  
                  <div>
                    <Label htmlFor="to">Número (com DDD)</Label>
                    <Input
                      id="to"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="11999999999"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Input
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={sendTestMessage}
                    disabled={!to || !message}
                    className="w-full"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Teste
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              {qrCode ? (
                <div className="text-center space-y-4">
                  <img 
                    src={qrCode} 
                    alt="QR Code WhatsApp" 
                    className="mx-auto border rounded-lg shadow-lg"
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-600">
                      ✅ QR Code Gerado!
                    </p>
                    <p className="text-xs text-gray-600">
                      Escaneie com o WhatsApp do seu celular
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <QrCode className="h-16 w-16 mx-auto mb-4" />
                  <p>QR Code aparecerá aqui</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Logs do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-80 overflow-y-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-gray-500">
                    💻 Aguardando início do processo...
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
        <Card>
          <CardHeader>
            <CardTitle>📋 Instruções de Teste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">🚀 Como Testar:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Clique em "Iniciar Teste Completo"</li>
                  <li>Aguarde a criação da instância</li>
                  <li>Aguarde o QR Code aparecer</li>
                  <li>Escaneie com o WhatsApp do celular</li>
                  <li>Aguarde a confirmação de conexão</li>
                  <li>Teste o envio de mensagem</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-3">⚡ Recursos Testados:</h3>
                <ul className="space-y-2 text-sm">
                  <li>✅ Criação de instâncias</li>
                  <li>✅ Geração de QR Code</li>
                  <li>✅ Simulação de conexão</li>
                  <li>✅ Status em tempo real</li>
                  <li>✅ Interface responsiva</li>
                  <li>✅ Logs detalhados</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
