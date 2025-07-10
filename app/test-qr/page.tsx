'use client'

import { useState, useEffect } from 'react'
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
  QrCode,
  Zap
} from 'lucide-react'

export default function TestQRPage() {
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

  const createAndTestQR = async () => {
    setIsLoading(true)
    setLogs([])
    setQrCode('')
    setStatus('')
    
    addLog('🚀 Criando nova instância para teste de QR Code...')
    
    try {
      // Create instance
      const createResponse = await fetch('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `TestQR_${Date.now()}` })
      })
      
      const createData = await createResponse.json()
      
      if (createResponse.ok) {
        const newInstanceId = createData.instance._id
        setInstanceId(newInstanceId)
        addLog(`✅ Instância criada: ${newInstanceId}`, 'success')
        
        // Wait a bit for Evolution API to process
        addLog('⏳ Aguardando 3 segundos para Evolution API processar...')
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Try to get QR code
        await getQRCode(newInstanceId)
        
      } else {
        addLog(`❌ Erro ao criar instância: ${createData.message}`, 'error')
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
    }
    
    setIsLoading(false)
  }

  const getQRCode = async (instanceIdToUse?: string) => {
    const targetId = instanceIdToUse || instanceId
    if (!targetId) {
      addLog('❌ ID da instância necessário', 'error')
      return
    }

    addLog(`📱 Buscando QR Code para: ${targetId}`)
    
    try {
      const response = await fetch(`/api/instances/${targetId}/qr`)
      const data = await response.json()
      
      if (response.ok) {
        setQrCode(data.qrCode)
        addLog(`✅ QR Code obtido com sucesso!`, 'success')
      } else {
        addLog(`⚠️ QR Code não disponível: ${data.message}`, 'error')
        addLog(`📊 Status: ${data.status || 'unknown'}`, 'info')
      }
    } catch (error) {
      addLog(`❌ Erro ao buscar QR Code: ${error}`, 'error')
    }
  }

  const getStatus = async () => {
    if (!instanceId) {
      addLog('❌ ID da instância necessário', 'error')
      return
    }

    addLog(`📊 Buscando status para: ${instanceId}`)
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/status`)
      const data = await response.json()
      
      if (response.ok) {
        setStatus(data.status)
        addLog(`📊 Status: ${data.status}`, 'success')
        if (data.phoneNumber) {
          addLog(`📱 Número: ${data.phoneNumber}`, 'info')
        }
      } else {
        addLog(`❌ Erro ao obter status: ${data.message}`, 'error')
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
    }
  }

  const startMonitoring = () => {
    if (!instanceId) return
    
    addLog('🔄 Iniciando monitoramento automático...')
    
    const interval = setInterval(async () => {
      await getQRCode()
      await getStatus()
    }, 5000)

    // Stop after 2 minutes
    setTimeout(() => {
      clearInterval(interval)
      addLog('⏰ Monitoramento finalizado', 'info')
    }, 120000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            📱 Teste de QR Code
          </h1>
          <p className="text-xl text-gray-600">
            Teste específico para geração e recuperação de QR Code
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">QR Code Test</Badge>
            <Badge className="bg-purple-100 text-purple-800">Evolution API</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                Controles de Teste
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instanceId">ID da Instância</Label>
                <Input
                  id="instanceId"
                  value={instanceId}
                  onChange={(e) => setInstanceId(e.target.value)}
                  placeholder="Cole o ID aqui ou crie nova"
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={createAndTestQR} 
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Criar & Testar QR
                    </>
                  )}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => getQRCode()} 
                    disabled={!instanceId || isLoading}
                    variant="outline"
                    size="sm"
                  >
                    Buscar QR
                  </Button>
                  
                  <Button 
                    onClick={getStatus} 
                    disabled={!instanceId || isLoading}
                    variant="outline"
                    size="sm"
                  >
                    Status
                  </Button>
                </div>
                
                <Button 
                  onClick={startMonitoring} 
                  disabled={!instanceId || isLoading}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  🔄 Monitorar (2min)
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
                      ✅ QR Code carregado!
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
            <CardTitle className="text-yellow-700">📖 Como testar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-yellow-600">🎯 Teste Automático:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Clique em "Criar & Testar QR"</li>
                  <li>Aguarde a instância ser criada</li>
                  <li>QR Code deve aparecer automaticamente</li>
                  <li>Use "Monitorar" para acompanhar mudanças</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-yellow-600">🔧 Teste Manual:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Cole um ID de instância existente</li>
                  <li>Clique em "Buscar QR"</li>
                  <li>Verifique o status com "Status"</li>
                  <li>Analise os logs para debug</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
