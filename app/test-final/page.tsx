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
  Zap
} from 'lucide-react'

export default function TestFinalPage() {
  const [instanceName, setInstanceName] = useState('TesteFinal')
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString()
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    setLogs(prev => [...prev.slice(-20), `${time} ${emoji} ${message}`])
  }

  const testCreateInstance = async () => {
    setIsLoading(true)
    setResult(null)
    setLogs([])
    addLog('🚀 Testando criação de instância com API corrigida...', 'info')
    
    try {
      addLog('📤 Enviando requisição para /api/instances...', 'info')
      
      const response = await fetch('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: instanceName })
      })
      
      const data = await response.json()
      
      addLog(`📊 Response status: ${response.status}`, 'info')
      addLog(`📋 Response data: ${JSON.stringify(data)}`, 'info')
      
      if (response.ok) {
        addLog(`✅ Instância criada com sucesso!`, 'success')
        addLog(`📋 ID: ${data.instance._id}`, 'info')
        addLog(`📋 Nome: ${data.instance.name}`, 'info')
        addLog(`📋 Status: ${data.instance.status}`, 'info')
        
        if (data.instance.error) {
          addLog(`⚠️ Erro na Evolution API: ${data.instance.error}`, 'error')
        } else {
          addLog(`✅ Criada no banco E na Evolution API!`, 'success')
        }
        
        setResult({ success: true, data })
      } else {
        addLog(`❌ Falha na criação: ${data.message}`, 'error')
        setResult({ success: false, data })
      }
    } catch (error) {
      addLog(`❌ Erro de rede: ${error}`, 'error')
      setResult({ success: false, error: error.toString() })
    }
    setIsLoading(false)
  }

  const checkEvolutionAPI = async () => {
    addLog('🔍 Verificando instâncias na Evolution API...', 'info')
    
    try {
      const response = await fetch('/api/test-evolution-direct')
      const data = await response.json()
      
      if (data.success) {
        addLog(`✅ Evolution API funcionando: ${data.instanceCount} instâncias`, 'success')
      } else {
        addLog(`❌ Evolution API com problema: ${data.message}`, 'error')
      }
    } catch (error) {
      addLog(`❌ Erro ao verificar Evolution API: ${error}`, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🎯 Teste Final - Criação de Instâncias
          </h1>
          <p className="text-xl text-gray-600">
            Teste da API corrigida que cria no banco E na Evolution API
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <Badge className="bg-green-100 text-green-800">API Corrigida</Badge>
            <Badge className="bg-blue-100 text-blue-800">Banco + Evolution</Badge>
            <Badge className="bg-purple-100 text-purple-800">Teste Final</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center">
                <Server className="h-5 w-5 mr-2" />
                Teste da API Corrigida
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
                  onClick={testCreateInstance} 
                  disabled={!instanceName || isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
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
                      Criar Instância (Banco + Evolution)
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={checkEvolutionAPI} 
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  🔍 Verificar Evolution API
                </Button>
              </div>

              {result && (
                <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    {result.success ? (
                      <div>
                        <strong className="text-green-800">✅ Sucesso!</strong>
                        <br />
                        <span className="text-green-700">
                          Instância criada no banco e Evolution API
                        </span>
                      </div>
                    ) : (
                      <div>
                        <strong className="text-red-800">❌ Falha</strong>
                        <br />
                        <span className="text-red-700">
                          Verifique os logs para detalhes
                        </span>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Logs */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700">📋 Logs Detalhados</CardTitle>
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

        {/* What was fixed */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-700">🔧 O que foi corrigido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-purple-600">❌ Antes (Problema):</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-red-100 p-3 rounded">
                    <strong className="text-red-700">API /api/instances:</strong>
                    <br />
                    <code className="text-red-600">
                      • Criava apenas no banco de dados<br />
                      • NÃO criava na Evolution API<br />
                      • Status 201 mas instância não existia
                    </code>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-purple-600">✅ Agora (Corrigido):</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-green-100 p-3 rounded">
                    <strong className="text-green-700">API /api/instances:</strong>
                    <br />
                    <code className="text-green-600">
                      • Cria no banco de dados<br />
                      • Cria na Evolution API<br />
                      • Logs detalhados de cada etapa<br />
                      • Tratamento de erros robusto
                    </code>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-purple-600">🎯 Fluxo Corrigido:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>✅ Validações (nome, limites, duplicatas)</li>
                <li>✅ Criação no banco de dados</li>
                <li>✅ Criação na Evolution API</li>
                <li>✅ Atualização do status conforme resultado</li>
                <li>✅ Logs detalhados de cada etapa</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
