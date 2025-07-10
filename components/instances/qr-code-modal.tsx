'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, RefreshCw, CheckCircle } from 'lucide-react'
import { useSocket } from '@/hooks/use-socket'

interface QrCodeModalProps {
  isOpen: boolean
  onClose: () => void
  instanceId: string
  instanceName: string
}

export function QrCodeModal({ isOpen, onClose, instanceId, instanceName }: QrCodeModalProps) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  // const socket = useSocket() // Temporariamente desabilitado

  // Socket event listeners - Temporariamente desabilitado
  // useEffect(() => {
  //   // Socket.io code here
  // }, [])

  const fetchQrCode = async () => {
    setIsLoading(true)
    setError('')

    try {
      console.log(`🔍 Fetching QR Code for instance: ${instanceId}`)
      const response = await fetch(`/api/instances/${instanceId}/qr`)
      const data = await response.json()

      console.log(`📊 QR Code response:`, { status: response.status, hasQrCode: !!data.qrCode, source: data.source })

      if (response.ok) {
        setQrCode(data.qrCode)
        console.log(`✅ QR Code loaded successfully from ${data.source}`)
      } else {
        console.log(`❌ QR Code error:`, data.message)
        setError(data.message || 'Erro ao gerar QR Code')
      }
    } catch (error) {
      console.error(`❌ QR Code fetch error:`, error)
      setError('Erro ao conectar com o servidor')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchQrCode()

      // Poll for connection status
      const pollConnection = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/instances/${instanceId}/status`)
          const statusData = await statusResponse.json()

          if (statusData.status === 'connected') {
            setIsConnected(true)
            clearInterval(pollConnection)
            setTimeout(() => {
              onClose()
            }, 2000)
          }
        } catch (error) {
          console.log('Error checking connection status')
        }
      }, 3000)

      // Stop polling after 2 minutes
      setTimeout(() => {
        clearInterval(pollConnection)
      }, 120000)

      return () => {
        clearInterval(pollConnection)
      }
    }
  }, [isOpen, instanceId, onClose])

  const handleClose = () => {
    setQrCode(null)
    setError('')
    setIsConnected(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Conectar ${instanceName}`} size="md">
      <div className="space-y-4">
        {isConnected ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Conectado com sucesso!
            </h3>
            <p className="text-gray-600">
              Sua instância WhatsApp está agora conectada e pronta para uso.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Escaneie o QR Code
              </h3>
              <p className="text-gray-600 mb-4">
                Abra o WhatsApp no seu celular e escaneie o código abaixo para conectar.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
                  <p className="text-gray-600">Gerando QR Code...</p>
                </div>
              ) : qrCode ? (
                <div className="bg-white p-4 rounded-lg border">
                  <img 
                    src={qrCode} 
                    alt="QR Code WhatsApp" 
                    className="w-64 h-64 mx-auto"
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Erro ao gerar QR Code</p>
                  <Button onClick={fetchQrCode} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar novamente
                  </Button>
                </div>
              )}
            </div>

            {qrCode && !isConnected && (
              <div className="text-center">
                <Button onClick={fetchQrCode} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar QR Code
                </Button>
              </div>
            )}

            <Alert>
              <AlertDescription>
                <strong>Como conectar:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Abra o WhatsApp no seu celular</li>
                  <li>Toque em "Mais opções" (⋮) e depois em "Dispositivos conectados"</li>
                  <li>Toque em "Conectar um dispositivo"</li>
                  <li>Aponte a câmera para este QR code</li>
                </ol>
              </AlertDescription>
            </Alert>
          </>
        )}

        <div className="flex justify-end">
          <Button onClick={handleClose} variant="outline">
            {isConnected ? 'Fechar' : 'Cancelar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
