'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestApiPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `${time}: ${message}`])
  }

  const runTest = async () => {
    setIsLoading(true)
    setResult(null)
    setLogs([])
    
    addLog('🧪 Iniciando teste direto do WhatsApp Web.js...')
    addLog('⏳ Isso pode demorar até 45 segundos...')
    
    try {
      const response = await fetch('/api/test-whatsapp', {
        method: 'POST'
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        addLog('✅ Teste concluído com sucesso!')
        if (data.qrCodeGenerated) {
          addLog('📱 QR Code foi gerado!')
        }
        if (data.clientReady) {
          addLog('🔗 Cliente conectou!')
        }
      } else {
        addLog('❌ Teste falhou')
        if (data.errorMessage) {
          addLog(`Erro: ${data.errorMessage}`)
        }
      }
    } catch (error) {
      addLog(`💥 Erro na requisição: ${error}`)
      setResult({ error: String(error) })
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Teste Direto WhatsApp Web.js
          </h1>
          <p className="text-gray-600">
            Teste isolado para verificar se o WhatsApp Web.js está funcionando
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>🔬 Teste de Funcionalidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runTest}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? '⏳ Testando... (até 45s)' : '🚀 Executar Teste'}
            </Button>

            {isLoading && (
              <Alert>
                <AlertDescription>
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Executando teste... Aguarde até 45 segundos</span>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Logs do Teste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500">
                  💻 Execute o teste para ver os logs...
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>📊 Resultado do Teste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{result.success ? '✅' : '❌'}</span>
                    <span className="font-medium">
                      {result.success ? 'Teste Passou!' : 'Teste Falhou'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Status:</h3>
                    <ul className="space-y-1 text-sm">
                      <li>QR Code Gerado: {result.qrCodeGenerated ? '✅' : '❌'}</li>
                      <li>Cliente Pronto: {result.clientReady ? '✅' : '❌'}</li>
                      <li>Erro Ocorreu: {result.errorOccurred ? '❌' : '✅'}</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Detalhes:</h3>
                    <ul className="space-y-1 text-sm">
                      <li>Test ID: {result.testId}</li>
                      <li>Timestamp: {result.timestamp}</li>
                      {result.errorMessage && (
                        <li className="text-red-600">Erro: {result.errorMessage}</li>
                      )}
                    </ul>
                  </div>
                </div>

                {result.qrCodeData && (
                  <div className="text-center">
                    <h3 className="font-medium mb-2">QR Code Gerado:</h3>
                    <img 
                      src={result.qrCodeData} 
                      alt="QR Code de Teste" 
                      className="mx-auto border rounded-lg"
                    />
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">Ver JSON Completo</summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>📖 Como Interpretar o Teste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-green-600">✅ Se o Teste Passar:</h3>
                <ul className="space-y-2 text-sm">
                  <li>• WhatsApp Web.js está funcionando</li>
                  <li>• Puppeteer está configurado corretamente</li>
                  <li>• QR Code pode ser gerado</li>
                  <li>• O problema está na integração</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-red-600">❌ Se o Teste Falhar:</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Problema com WhatsApp Web.js</li>
                  <li>• Puppeteer não está funcionando</li>
                  <li>• Dependências faltando</li>
                  <li>• Configuração do servidor</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
