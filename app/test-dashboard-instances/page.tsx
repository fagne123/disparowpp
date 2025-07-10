'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Server,
  Zap,
  MessageSquare,
  QrCode
} from 'lucide-react'

export default function TestDashboardInstancesPage() {
  const [instanceName, setInstanceName] = useState('TestDashboard')
  const [instanceId, setInstanceId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [qrCode, setQrCode] = useState('')
  const [status, setStatus] = useState('')

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString()
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    setLogs(prev => [...prev.slice(-15), `${time} ${emoji} ${message}`])
  }

  const createInstance = async () => {
    setIsLoading(true)
    addLog('🔧 Criando instância via dashboard API...')
    
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
    addLog('🔗 Conectando instância...')
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/connect`, {
        method: 'POST'
      })
      
      const data = await response.json()
      if (response.ok) {
        addLog(`✅ Conexão iniciada: ${data.message}`, 'success')
        
        // Start monitoring
        startMonitoring()
      } else {
        addLog(`❌ Erro na conexão: ${data.message}`, 'error')
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
    }
    setIsLoading(false)
  }

  const startMonitoring = () => {
    addLog('📊 Iniciando monitoramento...', 'info')
    
    const interval = setInterval(async () => {
      try {
        // Get QR code
        const qrResponse = await fetch(`/api/instances/${instanceId}/qr`)
        if (qrResponse.ok) {
          const qrData = await qrResponse.json()
          if (qrData.qrCode && qrData.qrCode !== qrCode) {
            setQrCode(qrData.qrCode)
            addLog('📱 QR Code obtido!', 'success')
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
              addLog(`🎉 Conectado! Número: ${statusData.phoneNumber}`, 'success')
              clearInterval(interval)
            }
          }
        }
      } catch (error) {
        console.error('Monitoring error:', error)
      }
    }, 3000)

    // Stop monitoring after 2 minutes
    setTimeout(() => {
      clearInterval(interval)
      addLog('⏰ Monitoramento finalizado', 'info')
    }, 120000)
  }

  const sendTestMessage = async () => {
    if (!instanceId) return
    
    addLog('📤 Enviando mensagem de teste...')
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: '5511999999999', 
          message: 'Teste do DisparoWPP via Evolution API!' 
        })
      })
      
      const data = await response.json()
      if (response.ok) {
        addLog(`✅ Mensagem enviada!`, 'success')
      } else {
        addLog(`❌ Erro no envio: ${data.message}`, 'error')
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
    }
  }

  const runFullTest = async () => {
    setLogs([])
    setQrCode('')
    setStatus('')
    setInstanceId('')
    
    addLog('🚀 Iniciando teste completo do dashboard...', 'info')
    
    await createInstance()
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (instanceId) {
      await connectInstance()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🧪 Teste Dashboard de Instâncias
          </h1>
          <p className="text-xl text-gray-600">
            Teste completo da funcionalidade de instâncias do dashboard
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">Dashboard Test</Badge>
            <Badge className="bg-purple-100 text-purple-800">Full Flow</Badge>
            <Badge className="bg-green-100 text-green-800">Evolution API</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center">
                <Server className="h-5 w-5 mr-2" />
                Controles de Teste
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
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={runFullTest} 
                  disabled={!instanceName || isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Teste Completo
                    </>
                  )}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={createInstance} 
                    disabled={!instanceName || isLoading}
                    variant="outline"
                    size="sm"
                  >
                    Criar
                  </Button>
                  
                  <Button 
                    onClick={connectInstance} 
                    disabled={!instanceId || isLoading}
                    variant="outline"
                    size="sm"
                  >
                    Conectar
                  </Button>
                </div>
                
                <Button 
                  onClick={sendTestMessage} 
                  disabled={!instanceId || status !== 'connected'}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar Teste
                </Button>
              </div>

              {instanceId && (
                <Alert className="border-blue-200 bg-blue-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div><strong>ID:</strong> {instanceId}</div>
                      {status && <div><strong>Status:</strong> {status}</div>}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              {qrCode ? (
                <div className="text-center space-y-4">
                  <img 
                    src={qrCode} 
                    alt="QR Code" 
                    className="mx-auto border-2 border-green-300 rounded-lg shadow-lg max-w-full"
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-600">
                      ✅ QR Code gerado!
                    </p>
                    <p className="text-xs text-gray-600">
                      Escaneie com o WhatsApp
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
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-700">📋 Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-80 overflow-y-auto font-mono text-xs">
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

        {/* Instructions */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-700">📖 Teste do Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-yellow-600">🎯 O que este teste faz:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Cria instância via API do dashboard</li>
                  <li>Conecta usando Evolution API</li>
                  <li>Monitora QR Code e status</li>
                  <li>Testa envio de mensagem</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-yellow-600">✅ Validações:</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Criação de instância funcionando</li>
                  <li>• Conexão com Evolution API</li>
                  <li>• Geração de QR Code</li>
                  <li>• Monitoramento de status</li>
                  <li>• Envio de mensagens</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
