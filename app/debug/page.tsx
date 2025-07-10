'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

export default function DebugPage() {
  const [instances, setInstances] = useState<any[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `${timestamp}: ${message}`])
  }

  const fetchInstances = async () => {
    try {
      const response = await fetch('/api/instances')
      const data = await response.json()
      setInstances(data.instances || [])
      addLog(`Carregadas ${data.instances?.length || 0} instâncias`)
    } catch (error) {
      addLog(`Erro ao carregar instâncias: ${error}`)
    }
  }

  const testConnection = async (instanceId: string) => {
    setIsLoading(true)
    addLog(`Testando conexão para ${instanceId}`)
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/connect`, {
        method: 'POST'
      })
      
      const data = await response.json()
      if (response.ok) {
        addLog(`✅ Conexão iniciada: ${data.message}`)
      } else {
        addLog(`❌ Erro na conexão: ${data.message}`)
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`)
    }
    
    setIsLoading(false)
  }

  const testQR = async (instanceId: string) => {
    addLog(`Testando QR para ${instanceId}`)
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/qr`)
      const data = await response.json()
      
      if (response.ok) {
        addLog(`✅ QR Code disponível`)
      } else {
        addLog(`❌ QR não disponível: ${data.message}`)
      }
    } catch (error) {
      addLog(`❌ Erro QR: ${error}`)
    }
  }

  const testStatus = async (instanceId: string) => {
    addLog(`Testando status para ${instanceId}`)
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/status`)
      const data = await response.json()
      
      if (response.ok) {
        addLog(`✅ Status: ${data.status} | Telefone: ${data.phoneNumber || 'N/A'}`)
      } else {
        addLog(`❌ Erro status: ${data.message}`)
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`)
    }
  }

  const testDisconnect = async (instanceId: string) => {
    addLog(`Testando desconexão para ${instanceId}`)
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/disconnect`, {
        method: 'POST'
      })
      
      const data = await response.json()
      if (response.ok) {
        addLog(`✅ Desconectado: ${data.message}`)
      } else {
        addLog(`❌ Erro desconexão: ${data.message}`)
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  useEffect(() => {
    fetchInstances()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'connecting': return 'bg-yellow-100 text-yellow-800'
      case 'disconnected': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Debug WhatsApp System
          </h1>
          <p className="text-gray-600">
            Ferramenta de debug para monitorar e testar o sistema WhatsApp
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instâncias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                📱 Instâncias WhatsApp
                <Button onClick={fetchInstances} size="sm" variant="outline">
                  🔄 Atualizar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {instances.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhuma instância encontrada
                  </p>
                ) : (
                  instances.map((instance) => (
                    <div key={instance._id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{instance.name}</h3>
                          <p className="text-sm text-gray-500">ID: {instance._id}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}>
                          {instance.status}
                        </span>
                      </div>
                      
                      {instance.phoneNumber && (
                        <p className="text-sm">📱 {instance.phoneNumber}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          onClick={() => testConnection(instance._id)}
                          disabled={isLoading}
                          size="sm"
                          variant="outline"
                        >
                          🔗 Conectar
                        </Button>
                        <Button 
                          onClick={() => testQR(instance._id)}
                          size="sm"
                          variant="outline"
                        >
                          📱 QR
                        </Button>
                        <Button 
                          onClick={() => testStatus(instance._id)}
                          size="sm"
                          variant="outline"
                        >
                          📊 Status
                        </Button>
                        <Button 
                          onClick={() => testDisconnect(instance._id)}
                          size="sm"
                          variant="outline"
                        >
                          ❌ Desconectar
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                📋 Logs de Debug
                <Button onClick={clearLogs} size="sm" variant="outline">
                  🗑️ Limpar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500">
                    💻 Logs aparecerão aqui...
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
        </div>

        {/* Ações Globais */}
        <Card>
          <CardHeader>
            <CardTitle>🛠️ Ações de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                onClick={() => {
                  addLog('🔄 Recarregando página...')
                  window.location.reload()
                }}
                variant="outline"
                className="w-full"
              >
                🔄 Reload Page
              </Button>
              
              <Button 
                onClick={() => {
                  addLog('🗑️ Limpando localStorage...')
                  localStorage.clear()
                  addLog('✅ localStorage limpo')
                }}
                variant="outline"
                className="w-full"
              >
                🗑️ Clear Storage
              </Button>
              
              <Button 
                onClick={() => {
                  addLog('📊 Verificando APIs...')
                  fetch('/api/instances').then(r => {
                    addLog(`API Status: ${r.status}`)
                  }).catch(e => {
                    addLog(`API Error: ${e}`)
                  })
                }}
                variant="outline"
                className="w-full"
              >
                📊 Test APIs
              </Button>
              
              <Button 
                onClick={() => {
                  addLog('🌐 Abrindo console do navegador...')
                  console.log('Debug info:', { instances, logs })
                  addLog('✅ Verifique o console do navegador')
                }}
                variant="outline"
                className="w-full"
              >
                🌐 Console Log
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>📖 Como Usar o Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">🎯 Testes Disponíveis:</h3>
                <ul className="space-y-2 text-sm">
                  <li><strong>🔗 Conectar:</strong> Testa a API de conexão</li>
                  <li><strong>📱 QR:</strong> Verifica se QR Code está disponível</li>
                  <li><strong>📊 Status:</strong> Consulta status atual da instância</li>
                  <li><strong>❌ Desconectar:</strong> Testa desconexão</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">🔍 Monitoramento:</h3>
                <ul className="space-y-2 text-sm">
                  <li><strong>Logs:</strong> Acompanhe todas as operações</li>
                  <li><strong>Status:</strong> Veja o estado de cada instância</li>
                  <li><strong>Erros:</strong> Identifique problemas rapidamente</li>
                  <li><strong>APIs:</strong> Teste conectividade das APIs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
