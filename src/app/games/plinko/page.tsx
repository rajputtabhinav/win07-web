"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { ArrowLeft, Circle, DollarSign, Star, Users, Trophy, Zap } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { toast } from 'sonner'

interface Ball {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  isActive: boolean
}

interface GameState {
  balls: Ball[]
  bet: number
  balance: number
  gameStatus: 'betting' | 'playing' | 'finished'
  multipliers: number[]
  gameHistory: GameResult[]
  isAnimating: boolean
}

interface GameResult {
  id: number
  bet: number
  result: 'win' | 'loss'
  payout: number
  multiplier: number
  timestamp: Date
}

export default function PlinkoPage() {
  const { user, isSignedIn } = useUser()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  
  const [gameState, setGameState] = useState<GameState>({
    balls: [],
    bet: 100,
    balance: 1000,
    gameStatus: 'betting',
    multipliers: [0.2, 0.5, 1.0, 2.0, 5.0, 10.0, 5.0, 2.0, 1.0, 0.5, 0.2], // 11 slots
    gameHistory: [],
    isAnimating: false
  })

  const [betAmount, setBetAmount] = useState(100)
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium')

  // Game constants
  const CANVAS_WIDTH = 600
  const CANVAS_HEIGHT = 500
  const PEG_RADIUS = 4
  const BALL_RADIUS = 8
  const ROWS = 12
  const SLOTS = 11

  // Risk level multipliers
  const riskMultipliers = {
    low: [0.5, 0.7, 1.0, 1.2, 1.5, 2.0, 1.5, 1.2, 1.0, 0.7, 0.5],
    medium: [0.2, 0.5, 1.0, 2.0, 5.0, 10.0, 5.0, 2.0, 1.0, 0.5, 0.2],
    high: [0.1, 0.2, 0.5, 1.0, 10.0, 50.0, 10.0, 1.0, 0.5, 0.2, 0.1]
  }

  // Initialize game loop
  useEffect(() => {
    if (gameState.isAnimating) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState.isAnimating])

  const gameLoop = () => {
    updatePhysics()
    render()
    if (gameState.isAnimating) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
  }

  // Create pegs pattern
  const createPegs = () => {
    const pegs = []
    for (let row = 0; row < ROWS; row++) {
      const pegsInRow = row + 3
      const spacing = CANVAS_WIDTH / (pegsInRow + 1)
      const y = 80 + row * 30
      
      for (let i = 0; i < pegsInRow; i++) {
        const x = spacing * (i + 1) + (row % 2) * spacing * 0.5
        pegs.push({ x, y })
      }
    }
    return pegs
  }

  const pegs = createPegs()

  // Update ball physics
  const updatePhysics = () => {
    setGameState(prev => {
      const newBalls = prev.balls.map(ball => {
        if (!ball.isActive) return ball

        // Apply gravity
        ball.vy += 0.3
        
        // Update position
        ball.x += ball.vx
        ball.y += ball.vy

        // Check collision with pegs
        pegs.forEach(peg => {
          const dx = ball.x - peg.x
          const dy = ball.y - peg.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < ball.radius + PEG_RADIUS) {
            // Collision detected
            const angle = Math.atan2(dy, dx)
            
            // Implement 25% win rate by biasing ball direction
            const shouldBiasToCenter = Math.random() < 0.25 // 25% chance to bias toward center (higher multipliers)
            
            if (shouldBiasToCenter) {
              // Bias toward center slots (higher multipliers)
              const centerX = CANVAS_WIDTH / 2
              const biasDirection = ball.x < centerX ? 1 : -1
              ball.vx = Math.cos(angle) * 2 + biasDirection * 0.5
            } else {
              // Normal physics
              ball.vx = Math.cos(angle) * 2 + (Math.random() - 0.5) * 1
            }
            
            ball.vy = Math.abs(Math.sin(angle) * 2)
            
            // Move ball out of peg
            ball.x = peg.x + Math.cos(angle) * (ball.radius + PEG_RADIUS + 1)
            ball.y = peg.y + Math.sin(angle) * (ball.radius + PEG_RADIUS + 1)
          }
        })

        // Check if ball reached bottom
        if (ball.y > CANVAS_HEIGHT - 60) {
          // Determine which slot the ball landed in
          const slotWidth = CANVAS_WIDTH / SLOTS
          let slotIndex = Math.floor(ball.x / slotWidth)
          slotIndex = Math.max(0, Math.min(SLOTS - 1, slotIndex))
          
          const multiplier = prev.multipliers[slotIndex]
          const payout = Math.floor(prev.bet * multiplier)
          
          // Add to history
          const result: GameResult = {
            id: Date.now() + Math.random(),
            bet: prev.bet,
            result: multiplier >= 1 ? 'win' : 'loss',
            payout,
            multiplier,
            timestamp: new Date()
          }
          
          // Update balance
          const newBalance = prev.balance + payout
          
          if (multiplier >= 1) {
            toast.success(`🎉 Ball landed on ${multiplier}x! Won ₹${payout}`)
          } else {
            toast.error(`😔 Ball landed on ${multiplier}x. Lost ₹${prev.bet - payout}`)
          }
          
          setGameState(current => ({
            ...current,
            balance: newBalance,
            gameHistory: [result, ...current.gameHistory.slice(0, 9)]
          }))
          
          ball.isActive = false
        }

        // Keep ball within bounds
        if (ball.x < ball.radius) {
          ball.x = ball.radius
          ball.vx = Math.abs(ball.vx)
        }
        if (ball.x > CANVAS_WIDTH - ball.radius) {
          ball.x = CANVAS_WIDTH - ball.radius
          ball.vx = -Math.abs(ball.vx)
        }

        return ball
      })

      // Check if all balls are done
      const activeBalls = newBalls.filter(ball => ball.isActive)
      const shouldStopAnimation = activeBalls.length === 0 && newBalls.length > 0
      
      if (shouldStopAnimation) {
        setTimeout(() => {
          setGameState(current => ({
            ...current,
            gameStatus: 'betting',
            balls: [],
            isAnimating: false
          }))
        }, 1000)
      }

      return {
        ...prev,
        balls: newBalls,
        isAnimating: activeBalls.length > 0
      }
    })
  }

  // Render game
  const render = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    gradient.addColorStop(0, '#1e293b')
    gradient.addColorStop(1, '#0f172a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw pegs
    ctx.fillStyle = '#64748b'
    pegs.forEach(peg => {
      ctx.beginPath()
      ctx.arc(peg.x, peg.y, PEG_RADIUS, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw slot dividers
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 2
    const slotWidth = CANVAS_WIDTH / SLOTS
    for (let i = 1; i < SLOTS; i++) {
      const x = i * slotWidth
      ctx.beginPath()
      ctx.moveTo(x, CANVAS_HEIGHT - 60)
      ctx.lineTo(x, CANVAS_HEIGHT)
      ctx.stroke()
    }

    // Draw slot multipliers
    ctx.fillStyle = '#ffffff'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    gameState.multipliers.forEach((multiplier, index) => {
      const x = (index + 0.5) * slotWidth
      const y = CANVAS_HEIGHT - 20
      
      // Color code multipliers
      if (multiplier >= 5) ctx.fillStyle = '#10b981' // Green for high multipliers
      else if (multiplier >= 1) ctx.fillStyle = '#f59e0b' // Yellow for medium
      else ctx.fillStyle = '#ef4444' // Red for low
      
      ctx.fillText(`${multiplier}x`, x, y)
    })

    // Draw balls
    gameState.balls.forEach(ball => {
      if (ball.isActive) {
        ctx.fillStyle = ball.color
        ctx.beginPath()
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
        ctx.fill()
        
        // Add glow effect
        ctx.shadowColor = ball.color
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      }
    })
  }

  // Drop ball
  const dropBall = () => {
    if (betAmount > gameState.balance) {
      toast.error('Insufficient balance!')
      return
    }

    const newBall: Ball = {
      id: Date.now(),
      x: CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 20,
      y: 20,
      vx: (Math.random() - 0.5) * 2,
      vy: 0,
      radius: BALL_RADIUS,
      color: '#3b82f6',
      isActive: true
    }

    setGameState(prev => ({
      ...prev,
      balls: [...prev.balls, newBall],
      bet: betAmount,
      balance: prev.balance - betAmount,
      gameStatus: 'playing',
      multipliers: riskMultipliers[riskLevel],
      isAnimating: true
    }))

    toast.info(`Ball dropped! Bet: ₹${betAmount}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
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
            🎯 Plinko
          </h1>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            Drop balls and watch them bounce through pegs to win multipliers!
          </p>
        </motion.div>

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
              
              {/* Drop Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={dropBall}
                  disabled={gameState.gameStatus === 'playing' || betAmount > gameState.balance}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  <Circle className="h-5 w-5" />
                  Drop Ball (₹{betAmount})
                </button>
              </div>

              {/* Risk Level Display */}
              <div className="mt-4 text-center">
                <div className="text-gray-400 text-sm mb-2">Current Risk Level</div>
                <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${
                  riskLevel === 'low' ? 'bg-green-600' :
                  riskLevel === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  {riskLevel.toUpperCase()}
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
                    disabled={gameState.gameStatus === 'playing'}
                  />
                </div>

                <div>
                  <div className="text-purple-400 text-sm mb-2">Risk Level</div>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    disabled={gameState.gameStatus === 'playing'}
                  >
                    <option value="low">Low Risk (Max 2x)</option>
                    <option value="medium">Medium Risk (Max 10x)</option>
                    <option value="high">High Risk (Max 50x)</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  {[50, 100, 250, 500].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(Math.min(amount, gameState.balance))}
                      disabled={gameState.gameStatus === 'playing' || amount > gameState.balance}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Multiplier Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
            >
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Multipliers
              </h3>
              
              <div className="grid grid-cols-3 gap-1 text-xs">
                {riskMultipliers[riskLevel].map((mult, index) => (
                  <div
                    key={index}
                    className={`text-center py-1 px-2 rounded ${
                      mult >= 5 ? 'bg-green-600/20 text-green-400' :
                      mult >= 1 ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-red-600/20 text-red-400'
                    }`}
                  >
                    {mult}x
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Game Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
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
                      ? `${Math.max(...gameState.gameHistory.map(g => g.multiplier)).toFixed(1)}x`
                      : '0.0x'
                    }
                  </span>
                </div>
              </div>
            </motion.div>

            {/* How to Play */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
            >
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                How to Play
              </h3>
              
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Set your bet amount and risk level</p>
                <p>• Click "Drop Ball" to release a ball</p>
                <p>• Ball bounces through pegs randomly</p>
                <p>• Win based on which slot it lands in</p>
                <p>• Higher risk = higher potential rewards</p>
                <p>• Center slots typically have better multipliers</p>
              </div>
            </motion.div>

            {/* Game History */}
            {gameState.gameHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
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
                          {game.result === 'win' ? '+' : ''}₹{game.payout - game.bet}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {game.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {game.multiplier}x multiplier
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