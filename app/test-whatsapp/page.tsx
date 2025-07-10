'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestWhatsAppPage() {
  const [instanceName, setInstanceName] = useState('')
  const [instanceId, setInstanceId] = useState('')
  const [status, setStatus] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const createInstance = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: instanceName })
      })
      
      const data = await response.json()
      if (response.ok) {
        setInstanceId(data.instance._id)
        setStatus('Instância criada')
      } else {
        setStatus(`Erro: ${data.message}`)
      }
    } catch (error) {
      setStatus(`Erro: ${error}`)
    }
    setIsLoading(false)
  }

  const connectInstance = async () => {
    if (!instanceId) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/instances/${instanceId}/connect`, {
        method: 'POST'
      })
      
      const data = await response.json()
      if (response.ok) {
        setStatus('Conectando... Aguarde o QR Code')
        
        // Poll for QR code
        const pollQR = setInterval(async () => {
          try {
            const qrResponse = await fetch(`/api/instances/${instanceId}/qr`)
            if (qrResponse.ok) {
              const qrData = await qrResponse.json()
              setQrCode(qrData.qrCode)
              clearInterval(pollQR)
            }
          } catch (error) {
            console.log('QR not ready yet')
          }
        }, 2000)
        
        // Stop polling after 30 seconds
        setTimeout(() => clearInterval(pollQR), 30000)
      } else {
        setStatus(`Erro: ${data.message}`)
      }
    } catch (error) {
      setStatus(`Erro: ${error}`)
    }
    setIsLoading(false)
  }

  const checkStatus = async () => {
    if (!instanceId) return
    
    try {
      const response = await fetch(`/api/instances/${instanceId}/status`)
      const data = await response.json()
      setStatus(`Status: ${data.status}${data.phoneNumber ? ` - ${data.phoneNumber}` : ''}`)
    } catch (error) {
      setStatus(`Erro: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Teste WhatsApp Web.js</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="instanceName">Nome da Instância</Label>
              <Input
                id="instanceName"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                placeholder="Ex: Teste WhatsApp"
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={createInstance} 
                disabled={!instanceName || isLoading}
              >
                Criar Instância
              </Button>
              
              <Button 
                onClick={connectInstance} 
                disabled={!instanceId || isLoading}
                variant="outline"
              >
                Conectar
              </Button>
              
              <Button 
                onClick={checkStatus} 
                disabled={!instanceId}
                variant="secondary"
              >
                Verificar Status
              </Button>
            </div>

            {status && (
              <Alert>
                <AlertDescription>{status}</AlertDescription>
              </Alert>
            )}

            {instanceId && (
              <Alert>
                <AlertDescription>
                  <strong>Instance ID:</strong> {instanceId}
                </AlertDescription>
              </Alert>
            )}

            {qrCode && (
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4">Escaneie o QR Code:</h3>
                <img 
                  src={qrCode} 
                  alt="QR Code WhatsApp" 
                  className="mx-auto border rounded-lg"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Use o WhatsApp no seu celular para escanear este código
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instruções</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Digite um nome para a instância</li>
              <li>Clique em "Criar Instância"</li>
              <li>Clique em "Conectar" para iniciar o processo</li>
              <li>Aguarde o QR Code aparecer</li>
              <li>Escaneie com o WhatsApp do seu celular</li>
              <li>Use "Verificar Status" para ver se conectou</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
