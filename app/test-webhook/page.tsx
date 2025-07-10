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
  Webhook,
  Zap
} from 'lucide-react'

export default function TestWebhookPage() {
  const [instanceId, setInstanceId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString()
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    setLogs(prev => [...prev.slice(-15), `${time} ${emoji} ${message}`])
  }

  const testWebhook = async (action: 'connect' | 'disconnect') => {
    if (!instanceId.trim()) {
      addLog('❌ ID da instância é obrigatório', 'error')
      return
    }

    setIsLoading(true)
    setResult(null)
    addLog(`🧪 Testando webhook ${action} para ${instanceId}...`, 'info')
    
    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceId: instanceId.trim(), action })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        addLog(`✅ Webhook ${action} simulado com sucesso!`, 'success')
        addLog(`📋 Dados enviados: ${JSON.stringify(data.webhookData)}`, 'info')
        setResult({ success: true, data })
      } else {
        addLog(`❌ Erro no webhook: ${data.error}`, 'error')
        setResult({ success: false, data })
      }
    } catch (error) {
      addLog(`❌ Erro de rede: ${error}`, 'error')
      setResult({ success: false, error: error.toString() })
    }
    
    setIsLoading(false)
  }

  const checkDashboard = () => {
    addLog('🔍 Verifique o dashboard para ver se o status foi atualizado', 'info')
    window.open('/dashboard/instances', '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🔗 Teste de Webhook
          </h1>
          <p className="text-xl text-gray-600">
            Simule eventos de webhook para testar atualizações de status
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <Badge className="bg-purple-100 text-purple-800">Webhook Test</Badge>
            <Badge className="bg-blue-100 text-blue-800">Status Update</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-700 flex items-center">
                <Webhook className="h-5 w-5 mr-2" />
                Simulador de Webhook
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instanceId">ID da Instância</Label>
                <Input
                  id="instanceId"
                  value={instanceId}
                  onChange={(e) => setInstanceId(e.target.value)}
                  placeholder="Cole o ID da instância aqui"
                  className="border-purple-200 focus:border-purple-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use o ID de uma instância existente no dashboard
                </p>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => testWebhook('connect')} 
                    disabled={!instanceId.trim() || isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Simular Conexão
                  </Button>
                  
                  <Button 
                    onClick={() => testWebhook('disconnect')} 
                    disabled={!instanceId.trim() || isLoading}
                    variant="destructive"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 mr-2" />
                    )}
                    Simular Desconexão
                  </Button>
                </div>
                
                <Button 
                  onClick={checkDashboard} 
                  variant="outline"
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Verificar Dashboard
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
                        <strong className="text-green-800">✅ Webhook simulado!</strong>
                        <br />
                        <span className="text-green-700">
                          Verifique o dashboard para ver a atualização
                        </span>
                      </div>
                    ) : (
                      <div>
                        <strong className="text-red-800">❌ Falha no webhook</strong>
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
              <CardTitle className="text-blue-700">📋 Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-80 overflow-y-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-gray-500">
                    🔗 Logs de webhook aparecerão aqui...
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
            <CardTitle className="text-yellow-700">📖 Como usar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-yellow-600">🎯 Passos:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Copie o ID de uma instância do dashboard</li>
                  <li>Cole no campo "ID da Instância"</li>
                  <li>Clique em "Simular Conexão" ou "Simular Desconexão"</li>
                  <li>Clique em "Verificar Dashboard" para ver o resultado</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-yellow-600">🔍 O que testa:</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Recebimento de webhooks</li>
                  <li>• Atualização do cache local</li>
                  <li>• Atualização do banco de dados</li>
                  <li>• Sincronização com o dashboard</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
