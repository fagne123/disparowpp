'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Send } from 'lucide-react'

interface SendMessageModalProps {
  isOpen: boolean
  onClose: () => void
  instanceId: string
  instanceName: string
}

export function SendMessageModal({ isOpen, onClose, instanceId, instanceName }: SendMessageModalProps) {
  const [to, setTo] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/instances/${instanceId}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, message }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Erro ao enviar mensagem')
        return
      }

      setSuccess('Mensagem enviada com sucesso!')
      setTo('')
      setMessage('')
      
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      setError('Erro interno do servidor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setTo('')
      setMessage('')
      setError('')
      setSuccess('')
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Enviar Mensagem - ${instanceName}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <div>
          <Label htmlFor="to">Número de Destino</Label>
          <Input
            id="to"
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Ex: 5511999999999"
            required
            disabled={isLoading}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Digite o número com código do país (sem + ou espaços).
          </p>
        </div>

        <div>
          <Label htmlFor="message">Mensagem</Label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem aqui..."
            required
            disabled={isLoading}
            className="mt-1 w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
          />
          <p className="text-sm text-gray-500 mt-1">
            Máximo de 4096 caracteres.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !to.trim() || !message.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Mensagem
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
