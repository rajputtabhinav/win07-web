// Admin Action Model for MongoDB - WIN07 Gaming Platform
import mongoose, { Schema, Document } from 'mongoose'

// Admin Action interface
export interface IAdminAction extends Document {
  adminId: string
  action: string
  targetUserId?: string
  targetUserName?: string
  details: any
  amount?: number
  reason?: string
  timestamp: Date
  ipAddress?: string
  userAgent?: string
  createdAt: Date
  updatedAt: Date
}

// Admin Action Schema
const AdminActionSchema = new Schema<IAdminAction>({
  adminId: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  targetUserId: {
    type: String,
    default: null,
    index: true
  },
  targetUserName: {
    type: String,
    default: null
  },
  details: {
    type: Schema.Types.Mixed,
    required: true
  },
  amount: {
    type: Number,
    default: null
  },
  reason: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
AdminActionSchema.index({ timestamp: -1 })
AdminActionSchema.index({ adminId: 1, timestamp: -1 })
AdminActionSchema.index({ targetUserId: 1, timestamp: -1 })
AdminActionSchema.index({ action: 1, timestamp: -1 })

// Static methods
AdminActionSchema.statics.findByAdminId = function(adminId: string, limit: number = 100) {
  return this.find({ adminId }).sort({ timestamp: -1 }).limit(limit)
}

AdminActionSchema.statics.findByTargetUser = function(targetUserId: string, limit: number = 100) {
  return this.find({ targetUserId }).sort({ timestamp: -1 }).limit(limit)
}

AdminActionSchema.statics.getRecentActions = function(limit: number = 100) {
  return this.find().sort({ timestamp: -1 }).limit(limit)
}

AdminActionSchema.statics.getActionsByType = function(action: string, limit: number = 100) {
  return this.find({ action }).sort({ timestamp: -1 }).limit(limit)
}

AdminActionSchema.statics.getAdminStats = async function(adminId?: string) {
  const match = adminId ? { adminId } : {}
  
  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        lastAction: { $max: '$timestamp' }
      }
    }
  ]
  
  return this.aggregate(pipeline)
}

// Static method to log admin action
AdminActionSchema.statics.logAction = async function(actionData: Partial<IAdminAction>) {
  const action = new this(actionData)
  return action.save()
}

// Virtual for formatted amount
AdminActionSchema.virtual('formattedAmount').get(function() {
  return this.amount ? `₹${this.amount.toLocaleString()}` : null
})

// Export the model
export default mongoose.models.AdminAction || mongoose.model<IAdminAction>('AdminAction', AdminActionSchema)
