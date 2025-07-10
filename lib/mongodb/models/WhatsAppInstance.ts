import mongoose, { Document, Schema } from 'mongoose'

export interface IWhatsAppInstance extends Document {
  _id: string
  companyId: string
  name: string
  phoneNumber?: string
  status: 'disconnected' | 'connecting' | 'connected' | 'banned'
  sessionData?: any
  proxyConfig?: any
  lastActivity?: Date
  createdAt: Date
  updatedAt: Date
}

const WhatsAppInstanceSchema = new Schema<IWhatsAppInstance>({
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
  phoneNumber: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['disconnected', 'connecting', 'connected', 'banned'],
    default: 'disconnected'
  },
  sessionData: {
    type: Schema.Types.Mixed
  },
  proxyConfig: {
    type: Schema.Types.Mixed
  },
  lastActivity: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'whatsapp_instances'
})

// Indexes
WhatsAppInstanceSchema.index({ companyId: 1 })
WhatsAppInstanceSchema.index({ status: 1 })
WhatsAppInstanceSchema.index({ phoneNumber: 1 })
WhatsAppInstanceSchema.index({ lastActivity: 1 })

export default mongoose.models.WhatsAppInstance || mongoose.model<IWhatsAppInstance>('WhatsAppInstance', WhatsAppInstanceSchema)
