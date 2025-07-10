import mongoose, { Document, Schema } from 'mongoose'

export interface ICampaign extends Document {
  _id: string
  companyId: string
  name: string
  messageTemplate: string
  mediaUrl?: string
  mediaType: 'text' | 'image' | 'audio' | 'video' | 'document'
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed'
  scheduledAt?: Date
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
    trim: true
  },
  messageTemplate: {
    type: String,
    required: true
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
    enum: ['draft', 'scheduled', 'running', 'paused', 'completed'],
    default: 'draft'
  },
  scheduledAt: {
    type: Date
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
