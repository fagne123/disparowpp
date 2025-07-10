import mongoose, { Document, Schema } from 'mongoose'

export interface IInstanceLog extends Document {
  _id: string
  instanceId: string
  eventType: 'connected' | 'disconnected' | 'banned' | 'message_sent' | 'error'
  message: string
  metadata?: any
  createdAt: Date
}

const InstanceLogSchema = new Schema<IInstanceLog>({
  instanceId: {
    type: String,
    required: true,
    ref: 'WhatsAppInstance'
  },
  eventType: {
    type: String,
    required: true,
    enum: ['connected', 'disconnected', 'banned', 'message_sent', 'error']
  },
  message: {
    type: String,
    required: true
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'instance_logs'
})

// Indexes
InstanceLogSchema.index({ instanceId: 1 })
InstanceLogSchema.index({ eventType: 1 })
InstanceLogSchema.index({ createdAt: 1 })
InstanceLogSchema.index({ instanceId: 1, createdAt: -1 })

export default mongoose.models.InstanceLog || mongoose.model<IInstanceLog>('InstanceLog', InstanceLogSchema)
