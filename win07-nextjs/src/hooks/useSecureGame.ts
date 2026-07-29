// Secure Game Hook - Uses Server-Side Game Logic
import { useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

interface GameResult {
  outcome: 'win' | 'loss'
  winAmount: number
  gameData: any
  multiplier?: number
}

interface Balance {
  cashBalance: number
  bonusBalance: number
  indCoins: number
}

export function useSecureGame(gameName: string) {
  const { user } = useUser()
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [balance, setBalance] = useState<Balance>({ cashBalance: 0, bonusBalance: 0, indCoins: 0 })

  // Play game with server-side logic
  const playGame = useCallback(async (betAmount: number, gameData?: any) => {
    if (!user) {
      toast.error('Please sign in to play')
      return null
    }

    if (isPlaying) {
      toast.error('Game already in progress')
      return null
    }

    setIsPlaying(true)
    setGameResult(null)

    try {
      const response = await fetch('/api/game/play', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          game: gameName,
          betAmount,
          gameData
        })
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Game failed')
        return null
      }

      const result = await response.json()
      
      if (result.success) {
        setGameResult(result.gameResult)
        setBalance(result.balance)
        
        if (result.gameResult.outcome === 'win') {
          toast.success(`🎉 You won ₹${result.gameResult.winAmount}!`)
        } else {
          toast.error('😔 Better luck next time!')
        }
        
        return result.gameResult
      } else {
        toast.error('Game failed')
        return null
      }
    } catch (error) {
      console.error('Game play error:', error)
      toast.error('Game failed to process')
      return null
    } finally {
      setIsPlaying(false)
    }
  }, [user, isPlaying, gameName])

  // Get current balance
  const refreshBalance = useCallback(async () => {
    try {
      const response = await fetch('/api/wallet/balance')
      if (response.ok) {
        const data = await response.json()
        setBalance({
          cashBalance: data.cashBalance || 0,
          bonusBalance: data.bonusBalance || 0,
          indCoins: data.indCoins || 0
        })
      }
    } catch (error) {
      console.error('Failed to refresh balance:', error)
    }
  }, [])

  return {
    playGame,
    refreshBalance,
    isPlaying,
    gameResult,
    balance
  }
}
