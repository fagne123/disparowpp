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

export default function TestCreatePage() {
  const [instanceName, setInstanceName] = useState('TestDebug')
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
    addLog('🔧 Testando criação de instância na Evolution API...')
    
    try {
      const response = await fetch('/api/test-create-instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName })
      })
      
      const data = await response.json()
      
      if (data.success) {
        addLog(`✅ Instância criada com sucesso!`, 'success')
        addLog(`📋 Payload usado: ${JSON.stringify(data.payload)}`, 'info')
        setResult(data)
      } else {
        addLog(`❌ Falha na criação: ${data.message}`, 'error')
        if (data.originalError) {
          addLog(`📋 Erro original: ${data.originalError}`, 'error')
        }
        if (data.minimalError) {
          addLog(`📋 Erro minimal: ${data.minimalError}`, 'error')
        }
        setResult(data)
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🔧 Teste de Criação de Instância
          </h1>
          <p className="text-xl text-gray-600">
            Debug da criação de instâncias na Evolution API
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">Debug Mode</Badge>
            <Badge className="bg-purple-100 text-purple-800">Evolution API</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center">
                <Server className="h-5 w-5 mr-2" />
                Teste de Criação
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

              <Button 
                onClick={testCreateInstance} 
                disabled={!instanceName || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Testar Criação de Instância
                  </>
                )}
              </Button>

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
                        <span className="text-green-700">{result.message}</span>
                      </div>
                    ) : (
                      <div>
                        <strong className="text-red-800">❌ Falha</strong>
                        <br />
                        <span className="text-red-700">{result.message}</span>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Logs */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-700">📋 Logs de Debug</CardTitle>
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

        {/* Result Details */}
        {result && (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-700">📊 Detalhes do Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-700">📖 O que este teste faz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <h3 className="font-semibold text-yellow-600 mb-2">🧪 Testes realizados:</h3>
                <ol className="list-decimal list-inside space-y-1 text-yellow-700">
                  <li>Testa payload original (com webhook)</li>
                  <li>Testa payload minimal (só o básico)</li>
                  <li>Verifica estrutura das instâncias existentes</li>
                  <li>Mostra erros detalhados de cada tentativa</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-semibold text-yellow-600 mb-2">🎯 Objetivo:</h3>
                <p className="text-yellow-700">
                  Descobrir qual formato de payload a Evolution API está esperando 
                  para criar instâncias com sucesso.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
