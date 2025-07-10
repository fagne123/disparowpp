'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

export default function TesteFinalPage() {
  const [instanceName, setInstanceName] = useState('DisparoWPP Teste')
  const [instance, setInstance] = useState<any>(null)
  const [qrCode, setQrCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('🚀 Olá! Esta é uma mensagem de teste do DisparoWPP!')
  const [to, setTo] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    '🔧 Criar Instância',
    '🔗 Conectar WhatsApp', 
    '📱 Gerar QR Code',
    '⏳ Aguardar Conexão',
    '✅ Pronto para Usar'
  ]

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString()
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    setLogs(prev => [...prev, `${time} ${emoji} ${message}`])
  }

  const createInstance = async () => {
    setIsLoading(true)
    setCurrentStep(1)
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
        setCurrentStep(2)
        
        // Auto-connect
        setTimeout(() => connectInstance(data.instance._id), 1000)
      } else {
        addLog(`Erro: ${data.message}`, 'error')
        setIsLoading(false)
      }
    } catch (error) {
      addLog(`Erro de conexão: ${error}`, 'error')
      setIsLoading(false)
    }
  }

  const connectInstance = async (instanceId?: string) => {
    const id = instanceId || instance?._id
    if (!id) return
    
    addLog('Iniciando processo de conexão...')
    setCurrentStep(3)
    
    try {
      const response = await fetch(`/api/instances/${id}/connect`, {
        method: 'POST'
      })
      
      if (response.ok) {
        addLog('Conexão iniciada. Gerando QR Code...', 'success')
        
        // Get QR code after 2 seconds
        setTimeout(async () => {
          try {
            const qrResponse = await fetch(`/api/instances/${id}/qr`)
            if (qrResponse.ok) {
              const qrData = await qrResponse.json()
              setQrCode(qrData.qrCode)
              addLog('QR Code gerado! Escaneie com seu WhatsApp.', 'success')
              setCurrentStep(4)
              
              // Start polling for connection
              pollForConnection(id)
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

  const pollForConnection = (instanceId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch(`/api/instances/${instanceId}/status`)
        const statusData = await statusResponse.json()
        
        setInstance((prev: any) => prev ? { ...prev, ...statusData } : null)
        
        if (statusData.status === 'connected') {
          addLog(`🎉 Conectado com sucesso! Número: ${statusData.phoneNumber}`, 'success')
          setCurrentStep(5)
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
        addLog('⏰ Timeout: Conexão não estabelecida em 2 minutos', 'error')
        setIsLoading(false)
      }
    }, 120000)
  }

  const sendTestMessage = async () => {
    if (!instance || !to || !message) return
    
    addLog(`📤 Enviando mensagem para ${to}...`)
    
    try {
      const response = await fetch(`/api/instances/${instance._id}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message })
      })
      
      const data = await response.json()
      if (response.ok) {
        addLog(`✅ Mensagem enviada com sucesso!`, 'success')
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
      connected: { color: 'bg-green-100 text-green-800', label: '✅ Conectado' },
      connecting: { color: 'bg-yellow-100 text-yellow-800', label: '🔄 Conectando' },
      disconnected: { color: 'bg-gray-100 text-gray-800', label: '⚪ Desconectado' }
    }
    
    const config = configs[status as keyof typeof configs] || configs.disconnected
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🚀 DisparoWPP - Teste Final
          </h1>
          <p className="text-xl text-gray-600">
            Sistema Completo de WhatsApp Business
          </p>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Progresso do Teste</CardTitle>
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
                    index === currentStep ? 'bg-blue-500 text-white' : 
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
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>🎮 Controles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instanceName">Nome da Instância</Label>
                <Input
                  id="instanceName"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={createInstance} 
                  disabled={!instanceName || isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? '🔄 Processando...' : '🚀 Iniciar Teste Completo'}
                </Button>
                
                <Button 
                  onClick={resetTest} 
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  🔄 Reiniciar Teste
                </Button>
              </div>

              {instance && (
                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span><strong>Status:</strong></span>
                        {getStatusBadge(instance.status)}
                      </div>
                      {instance.phoneNumber && (
                        <div>
                          <strong>📱 Número:</strong> {instance.phoneNumber}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Message Test */}
              {instance?.status === 'connected' && (
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-medium">💬 Teste de Mensagem</h3>
                  
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
                    📤 Enviar Teste
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle>📱 QR Code WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              {qrCode ? (
                <div className="text-center space-y-4">
                  <img 
                    src={qrCode} 
                    alt="QR Code WhatsApp" 
                    className="mx-auto border-2 border-green-200 rounded-lg shadow-lg"
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
                  <div className="text-6xl mb-4">📱</div>
                  <p>QR Code aparecerá aqui</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logs */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Logs do Sistema</CardTitle>
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
            <CardTitle>📖 Como Usar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-green-600">🎯 Passos do Teste:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Clique em "🚀 Iniciar Teste Completo"</li>
                  <li>Aguarde a criação automática da instância</li>
                  <li>Aguarde o QR Code aparecer (2 segundos)</li>
                  <li>Escaneie com o WhatsApp do celular</li>
                  <li>Aguarde confirmação (15 segundos simulados)</li>
                  <li>Teste o envio de mensagem</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-blue-600">⚡ Recursos Demonstrados:</h3>
                <ul className="space-y-2 text-sm">
                  <li>✅ Criação automática de instâncias</li>
                  <li>✅ Geração de QR Code em tempo real</li>
                  <li>✅ Simulação de conexão WhatsApp</li>
                  <li>✅ Interface responsiva e moderna</li>
                  <li>✅ Logs detalhados com timestamps</li>
                  <li>✅ Sistema de progresso visual</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
