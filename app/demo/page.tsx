'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Smartphone, Wifi, Clock, CheckCircle, MessageSquare } from 'lucide-react'

export default function DemoPage() {
  const [instanceName, setInstanceName] = useState('')
  const [instanceId, setInstanceId] = useState('')
  const [status, setStatus] = useState('disconnected')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [to, setTo] = useState('')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (log: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${log}`])
  }

  const createInstance = async () => {
    setIsLoading(true)
    addLog('Criando instância...')
    
    try {
      const response = await fetch('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: instanceName })
      })
      
      const data = await response.json()
      if (response.ok) {
        setInstanceId(data.instance._id)
        addLog(`Instância criada: ${data.instance._id}`)
      } else {
        addLog(`Erro: ${data.message}`)
      }
    } catch (error) {
      addLog(`Erro: ${error}`)
    }
    setIsLoading(false)
  }

  const connectInstance = async () => {
    if (!instanceId) return
    
    setIsLoading(true)
    addLog('Iniciando conexão...')
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/connect`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setStatus('connecting')
        addLog('Conectando... Aguarde o QR Code')
        
        // Get QR code
        setTimeout(async () => {
          try {
            const qrResponse = await fetch(`/api/instances/${instanceId}/qr`)
            if (qrResponse.ok) {
              const qrData = await qrResponse.json()
              setQrCode(qrData.qrCode)
              addLog('QR Code gerado!')
            }
          } catch (error) {
            addLog('Erro ao gerar QR Code')
          }
        }, 2000)
        
        // Poll for status
        const pollStatus = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/instances/${instanceId}/status`)
            const statusData = await statusResponse.json()
            
            setStatus(statusData.status)
            
            if (statusData.status === 'connected') {
              setPhoneNumber(statusData.phoneNumber)
              addLog(`Conectado! Número: ${statusData.phoneNumber}`)
              clearInterval(pollStatus)
              setIsLoading(false)
            }
          } catch (error) {
            addLog('Erro ao verificar status')
          }
        }, 3000)
        
        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(pollStatus)
          setIsLoading(false)
        }, 120000)
      }
    } catch (error) {
      addLog(`Erro: ${error}`)
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!instanceId || !to || !message) return
    
    addLog(`Enviando mensagem para ${to}...`)
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message })
      })
      
      const data = await response.json()
      if (response.ok) {
        addLog(`Mensagem enviada com sucesso!`)
        setMessage('')
        setTo('')
      } else {
        addLog(`Erro ao enviar: ${data.message}`)
      }
    } catch (error) {
      addLog(`Erro: ${error}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success'
      case 'connecting': return 'warning'
      case 'disconnected': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />
      case 'connecting': return <Clock className="h-4 w-4" />
      case 'disconnected': return <Wifi className="h-4 w-4" />
      default: return <Smartphone className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            DisparoWPP - Demonstração
          </h1>
          <p className="text-gray-600">
            Sistema completo de WhatsApp Business em funcionamento
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Controle da Instância
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instanceName">Nome da Instância</Label>
                <Input
                  id="instanceName"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  placeholder="Ex: WhatsApp Principal"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={createInstance} 
                  disabled={!instanceName || isLoading}
                  className="flex-1"
                >
                  Criar Instância
                </Button>
                
                <Button 
                  onClick={connectInstance} 
                  disabled={!instanceId || isLoading || status === 'connected'}
                  variant="outline"
                  className="flex-1"
                >
                  Conectar
                </Button>
              </div>

              {instanceId && (
                <Alert>
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span><strong>Status:</strong></span>
                      <Badge variant={getStatusColor(status)} className="flex items-center gap-1">
                        {getStatusIcon(status)}
                        {status}
                      </Badge>
                    </div>
                    {phoneNumber && (
                      <div className="mt-2">
                        <strong>Número:</strong> {phoneNumber}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Envio de Mensagem */}
              {status === 'connected' && (
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Enviar Mensagem de Teste
                  </h3>
                  
                  <div>
                    <Label htmlFor="to">Número de Destino</Label>
                    <Input
                      id="to"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="5511999999999"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Input
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Olá! Esta é uma mensagem de teste."
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    onClick={sendMessage}
                    disabled={!to || !message}
                    className="w-full"
                  >
                    Enviar Mensagem
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code e Logs */}
          <div className="space-y-6">
            {qrCode && status === 'connecting' && (
              <Card>
                <CardHeader>
                  <CardTitle>QR Code WhatsApp</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <img 
                    src={qrCode} 
                    alt="QR Code WhatsApp" 
                    className="mx-auto border rounded-lg mb-4"
                  />
                  <p className="text-sm text-gray-600">
                    Escaneie com o WhatsApp do seu celular
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Logs do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
                  {logs.length === 0 ? (
                    <div className="text-gray-500">Aguardando ações...</div>
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Como Usar</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Digite um nome para a instância WhatsApp</li>
              <li>Clique em "Criar Instância" para registrar no sistema</li>
              <li>Clique em "Conectar" para iniciar o processo de conexão</li>
              <li>Aguarde o QR Code aparecer (pode levar alguns segundos)</li>
              <li>Escaneie o QR Code com o WhatsApp do seu celular</li>
              <li>Aguarde a confirmação de conexão (status mudará para "connected")</li>
              <li>Use o formulário de mensagem para enviar mensagens de teste</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
