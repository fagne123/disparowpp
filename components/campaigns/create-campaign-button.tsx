'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateCampaignModal } from './create-campaign-modal'

export function CreateCampaignButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
        size="lg"
      >
        <Plus className="h-5 w-5 mr-2" />
        Nova Campanha
      </Button>

      <CreateCampaignModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
