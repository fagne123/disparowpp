import mongoose, { Document, Schema } from 'mongoose'

export interface IContact extends Document {
  _id: string
  companyId: string
  phoneNumber: string
  name: string
  email?: string
  tags: string[]
  customFields: Map<string, string>

  // Novos campos para campanhas
  groups: string[]
  status: 'active' | 'blocked' | 'invalid'
  isBlacklisted: boolean
  source: 'manual' | 'import' | 'api' | 'form'

  isActive: boolean
  lastMessageAt?: Date
  notes?: string
  avatar?: string
  customField1?: string
  customField2?: string
  customField3?: string
  customField4?: string
  createdAt: Date
  updatedAt: Date
}

const ContactSchema = new Schema<IContact>({
  companyId: {
    type: String,
    required: true,
    ref: 'Company'
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  customFields: {
    type: Map,
    of: String,
    default: new Map()
  },
  groups: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'blocked', 'invalid'],
    default: 'active'
  },
  isBlacklisted: {
    type: Boolean,
    default: false,
    index: true
  },
  source: {
    type: String,
    enum: ['manual', 'import', 'api', 'form'],
    default: 'manual'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  // Manter campos legados para compatibilidade
  customField1: {
    type: String,
    trim: true
  },
  customField2: {
    type: String,
    trim: true
  },
  customField3: {
    type: String,
    trim: true
  },
  customField4: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'contacts'
})

// Indexes
ContactSchema.index({ companyId: 1, phoneNumber: 1 }, { unique: true })
ContactSchema.index({ companyId: 1 })
ContactSchema.index({ phoneNumber: 1 })
ContactSchema.index({ name: 1 })
ContactSchema.index({ companyId: 1, tags: 1 })
ContactSchema.index({ companyId: 1, isActive: 1 })
ContactSchema.index({ email: 1 })

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema)
