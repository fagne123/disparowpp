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
  MessageSquare,
  QrCode,
  Server,
  Zap
} from 'lucide-react'

export default function EvolutionTestCorrectedPage() {
  const [instanceName, setInstanceName] = useState('TestCorreto')
  const [instanceId, setInstanceId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [testResults, setTestResults] = useState<any>({})

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString()
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    setLogs(prev => [...prev.slice(-20), `${time} ${emoji} ${message}`])
  }

  const testCreateInstance = async () => {
    setIsLoading(true)
    addLog('🔧 Testando criação de instância com payload correto...')
    
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
        setTestResults(prev => ({ ...prev, create: true }))
      } else {
        addLog(`❌ Erro na criação: ${data.message}`, 'error')
        setTestResults(prev => ({ ...prev, create: false }))
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
      setTestResults(prev => ({ ...prev, create: false }))
    }
    setIsLoading(false)
  }

  const testConnect = async () => {
    if (!instanceId) return
    
    setIsLoading(true)
    addLog('🔗 Testando conexão com endpoint correto...')
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/connect`, {
        method: 'POST'
      })
      
      const data = await response.json()
      if (response.ok) {
        addLog(`✅ Conexão iniciada: ${data.message}`, 'success')
        setTestResults(prev => ({ ...prev, connect: true }))
      } else {
        addLog(`❌ Erro na conexão: ${data.message}`, 'error')
        setTestResults(prev => ({ ...prev, connect: false }))
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
      setTestResults(prev => ({ ...prev, connect: false }))
    }
    setIsLoading(false)
  }

  const testConnectionState = async () => {
    if (!instanceId) return
    
    addLog('🔍 Testando verificação de status...')
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/status`)
      const data = await response.json()
      
      if (response.ok) {
        addLog(`✅ Status obtido: ${data.status}`, 'success')
        setTestResults(prev => ({ ...prev, status: true }))
      } else {
        addLog(`❌ Erro no status: ${data.message}`, 'error')
        setTestResults(prev => ({ ...prev, status: false }))
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
      setTestResults(prev => ({ ...prev, status: false }))
    }
  }

  const testSendMessage = async () => {
    if (!instanceId) return
    
    addLog('📤 Testando envio com formato correto de número...')
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: '5511999999999', // Formato correto: código país + número
          message: 'Teste com formato correto da Evolution API' 
        })
      })
      
      const data = await response.json()
      if (response.ok) {
        addLog(`✅ Mensagem enviada com formato correto!`, 'success')
        setTestResults(prev => ({ ...prev, message: true }))
      } else {
        addLog(`❌ Erro no envio: ${data.message}`, 'error')
        setTestResults(prev => ({ ...prev, message: false }))
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
      setTestResults(prev => ({ ...prev, message: false }))
    }
  }

  const runAllTests = async () => {
    setTestResults({})
    setLogs([])
    addLog('🚀 Iniciando testes com implementação corrigida...', 'info')
    
    await testCreateInstance()
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (testResults.create) {
      await testConnect()
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      await testConnectionState()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await testSendMessage()
    }
    
    addLog('🏁 Testes finalizados!', 'info')
  }

  const getTestIcon = (test: string) => {
    const result = testResults[test]
    if (result === true) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (result === false) return <AlertTriangle className="h-4 w-4 text-red-600" />
    return <RefreshCw className="h-4 w-4 text-gray-400" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            ✅ Evolution API - Implementação Corrigida
          </h1>
          <p className="text-xl text-gray-600">
            Teste da implementação seguindo a documentação oficial
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <Badge className="bg-green-100 text-green-800">Documentação Oficial</Badge>
            <Badge className="bg-blue-100 text-blue-800">Payload Correto</Badge>
            <Badge className="bg-purple-100 text-purple-800">Endpoints Oficiais</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center">
                <Server className="h-5 w-5 mr-2" />
                Testes da Implementação Corrigida
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
                  className="border-green-200 focus:border-green-400"
                />
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={runAllTests} 
                  disabled={!instanceName || isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Executando Testes...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Executar Todos os Testes
                    </>
                  )}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={testCreateInstance} 
                    disabled={!instanceName || isLoading}
                    variant="outline"
                    size="sm"
                  >
                    Criar Instância
                  </Button>
                  
                  <Button 
                    onClick={testConnect} 
                    disabled={!instanceId || isLoading}
                    variant="outline"
                    size="sm"
                  >
                    Conectar
                  </Button>
                </div>
              </div>

              {/* Test Results */}
              <div className="space-y-2">
                <h3 className="font-medium text-green-700">Resultados dos Testes:</h3>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    {getTestIcon('create')}
                    <span>Criação de Instância (payload correto)</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    {getTestIcon('connect')}
                    <span>Conexão (endpoint oficial)</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    {getTestIcon('status')}
                    <span>Verificação de Status</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    {getTestIcon('message')}
                    <span>Envio de Mensagem (formato correto)</span>
                  </div>
                </div>
              </div>

              {instanceId && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Instance ID:</strong> {instanceId}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Logs */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700">📋 Logs dos Testes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-80 overflow-y-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-gray-500">
                    💻 Logs dos testes aparecerão aqui...
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

        {/* Corrections Made */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-700">🔧 Correções Implementadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-purple-600">✅ Payload de Criação:</h3>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono">
                  <div>{'{'}</div>
                  <div>&nbsp;&nbsp;"instanceName": "string",</div>
                  <div>&nbsp;&nbsp;"integration": "WHATSAPP-BAILEYS",</div>
                  <div>&nbsp;&nbsp;"qrcode": true,</div>
                  <div>&nbsp;&nbsp;"webhook": {'{'}</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;"url": "...",</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;"by_events": true</div>
                  <div>&nbsp;&nbsp;{'}'}</div>
                  <div>{'}'}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-purple-600">✅ Formato de Número:</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-red-100 p-2 rounded">
                    <strong className="text-red-700">❌ Antes:</strong>
                    <br />
                    <code>"5511999999999@s.whatsapp.net"</code>
                  </div>
                  <div className="bg-green-100 p-2 rounded">
                    <strong className="text-green-700">✅ Agora:</strong>
                    <br />
                    <code>"5511999999999"</code>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-purple-600">📋 Endpoints Corrigidos:</h3>
              <ul className="space-y-1 text-sm">
                <li>✅ <code>POST /instance/create</code> - Payload conforme documentação</li>
                <li>✅ <code>GET /instance/connect/{'{instance}'}</code> - Endpoint oficial</li>
                <li>✅ <code>GET /instance/connectionState/{'{instance}'}</code> - Verificação de status</li>
                <li>✅ <code>POST /message/sendText/{'{instance}'}</code> - Formato de número correto</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
