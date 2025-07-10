import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb/connection'
import { WhatsAppInstance } from '@/lib/mongodb/models'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default async function InstanceLogsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const { id } = await params
  await connectDB()

  const instance = await WhatsAppInstance.findOne({
    _id: id,
    companyId: session.user.companyId
  }).lean()

  if (!instance) {
    redirect('/dashboard/instances')
  }

  // Mock logs for demonstration
  const logs = [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Instância inicializada com sucesso',
      details: 'Cliente WhatsApp Web.js criado e configurado'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 60000).toISOString(),
      level: 'info',
      message: 'QR Code gerado',
      details: 'QR Code enviado para o frontend via Socket.io'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 120000).toISOString(),
      level: 'success',
      message: 'Cliente autenticado',
      details: 'Autenticação WhatsApp realizada com sucesso'
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 180000).toISOString(),
      level: 'info',
      message: 'Cliente conectado',
      details: `Número: ${instance.phoneNumber || '+55 11 99999-9999'}`
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 240000).toISOString(),
      level: 'warning',
      message: 'Tentativa de reconexão',
      details: 'Conexão perdida, tentando reconectar automaticamente'
    }
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-green-600 bg-green-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-blue-600 bg-blue-50'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/instances">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Logs da Instância</h1>
            <p className="text-gray-600">
              {instance.name} - Monitoramento em tempo real
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border-l-4 border-gray-200 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="font-medium text-gray-900">{log.message}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
                {log.details && (
                  <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                )}
              </div>
            ))}
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
              <strong>Logs em tempo real:</strong> Os logs são atualizados automaticamente conforme a instância WhatsApp executa ações. Use o botão "Atualizar" para ver os logs mais recentes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
