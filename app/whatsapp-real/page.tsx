'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

export default function WhatsAppRealPage() {
  const [instanceName, setInstanceName] = useState('WhatsApp Real')
  const [instance, setInstance] = useState<any>(null)
  const [qrCode, setQrCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('🚀 Olá! Esta é uma mensagem REAL do DisparoWPP!')
  const [to, setTo] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    '🔧 Criar Instância',
    '🔗 Conectar WhatsApp Real', 
    '📱 Gerar QR Code Real',
    '⏳ Aguardar Autenticação',
    '✅ WhatsApp Conectado!'
  ]

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString()
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    setLogs(prev => [...prev, `${time} ${emoji} ${message}`])
  }

  const createInstance = async () => {
    setIsLoading(true)
    setCurrentStep(1)
    addLog('Criando instância WhatsApp REAL...')
    
    try {
      const response = await fetch('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: instanceName })
      })
      
      const data = await response.json()
      if (response.ok) {
        setInstance(data.instance)
        addLog(`✅ Instância criada: ${data.instance.name}`, 'success')
        setCurrentStep(2)
        
        // Auto-connect
        setTimeout(() => connectInstance(data.instance._id), 1000)
      } else {
        addLog(`❌ Erro: ${data.message}`, 'error')
        setIsLoading(false)
      }
    } catch (error) {
      addLog(`❌ Erro de conexão: ${error}`, 'error')
      setIsLoading(false)
    }
  }

  const connectInstance = async (instanceId?: string) => {
    const id = instanceId || instance?._id
    if (!id) return
    
    addLog('🔗 Iniciando conexão com WhatsApp Web.js REAL...')
    setCurrentStep(3)
    
    try {
      const response = await fetch(`/api/instances/${id}/connect`, {
        method: 'POST'
      })
      
      if (response.ok) {
        addLog('✅ Conexão iniciada. Aguardando QR Code real...', 'success')
        
        // Poll for QR code
        const pollQR = setInterval(async () => {
          try {
            const qrResponse = await fetch(`/api/instances/${id}/qr`)
            if (qrResponse.ok) {
              const qrData = await qrResponse.json()
              if (qrData.qrCode) {
                setQrCode(qrData.qrCode)
                addLog('📱 QR Code REAL gerado! Escaneie com seu WhatsApp.', 'success')
                setCurrentStep(4)
                clearInterval(pollQR)
                
                // Start polling for connection
                pollForConnection(id)
              }
            }
          } catch (error) {
            console.log('QR code not ready yet')
          }
        }, 3000)
        
        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(pollQR)
          if (!qrCode) {
            addLog('⏰ Timeout: QR Code não foi gerado', 'error')
          }
        }, 120000)
      } else {
        addLog('❌ Erro ao iniciar conexão', 'error')
        setIsLoading(false)
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
      setIsLoading(false)
    }
  }

  const pollForConnection = (instanceId: string) => {
    addLog('🔄 Monitorando conexão WhatsApp...')
    
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch(`/api/instances/${instanceId}/status`)
        const statusData = await statusResponse.json()
        
        setInstance((prev: any) => prev ? { ...prev, ...statusData } : null)
        
        if (statusData.status === 'connected') {
          addLog(`🎉 CONECTADO COM WHATSAPP REAL! Número: ${statusData.phoneNumber}`, 'success')
          setCurrentStep(5)
          setIsLoading(false)
          clearInterval(pollInterval)
        } else if (statusData.status === 'error') {
          addLog(`❌ Erro na conexão: ${statusData.error || 'Erro desconhecido'}`, 'error')
          setIsLoading(false)
          clearInterval(pollInterval)
        }
      } catch (error) {
        addLog('❌ Erro ao verificar status', 'error')
      }
    }, 5000)
    
    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
      if (instance?.status !== 'connected') {
        addLog('⏰ Timeout: Conexão não estabelecida em 5 minutos', 'error')
        setIsLoading(false)
      }
    }, 300000)
  }

  const sendRealMessage = async () => {
    if (!instance || !to || !message) return
    
    addLog(`📤 Enviando mensagem REAL para ${to}...`)
    
    try {
      const response = await fetch(`/api/instances/${instance._id}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message })
      })
      
      const data = await response.json()
      if (response.ok) {
        addLog(`✅ Mensagem REAL enviada com sucesso! ID: ${data.messageId}`, 'success')
      } else {
        addLog(`❌ Erro ao enviar: ${data.message}`, 'error')
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
    }
  }

  const resetTest = () => {
    setInstance(null)
    setQrCode('')
    setIsLoading(false)
    setCurrentStep(0)
    setLogs([])
    setTo('')
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      connected: { color: 'bg-green-100 text-green-800', label: '✅ Conectado REAL' },
      connecting: { color: 'bg-yellow-100 text-yellow-800', label: '🔄 Conectando...' },
      disconnected: { color: 'bg-gray-100 text-gray-800', label: '⚪ Desconectado' },
      error: { color: 'bg-red-100 text-red-800', label: '❌ Erro' }
    }
    
    const config = configs[status as keyof typeof configs] || configs.disconnected
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            📱 WhatsApp Web.js REAL
          </h1>
          <p className="text-xl text-gray-600">
            Conexão Real com WhatsApp Business
          </p>
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            🔥 Sistema Real - Não é Simulação!
          </div>
        </div>

        {/* Progress Steps */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">📊 Progresso da Conexão Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex flex-col items-center text-center ${
                    index <= currentStep ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 text-sm font-bold ${
                    index < currentStep ? 'bg-green-500 text-white' : 
                    index === currentStep ? 'bg-emerald-500 text-white' : 
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <span className="text-xs max-w-20">{step}</span>
                </div>
              ))}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">🎮 Controles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instanceName">Nome da Instância</Label>
                <Input
                  id="instanceName"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  disabled={isLoading}
                  className="mt-1 border-green-200 focus:border-green-400"
                />
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={createInstance} 
                  disabled={!instanceName || isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {isLoading ? '🔄 Conectando WhatsApp Real...' : '🚀 Conectar WhatsApp REAL'}
                </Button>
                
                <Button 
                  onClick={resetTest} 
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                  disabled={isLoading}
                >
                  🔄 Reiniciar
                </Button>
              </div>

              {instance && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span><strong>Status:</strong></span>
                        {getStatusBadge(instance.status)}
                      </div>
                      {instance.phoneNumber && (
                        <div className="text-green-700">
                          <strong>📱 Número Real:</strong> {instance.phoneNumber}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Message Test */}
              {instance?.status === 'connected' && (
                <div className="border-t border-green-200 pt-4 space-y-3">
                  <h3 className="font-medium text-green-700">💬 Enviar Mensagem Real</h3>
                  
                  <div>
                    <Label htmlFor="to">Número (com DDD)</Label>
                    <Input
                      id="to"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="5511999999999"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Input
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                  
                  <Button 
                    onClick={sendRealMessage}
                    disabled={!to || !message}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    📤 Enviar Mensagem REAL
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">📱 QR Code WhatsApp Real</CardTitle>
            </CardHeader>
            <CardContent>
              {qrCode ? (
                <div className="text-center space-y-4">
                  <img 
                    src={qrCode} 
                    alt="QR Code WhatsApp Real" 
                    className="mx-auto border-2 border-green-300 rounded-lg shadow-lg"
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-600">
                      ✅ QR Code REAL Gerado!
                    </p>
                    <p className="text-xs text-gray-600">
                      Escaneie com o WhatsApp do seu celular
                    </p>
                    <div className="bg-green-100 p-2 rounded text-xs text-green-700">
                      🔥 Este é um QR Code real do WhatsApp!
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">📱</div>
                  <p>QR Code Real aparecerá aqui</p>
                  <p className="text-xs mt-2">Aguarde a conexão com WhatsApp Web.js</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logs */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">📋 Logs do Sistema Real</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-80 overflow-y-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-gray-500">
                    💻 Aguardando conexão com WhatsApp Real...
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
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700">📖 Como Usar o WhatsApp Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-green-600">🎯 Passos para Conexão Real:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Clique em "🚀 Conectar WhatsApp REAL"</li>
                  <li>Aguarde a criação da instância real</li>
                  <li>Aguarde o QR Code REAL aparecer</li>
                  <li>Escaneie com o WhatsApp do celular</li>
                  <li>Aguarde autenticação real</li>
                  <li>Envie mensagens reais!</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-green-600">⚡ Sistema Real:</h3>
                <ul className="space-y-2 text-sm">
                  <li>✅ WhatsApp Web.js real</li>
                  <li>✅ QR Code autêntico do WhatsApp</li>
                  <li>✅ Conexão real com servidores WhatsApp</li>
                  <li>✅ Mensagens reais enviadas</li>
                  <li>✅ Sessão persistente</li>
                  <li>✅ Eventos em tempo real</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Importante:</strong> Este sistema conecta com o WhatsApp real. 
                Use apenas números de teste ou seu próprio número para evitar spam.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
