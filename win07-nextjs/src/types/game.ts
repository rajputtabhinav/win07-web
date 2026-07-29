// Game Types and Interfaces
export interface GameConfig {
  id: string
  title: string
  description: string
  category: 'Casino' | 'Cards' | 'Action' | 'Strategy' | 'Arcade'
  thumbnail: string
  rating: number
  players: string
  featured?: boolean
  minBet: number
  maxBet: number
  rtp: number // Return to Player percentage
  volatility: 'Low' | 'Medium' | 'High'
}

export interface BetConfig {
  amount: number
  multiplier: number
  autoPlay?: boolean
  stopOnWin?: number
  stopOnLoss?: number
}

export interface GameState {
  isPlaying: boolean
  isPaused: boolean
  currentBet: number
  balance: number
  totalWon: number
  totalLost: number
  gamesPlayed: number
  currentMultiplier: number
  gameResult?: 'win' | 'loss' | 'ongoing'
}

export interface Player {
  x: number
  y: number
  width: number
  height: number
  velocityX: number
  velocityY: number
  health: number
  score: number
  level: number
}

export interface GameStats {
  totalBets: number
  totalWins: number
  totalLosses: number
  biggestWin: number
  winRate: number
  averageBet: number
  favoriteGame: string
}

export interface Transaction {
  id: string
  type: 'bet' | 'win' | 'loss' | 'deposit' | 'withdrawal'
  amount: number
  game: string
  timestamp: Date
  multiplier?: number
  status: 'completed' | 'pending' | 'failed'
}

export interface GameSession {
  sessionId: string
  gameId: string
  startTime: Date
  endTime?: Date
  totalBets: number
  totalWins: number
  netResult: number
  transactions: Transaction[]
}
