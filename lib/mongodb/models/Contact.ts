import mongoose, { Document, Schema } from 'mongoose'

export interface IContact extends Document {
  _id: string
  companyId: string
  phoneNumber: string
  name: string
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

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema)
