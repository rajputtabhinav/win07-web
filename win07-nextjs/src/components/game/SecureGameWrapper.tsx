// Secure Game Wrapper Component - Ensures server-side game logic
import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Gamepad2 } from 'lucide-react'
import { useSecureGame } from '@/hooks/useSecureGame'

interface SecureGameWrapperProps {
  gameName: string
  children: (gameProps: {
    playGame: (betAmount: number, gameData?: any) => Promise<any>
    isPlaying: boolean
    gameResult: any
    balance: any
    refreshBalance: () => Promise<void>
  }) => React.ReactNode
}

export function SecureGameWrapper({ gameName, children }: SecureGameWrapperProps) {
  const { user, isSignedIn } = useUser()
  const { playGame, refreshBalance, isPlaying, gameResult, balance } = useSecureGame(gameName)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize balance on component mount
  useEffect(() => {
    if (isSignedIn && user) {
      refreshBalance().then(() => setIsInitialized(true))
    }
  }, [isSignedIn, user, refreshBalance])

  // Security check - ensure user is authenticated
  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full mx-4 text-center"
        >
          <Shield className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-4">Please sign in to play {gameName}</p>
          <button
            onClick={() => window.location.href = '/sign-in'}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
          >
            Sign In
          </button>
        </motion.div>
      </div>
    )
  }

  // Loading state
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white">Loading {gameName}...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Security indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Secure Server-Side Gaming
        </div>
      </div>

      {children({
        playGame,
        isPlaying,
        gameResult,
        balance,
        refreshBalance
      })}
    </div>
  )
}
