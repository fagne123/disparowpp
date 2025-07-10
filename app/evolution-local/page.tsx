'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Server, 
  Download, 
  Terminal, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react'

export default function EvolutionLocalPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const testLocalConnection = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/evolution/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiUrl: 'http://localhost:8080',
          apiKey: 'B6D711FCDE4D4FD5936544120E713976'
        })
      })

      const result = await response.json()
      setTestResult(result)

    } catch (error) {
      setTestResult({ 
        success: false, 
        message: 'Erro de conexão - Evolution API local não está rodando' 
      })
    }

    setIsLoading(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const commands = [
    'git clone https://github.com/EvolutionAPI/evolution-api.git',
    'cd evolution-api',
    'npm install',
    'cp .env.example .env',
    'npm run start:prod'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            🏠 Evolution API Local
          </h1>
          <p className="text-xl text-gray-600">
            Configure uma instância local da Evolution API para desenvolvimento
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <Badge className="bg-orange-100 text-orange-800">Desenvolvimento</Badge>
            <Badge className="bg-red-100 text-red-800">Localhost:8080</Badge>
            <Badge className="bg-pink-100 text-pink-800">Alternativa</Badge>
          </div>
        </div>

        {/* Current Status */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center justify-between">
              <span className="flex items-center">
                <Server className="h-5 w-5 mr-2" />
                Status Atual
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={testLocalConnection}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Testar Local'
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2 text-blue-600">🌐 Servidor Externo:</h3>
                <div className="space-y-1 text-sm">
                  <p>✅ URL: https://api.marcussviniciusa.cloud</p>
                  <p>✅ Status: Online e acessível</p>
                  <p>❌ API Key: Necessária (401 Unauthorized)</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-orange-600">🏠 Servidor Local:</h3>
                <div className="space-y-1 text-sm">
                  {testResult ? (
                    testResult.success ? (
                      <>
                        <p className="text-green-600">✅ Status: Funcionando</p>
                        <p className="text-green-600">✅ Instâncias: {testResult.data?.instanceCount || 0}</p>
                        <p className="text-green-600">✅ API Key: Configurada</p>
                      </>
                    ) : (
                      <>
                        <p className="text-red-600">❌ Status: Offline</p>
                        <p className="text-red-600">❌ Erro: {testResult.message}</p>
                      </>
                    )
                  ) : (
                    <>
                      <p className="text-gray-600">⏳ Status: Não testado</p>
                      <p className="text-gray-600">⏳ Clique em "Testar Local"</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Installation Guide */}
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-700 flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Instalação Local
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Alternativa:</strong> Use isso apenas se não conseguir a API Key do servidor externo.
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="font-semibold mb-3 text-orange-600">📋 Comandos de Instalação:</h3>
                <div className="space-y-2">
                  {commands.map((command, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="bg-gray-900 text-green-400 p-2 rounded font-mono text-xs flex-1">
                        {command}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(command)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-orange-600">⚙️ Configuração:</h3>
                <div className="text-sm space-y-1">
                  <p>• Porta padrão: 8080</p>
                  <p>• API Key padrão: B6D711FCDE4D4FD5936544120E713976</p>
                  <p>• Webhook: http://localhost:3000/api/webhooks/evolution</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open('https://github.com/EvolutionAPI/evolution-api', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open('http://localhost:8080', '_blank')}
                >
                  <Server className="h-4 w-4 mr-2" />
                  Painel Local
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center">
                <Terminal className="h-5 w-5 mr-2" />
                Instruções Detalhadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-red-600">🎯 Opções Disponíveis:</h3>
                <div className="space-y-3 text-sm">
                  <div className="p-3 border border-green-200 bg-green-50 rounded">
                    <strong className="text-green-700">Opção 1: Servidor Externo (Recomendado)</strong>
                    <p className="text-green-600 mt-1">
                      • Obtenha a API Key do servidor externo
                      • Use: http://localhost:3000/setup-evolution
                      • Mais estável e profissional
                    </p>
                  </div>
                  
                  <div className="p-3 border border-orange-200 bg-orange-50 rounded">
                    <strong className="text-orange-700">Opção 2: Servidor Local (Desenvolvimento)</strong>
                    <p className="text-orange-600 mt-1">
                      • Instale Evolution API localmente
                      • Use para testes e desenvolvimento
                      • Requer configuração adicional
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-red-600">📝 Passos para Local:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Execute os comandos de instalação</li>
                  <li>Aguarde a Evolution API iniciar</li>
                  <li>Acesse http://localhost:8080</li>
                  <li>Clique em "Testar Local" aqui</li>
                  <li>Se funcionar, atualize o .env.local</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-red-600">🔧 Configuração .env.local:</h3>
                <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs">
                  <div>EVOLUTION_API_URL=http://localhost:8080</div>
                  <div>EVOLUTION_API_KEY=B6D711FCDE4D4FD5936544120E713976</div>
                  <div>EVOLUTION_WEBHOOK_URL=http://localhost:3000/api/webhooks/evolution</div>
                </div>
              </div>

              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Importante:</strong> O servidor local é apenas para desenvolvimento. 
                  Para produção, use sempre o servidor externo.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-700">💡 Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2 text-purple-600">🎯 Melhor Opção:</h3>
                <p className="text-purple-700">
                  Obter a API Key do servidor externo. É mais estável, 
                  profissional e não requer instalação local.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-purple-600">🔧 Para Desenvolvimento:</h3>
                <p className="text-purple-700">
                  Se precisar testar offline ou fazer desenvolvimento, 
                  a instalação local é uma boa alternativa.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-purple-600">🚀 Próximos Passos:</h3>
                <p className="text-purple-700">
                  Assim que tiver uma Evolution API funcionando, 
                  podemos implementar o sistema de campanhas!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
