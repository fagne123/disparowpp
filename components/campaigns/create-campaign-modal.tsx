'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Users,
  Settings,
  Send
} from 'lucide-react'
import { CampaignBasicInfo } from './wizard/campaign-basic-info'
import { CampaignMessage } from './wizard/campaign-message'
import { CampaignContacts } from './wizard/campaign-contacts'
import { CampaignSettings } from './wizard/campaign-settings'
import { CampaignReview } from './wizard/campaign-review'

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
}

interface CampaignData {
  // Informações básicas
  name: string
  description: string
  
  // Mensagem
  messageTemplate: string
  mediaUrl?: string
  mediaType: 'text' | 'image' | 'audio' | 'video' | 'document'
  
  // Contatos
  contactSelection: 'all' | 'groups' | 'upload'
  selectedGroups: string[]
  uploadedContacts: any[]
  
  // Configurações
  sendConfig: {
    delayBetweenMessages: number
    maxMessagesPerInstance: number
    instanceIds: string[]
    retryFailedMessages: boolean
    maxRetries: number
  }
  
  // Agendamento
  scheduleType: 'now' | 'later'
  scheduledAt?: Date
  
  // Configurações avançadas
  settings: {
    personalizeMessage: boolean
    variables: string[]
    blacklistCheck: boolean
    duplicateCheck: boolean
  }
}

const initialCampaignData: CampaignData = {
  name: '',
  description: '',
  messageTemplate: '',
  mediaType: 'text',
  contactSelection: 'all',
  selectedGroups: [],
  uploadedContacts: [],
  sendConfig: {
    delayBetweenMessages: 5,
    maxMessagesPerInstance: 100,
    instanceIds: [],
    retryFailedMessages: true,
    maxRetries: 3
  },
  scheduleType: 'now',
  settings: {
    personalizeMessage: true,
    variables: ['nome'],
    blacklistCheck: true,
    duplicateCheck: true
  }
}

const steps = [
  {
    id: 'basic',
    title: 'Informações Básicas',
    icon: FileText,
    description: 'Nome e descrição da campanha'
  },
  {
    id: 'message',
    title: 'Mensagem',
    icon: Send,
    description: 'Conteúdo da mensagem'
  },
  {
    id: 'contacts',
    title: 'Contatos',
    icon: Users,
    description: 'Seleção de destinatários'
  },
  {
    id: 'settings',
    title: 'Configurações',
    icon: Settings,
    description: 'Configurações de envio'
  },
  {
    id: 'review',
    title: 'Revisão',
    icon: FileText,
    description: 'Revisar e confirmar'
  }
]

export function CreateCampaignModal({ isOpen, onClose }: CreateCampaignModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [campaignData, setCampaignData] = useState<CampaignData>(initialCampaignData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    setCurrentStep(0)
    setCampaignData(initialCampaignData)
    onClose()
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      })

      if (response.ok) {
        handleClose()
        // Refresh the campaigns list
        window.location.reload()
      } else {
        const error = await response.json()
        console.error('Error creating campaign:', error)
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateCampaignData = (updates: Partial<CampaignData>) => {
    setCampaignData(prev => ({ ...prev, ...updates }))
  }

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'basic':
        return (
          <CampaignBasicInfo 
            data={campaignData}
            onUpdate={updateCampaignData}
          />
        )
      case 'message':
        return (
          <CampaignMessage 
            data={campaignData}
            onUpdate={updateCampaignData}
          />
        )
      case 'contacts':
        return (
          <CampaignContacts 
            data={campaignData}
            onUpdate={updateCampaignData}
          />
        )
      case 'settings':
        return (
          <CampaignSettings 
            data={campaignData}
            onUpdate={updateCampaignData}
          />
        )
      case 'review':
        return (
          <CampaignReview 
            data={campaignData}
            onUpdate={updateCampaignData}
          />
        )
      default:
        return null
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            🚀 Criar Nova Campanha
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Passo {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-between items-center mb-6 overflow-x-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            
            return (
              <div 
                key={step.id}
                className={`flex flex-col items-center min-w-0 flex-1 ${
                  index < steps.length - 1 ? 'border-r border-gray-200 pr-4' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : isCompleted 
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className={`text-xs font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Criando...' : 'Criar Campanha'}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
