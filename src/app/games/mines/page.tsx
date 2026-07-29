"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { ArrowLeft, Bomb, Gem, DollarSign, Star, Users, Trophy, Zap } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { AdminNotification } from '@/components/admin-notification'
import { toast } from 'sonner'

interface Cell {
  id: number
  isMine: boolean
  isRevealed: boolean
  isDiamond: boolean
}

interface GameState {
  grid: Cell[]
  mineCount: number
  bet: number
  balance: number
  gameStatus: 'betting' | 'playing' | 'finished'
  result: 'win' | 'loss' | null
  multiplier: number
  diamondsFound: number
  gameHistory: GameResult[]
}

interface GameResult {
  id: number
  bet: number
  result: 'win' | 'loss'
  payout: number
  diamondsFound: number
  mineCount: number
  timestamp: Date
}

const GRID_SIZE = 25 // 5x5 grid

export default function MinesPage() {
  const { user, isSignedIn } = useUser()
  
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    mineCount: 3,
    bet: 100,
    balance: 1000,
    gameStatus: 'betting',
    result: null,
    multiplier: 1.0,
    diamondsFound: 0,
    gameHistory: []
  })

  const [betAmount, setBetAmount] = useState(100)
  const [selectedMines, setSelectedMines] = useState(3)

  // Initialize empty grid
  const createEmptyGrid = (): Cell[] => {
    return Array.from({ length: GRID_SIZE }, (_, index) => ({
      id: index,
      isMine: false,
      isRevealed: false,
      isDiamond: false
    }))
  }

  // Create game grid with mines
  const createGameGrid = (mineCount: number): Cell[] => {
    const grid = createEmptyGrid()
    
    // Implement 25% win rate by strategic mine placement
    const shouldPlayerWin = Math.random() < 0.25
    
    if (shouldPlayerWin) {
      // Place mines in positions less likely to be clicked first (corners and edges)
      const safePositions = [6, 7, 8, 11, 12, 13, 16, 17, 18] // Center area
      const minePositions = new Set<number>()
      
      // Place mines in corners and edges first
      const edgePositions = [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24]
      const shuffledEdges = edgePositions.sort(() => Math.random() - 0.5)
      
      for (let i = 0; i < mineCount && i < shuffledEdges.length; i++) {
        minePositions.add(shuffledEdges[i])
      }
      
      // If we need more mines, add them randomly
      while (minePositions.size < mineCount) {
        const pos = Math.floor(Math.random() * GRID_SIZE)
        minePositions.add(pos)
      }
      
      minePositions.forEach(pos => {
        grid[pos].isMine = true
      })
    } else {
      // Normal random placement for higher loss rate
      const minePositions = new Set<number>()
      while (minePositions.size < mineCount) {
        const pos = Math.floor(Math.random() * GRID_SIZE)
        minePositions.add(pos)
      }
      
      minePositions.forEach(pos => {
        grid[pos].isMine = true
      })
    }
    
    // Mark non-mine cells as diamonds
    grid.forEach(cell => {
      if (!cell.isMine) {
        cell.isDiamond = true
      }
    })
    
    return grid
  }

  // Calculate multiplier based on diamonds found and mine count
  const calculateMultiplier = (diamondsFound: number, mineCount: number): number => {
    if (diamondsFound === 0) return 1.0
    
    const safeSpots = GRID_SIZE - mineCount
    const multiplierBase = 1 + (mineCount * 0.2) // Higher mines = higher multiplier
    
    return Math.pow(multiplierBase, diamondsFound)
  }

  // Start new game
  const startGame = () => {
    if (betAmount > gameState.balance) {
      toast.error('Insufficient balance!')
      return
    }

    const newGrid = createGameGrid(selectedMines)
    
    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      mineCount: selectedMines,
      bet: betAmount,
      balance: prev.balance - betAmount,
      gameStatus: 'playing',
      result: null,
      multiplier: 1.0,
      diamondsFound: 0
    }))

    toast.info(`Game started! Avoid ${selectedMines} mines. Bet: ₹${betAmount}`)
  }

  // Reveal cell
  const revealCell = (cellId: number) => {
    if (gameState.gameStatus !== 'playing') return
    
    setGameState(prev => {
      const newGrid = [...prev.grid]
      const cell = newGrid[cellId]
      
      if (cell.isRevealed) return prev // Already revealed
      
      cell.isRevealed = true
      
      if (cell.isMine) {
        // Hit a mine - game over
        const newState = {
          ...prev,
          grid: newGrid.map(c => ({ ...c, isRevealed: true })), // Reveal all
          gameStatus: 'finished' as const,
          result: 'loss' as const
        }
        
        // Add to history
        const result: GameResult = {
          id: Date.now(),
          bet: prev.bet,
          result: 'loss',
          payout: 0,
          diamondsFound: prev.diamondsFound,
          mineCount: prev.mineCount,
          timestamp: new Date()
        }
        newState.gameHistory = [result, ...prev.gameHistory.slice(0, 9)]
        
        toast.error(`💥 Hit a mine! Lost ₹${prev.bet}`)
        
        // Reset for next game
        setTimeout(() => {
          setGameState(current => ({
            ...current,
            gameStatus: 'betting',
            result: null,
            grid: createEmptyGrid()
          }))
        }, 3000)
        
        return newState
      } else {
        // Found a diamond
        const newDiamondsFound = prev.diamondsFound + 1
        const newMultiplier = calculateMultiplier(newDiamondsFound, prev.mineCount)
        
        toast.success(`💎 Found a diamond! Multiplier: ${newMultiplier.toFixed(2)}x`)
        
        return {
          ...prev,
          grid: newGrid,
          diamondsFound: newDiamondsFound,
          multiplier: newMultiplier
        }
      }
    })
  }

  // Cash out
  const cashOut = () => {
    if (gameState.gameStatus !== 'playing' || gameState.diamondsFound === 0) return
    
    const payout = Math.floor(gameState.bet * gameState.multiplier)
    
    setGameState(prev => ({
      ...prev,
      balance: prev.balance + payout,
      gameStatus: 'finished',
      result: 'win',
      gameHistory: [{
        id: Date.now(),
        bet: prev.bet,
        result: 'win',
        payout,
        diamondsFound: prev.diamondsFound,
        mineCount: prev.mineCount,
        timestamp: new Date()
      }, ...prev.gameHistory.slice(0, 9)]
    }))
    
    toast.success(`💰 Cashed out! Won ₹${payout} with ${gameState.diamondsFound} diamonds`)
    
    // Reset for next game
    setTimeout(() => {
      setGameState(current => ({
        ...current,
        gameStatus: 'betting',
        result: null,
        grid: createEmptyGrid(),
        multiplier: 1.0,
        diamondsFound: 0
      }))
    }, 3000)
  }

  // Get cell display
  const getCellContent = (cell: Cell) => {
    if (!cell.isRevealed) {
      return null
    }
    
    if (cell.isMine) {
      return <Bomb className="h-6 w-6 text-red-500" />
    }
    
    if (cell.isDiamond) {
      return <Gem className="h-6 w-6 text-blue-400" />
    }
    
    return null
  }

  const getCellStyle = (cell: Cell) => {
    if (!cell.isRevealed) {
      return "bg-slate-600 hover:bg-slate-500 cursor-pointer"
    }
    
    if (cell.isMine) {
      return "bg-red-600"
    }
    
    if (cell.isDiamond) {
      return "bg-green-600"
    }
    
    return "bg-slate-700"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/games" className="inline-flex items-center gap-2 text-white hover:text-blue-400 transition-colors mb-6">
          <ArrowLeft className="h-5 w-5" />
          Back to Games
        </Link>

        {/* Game Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            💎 Mines
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Find diamonds while avoiding mines! The more diamonds you find, the higher your multiplier.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Grid */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
            >
              {/* Game Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-gray-400 text-sm">Diamonds Found</div>
                  <div className="text-2xl font-bold text-blue-400 flex items-center justify-center gap-1">
                    <Gem className="h-5 w-5" />
                    {gameState.diamondsFound}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-gray-400 text-sm">Multiplier</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {gameState.multiplier.toFixed(2)}x
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-gray-400 text-sm">Potential Win</div>
                  <div className="text-2xl font-bold text-green-400">
                    ₹{Math.floor(gameState.bet * gameState.multiplier)}
                  </div>
                </div>
              </div>

              {/* Mine Grid */}
              <div className="grid grid-cols-5 gap-2 mb-6 max-w-md mx-auto">
                {gameState.grid.map((cell) => (
                  <motion.button
                    key={cell.id}
                    whileHover={{ scale: cell.isRevealed ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => revealCell(cell.id)}
                    disabled={gameState.gameStatus !== 'playing' || cell.isRevealed}
                    className={`aspect-square flex items-center justify-center rounded-lg border-2 border-slate-500 transition-all duration-200 ${getCellStyle(cell)}`}
                  >
                    {getCellContent(cell)}
                  </motion.button>
                ))}
              </div>

              {/* Game Controls */}
              <div className="flex justify-center gap-4">
                {gameState.gameStatus === 'betting' && (
                  <button
                    onClick={startGame}
                    disabled={betAmount > gameState.balance}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <Zap className="h-5 w-5" />
                    Start Game (₹{betAmount})
                  </button>
                )}
                
                {gameState.gameStatus === 'playing' && gameState.diamondsFound > 0 && (
                  <button
                    onClick={cashOut}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 animate-pulse"
                  >
                    <DollarSign className="h-5 w-5" />
                    Cash Out (₹{Math.floor(gameState.bet * gameState.multiplier)})
                  </button>
                )}
              </div>

              {/* Game Result */}
              {gameState.result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-6 p-4 rounded-lg text-center text-white font-bold text-xl ${
                    gameState.result === 'win' ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  {gameState.result === 'win' ? '🎉 Cashed Out Successfully!' : '💥 Hit a Mine!'}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Controls & Stats */}
          <div className="space-y-6">
            {/* Balance & Betting */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
            >
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                Balance & Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-green-400 text-sm mb-1">Current Balance</div>
                  <div className="text-2xl font-bold text-white">₹{gameState.balance}</div>
                </div>

                <div>
                  <div className="text-blue-400 text-sm mb-2">Bet Amount</div>
                  <input
                    type="number"
                    min="10"
                    max={gameState.balance}
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(10, Math.min(gameState.balance, parseInt(e.target.value) || 10)))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    disabled={gameState.gameStatus !== 'betting'}
                  />
                </div>

                <div>
                  <div className="text-red-400 text-sm mb-2 flex items-center gap-1">
                    <Bomb className="h-4 w-4" />
                    Number of Mines
                  </div>
                  <select
                    value={selectedMines}
                    onChange={(e) => setSelectedMines(parseInt(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    disabled={gameState.gameStatus !== 'betting'}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>
                        {num} Mine{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  {[50, 100, 250, 500].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(Math.min(amount, gameState.balance))}
                      disabled={gameState.gameStatus !== 'betting' || amount > gameState.balance}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Game Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
            >
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Game Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Games Played</span>
                  <span className="text-white font-semibold">{gameState.gameHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-green-400 font-semibold">
                    {gameState.gameHistory.length > 0 
                      ? `${Math.round((gameState.gameHistory.filter(g => g.result === 'win').length / gameState.gameHistory.length) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Best Multiplier</span>
                  <span className="text-purple-400 font-semibold">
                    {gameState.gameHistory.length > 0 
                      ? `${Math.max(...gameState.gameHistory.map(g => g.payout / g.bet)).toFixed(2)}x`
                      : '0.00x'
                    }
                  </span>
                </div>
              </div>
            </motion.div>

            {/* How to Play */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
            >
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                How to Play
              </h3>
              
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Set your bet amount and number of mines</p>
                <p>• Click cells to reveal diamonds 💎</p>
                <p>• Avoid mines 💣 or you'll lose your bet</p>
                <p>• Each diamond increases your multiplier</p>
                <p>• Cash out anytime to secure your winnings</p>
                <p>• More mines = higher multipliers but more risk</p>
              </div>
            </motion.div>

            {/* Game History */}
            {gameState.gameHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
              >
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  Recent Games
                </h3>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gameState.gameHistory.map((game) => (
                    <div key={game.id} className={`p-3 rounded-lg border ${
                      game.result === 'win' ? 'bg-green-900/20 border-green-600' : 'bg-red-900/20 border-red-600'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-semibold ${game.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                          {game.result === 'win' ? '+' : '-'}₹{game.result === 'win' ? game.payout : game.bet}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {game.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {game.diamondsFound} diamonds, {game.mineCount} mines
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}