import mongoose, { Document, Schema } from 'mongoose'

export interface ICampaign extends Document {
  _id: string
  companyId: string
  name: string
  description?: string
  messageTemplate: string
  mediaUrl?: string
  mediaType: 'text' | 'image' | 'audio' | 'video' | 'document'
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled'

  // Configurações de envio
  sendConfig: {
    delayBetweenMessages: number // em segundos
    maxMessagesPerInstance: number
    instanceIds: string[] // IDs das instâncias para usar
    retryFailedMessages: boolean
    maxRetries: number
  }

  // Agendamento
  scheduledAt?: Date
  startedAt?: Date
  completedAt?: Date

  // Estatísticas
  stats: {
    totalContacts: number
    sent: number
    delivered: number
    failed: number
    pending: number
  }

  // Configurações avançadas
  settings: {
    personalizeMessage: boolean
    variables: string[] // variáveis disponíveis como {nome}, {empresa}
    blacklistCheck: boolean
    duplicateCheck: boolean
  }

  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const CampaignSchema = new Schema<ICampaign>({
  companyId: {
    type: String,
    required: true,
    ref: 'Company'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  messageTemplate: {
    type: String,
    required: true,
    maxlength: 4096 // Limite do WhatsApp
  },
  mediaUrl: {
    type: String,
    trim: true
  },
  mediaType: {
    type: String,
    enum: ['text', 'image', 'audio', 'video', 'document'],
    default: 'text'
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  sendConfig: {
    delayBetweenMessages: {
      type: Number,
      default: 5, // 5 segundos
      min: 1,
      max: 300
    },
    maxMessagesPerInstance: {
      type: Number,
      default: 100,
      min: 1,
      max: 1000
    },
    instanceIds: [{
      type: String,
      required: true
    }],
    retryFailedMessages: {
      type: Boolean,
      default: true
    },
    maxRetries: {
      type: Number,
      default: 3,
      min: 0,
      max: 10
    }
  },
  scheduledAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  stats: {
    totalContacts: {
      type: Number,
      default: 0
    },
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    }
  },
  settings: {
    personalizeMessage: {
      type: Boolean,
      default: true
    },
    variables: [{
      type: String
    }],
    blacklistCheck: {
      type: Boolean,
      default: true
    },
    duplicateCheck: {
      type: Boolean,
      default: true
    }
  },
  createdBy: {
    type: String,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'campaigns'
})

// Indexes
CampaignSchema.index({ companyId: 1 })
CampaignSchema.index({ status: 1 })
CampaignSchema.index({ createdBy: 1 })
CampaignSchema.index({ scheduledAt: 1 })

export default mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema)
