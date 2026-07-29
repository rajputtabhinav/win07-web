// Lazy Game Loader - Performance Optimization
"use client"

import React, { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { Gamepad2, Shield } from 'lucide-react'
import { GameErrorBoundary } from '@/components/ErrorBoundary'

// Lazy load all games for better performance
const LazyTeenPatti = lazy(() => import('@/app/games/teen-patti/page'))
const LazyRoulette = lazy(() => import('@/app/games/roulette/page'))
const LazyDragonTiger = lazy(() => import('@/app/games/dragon-tiger/page'))
const LazyWheel = lazy(() => import('@/app/games/wheel/page'))
const LazyBlackjack = lazy(() => import('@/app/games/blackjack/page'))
const LazyBaccarat = lazy(() => import('@/app/games/baccarat/page'))
const LazyAndarBahar = lazy(() => import('@/app/games/andar-bahar/page'))
const LazyMines = lazy(() => import('@/app/games/mines/page'))
const LazyAviator = lazy(() => import('@/app/games/aviator/page'))

// Game loading component
function GameLoadingFallback({ gameName }: { gameName: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Gamepad2 className="w-full h-full text-purple-400" />
          </motion.div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Loading {gameName}</h2>
        <p className="text-gray-400 mb-4">Initializing secure game environment...</p>
        
        <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
          <Shield className="h-4 w-4" />
          <span>Cryptographically Secure</span>
        </div>
      </motion.div>
    </div>
  )
}

// Game component map
const GAME_COMPONENTS = {
  'teen-patti': LazyTeenPatti,
  'roulette': LazyRoulette,
  'dragon-tiger': LazyDragonTiger,
  'wheel': LazyWheel,
  'blackjack': LazyBlackjack,
  'baccarat': LazyBaccarat,
  'andar-bahar': LazyAndarBahar,
  'mines': LazyMines,
  'aviator': LazyAviator
}

interface LazyGameLoaderProps {
  gameId: string
  gameName: string
}

export function LazyGameLoader({ gameId, gameName }: LazyGameLoaderProps) {
  const GameComponent = GAME_COMPONENTS[gameId as keyof typeof GAME_COMPONENTS]

  if (!GameComponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Game Not Found</h2>
          <p className="text-gray-400">The requested game is not available.</p>
        </div>
      </div>
    )
  }

  return (
    <GameErrorBoundary gameName={gameName}>
      <Suspense fallback={<GameLoadingFallback gameName={gameName} />}>
        <GameComponent />
      </Suspense>
    </GameErrorBoundary>
  )
}
