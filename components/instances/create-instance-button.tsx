'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreateInstanceModal } from './create-instance-modal'
import { Plus } from 'lucide-react'

interface CreateInstanceButtonProps {
  variant?: 'primary' | 'secondary'
}

export function CreateInstanceButton({ variant = 'secondary' }: CreateInstanceButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant={variant === 'primary' ? 'default' : 'outline'}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Nova Instância
      </Button>

      <CreateInstanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
