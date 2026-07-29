// Game Activity Model for MongoDB - WIN07 Gaming Platform
import mongoose, { Schema, Document } from 'mongoose'

// Game Activity interface
export interface IGameActivity extends Document {
  userId: string
  clerkUserId: string
  userName: string
  game: string
  betAmount: number
  winAmount: number
  profit: number
  outcome: 'win' | 'loss'
  gameData?: any
  multiplier?: number
  timestamp: Date
  createdAt: Date
  updatedAt: Date
}

// Game Activity Schema
const GameActivitySchema = new Schema<IGameActivity>({
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
  game: {
    type: String,
    required: true,
    index: true
  },
  betAmount: {
    type: Number,
    required: true,
    min: 0
  },
  winAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  profit: {
    type: Number,
    required: true
  },
  outcome: {
    type: String,
    required: true,
    enum: ['win', 'loss']
  },
  gameData: {
    type: Schema.Types.Mixed,
    default: {}
  },
  multiplier: {
    type: Number,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
GameActivitySchema.index({ timestamp: -1 })
GameActivitySchema.index({ userId: 1, timestamp: -1 })
GameActivitySchema.index({ game: 1, timestamp: -1 })
GameActivitySchema.index({ outcome: 1, timestamp: -1 })

// Static methods
GameActivitySchema.statics.findByUserId = function(userId: string, limit: number = 50) {
  return this.find({ userId }).sort({ timestamp: -1 }).limit(limit)
}

GameActivitySchema.statics.findByGame = function(game: string, limit: number = 100) {
  return this.find({ game }).sort({ timestamp: -1 }).limit(limit)
}

GameActivitySchema.statics.getRecentActivity = function(limit: number = 100) {
  return this.find().sort({ timestamp: -1 }).limit(limit)
}

GameActivitySchema.statics.getUserGameStats = async function(clerkUserId: string) {
  const pipeline = [
    { $match: { clerkUserId } },
    {
      $group: {
        _id: '$game',
        totalBets: { $sum: 1 },
        totalBetAmount: { $sum: '$betAmount' },
        totalWinAmount: { $sum: '$winAmount' },
        totalProfit: { $sum: '$profit' },
        wins: { $sum: { $cond: [{ $eq: ['$outcome', 'win'] }, 1, 0] } },
        losses: { $sum: { $cond: [{ $eq: ['$outcome', 'loss'] }, 1, 0] } },
        lastPlayed: { $max: '$timestamp' }
      }
    },
    {
      $addFields: {
        winRate: { $divide: ['$wins', '$totalBets'] },
        rtp: { $divide: ['$totalWinAmount', '$totalBetAmount'] }
      }
    }
  ]
  
  return this.aggregate(pipeline)
}

GameActivitySchema.statics.getGameStats = async function(game?: string) {
  const match = game ? { game } : {}
  
  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: '$game',
        totalPlayers: { $addToSet: '$clerkUserId' },
        totalBets: { $sum: 1 },
        totalBetAmount: { $sum: '$betAmount' },
        totalWinAmount: { $sum: '$winAmount' },
        totalProfit: { $sum: '$profit' },
        avgBetAmount: { $avg: '$betAmount' },
        maxBetAmount: { $max: '$betAmount' },
        wins: { $sum: { $cond: [{ $eq: ['$outcome', 'win'] }, 1, 0] } },
        losses: { $sum: { $cond: [{ $eq: ['$outcome', 'loss'] }, 1, 0] } }
      }
    },
    {
      $addFields: {
        totalPlayers: { $size: '$totalPlayers' },
        winRate: { $divide: ['$wins', '$totalBets'] },
        houseEdge: { $divide: [{ $multiply: ['$totalProfit', -1] }, '$totalBetAmount'] }
      }
    }
  ]
  
  return this.aggregate(pipeline)
}

// Virtual for formatted amounts
GameActivitySchema.virtual('formattedBetAmount').get(function() {
  return `₹${this.betAmount.toLocaleString()}`
})

GameActivitySchema.virtual('formattedWinAmount').get(function() {
  return `₹${this.winAmount.toLocaleString()}`
})

GameActivitySchema.virtual('formattedProfit').get(function() {
  const sign = this.profit >= 0 ? '+' : ''
  return `${sign}₹${this.profit.toLocaleString()}`
})

// Export the model
export default mongoose.models.GameActivity || mongoose.model<IGameActivity>('GameActivity', GameActivitySchema)
