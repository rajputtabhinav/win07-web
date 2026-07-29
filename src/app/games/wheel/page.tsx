"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { ArrowLeft, RotateCw, DollarSign, Star, Users, Trophy, Zap } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { toast } from 'sonner'

interface WheelSegment {
  id: number
  multiplier: number
  color: string
  angle: number
}

interface GameState {
  segments: WheelSegment[]
  bet: number
  balance: number
  gameStatus: 'betting' | 'spinning' | 'finished'
  result: number | null
  gameHistory: GameResult[]
  isSpinning: boolean
  rotation: number
}

interface GameResult {
  id: number
  bet: number
  result: 'win' | 'loss'
  payout: number
  multiplier: number
  timestamp: Date
}

export default function WheelPage() {
  const { user, isSignedIn } = useUser()
  const wheelRef = useRef<HTMLDivElement>(null)
  
  const [gameState, setGameState] = useState<GameState>({
    segments: [
      { id: 1, multiplier: 2, color: '#ef4444', angle: 0 },
      { id: 2, multiplier: 0, color: '#6b7280', angle: 45 },
      { id: 3, multiplier: 5, color: '#10b981', angle: 90 },
      { id: 4, multiplier: 0, color: '#6b7280', angle: 135 },
      { id: 5, multiplier: 10, color: '#f59e0b', angle: 180 },
      { id: 6, multiplier: 0, color: '#6b7280', angle: 225 },
      { id: 7, multiplier: 3, color: '#3b82f6', angle: 270 },
      { id: 8, multiplier: 0, color: '#6b7280', angle: 315 }
    ],
    bet: 100,
    balance: 1000,
    gameStatus: 'betting',
    result: null,
    gameHistory: [],
    isSpinning: false,
    rotation: 0
  })

  const [betAmount, setBetAmount] = useState(100)

  // Spin the wheel
  const spinWheel = () => {
    if (betAmount > gameState.balance) {
      toast.error('Insufficient balance!')
      return
    }

    if (gameState.isSpinning) {
      toast.error('Wheel is already spinning!')
      return
    }

    setGameState(prev => ({
      ...prev,
      bet: betAmount,
      balance: prev.balance - betAmount,
      gameStatus: 'spinning',
      isSpinning: true,
      result: null
    }))

    toast.info(`Wheel spinning! Bet: ₹${betAmount}`)

    // Implement 25% win rate
    const shouldWin = Math.random() < 0.25
    let targetSegment: WheelSegment
    
    if (shouldWin) {
      // Choose a winning segment (multiplier > 0)
      const winningSegments = gameState.segments.filter(s => s.multiplier > 0)
      targetSegment = winningSegments[Math.floor(Math.random() * winningSegments.length)]
    } else {
      // Choose a losing segment (multiplier = 0)
      const losingSegments = gameState.segments.filter(s => s.multiplier === 0)
      targetSegment = losingSegments[Math.floor(Math.random() * losingSegments.length)]
    }

    // Calculate spin parameters
    const minSpins = 3
    const maxSpins = 6
    const spins = minSpins + Math.random() * (maxSpins - minSpins)
    const targetAngle = targetSegment.angle + (Math.random() - 0.5) * 40 // Add some randomness within segment
    const finalRotation = spins * 360 + targetAngle

    // Animate the wheel
    setGameState(prev => ({
      ...prev,
      rotation: prev.rotation + finalRotation
    }))

    // Complete spin after animation
    setTimeout(() => {
      completeSpinAnimation(targetSegment)
    }, 4000) // 4 second spin duration
  }

  // Complete spin animation
  const completeSpinAnimation = (targetSegment: WheelSegment) => {
    const isWin = targetSegment.multiplier > 0
    const payout = Math.floor(gameState.bet * targetSegment.multiplier)
    const newBalance = gameState.balance + payout

    const result: GameResult = {
      id: Date.now(),
      bet: gameState.bet,
      result: isWin ? 'win' : 'loss',
      payout,
      multiplier: targetSegment.multiplier,
      timestamp: new Date()
    }

    setGameState(prev => ({
      ...prev,
      result: targetSegment.multiplier,
      balance: newBalance,
      gameStatus: 'finished',
      isSpinning: false,
      gameHistory: [result, ...prev.gameHistory.slice(0, 9)]
    }))

    if (isWin) {
      toast.success(`🎉 Landed on ${targetSegment.multiplier}x! Won ₹${payout}`)
    } else {
      toast.error(`😔 Landed on 0x. Lost ₹${gameState.bet}`)
    }

    // Reset for next game
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'betting',
        result: null
      }))
    }, 3000)
  }

  // Render wheel segments
  const renderWheelSegments = () => {
    return gameState.segments.map((segment, index) => {
      const segmentAngle = 360 / gameState.segments.length
      const rotation = segment.angle
      
      return (
        <div
          key={segment.id}
          className="absolute w-full h-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            clipPath: `polygon(50% 50%, 50% 0%, ${50 + Math.tan((segmentAngle * Math.PI) / 360) * 50}% 0%)`
          }}
        >
          <div
            className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: segment.color }}
          >
            <div
              className="absolute"
              style={{
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '16px'
              }}
            >
              {segment.multiplier}x
            </div>
          </div>
        </div>
      )
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/games" className="inline-flex items-center gap-2 text-white hover:text-purple-400 transition-colors mb-6">
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
            🎡 Wheel of Fortune
          </h1>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            Spin the wheel and win big! Land on multipliers to multiply your bet!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wheel Area */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
            >
              {/* Wheel Container */}
              <div className="relative flex items-center justify-center mb-8">
                <div className="relative">
                  {/* Wheel */}
                  <div
                    ref={wheelRef}
                    className="relative w-80 h-80 rounded-full border-4 border-yellow-400 overflow-hidden transition-transform duration-[4000ms] ease-out"
                    style={{
                      transform: `rotate(${gameState.rotation}deg)`,
                    }}
                  >
                    {/* Segments */}
                    {gameState.segments.map((segment, index) => {
                      const segmentAngle = 360 / gameState.segments.length
                      const startAngle = (index * segmentAngle) - (segmentAngle / 2)
                      
                      return (
                        <div
                          key={segment.id}
                          className="absolute w-full h-full flex items-center justify-center"
                          style={{
                            background: `conic-gradient(from ${startAngle}deg, ${segment.color} 0deg, ${segment.color} ${segmentAngle}deg, transparent ${segmentAngle}deg)`,
                            clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle * Math.PI) / 180)}% ${50 + 50 * Math.sin((startAngle * Math.PI) / 180)}%, ${50 + 50 * Math.cos(((startAngle + segmentAngle) * Math.PI) / 180)}% ${50 + 50 * Math.sin(((startAngle + segmentAngle) * Math.PI) / 180)}%)`
                          }}
                        >
                          <div
                            className="absolute text-white font-bold text-lg"
                            style={{
                              transform: `rotate(${(index * segmentAngle)}deg)`,
                              top: '25%'
                            }}
                          >
                            {segment.multiplier}x
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Center circle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-400 rounded-full border-4 border-white flex items-center justify-center">
                      <RotateCw className="h-8 w-8 text-gray-800" />
                    </div>
                  </div>
                  
                  {/* Pointer */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                    <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[30px] border-l-transparent border-r-transparent border-b-yellow-400"></div>
                  </div>
                </div>
              </div>

              {/* Spin Button */}
              <div className="text-center">
                <button
                  onClick={spinWheel}
                  disabled={gameState.isSpinning || betAmount > gameState.balance}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  <Zap className="h-5 w-5" />
                  {gameState.isSpinning ? 'Spinning...' : `Spin Wheel (₹${betAmount})`}
                </button>
              </div>

              {/* Result Display */}
              {gameState.result !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-6 p-4 rounded-lg text-center text-white font-bold text-xl ${
                    gameState.result > 0 ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  Landed on {gameState.result}x! 
                  {gameState.result > 0 ? ' 🎉 You Won!' : ' 😔 Better luck next time!'}
                </motion.div>
              )}

              {/* Wheel Legend */}
              <div className="mt-6 grid grid-cols-4 gap-2">
                {gameState.segments.map((segment) => (
                  <div key={segment.id} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: segment.color }}
                    ></div>
                    <span className="text-white text-sm">{segment.multiplier}x</span>
                  </div>
                ))}
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
                  <div className="text-purple-400 text-sm mb-2">Bet Amount</div>
                  <input
                    type="number"
                    min="10"
                    max={gameState.balance}
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(10, Math.min(gameState.balance, parseInt(e.target.value) || 10)))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    disabled={gameState.isSpinning}
                  />
                </div>

                <div className="flex gap-2">
                  {[50, 100, 250, 500].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(Math.min(amount, gameState.balance))}
                      disabled={gameState.isSpinning || amount > gameState.balance}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Multiplier Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
            >
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Multipliers
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-red-400">
                  <span>2x</span>
                  <span>Double your bet</span>
                </div>
                <div className="flex justify-between text-blue-400">
                  <span>3x</span>
                  <span>Triple your bet</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>5x</span>
                  <span>5x your bet</span>
                </div>
                <div className="flex justify-between text-yellow-400">
                  <span>10x</span>
                  <span>10x your bet</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>0x</span>
                  <span>Lose your bet</span>
                </div>
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
                  <span className="text-gray-400">Spins</span>
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
                      ? `${Math.max(...gameState.gameHistory.map(g => g.multiplier))}x`
                      : '0x'
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
                <RotateCw className="h-5 w-5 text-yellow-400" />
                How to Play
              </h3>
              
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Set your bet amount</p>
                <p>• Click "Spin Wheel" to start</p>
                <p>• Wheel spins and lands on a segment</p>
                <p>• Win based on the multiplier you land on</p>
                <p>• 0x segments mean you lose your bet</p>
                <p>• Higher multipliers are rarer but more rewarding</p>
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
                  Recent Spins
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
                        Landed on {game.multiplier}x
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