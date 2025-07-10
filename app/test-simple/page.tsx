'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestSimplePage() {
  const [instanceName, setInstanceName] = useState('Teste Simples')
  const [instanceId, setInstanceId] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `${time}: ${message}`])
    console.log(`[${time}] ${message}`)
  }

  const step1_CreateInstance = async () => {
    setIsLoading(true)
    addLog('🔧 Passo 1: Criando instância...')
    
    try {
      const response = await fetch('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: instanceName })
      })
      
      const data = await response.json()
      if (response.ok) {
        setInstanceId(data.instance._id)
        addLog(`✅ Instância criada: ${data.instance._id}`)
      } else {
        addLog(`❌ Erro: ${data.message}`)
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`)
    }
    
    setIsLoading(false)
  }

  const step2_ConnectWhatsApp = async () => {
    if (!instanceId) {
      addLog('❌ Primeiro crie uma instância')
      return
    }
    
    setIsLoading(true)
    addLog('🔗 Passo 2: Conectando WhatsApp...')
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/connect`, {
        method: 'POST'
      })
      
      const data = await response.json()
      if (response.ok) {
        addLog(`✅ Conexão iniciada: ${data.message}`)
      } else {
        addLog(`❌ Erro: ${data.message}`)
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`)
    }
    
    setIsLoading(false)
  }

  const step3_CheckQR = async () => {
    if (!instanceId) {
      addLog('❌ Primeiro crie uma instância')
      return
    }
    
    addLog('📱 Passo 3: Verificando QR Code...')
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/qr`)
      const data = await response.json()
      
      if (response.ok) {
        addLog(`✅ QR Code disponível!`)
        // Mostrar QR code em nova aba
        const newWindow = window.open()
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>QR Code WhatsApp</title></head>
              <body style="text-align: center; padding: 20px;">
                <h2>Escaneie com seu WhatsApp</h2>
                <img src="${data.qrCode}" style="max-width: 400px;" />
              </body>
            </html>
          `)
        }
      } else {
        addLog(`❌ QR não disponível: ${data.message}`)
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`)
    }
  }

  const step4_CheckStatus = async () => {
    if (!instanceId) {
      addLog('❌ Primeiro crie uma instância')
      return
    }

    addLog('📊 Passo 4: Verificando status...')

    try {
      const response = await fetch(`/api/instances/${instanceId}/status`)
      const data = await response.json()

      if (response.ok) {
        addLog(`📊 Status: ${data.status}`)
        if (data.phoneNumber) {
          addLog(`📱 Telefone: ${data.phoneNumber}`)
        }
      } else {
        addLog(`❌ Erro: ${data.message}`)
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`)
    }
  }

  const debugManager = async () => {
    addLog('🔍 Debug: Verificando manager interno...')

    try {
      const response = await fetch('/api/debug-manager')
      const data = await response.json()

      addLog(`🔍 Manager existe: ${data.managerExists}`)
      addLog(`🔍 Clientes ativos: ${data.clientsCount}`)
      addLog(`🔍 Status salvos: ${data.statusesCount}`)

      if (instanceId) {
        const instanceResponse = await fetch('/api/debug-manager', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instanceId })
        })

        const instanceData = await instanceResponse.json()
        addLog(`🔍 Status da instância: ${JSON.stringify(instanceData.status)}`)
        addLog(`🔍 Cliente existe: ${instanceData.hasClient}`)
      }
    } catch (error) {
      addLog(`❌ Erro debug: ${error}`)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  const resetAll = () => {
    setInstanceId('')
    setLogs([])
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Teste Simples WhatsApp
          </h1>
          <p className="text-gray-600">
            Teste passo a passo do sistema WhatsApp Web.js
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controles */}
          <Card>
            <CardHeader>
              <CardTitle>🎮 Controles de Teste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  placeholder="Nome da instância"
                  disabled={isLoading}
                />
              </div>

              {instanceId && (
                <div className="p-2 bg-blue-50 rounded text-sm">
                  <strong>Instance ID:</strong> {instanceId}
                </div>
              )}

              <div className="space-y-2">
                <Button 
                  onClick={step1_CreateInstance}
                  disabled={isLoading || !instanceName}
                  className="w-full"
                >
                  🔧 Passo 1: Criar Instância
                </Button>

                <Button 
                  onClick={step2_ConnectWhatsApp}
                  disabled={isLoading || !instanceId}
                  className="w-full"
                  variant="outline"
                >
                  🔗 Passo 2: Conectar WhatsApp
                </Button>

                <Button 
                  onClick={step3_CheckQR}
                  disabled={isLoading || !instanceId}
                  className="w-full"
                  variant="outline"
                >
                  📱 Passo 3: Ver QR Code
                </Button>

                <Button
                  onClick={step4_CheckStatus}
                  disabled={isLoading || !instanceId}
                  className="w-full"
                  variant="outline"
                >
                  📊 Passo 4: Verificar Status
                </Button>

                <Button
                  onClick={debugManager}
                  disabled={isLoading}
                  className="w-full"
                  variant="secondary"
                >
                  🔍 Debug Manager
                </Button>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Button 
                  onClick={clearLogs}
                  variant="secondary"
                  className="w-full"
                >
                  🗑️ Limpar Logs
                </Button>

                <Button 
                  onClick={resetAll}
                  variant="destructive"
                  className="w-full"
                >
                  🔄 Reset Completo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logs */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Logs de Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500">
                    💻 Execute os passos para ver os logs...
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

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>📖 Como Usar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">🎯 Passos do Teste:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li><strong>Criar Instância:</strong> Registra no banco de dados</li>
                  <li><strong>Conectar WhatsApp:</strong> Inicia o cliente real</li>
                  <li><strong>Ver QR Code:</strong> Abre QR em nova aba</li>
                  <li><strong>Verificar Status:</strong> Consulta estado atual</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-3">🔍 Debug:</h3>
                <ul className="space-y-2 text-sm">
                  <li><strong>Logs:</strong> Acompanhe cada operação</li>
                  <li><strong>Console:</strong> Verifique o console do navegador</li>
                  <li><strong>Network:</strong> Monitore as requisições</li>
                  <li><strong>Terminal:</strong> Veja logs do servidor</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
