"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { ArrowLeft, TrendingUp, DollarSign, Star, Users, Trophy, Zap } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { AdminNotification } from '@/components/admin-notification'
import { toast } from 'sonner'

interface GameState {
  isPlaying: boolean
  multiplier: number
  bet: number
  balance: number
  isRunning: boolean
  hasCashedOut: boolean
  gameResult: 'win' | 'loss' | null
  crashMultiplier: number
  gameHistory: GameResult[]
  timeElapsed: number
}

interface GameResult {
  id: number
  multiplier: number
  bet: number
  result: 'win' | 'loss'
  payout: number
  timestamp: Date
}

export default function CrashPage() {
  const { user, isSignedIn } = useUser()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const startTimeRef = useRef<number>()
  
  const [showAdminNotification, setShowAdminNotification] = useState(false)
  
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    multiplier: 1.00,
    bet: 100,
    balance: 1000,
    isRunning: false,
    hasCashedOut: false,
    gameResult: null,
    crashMultiplier: 0,
    gameHistory: [],
    timeElapsed: 0
  })

  const [betAmount, setBetAmount] = useState(25)

  // Game constants
  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 400
  const MIN_BET = 20
  const MAX_BET = 50000

  // Initialize game loop
  useEffect(() => {
    if (gameState.isRunning) {
      startTimeRef.current = Date.now()
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState.isRunning])

  const gameLoop = () => {
    updateGame()
    render()
    if (gameState.isRunning) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
  }

  const updateGame = () => {
    setGameState(prev => {
      if (!prev.isRunning) return prev

      const newState = { ...prev }
      const currentTime = Date.now()
      const elapsed = startTimeRef.current ? (currentTime - startTimeRef.current) / 1000 : 0
      
      newState.timeElapsed = elapsed
      
      // Update multiplier (exponential growth)
      newState.multiplier = Math.max(1.00, 1.00 * Math.pow(1.05, elapsed))

      // Implement 25% win rate - crash probability increases over time
      const baseCrashChance = 0.01 // 1% per second base chance
      const timeMultiplier = Math.pow(1.2, elapsed) // Exponential increase
      const crashProbability = baseCrashChance * timeMultiplier
      
      // Adjust crash probability to achieve ~25% win rate
      const adjustedCrashProb = crashProbability * 3 // Make it crash more often
      
      if (Math.random() < adjustedCrashProb / 60) { // 60fps adjustment
        // Game crashes
        newState.isRunning = false
        newState.crashMultiplier = newState.multiplier
        
        if (!newState.hasCashedOut) {
          newState.gameResult = 'loss'
          toast.error(`Crashed at ${newState.multiplier.toFixed(2)}x! You lost ₹${newState.bet}`)
          // Hide admin notification when game ends
          setShowAdminNotification(false)
        }

        // Add to history
        const result: GameResult = {
          id: Date.now(),
          multiplier: newState.crashMultiplier,
          bet: newState.bet,
          result: newState.hasCashedOut ? 'win' : 'loss',
          payout: newState.hasCashedOut ? Math.floor(newState.bet * newState.multiplier) : 0,
          timestamp: new Date()
        }
        newState.gameHistory = [result, ...newState.gameHistory.slice(0, 9)]

        // Reset for next game
        setTimeout(() => {
          setGameState(current => ({
            ...current,
            isPlaying: false,
            multiplier: 1.00,
            hasCashedOut: false,
            gameResult: null,
            timeElapsed: 0
          }))
        }, 3000)
      }

      return newState
    })
  }

  const render = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas with dark background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    gradient.addColorStop(0, '#0f172a')
    gradient.addColorStop(1, '#1e293b')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * CANVAS_WIDTH
      const y = (i / 10) * CANVAS_HEIGHT
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, CANVAS_HEIGHT)
      ctx.moveTo(0, y)
      ctx.lineTo(CANVAS_WIDTH, y)
      ctx.stroke()
    }

    // Draw multiplier curve
    if (gameState.timeElapsed > 0) {
      ctx.strokeStyle = gameState.isRunning ? '#10b981' : '#ef4444'
      ctx.lineWidth = 4
      ctx.beginPath()
      
      const maxTime = 20 // seconds
      const points = 100
      
      for (let i = 0; i <= points; i++) {
        const t = (i / points) * Math.min(gameState.timeElapsed, maxTime)
        const mult = Math.max(1.00, 1.00 * Math.pow(1.05, t))
        
        const x = (t / maxTime) * CANVAS_WIDTH
        const y = CANVAS_HEIGHT - ((mult - 1) / 9) * CANVAS_HEIGHT // Scale to 10x max
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()

      // Draw current point
      const currentX = (Math.min(gameState.timeElapsed, maxTime) / maxTime) * CANVAS_WIDTH
      const currentY = CANVAS_HEIGHT - ((gameState.multiplier - 1) / 9) * CANVAS_HEIGHT
      
      ctx.fillStyle = gameState.isRunning ? '#10b981' : '#ef4444'
      ctx.beginPath()
      ctx.arc(currentX, currentY, 8, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw multiplier text
    ctx.fillStyle = gameState.isRunning ? '#10b981' : '#ef4444'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${gameState.multiplier.toFixed(2)}x`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)

    // Draw status text
    ctx.fillStyle = '#ffffff'
    ctx.font = '24px Arial'
    if (!gameState.isRunning && gameState.crashMultiplier > 0) {
      ctx.fillText(`CRASHED AT ${gameState.crashMultiplier.toFixed(2)}x`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60)
    } else if (gameState.isRunning) {
      ctx.fillText('FLYING...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60)
    }
  }

  const startGame = () => {
    if (betAmount > gameState.balance) {
      toast.error('Insufficient balance!')
      return
    }

    // Show admin notification when game starts
    setShowAdminNotification(true)

    if (gameState.isRunning) {
      toast.error('Game already in progress!')
      return
    }

    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isRunning: true,
      bet: betAmount,
      balance: prev.balance - betAmount,
      multiplier: 1.00,
      hasCashedOut: false,
      gameResult: null,
      crashMultiplier: 0,
      timeElapsed: 0
    }))

    toast.info(`Game started! Bet: ₹${betAmount}`)
  }

  const cashOut = () => {
    if (!gameState.isRunning || gameState.hasCashedOut) {
      return
    }

    const payout = Math.floor(gameState.bet * gameState.multiplier)
    
    setGameState(prev => ({
      ...prev,
      hasCashedOut: true,
      gameResult: 'win',
      balance: prev.balance + payout
    }))

    // Hide admin notification when cashing out
    setShowAdminNotification(false)

    toast.success(`Cashed out at ${gameState.multiplier.toFixed(2)}x! Won ₹${payout}`)
  }

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isRunning: false,
      multiplier: 1.00,
      hasCashedOut: false,
      gameResult: null,
      crashMultiplier: 0,
      timeElapsed: 0
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">


        {/* Header - Compact */}
        <div className="px-4 py-2 flex items-center justify-between bg-black/20 backdrop-blur-sm mb-4">
          <h1 className="text-lg font-bold text-white">🚀 Crash</h1>
          <div className="text-green-400 font-bold text-sm">₹{gameState.balance.toLocaleString()}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Canvas */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full max-w-full h-auto bg-slate-900 rounded-lg border border-slate-600"
              />
              
              {/* Game Controls */}
              <div className="flex justify-center gap-4 mt-6">
                {!gameState.isRunning && !gameState.isPlaying && (
                  <button
                    onClick={startGame}
                    disabled={betAmount > gameState.balance}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <Zap className="h-5 w-5" />
                    Start Game (₹{betAmount})
                  </button>
                )}
                
                {gameState.isRunning && !gameState.hasCashedOut && (
                  <button
                    onClick={cashOut}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 animate-pulse"
                  >
                    <DollarSign className="h-5 w-5" />
                    Cash Out (₹{Math.floor(gameState.bet * gameState.multiplier)})
                  </button>
                )}
                
                {gameState.gameResult && (
                  <button
                    onClick={resetGame}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200"
                  >
                    Play Again
                  </button>
                )}
              </div>

              {/* Current Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-gray-400 text-sm">Current Multiplier</div>
                  <div className={`text-2xl font-bold ${gameState.isRunning ? 'text-green-400' : 'text-gray-400'}`}>
                    {gameState.multiplier.toFixed(2)}x
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-gray-400 text-sm">Potential Win</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    ₹{gameState.isPlaying ? Math.floor(gameState.bet * gameState.multiplier) : 0}
                  </div>
                </div>
              </div>
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
                Balance & Betting
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
                    min={MIN_BET}
                    max={Math.min(MAX_BET, gameState.balance)}
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(MIN_BET, Math.min(gameState.balance, parseInt(e.target.value) || MIN_BET)))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    disabled={gameState.isRunning}
                  />
                </div>

                <div className="flex gap-2">
                  {[25, 100, 500, 1000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(Math.min(amount, gameState.balance))}
                      disabled={gameState.isRunning || amount > gameState.balance}
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
                      ? `${Math.max(...gameState.gameHistory.map(g => g.multiplier)).toFixed(2)}x`
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
                <p>• Place your bet and start the game</p>
                <p>• Watch the multiplier increase</p>
                <p>• Cash out before it crashes!</p>
                <p>• The longer you wait, the higher the risk</p>
                <p>• If you don't cash out before the crash, you lose your bet</p>
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
                  <TrendingUp className="h-5 w-5 text-purple-400" />
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
                        Crashed at {game.multiplier.toFixed(2)}x
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Notification */}
      {showAdminNotification && (
        <AdminNotification
          gameId="crash"
          gameName="Crash"
          onClose={() => setShowAdminNotification(false)}
        />
      )}
    </div>
  )
}