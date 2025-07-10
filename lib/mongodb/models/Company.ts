import mongoose, { Document, Schema } from 'mongoose'

export interface ICompany extends Document {
  _id: string
  name: string
  email: string
  status: 'pending' | 'approved' | 'suspended'
  maxInstances: number
  trialEndDate?: Date
  createdAt: Date
  updatedAt: Date
}

const CompanySchema = new Schema<ICompany>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'suspended'],
    default: 'pending'
  },
  maxInstances: {
    type: Number,
    default: 5
  },
  trialEndDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  }
}, {
  timestamps: true,
  collection: 'companies'
})

// Indexes
CompanySchema.index({ email: 1 }, { unique: true })
CompanySchema.index({ status: 1 })
CompanySchema.index({ createdAt: 1 })

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema)
