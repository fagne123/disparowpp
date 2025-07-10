import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb/connection'
import { WhatsAppInstance } from '@/lib/mongodb/models'
import { InstancesList } from '@/components/instances/instances-list'
import { CreateInstanceButton } from '@/components/instances/create-instance-button'
import { Plus } from 'lucide-react'

export default async function InstancesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  // Get instances from database
  await connectDB()
  const instances = await WhatsAppInstance.find({ 
    companyId: session.user.companyId 
  }).lean()

  // Convert MongoDB objects to plain objects
  const serializedInstances = instances.map(instance => ({
    ...instance,
    _id: instance._id.toString(),
    createdAt: instance.createdAt.toISOString(),
    updatedAt: instance.updatedAt.toISOString(),
    lastActivity: instance.lastActivity?.toISOString() || null
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instâncias WhatsApp</h1>
          <p className="text-gray-600">
            Gerencie suas conexões WhatsApp Business
          </p>
        </div>
        <CreateInstanceButton />
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {serializedInstances.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhuma instância encontrada
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece criando sua primeira instância WhatsApp.
              </p>
              <div className="mt-6">
                <CreateInstanceButton variant="primary" />
              </div>
            </div>
          ) : (
            <InstancesList instances={serializedInstances} />
          )}
        </div>
      </div>
    </div>
  )
}
