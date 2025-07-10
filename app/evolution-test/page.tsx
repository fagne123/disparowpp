'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

export default function EvolutionTestPage() {
  const [instanceName, setInstanceName] = useState('Evolution Test')
  const [instanceId, setInstanceId] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('🚀 Olá! Esta é uma mensagem via Evolution API!')
  const [to, setTo] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [status, setStatus] = useState('')

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString()
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    setLogs(prev => [...prev, `${time} ${emoji} ${message}`])
  }

  const createInstance = async () => {
    setIsLoading(true)
    addLog('🔧 Criando instância via Evolution API...')
    
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
    addLog('🔗 Conectando via Evolution API...')
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/connect`, {
        method: 'POST'
      })
      
      const data = await response.json()
      if (response.ok) {
        addLog(`✅ Conexão iniciada: ${data.message}`, 'success')
        
        // Start polling for QR code
        pollForQR()
      } else {
        addLog(`❌ Erro: ${data.message}`, 'error')
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
    }
    setIsLoading(false)
  }

  const pollForQR = () => {
    let attempts = 0
    const maxAttempts = 30
    
    const poll = setInterval(async () => {
      attempts++
      
      try {
        const response = await fetch(`/api/instances/${instanceId}/qr`)
        if (response.ok) {
          const data = await response.json()
          setQrCode(data.qrCode)
          addLog('📱 QR Code recebido via Evolution API!', 'success')
          clearInterval(poll)
          
          // Start polling for connection status
          pollForConnection()
        } else if (attempts >= maxAttempts) {
          addLog('⏰ Timeout aguardando QR Code', 'error')
          clearInterval(poll)
        }
      } catch (error) {
        if (attempts >= maxAttempts) {
          addLog('⏰ Timeout aguardando QR Code', 'error')
          clearInterval(poll)
        }
      }
    }, 2000)
  }

  const pollForConnection = () => {
    let attempts = 0
    const maxAttempts = 60 // 2 minutes
    
    const poll = setInterval(async () => {
      attempts++
      
      try {
        const response = await fetch(`/api/instances/${instanceId}/status`)
        if (response.ok) {
          const data = await response.json()
          setStatus(data.status)
          
          if (data.status === 'connected') {
            addLog(`🎉 Conectado via Evolution API! Número: ${data.phoneNumber}`, 'success')
            clearInterval(poll)
          } else if (attempts >= maxAttempts) {
            addLog('⏰ Timeout aguardando conexão', 'error')
            clearInterval(poll)
          }
        }
      } catch (error) {
        if (attempts >= maxAttempts) {
          addLog('⏰ Timeout aguardando conexão', 'error')
          clearInterval(poll)
        }
      }
    }, 2000)
  }

  const sendMessage = async () => {
    if (!instanceId || !to || !message) return
    
    addLog(`📤 Enviando mensagem via Evolution API para ${to}...`)
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message })
      })
      
      const data = await response.json()
      if (response.ok) {
        addLog(`✅ Mensagem enviada via Evolution API!`, 'success')
      } else {
        addLog(`❌ Erro ao enviar: ${data.message}`, 'error')
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
    }
  }

  const resetTest = () => {
    setInstanceId('')
    setQrCode('')
    setStatus('')
    setLogs([])
    setTo('')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'connecting': return 'bg-yellow-100 text-yellow-800'
      case 'disconnected': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🚀 Evolution API 2.3.0 Test
          </h1>
          <p className="text-xl text-gray-600">
            Teste Completo com WhatsApp Baileys Integration
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              🔥 Evolution API 2.3.0
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              📱 WhatsApp Baileys
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-700">🎮 Controles Evolution API</CardTitle>
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
                  {isLoading ? '🔄 Criando...' : '🔧 Criar Instância'}
                </Button>
                
                <Button 
                  onClick={connectInstance} 
                  disabled={!instanceId || isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  🔗 Conectar Evolution API
                </Button>
                
                <Button 
                  onClick={resetTest} 
                  variant="outline"
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                  disabled={isLoading}
                >
                  🔄 Reset
                </Button>
              </div>

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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Message Test */}
              {status === 'connected' && (
                <div className="border-t border-purple-200 pt-4 space-y-3">
                  <h3 className="font-medium text-purple-700">💬 Enviar Mensagem</h3>
                  
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
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    📤 Enviar via Evolution API
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-700">📱 QR Code Evolution API</CardTitle>
            </CardHeader>
            <CardContent>
              {qrCode ? (
                <div className="text-center space-y-4">
                  <img 
                    src={qrCode} 
                    alt="QR Code Evolution API" 
                    className="mx-auto border-2 border-purple-300 rounded-lg shadow-lg"
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-purple-600">
                      ✅ QR Code da Evolution API!
                    </p>
                    <p className="text-xs text-gray-600">
                      Escaneie com o WhatsApp do seu celular
                    </p>
                    <div className="bg-purple-100 p-2 rounded text-xs text-purple-700">
                      🔥 Gerado pela Evolution API
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">📱</div>
                  <p>QR Code da Evolution API aparecerá aqui</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logs */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-700">📋 Logs Evolution API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-purple-400 p-4 rounded-lg h-80 overflow-y-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-gray-500">
                    💻 Aguardando teste da Evolution API...
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
            <CardTitle className="text-purple-700">📖 Como Usar Evolution API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-purple-600">🎯 Passos:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Certifique-se que Evolution API está rodando</li>
                  <li>Clique em "🔧 Criar Instância"</li>
                  <li>Clique em "🔗 Conectar Evolution API"</li>
                  <li>Aguarde o QR Code da Evolution API</li>
                  <li>Escaneie com o WhatsApp</li>
                  <li>Envie mensagens via Evolution API!</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-purple-600">⚡ Vantagens Evolution API:</h3>
                <ul className="space-y-2 text-sm">
                  <li>✅ Mais estável que WhatsApp Web.js</li>
                  <li>✅ Melhor performance</li>
                  <li>✅ Webhooks em tempo real</li>
                  <li>✅ Múltiplas instâncias</li>
                  <li>✅ API REST completa</li>
                  <li>✅ Menos bloqueios</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>📋 Pré-requisito:</strong> Evolution API deve estar rodando em http://localhost:8080
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
