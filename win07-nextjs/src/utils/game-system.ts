import { BetConfig, GameConfig, Transaction } from '@/types/game'

// Betting utility functions
export class GameSystem {
  static readonly MIN_BET = 20 // ₹20
  static readonly MAX_BET = 50000 // ₹50,000

  static validateBet(amount: number): boolean {
    return amount >= this.MIN_BET && amount <= this.MAX_BET && amount > 0
  }

  static calculatePayout(betAmount: number, multiplier: number): number {
    return Math.floor(betAmount * multiplier * 100) / 100
  }

  static generateMultiplier(gameType: string, volatility: 'Low' | 'Medium' | 'High'): number {
    const baseMultipliers = {
      'Low': { min: 1.01, max: 2.5 },
      'Medium': { min: 1.01, max: 10.0 },
      'High': { min: 1.01, max: 100.0 }
    }

    const range = baseMultipliers[volatility]
    
    // Use weighted random for realistic casino-like odds
    const random = Math.random()
    
    // Higher chance for lower multipliers (house edge)
    if (random < 0.7) {
      return Math.round((range.min + (range.max - range.min) * Math.random() * 0.3) * 100) / 100
    } else if (random < 0.9) {
      return Math.round((range.min + (range.max - range.min) * Math.random() * 0.6) * 100) / 100
    } else {
      return Math.round((range.min + (range.max - range.min) * Math.random()) * 100) / 100
    }
  }

  static calculateHouseEdge(rtp: number): number {
    return 100 - rtp
  }

  static formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  static generateQuickBetAmounts(): number[] {
    return [25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000]
  }

  static createTransaction(
    type: 'bet' | 'win' | 'loss',
    amount: number,
    gameId: string,
    multiplier?: number
  ): Transaction {
    return {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      amount,
      game: gameId,
      timestamp: new Date(),
      multiplier,
      status: 'completed'
    }
  }

  static calculateWinProbability(multiplier: number): number {
    // Simplified probability calculation (1/multiplier with house edge)
    return Math.max(0.01, (0.99 / multiplier))
  }

  static getRecommendedBet(balance: number): number {
    // Recommend 1-5% of balance as safe betting
    const safeBet = Math.floor(balance * 0.02)
    return Math.max(this.MIN_BET, Math.min(safeBet, this.MAX_BET))
  }

  static validateBalance(balance: number, betAmount: number): boolean {
    return balance >= betAmount
  }

  // Provably fair system (simplified)
  static generateProvablyFairResult(seed: string, nonce: number): number {
    const hash = this.simpleHash(seed + nonce.toString())
    return parseInt(hash.substr(0, 8), 16) / 0xffffffff
  }

  private static simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }
}

// Challenge strategies
export const challengeStrategies = {
  conservative: {
    name: 'Conservative',
    description: 'Small, safe challenges with lower risk',
    multiplier: 0.01, // 1% of balance
    maxAmount: 100
  },
  moderate: {
    name: 'Moderate',
    description: 'Balanced risk and reward',
    multiplier: 0.05, // 5% of balance
    maxAmount: 1000
  },
  aggressive: {
    name: 'Aggressive',
    description: 'High risk, high reward challenges',
    multiplier: 0.1, // 10% of balance
    maxAmount: 10000
  }
}

// Popular challenge amounts for mind games
export const popularChallengeAmounts = [
  { label: '₹5', value: 5 },
  { label: '₹10', value: 10 },
  { label: '₹25', value: 25 },
  { label: '₹50', value: 50 },
  { label: '₹100', value: 100 },
  { label: '₹250', value: 250 },
  { label: '₹500', value: 500 },
  { label: '₹1K', value: 1000 },
  { label: '₹2.5K', value: 2500 },
  { label: '₹5K', value: 5000 },
  { label: '₹10K', value: 10000 },
  { label: '₹25K', value: 25000 },
  { label: '₹50K', value: 50000 }
]
