import mongoose, { Document, Schema } from 'mongoose'

export interface ICampaignContact extends Document {
  _id: string
  campaignId: string
  contactId: string
  instanceId?: string
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'banned'
  sentAt?: Date
  deliveredAt?: Date
  errorMessage?: string
  createdAt: Date
}

const CampaignContactSchema = new Schema<ICampaignContact>({
  campaignId: {
    type: String,
    required: true,
    ref: 'Campaign'
  },
  contactId: {
    type: String,
    required: true,
    ref: 'Contact'
  },
  instanceId: {
    type: String,
    ref: 'WhatsAppInstance'
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'banned'],
    default: 'pending'
  },
  sentAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'campaign_contacts'
})

// Indexes
CampaignContactSchema.index({ campaignId: 1, contactId: 1 }, { unique: true })
CampaignContactSchema.index({ campaignId: 1 })
CampaignContactSchema.index({ status: 1 })
CampaignContactSchema.index({ instanceId: 1 })

export default mongoose.models.CampaignContact || mongoose.model<ICampaignContact>('CampaignContact', CampaignContactSchema)
