'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Trash2, AlertTriangle, RefreshCw } from 'lucide-react'

export default function TestDeleteSimplePage() {
  const [instances, setInstances] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString()
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    setLogs(prev => [...prev, `${time} ${emoji} ${message}`])
  }

  const fetchInstances = async () => {
    setIsLoading(true)
    addLog('📋 Carregando instâncias...')
    
    try {
      const response = await fetch('/api/instances')
      const data = await response.json()
      
      if (response.ok) {
        setInstances(data.instances || [])
        addLog(`✅ ${data.instances?.length || 0} instâncias carregadas`, 'success')
      } else {
        addLog(`❌ Erro ao carregar: ${data.message}`, 'error')
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
    }
    
    setIsLoading(false)
  }

  const deleteInstanceSimple = async (instanceId: string, instanceName: string) => {
    if (!confirm(`TESTE SIMPLES: Deletar "${instanceName}"?\n\nEsta versão só remove do banco de dados.`)) {
      return
    }
    
    addLog(`🗑️ Deletando (simples): ${instanceName}`)
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/delete-simple`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        addLog(`✅ Instância "${instanceName}" deletada (simples)!`, 'success')
        // Refresh the list
        fetchInstances()
      } else {
        addLog(`❌ Erro ao deletar: ${data.message}`, 'error')
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
    }
  }

  const deleteInstanceComplete = async (instanceId: string, instanceName: string) => {
    if (!confirm(`TESTE COMPLETO: Deletar "${instanceName}"?\n\nEsta versão faz limpeza completa.`)) {
      return
    }
    
    addLog(`🗑️ Deletando (completo): ${instanceName}`)
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/delete`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        addLog(`✅ Instância "${instanceName}" deletada (completo)!`, 'success')
        if (data.warning) {
          addLog(`⚠️ Aviso: ${data.warning}`, 'error')
        }
        // Refresh the list
        fetchInstances()
      } else {
        addLog(`❌ Erro ao deletar: ${data.message}`, 'error')
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error')
    }
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

  useEffect(() => {
    fetchInstances()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🧪 Teste de Delete - Simples vs Completo
          </h1>
          <p className="text-xl text-gray-600">
            Compare as duas versões de exclusão
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              🔵 Simples: Só remove do banco
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              🟣 Completo: Limpeza total
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instances List */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-blue-700">
                📱 Instâncias para Teste
                <Button 
                  onClick={fetchInstances}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                  className="border-blue-200"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {instances.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                        Carregando...
                      </div>
                    ) : (
                      'Nenhuma instância encontrada'
                    )}
                  </div>
                ) : (
                  instances.map((instance) => (
                    <div key={instance._id} className="border border-blue-100 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{instance.name}</h3>
                          <p className="text-sm text-gray-500">ID: {instance._id}</p>
                          {instance.phoneNumber && (
                            <p className="text-sm text-gray-600">📱 {instance.phoneNumber}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}>
                          {instance.status}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 pt-2 border-t border-blue-100">
                        <Button
                          onClick={() => deleteInstanceSimple(instance._id, instance.name)}
                          size="sm"
                          variant="outline"
                          className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Simples
                        </Button>
                        <Button
                          onClick={() => deleteInstanceComplete(instance._id, instance.name)}
                          size="sm"
                          variant="destructive"
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Completo
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Logs */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700">📋 Logs de Teste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-blue-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500">
                    💻 Logs de teste aparecerão aqui...
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

        {/* Comparison Card */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              🔍 Comparação dos Métodos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-100 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3">🔵 Delete Simples</h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>✅ Remove apenas do banco de dados</li>
                  <li>✅ Rápido e direto</li>
                  <li>✅ Sem limpeza de arquivos</li>
                  <li>✅ Sem desconexão de serviços</li>
                  <li>⚠️ Pode deixar "lixo" no sistema</li>
                </ul>
              </div>
              
              <div className="bg-purple-100 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-3">🟣 Delete Completo</h3>
                <ul className="space-y-2 text-sm text-purple-700">
                  <li>✅ Desconecta do WhatsApp Web.js</li>
                  <li>✅ Remove da Evolution API</li>
                  <li>✅ Limpa arquivos de sessão</li>
                  <li>✅ Remove do banco de dados</li>
                  <li>✅ Limpeza total do sistema</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>💡 Dica:</strong> Use o "Delete Simples" para testar rapidamente, 
                e o "Delete Completo" para limpeza real do sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
