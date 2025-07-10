import mongoose, { Document, Schema } from 'mongoose'

export interface IMessageTemplate extends Document {
  _id: string
  companyId: string
  name: string
  content: string
  variables: string[]
  category: string
  isActive: boolean
  mediaType?: 'text' | 'image' | 'document' | 'video'
  mediaUrl?: string
  mediaCaption?: string
  usageCount: number
  lastUsedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const MessageTemplateSchema = new Schema<IMessageTemplate>({
  companyId: {
    type: String,
    required: true,
    ref: 'Company'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  variables: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: true,
    trim: true,
    default: 'geral'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  mediaType: {
    type: String,
    enum: ['text', 'image', 'document', 'video'],
    default: 'text'
  },
  mediaUrl: {
    type: String,
    trim: true
  },
  mediaCaption: {
    type: String,
    trim: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsedAt: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'message_templates'
})

// Indexes
MessageTemplateSchema.index({ companyId: 1, name: 1 }, { unique: true })
MessageTemplateSchema.index({ companyId: 1 })
MessageTemplateSchema.index({ companyId: 1, category: 1 })
MessageTemplateSchema.index({ companyId: 1, isActive: 1 })

export default mongoose.models.MessageTemplate || mongoose.model<IMessageTemplate>('MessageTemplate', MessageTemplateSchema)
