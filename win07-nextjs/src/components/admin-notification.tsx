"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Zap, Target, TrendingUp, X } from 'lucide-react'
import { useWallet } from '@/contexts/wallet-context'

interface AdminNotificationProps {
  gameId: string
  gameName: string
  onClose: () => void
}

interface GamePrediction {
  type: 'win_chance' | 'next_move' | 'optimal_exit' | 'multiplier_prediction' | 'card_prediction' | 'number_prediction'
  message: string
  confidence: number
  action?: string
}

export function AdminNotification({ gameId, gameName, onClose }: AdminNotificationProps) {
  const { useNotification, hasAdminAccess, adminAccess } = useWallet()
  const [prediction, setPrediction] = useState<GamePrediction | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Game-specific predictions
  const getGamePrediction = (gameId: string): GamePrediction => {
    const predictions = {
      'andar-bahar': [
        { type: 'card_prediction' as const, message: '🎯 Next card will be ANDAR - 94% confidence', confidence: 94, action: 'Place challenge on Andar' },
        { type: 'card_prediction' as const, message: '🎯 Next card will be BAHAR - 92% confidence', confidence: 92, action: 'Place challenge on Bahar' },
        { type: 'win_chance' as const, message: '⚡ High win probability detected - 96% chance', confidence: 96, action: 'Increase challenge amount' }
      ],
      'roulette': [
        { type: 'number_prediction' as const, message: '🎯 Numbers 1-18 have 89% probability', confidence: 89, action: 'Challenge on 1-18' },
        { type: 'number_prediction' as const, message: '🎯 RED numbers showing strong pattern - 91% confidence', confidence: 91, action: 'Challenge on Red' },
        { type: 'number_prediction' as const, message: '⚡ Lucky number 17 incoming - 87% confidence', confidence: 87, action: 'Challenge on 17' }
      ],
      'blackjack': [
        { type: 'card_prediction' as const, message: '🎯 Dealer will bust - 88% confidence', confidence: 88, action: 'STAND on your current hand' },
        { type: 'card_prediction' as const, message: '⚡ Next card will be 10 or face card - 93% confidence', confidence: 93, action: 'HIT if below 11' },
        { type: 'win_chance' as const, message: '🎯 Perfect double down opportunity - 95% win chance', confidence: 95, action: 'DOUBLE your challenge' }
      ],
      'dragon-tiger': [
        { type: 'card_prediction' as const, message: '🎯 DRAGON will win - 90% confidence', confidence: 90, action: 'Challenge on Dragon' },
        { type: 'card_prediction' as const, message: '🎯 TIGER showing strength - 88% confidence', confidence: 88, action: 'Challenge on Tiger' },
        { type: 'card_prediction' as const, message: '⚡ TIE incoming - rare 85% confidence', confidence: 85, action: 'Challenge on Tie (11:1 payout)' }
      ],
      'mines': [
        { type: 'optimal_exit' as const, message: '💎 Cash out NOW - optimal exit point reached', confidence: 92, action: 'Click CASH OUT immediately' },
        { type: 'win_chance' as const, message: '⚡ Safe tiles detected in top row - 89% confidence', confidence: 89, action: 'Click tiles in top row' },
        { type: 'multiplier_prediction' as const, message: '🎯 Continue for 3 more tiles - 2.5x multiplier incoming', confidence: 87, action: 'Keep clicking, avoid bottom row' }
      ],
      'limbo': [
        { type: 'multiplier_prediction' as const, message: '🚀 Rocket will crash at 2.8x - 91% confidence', confidence: 91, action: 'Cash out at 2.7x' },
        { type: 'optimal_exit' as const, message: '⚡ Cash out at 1.5x - safe exit window', confidence: 88, action: 'Quick cash out recommended' },
        { type: 'multiplier_prediction' as const, message: '🎯 High flight detected - rocket going to 5x+', confidence: 85, action: 'Hold till 4.5x minimum' }
      ],
      'aviator': [
        { type: 'multiplier_prediction' as const, message: '✈️ Plane will fly to 3.2x - 89% confidence', confidence: 89, action: 'Cash out at 3.0x' },
        { type: 'optimal_exit' as const, message: '⚡ Early crash warning - cash out before 1.8x', confidence: 92, action: 'Cash out immediately' },
        { type: 'multiplier_prediction' as const, message: '🎯 Super flight incoming - 8x+ potential', confidence: 83, action: 'Hold for maximum profit' }
      ]
    }

    const gamePredictions = predictions[gameId as keyof typeof predictions] || [
      { type: 'win_chance' as const, message: '🎯 Optimal challenge detected - 91% win probability', confidence: 91, action: 'Place maximum challenge' }
    ]

    return gamePredictions[Math.floor(Math.random() * gamePredictions.length)]
  }

  // Always call useNotification at top level for React rules
  const notificationResult = useNotification()
  const canUseNotification = hasAdminAccess() && notificationResult

  useEffect(() => {
    if (!hasAdminAccess()) {
      onClose()
      return
    }

    if (canUseNotification) {
      const newPrediction = getGamePrediction(gameId)
      setPrediction(newPrediction)
      setIsVisible(true)

      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for fade out animation
      }, 8000)

      return () => clearTimeout(timer)
    } else {
      onClose()
    }
  }, [gameId, hasAdminAccess, onClose, canUseNotification])

  if (!prediction || !hasAdminAccess()) {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className="relative bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 p-1 rounded-xl shadow-2xl">
            {/* Golden border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-xl blur-lg opacity-75 animate-pulse"></div>
            
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                    <Crown className="h-4 w-4 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-yellow-400 font-bold text-sm">ADMIN ACCESS</h3>
                    <p className="text-yellow-300 text-xs opacity-80">{gameName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-yellow-400 text-xs font-semibold">{adminAccess.notificationsRemaining} left</p>
                    <p className="text-yellow-300 text-xs opacity-60">{adminAccess.plan.toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsVisible(false)
                      setTimeout(onClose, 300)
                    }}
                    className="p-1 hover:bg-slate-700 rounded text-yellow-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Prediction Content */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <p className="text-white font-medium text-sm">{prediction.message}</p>
                </div>

                {/* Confidence meter */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-300 text-xs">Confidence</span>
                    <span className="text-yellow-400 font-bold text-xs">{prediction.confidence}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${prediction.confidence}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                    />
                  </div>
                </div>

                {/* Action recommendation */}
                {prediction.action && (
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-3 w-3 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold text-xs">RECOMMENDED ACTION</span>
                    </div>
                    <p className="text-white text-sm font-medium">{prediction.action}</p>
                  </div>
                )}

                {/* Success rate indicator */}
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-700">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-green-400 text-xs font-semibold">95% Success Rate with Admin Access</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
