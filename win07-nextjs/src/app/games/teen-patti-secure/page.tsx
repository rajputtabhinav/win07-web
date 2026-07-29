// Secure Teen Patti Game - Server-Side Logic Implementation
"use client"

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, History, Trophy, Shield, Plus, Minus } from 'lucide-react'
import { Header } from '@/components/header'
import { SecureGameWrapper } from '@/components/game/SecureGameWrapper'
import { GamePanel } from '@/components/ui/game-panel'
import { PlayingCard } from '@/components/ui/playing-card'

interface TeenPattiGameState {
  currentBet: number
  gameHistory: string[]
  playerCards: any[]
  dealerCards: any[]
  gamePhase: 'betting' | 'dealing' | 'showdown' | 'result'
  playerHand: string
  dealerHand: string
  lastResult?: 'win' | 'loss'
}

export default function SecureTeenPattiPage() {
  const [gameState, setGameState] = useState<TeenPattiGameState>({
    currentBet: 50,
    gameHistory: [],
    playerCards: [],
    dealerCards: [],
    gamePhase: 'betting',
    playerHand: '',
    dealerHand: ''
  })

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'betting',
      playerCards: [],
      dealerCards: [],
      playerHand: '',
      dealerHand: '',
      lastResult: undefined
    }))
  }, [])

  const updateBet = useCallback((change: number) => {
    setGameState(prev => ({
      ...prev,
      currentBet: Math.max(20, Math.min(prev.currentBet + change, 10000))
    }))
  }, [])

  return (
    <SecureGameWrapper gameName="teen-patti">
      {({ playGame, isPlaying, gameResult, balance, refreshBalance }) => (
        <>
          <Header />
          
          <div className="container mx-auto px-4 py-8">
            {/* Game Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <Shield className="h-8 w-8 text-green-400" />
                Secure Teen Patti
              </h1>
              <p className="text-gray-400">Server-side verified card game</p>
            </div>

            {/* Balance Display */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-gray-400 text-sm">Cash Balance</p>
                  <p className="text-2xl font-bold text-green-400">₹{balance.cashBalance?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Bonus Balance</p>
                  <p className="text-2xl font-bold text-orange-400">₹{balance.bonusBalance?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">IND Coins</p>
                  <p className="text-2xl font-bold text-yellow-400">{balance.indCoins?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>

            {/* Game Area */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
              {/* Betting Controls */}
              {gameState.gamePhase === 'betting' && (
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">Place Your Bet</h3>
                  
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={() => updateBet(-10)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                      disabled={gameState.currentBet <= 20}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    
                    <div className="bg-slate-700 px-6 py-3 rounded-lg">
                      <span className="text-2xl font-bold text-white">₹{gameState.currentBet}</span>
                    </div>
                    
                    <button
                      onClick={() => updateBet(10)}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
                      disabled={gameState.currentBet >= balance.cashBalance}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={async () => {
                      if (gameState.currentBet > balance.cashBalance) {
                        toast.error('Insufficient balance!')
                        return
                      }

                      setGameState(prev => ({ ...prev, gamePhase: 'dealing' }))
                      
                      const result = await playGame(gameState.currentBet, {
                        gameType: 'teen-patti'
                      })

                      if (result) {
                        setGameState(prev => ({
                          ...prev,
                          gamePhase: 'result',
                          playerCards: result.gameData.playerCards,
                          dealerCards: result.gameData.dealerCards,
                          lastResult: result.outcome,
                          gameHistory: [
                            `${result.outcome === 'win' ? 'WON' : 'LOST'} ₹${result.outcome === 'win' ? result.winAmount : gameState.currentBet}`,
                            ...prev.gameHistory.slice(0, 9)
                          ]
                        }))
                      } else {
                        setGameState(prev => ({ ...prev, gamePhase: 'betting' }))
                      }
                    }}
                    disabled={isPlaying || gameState.currentBet > balance.cashBalance}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-lg font-semibold text-lg"
                  >
                    {isPlaying ? 'Dealing Cards...' : 'Deal Cards'}
                  </button>
                </div>
              )}

              {/* Game Progress */}
              {gameState.gamePhase === 'dealing' && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                  <p className="text-white">Dealing cards securely...</p>
                </div>
              )}

              {/* Game Result */}
              {gameState.gamePhase === 'result' && gameResult && (
                <div className="text-center">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {gameResult.outcome === 'win' ? '🎉 You Won!' : '😔 You Lost!'}
                    </h3>
                    
                    {/* Player Cards */}
                    <div className="mb-4">
                      <p className="text-gray-400 mb-2">Your Cards</p>
                      <div className="flex justify-center gap-2">
                        {gameState.playerCards.map((card, index) => (
                          <PlayingCard key={index} card={card} />
                        ))}
                      </div>
                    </div>

                    {/* Dealer Cards */}
                    <div className="mb-4">
                      <p className="text-gray-400 mb-2">Dealer Cards</p>
                      <div className="flex justify-center gap-2">
                        {gameState.dealerCards.map((card, index) => (
                          <PlayingCard key={index} card={card} />
                        ))}
                      </div>
                    </div>

                    {gameResult.outcome === 'win' && (
                      <p className="text-green-400 text-xl font-bold mb-4">
                        Won ₹{gameResult.winAmount} {gameResult.multiplier && `(${gameResult.multiplier}x)`}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={resetGame}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>

            {/* Game History */}
            {gameState.gameHistory.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Games
                </h3>
                <div className="space-y-2">
                  {gameState.gameHistory.slice(0, 5).map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <span className="text-gray-300">Game {gameState.gameHistory.length - index}</span>
                      <span className={`font-semibold ${result.includes('WON') ? 'text-green-400' : 'text-red-400'}`}>
                        {result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-6 bg-green-900/20 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Shield className="h-4 w-4" />
                <span className="font-semibold">Secure Gaming</span>
              </div>
              <p className="text-green-300 text-sm">
                All game results are calculated on our secure servers using cryptographically secure random number generation. 
                Game outcomes cannot be manipulated and are provably fair.
              </p>
            </div>
          </div>
        </>
      )}
    </SecureGameWrapper>
  )
}
