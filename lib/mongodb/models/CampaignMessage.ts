import { Schema, model, models, Document } from 'mongoose'

export interface ICampaignMessage extends Document {
  _id: string
  campaignId: string
  contactId: string
  instanceId: string
  
  // Dados do contato (snapshot)
  contactPhone: string
  contactName: string
  
  // Mensagem
  message: string
  mediaUrl?: string
  mediaType: 'text' | 'image' | 'audio' | 'video' | 'document'
  
  // Status de envio
  status: 'pending' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  
  // Tentativas
  attempts: number
  maxAttempts: number
  lastAttemptAt?: Date
  
  // Timestamps
  scheduledAt?: Date
  sentAt?: Date
  deliveredAt?: Date
  readAt?: Date
  failedAt?: Date
  
  // Erro (se houver)
  error?: string
  errorCode?: string
  
  // Metadados
  messageId?: string // ID da mensagem no WhatsApp
  
  createdAt: Date
  updatedAt: Date
}

const campaignMessageSchema = new Schema<ICampaignMessage>({
  campaignId: {
    type: String,
    required: true,
    ref: 'Campaign',
    index: true
  },
  contactId: {
    type: String,
    required: true,
    ref: 'Contact',
    index: true
  },
  instanceId: {
    type: String,
    required: true,
    ref: 'WhatsAppInstance',
    index: true
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true
  },
  contactName: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 4096
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
    enum: ['pending', 'sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending',
    index: true
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: 1
  },
  lastAttemptAt: {
    type: Date
  },
  scheduledAt: {
    type: Date,
    index: true
  },
  sentAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  readAt: {
    type: Date
  },
  failedAt: {
    type: Date
  },
  error: {
    type: String,
    maxlength: 1000
  },
  errorCode: {
    type: String,
    maxlength: 50
  },
  messageId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Índices compostos para performance
campaignMessageSchema.index({ campaignId: 1, status: 1 })
campaignMessageSchema.index({ campaignId: 1, contactId: 1 }, { unique: true })
campaignMessageSchema.index({ instanceId: 1, status: 1 })
campaignMessageSchema.index({ status: 1, scheduledAt: 1 })
campaignMessageSchema.index({ status: 1, lastAttemptAt: 1 })

export const CampaignMessage = models.CampaignMessage || model<ICampaignMessage>('CampaignMessage', campaignMessageSchema)
