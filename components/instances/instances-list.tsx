'use client'

import { InstanceCard } from './instance-card'

interface Instance {
  _id: string
  name: string
  phoneNumber?: string
  status: 'disconnected' | 'connecting' | 'connected' | 'banned'
  lastActivity?: string | null
  createdAt: string
  updatedAt: string
}

interface InstancesListProps {
  instances: Instance[]
}

export function InstancesList({ instances }: InstancesListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {instances.map((instance) => (
        <InstanceCard key={instance._id} instance={instance} />
      ))}
    </div>
  )
}
