'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { QrCodeModal } from './qr-code-modal'
import { SendMessageModal } from './send-message-modal'
import { useSocket } from '@/hooks/use-socket'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Smartphone,
  Wifi,
  WifiOff,
  AlertTriangle,
  Clock,
  Play,
  Square,
  QrCode,
  Trash2,
  MessageSquare,
  FileText
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface Instance {
  _id: string
  name: string
  phoneNumber?: string
  status: 'disconnected' | 'connecting' | 'connected' | 'banned'
  lastActivity?: string | null
  createdAt: string
  updatedAt: string
}

interface InstanceCardProps {
  instance: Instance
}

const statusConfig = {
  connected: {
    label: 'Conectado',
    variant: 'success' as const,
    icon: Wifi,
    color: 'text-green-600'
  },
  connecting: {
    label: 'Conectando',
    variant: 'warning' as const,
    icon: Clock,
    color: 'text-yellow-600'
  },
  disconnected: {
    label: 'Desconectado',
    variant: 'secondary' as const,
    icon: WifiOff,
    color: 'text-gray-600'
  },
  banned: {
    label: 'Banido',
    variant: 'destructive' as const,
    icon: AlertTriangle,
    color: 'text-red-600'
  }
}

export function InstanceCard({ instance }: InstanceCardProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showQrCode, setShowQrCode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSendMessage, setShowSendMessage] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(instance.status)
  const [phoneNumber, setPhoneNumber] = useState(instance.phoneNumber)
  const [hasQrCode, setHasQrCode] = useState(false)

  // const socket = useSocket() // Temporariamente desabilitado
  const router = useRouter()

  const config = statusConfig[currentStatus]
  const StatusIcon = config.icon

  // Check for QR Code when instance is connecting
  useEffect(() => {
    const checkQrCode = async () => {
      if (currentStatus === 'connecting') {
        try {
          const qrResponse = await fetch(`/api/instances/${instance._id}/qr`)
          if (qrResponse.ok) {
            const qrData = await qrResponse.json()
            if (qrData.qrCode) {
              setHasQrCode(true)
              console.log(`✅ QR Code available for ${instance.name}`)
            }
          }
        } catch (error) {
          console.log(`⚠️ QR Code not available for ${instance.name}`)
        }
      }
    }

    checkQrCode()
  }, [currentStatus, instance._id, instance.name])

  // Socket event listeners - Temporariamente desabilitado
  // useEffect(() => {
  //   // Socket.io code here
  // }, [])

  const handleConnect = async () => {
    setIsConnecting(true)

    try {
      // Direct API call
      const response = await fetch(`/api/instances/${instance._id}/connect`, {
        method: 'POST'
      })

      if (response.ok) {
        setCurrentStatus('connecting')
        // Poll for status updates
        const pollStatus = setInterval(async () => {
          const statusResponse = await fetch(`/api/instances/${instance._id}/status`)
          const statusData = await statusResponse.json()

          if (statusData.status === 'connected') {
            setCurrentStatus('connected')
            setPhoneNumber(statusData.phoneNumber)
            setIsConnecting(false)
            clearInterval(pollStatus)
            router.refresh()
          } else if (statusData.status === 'connecting') {
            // Check for QR code
            try {
              const qrResponse = await fetch(`/api/instances/${instance._id}/qr`)
              if (qrResponse.ok) {
                const qrData = await qrResponse.json()
                if (qrData.qrCode) {
                  setShowQrCode(true)
                }
              }
            } catch (error) {
              console.log('QR code not ready yet')
            }
          }
        }, 3000)

        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(pollStatus)
          setIsConnecting(false)
        }, 120000)
      }
    } catch (error) {
      console.error('Error connecting instance:', error)
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)

    try {
      // Direct API call
      const response = await fetch(`/api/instances/${instance._id}/disconnect`, {
        method: 'POST'
      })

      if (response.ok) {
        setCurrentStatus('disconnected')
        setPhoneNumber(undefined)
        setIsDisconnecting(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Error disconnecting instance:', error)
      setIsDisconnecting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/instances/${instance._id}/delete`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Instance deleted successfully, refresh the page
        router.refresh()
      } else {
        const data = await response.json()
        console.error('Error deleting instance:', data.message)
      }
    } catch (error) {
      console.error('Error deleting instance:', error)
    }

    setIsDeleting(false)
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              {instance.name}
            </CardTitle>
            <Badge variant={config.variant}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {phoneNumber && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Número:</span>
              <span>{phoneNumber}</span>
            </div>
          )}
          
          {instance.lastActivity && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Última atividade:</span>
              <span>{formatRelativeTime(instance.lastActivity)}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Criado em:</span>
            <span>{formatRelativeTime(instance.createdAt)}</span>
          </div>

          {currentStatus === 'connecting' && hasQrCode && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
              <QrCode className="h-4 w-4" />
              <span className="font-medium">QR Code disponível!</span>
            </div>
          )}

          <div className="pt-2">
            <Link href={`/dashboard/instances/${instance._id}/logs`}>
              <Button variant="ghost" size="sm" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Ver Logs
              </Button>
            </Link>
          </div>
        </CardContent>
        
        <CardFooter className="pt-3">
          <div className="flex gap-2 w-full">
            {currentStatus === 'disconnected' && (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex-1"
                size="sm"
              >
                {isConnecting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Conectar
                  </>
                )}
              </Button>
            )}
            
            {currentStatus === 'connecting' && (
              <Button
                onClick={() => setShowQrCode(true)}
                variant={hasQrCode ? "default" : "outline"}
                className="flex-1"
                size="sm"
              >
                <QrCode className="h-4 w-4 mr-2" />
                {hasQrCode ? 'Ver QR Code' : 'Aguardando QR...'}
              </Button>
            )}

            {currentStatus === 'connected' && (
              <>
                <Button
                  onClick={() => setShowSendMessage(true)}
                  variant="default"
                  className="flex-1"
                  size="sm"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>
                <Button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  variant="outline"
                  size="sm"
                >
                  {isDisconnecting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Desconectando...
                    </>
                  ) : (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Desconectar
                    </>
                  )}
                </Button>
              </>
            )}
            
            {currentStatus === 'banned' && (
              <Button
                disabled
                variant="destructive"
                className="flex-1"
                size="sm"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Banido
              </Button>
            )}

            {/* Delete Button - Always available */}
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              {isDeleting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <QrCodeModal
        isOpen={showQrCode}
        onClose={() => setShowQrCode(false)}
        instanceId={instance._id}
        instanceName={instance.name}
      />

      <SendMessageModal
        isOpen={showSendMessage}
        onClose={() => setShowSendMessage(false)}
        instanceId={instance._id}
        instanceName={instance.name}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Exclusão
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              Tem certeza que deseja deletar a instância <strong>"{instance.name}"</strong>?
              <br /><br />
              Esta ação irá:
              <br />• Desconectar do WhatsApp
              <br />• Remover todos os dados da instância
              <br />• Limpar arquivos de sessão
              <br /><br />
              <strong className="text-red-600">Esta ação não pode ser desfeita!</strong>
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1"
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="flex-1"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Deletando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar Instância
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
