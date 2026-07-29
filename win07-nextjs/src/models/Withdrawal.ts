// Withdrawal Model for MongoDB - WIN07 Gaming Platform
import mongoose, { Schema, Document } from 'mongoose'

// Withdrawal interface
export interface IWithdrawal extends Document {
  userId: string
  clerkUserId: string
  userName: string
  amount: number
  method: 'bank' | 'upi'
  accountDetails: {
    accountNumber?: string
    ifscCode?: string
    bankName?: string
    accountHolderName?: string
    upiId?: string
  }
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed'
  adminNotes?: string
  processedBy?: string
  processedAt?: Date
  rejectionReason?: string
  transactionId?: string
  createdAt: Date
  updatedAt: Date
}

// Withdrawal Schema
const WithdrawalSchema = new Schema<IWithdrawal>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  clerkUserId: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  method: {
    type: String,
    required: true,
    enum: ['bank', 'upi']
  },
  accountDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String,
    upiId: String
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'processing', 'completed'],
    default: 'pending',
    index: true
  },
  adminNotes: {
    type: String,
    default: null
  },
  processedBy: {
    type: String,
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  transactionId: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
WithdrawalSchema.index({ createdAt: -1 })
WithdrawalSchema.index({ userId: 1, createdAt: -1 })
WithdrawalSchema.index({ clerkUserId: 1, createdAt: -1 })
WithdrawalSchema.index({ status: 1, createdAt: -1 })

// Static methods
WithdrawalSchema.statics.findByUserId = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 })
}

WithdrawalSchema.statics.findByClerkUserId = function(clerkUserId: string) {
  return this.find({ clerkUserId }).sort({ createdAt: -1 })
}

WithdrawalSchema.statics.getPendingWithdrawals = function() {
  return this.find({ status: 'pending' }).sort({ createdAt: 1 })
}

WithdrawalSchema.statics.getProcessedWithdrawals = function(limit: number = 50) {
  return this.find({ 
    status: { $in: ['approved', 'rejected', 'completed'] } 
  }).sort({ processedAt: -1 }).limit(limit)
}

WithdrawalSchema.statics.getTotalWithdrawalAmount = function(status?: string) {
  const match = status ? { status } : {}
  return this.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ])
}

WithdrawalSchema.statics.getUserDailyWithdrawals = function(clerkUserId: string, date: Date = new Date()) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  
  return this.find({
    clerkUserId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'approved', 'processing', 'completed'] }
  })
}

// Instance methods
WithdrawalSchema.methods.approve = function(adminId: string, notes?: string) {
  this.status = 'approved'
  this.processedBy = adminId
  this.processedAt = new Date()
  if (notes) this.adminNotes = notes
  return this.save()
}

WithdrawalSchema.methods.reject = function(adminId: string, reason: string, notes?: string) {
  this.status = 'rejected'
  this.processedBy = adminId
  this.processedAt = new Date()
  this.rejectionReason = reason
  if (notes) this.adminNotes = notes
  return this.save()
}

WithdrawalSchema.methods.complete = function(transactionId?: string) {
  this.status = 'completed'
  if (transactionId) this.transactionId = transactionId
  return this.save()
}

// Virtual for formatted amount
WithdrawalSchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount.toLocaleString()}`
})

// Virtual for processing time
WithdrawalSchema.virtual('processingTime').get(function() {
  if (!this.processedAt) return null
  const diff = this.processedAt.getTime() - this.createdAt.getTime()
  return Math.floor(diff / (1000 * 60)) // in minutes
})

// Pre-save middleware
WithdrawalSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending' && !this.processedAt) {
    this.processedAt = new Date()
  }
  next()
})

// Export the model
export default mongoose.models.Withdrawal || mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema)
