import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: string
  companyId: string
  role: 'super_admin' | 'company_admin' | 'company_user'
  name: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  companyId: {
    type: String,
    required: true,
    ref: 'Company'
  },
  role: {
    type: String,
    enum: ['super_admin', 'company_admin', 'company_user'],
    default: 'company_user'
  },
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
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  timestamps: true,
  collection: 'users'
})

// Indexes
UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ companyId: 1 })
UserSchema.index({ role: 1 })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
