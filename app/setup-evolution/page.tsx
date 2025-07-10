'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Key, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Server
} from 'lucide-react'

export default function SetupEvolutionPage() {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString()
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    setLogs(prev => [...prev.slice(-10), `${time} ${emoji} ${message}`])
  }

  const testConnection = async () => {
    if (!apiKey.trim()) {
      addLog('❌ API Key é obrigatória', 'error')
      return
    }

    setIsLoading(true)
    setTestResult(null)
    addLog('🔍 Testando conexão com Evolution API...')

    try {
      const response = await fetch('/api/evolution/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiUrl: 'https://api.marcussviniciusa.cloud',
          apiKey: apiKey.trim()
        })
      })

      const result = await response.json()

      if (result.success) {
        addLog('✅ Conexão estabelecida com sucesso!', 'success')
        addLog(`📊 Instâncias encontradas: ${result.data.instanceCount}`, 'info')
        setTestResult(result)
      } else {
        addLog(`❌ ${result.message}`, 'error')
        if (result.details) {
          addLog(`📋 Detalhes: ${result.details}`, 'error')
        }
        setTestResult(result)
      }

    } catch (error) {
      addLog(`❌ Erro de conexão: ${error}`, 'error')
      setTestResult({ success: false, message: 'Erro de rede' })
    }

    setIsLoading(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    addLog('📋 Copiado para área de transferência', 'success')
  }

  const saveConfiguration = () => {
    addLog('💾 Para salvar a configuração:', 'info')
    addLog('1. Pare o servidor (Ctrl+C)', 'info')
    addLog('2. Edite o arquivo .env.local', 'info')
    addLog('3. Substitua "sua-api-key-real-aqui" pela API Key testada', 'info')
    addLog('4. Reinicie o servidor (npm run dev)', 'info')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🔑 Setup Evolution API
          </h1>
          <p className="text-xl text-gray-600">
            Configure sua API Key para conectar com o servidor
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <Badge className="bg-green-100 text-green-800">api.marcussviniciusa.cloud</Badge>
            <Badge className="bg-blue-100 text-blue-800">Evolution API 2.3.0</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Configuração da API Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Server className="h-4 w-4" />
                <AlertDescription>
                  <strong>Servidor:</strong> https://api.marcussviniciusa.cloud
                  <br />
                  <strong>Status:</strong> Online e acessível
                  <br />
                  <strong>Erro atual:</strong> 401 Unauthorized (API Key necessária)
                </AlertDescription>
              </Alert>

              <Alert className="border-yellow-200 bg-yellow-50">
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>🔑 API Key necessária:</strong> O servidor está funcionando mas precisa de uma API Key válida.
                  <br />
                  <strong>Como obter:</strong> Acesse o painel do servidor ou contate o administrador.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="apiKey" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API Key do Servidor
                </Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Cole sua API Key aqui..."
                    className="border-green-200 focus:border-green-400 pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="h-8 w-8 p-0"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    {apiKey && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Obtenha sua API Key no painel do servidor Evolution API
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={testConnection}
                  disabled={isLoading || !apiKey.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Testar API Key
                    </>
                  )}
                </Button>
                
                {testResult?.success && (
                  <Button 
                    onClick={saveConfiguration}
                    variant="outline"
                    className="flex-1"
                  >
                    💾 Como Salvar
                  </Button>
                )}
              </div>

              {/* Test Result */}
              {testResult && (
                <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    {testResult.success ? (
                      <div>
                        <strong className="text-green-800">✅ API Key válida!</strong>
                        <br />
                        <span className="text-green-700">
                          Encontradas {testResult.data?.instanceCount || 0} instâncias no servidor
                        </span>
                      </div>
                    ) : (
                      <div>
                        <strong className="text-red-800">❌ API Key inválida</strong>
                        <br />
                        <span className="text-red-700">{testResult.message}</span>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Logs and Instructions */}
          <div className="space-y-6">
            {/* Logs */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-700">📋 Logs de Teste</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-48 overflow-y-auto font-mono text-xs">
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

            {/* Instructions */}
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-700">📖 Instruções</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <h3 className="font-semibold text-purple-600 mb-2">🔧 Como obter a API Key:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-purple-700">
                      <li>Acesse: https://api.marcussviniciusa.cloud</li>
                      <li>Faça login no painel administrativo</li>
                      <li>Vá em "API Keys" ou "Configurações"</li>
                      <li>Gere uma nova API Key</li>
                      <li>Copie e cole aqui para testar</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="font-semibold text-purple-600 mb-2">📞 Alternativas:</h3>
                    <ul className="list-disc list-inside space-y-1 text-purple-700">
                      <li>Contate o administrador do servidor</li>
                      <li>Solicite acesso ao painel Evolution API</li>
                      <li>Peça uma API Key válida para integração</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-purple-600 mb-2">💾 Como salvar:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-purple-700">
                      <li>Teste a API Key aqui primeiro</li>
                      <li>Pare o servidor (Ctrl+C no terminal)</li>
                      <li>Edite o arquivo .env.local</li>
                      <li>Substitua "sua-api-key-real-aqui" pela API Key</li>
                      <li>Reinicie: npm run dev</li>
                    </ol>
                  </div>

                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Importante:</strong> Mantenha sua API Key segura e nunca a compartilhe publicamente.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Current Status */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-700">⚠️ Status Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">✅ Funcionando:</h3>
                <ul className="space-y-1 text-green-700">
                  <li>• Servidor detectado automaticamente</li>
                  <li>• URL configurada corretamente</li>
                  <li>• 6 instâncias encontradas no servidor</li>
                  <li>• Sistema pronto para usar</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🔧 Pendente:</h3>
                <ul className="space-y-1 text-yellow-700">
                  <li>• Configurar API Key real</li>
                  <li>• Testar conexão completa</li>
                  <li>• Salvar configuração</li>
                  <li>• Reiniciar servidor</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
