import mongoose, { Document, Schema } from 'mongoose'

export interface IContactGroup extends Document {
  _id: string
  companyId: string
  name: string
  description?: string
  contacts: string[]
  isActive: boolean
  color?: string
  createdAt: Date
  updatedAt: Date
}

const ContactGroupSchema = new Schema<IContactGroup>({
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
  description: {
    type: String,
    trim: true
  },
  contacts: [{
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    trim: true,
    default: '#3B82F6'
  }
}, {
  timestamps: true,
  collection: 'contact_groups'
})

// Indexes
ContactGroupSchema.index({ companyId: 1, name: 1 }, { unique: true })
ContactGroupSchema.index({ companyId: 1 })
ContactGroupSchema.index({ companyId: 1, isActive: 1 })

export default mongoose.models.ContactGroup || mongoose.model<IContactGroup>('ContactGroup', ContactGroupSchema)
