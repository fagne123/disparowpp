import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MessageSquare, Send } from 'lucide-react'

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
          <p className="text-gray-600">
            Histórico e gerenciamento de mensagens enviadas
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          Enviar Mensagem
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <MessageSquare className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhuma mensagem encontrada
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Suas mensagens enviadas aparecerão aqui.
            </p>
            <div className="mt-6">
              <Button className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Enviar Primeira Mensagem
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Em desenvolvimento:</strong> Sistema de mensagens individuais e histórico completo será implementado em breve.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
