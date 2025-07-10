'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Trash2, AlertTriangle, RefreshCw } from 'lucide-react'

export default function TestDeletePage() {
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

  const deleteInstance = async (instanceId: string, instanceName: string) => {
    if (!confirm(`Tem certeza que deseja deletar a instância "${instanceName}"?\n\nEsta ação não pode ser desfeita!`)) {
      return
    }
    
    addLog(`🗑️ Deletando instância: ${instanceName}`)
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/delete`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        addLog(`✅ Instância "${instanceName}" deletada com sucesso!`, 'success')
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            🗑️ Teste de Exclusão de Instâncias
          </h1>
          <p className="text-xl text-gray-600">
            Gerencie e delete instâncias WhatsApp
          </p>
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
            ⚠️ Cuidado: Exclusões são permanentes!
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instances List */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-red-700">
                📱 Instâncias Disponíveis
                <Button 
                  onClick={fetchInstances}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                  className="border-red-200"
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
                    <div key={instance._id} className="border border-red-100 rounded-lg p-4 space-y-3">
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
                      
                      <div className="flex items-center justify-between pt-2 border-t border-red-100">
                        <div className="text-xs text-gray-500">
                          Criado: {new Date(instance.createdAt).toLocaleDateString()}
                        </div>
                        <Button
                          onClick={() => deleteInstance(instance._id, instance.name)}
                          size="sm"
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deletar
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Logs */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">📋 Logs de Exclusão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-red-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500">
                    💻 Logs de exclusão aparecerão aqui...
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

        {/* Warning Card */}
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              ⚠️ Avisos Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-yellow-800">
              <div>
                <strong>🗑️ O que acontece ao deletar uma instância:</strong>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Desconecta automaticamente do WhatsApp</li>
                  <li>Remove a instância da Evolution API (se aplicável)</li>
                  <li>Deleta arquivos de sessão do WhatsApp Web.js</li>
                  <li>Remove todos os dados do banco de dados</li>
                  <li><strong>Esta ação é irreversível!</strong></li>
                </ul>
              </div>
              
              <div>
                <strong>🔄 Processo de limpeza:</strong>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Desconexão segura dos serviços</li>
                  <li>Limpeza de arquivos temporários</li>
                  <li>Remoção de dados persistentes</li>
                  <li>Atualização automática da interface</li>
                </ul>
              </div>
              
              <div className="bg-red-100 border border-red-300 rounded p-3 mt-4">
                <strong className="text-red-800">🚨 ATENÇÃO:</strong>
                <p className="text-red-700 mt-1">
                  Sempre confirme que você realmente deseja deletar uma instância. 
                  Você precisará reconfigurar tudo do zero se deletar por engano!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
