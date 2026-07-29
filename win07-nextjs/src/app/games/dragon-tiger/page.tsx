// Secure Dragon Tiger Game - Server-Side Logic Implementation
"use client"

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, Shield } from 'lucide-react'
import { Header } from '@/components/header'
import { SecureGameWrapper } from '@/components/game/SecureGameWrapper'
import { PlayingCard } from '@/components/ui/playing-card'

interface DragonTigerGameState {
  currentBet: number
  selectedBet: 'dragon' | 'tiger' | 'tie' | null
  dragonCard: any | null
  tigerCard: any | null
  gameResult: 'dragon' | 'tiger' | 'tie' | null
  gameHistory: string[]
  isDealing: boolean
}

export default function SecureDragonTigerPage() {
  const [gameState, setGameState] = useState<DragonTigerGameState>({
    currentBet: 50,
    selectedBet: null,
    dragonCard: null,
    tigerCard: null,
    gameResult: null,
    gameHistory: [],
    isDealing: false
  })

  const selectBet = useCallback((bet: 'dragon' | 'tiger' | 'tie') => {
    setGameState(prev => ({ ...prev, selectedBet: bet }))
  }, [])

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      selectedBet: null,
      dragonCard: null,
      tigerCard: null,
      gameResult: null,
      isDealing: false
    }))
  }, [])

  return (
    <SecureGameWrapper gameName="dragon-tiger">
      {({ playGame, isPlaying, gameResult, balance }) => (
    <>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <Shield className="h-8 w-8 text-green-400" />
                Secure Dragon Tiger
              </h1>
              <p className="text-gray-400">Server-side verified card game</p>
        </div>

            {/* Balance Display */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Cash Balance</p>
                <p className="text-3xl font-bold text-green-400">₹{balance.cashBalance?.toLocaleString() || 0}</p>
                  </div>
                </div>

            {/* Game Area */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
              {!gameState.isDealing && !gameState.gameResult && (
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-6">Choose Your Side</h3>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6 max-w-md mx-auto">
                <button
                  onClick={() => selectBet('dragon')}
                      className={`p-6 rounded-xl font-semibold text-lg ${
                        gameState.selectedBet === 'dragon'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-600/20 text-red-400 border border-red-500'
                      }`}
                    >
                      DRAGON<br/>
                      <span className="text-sm">2:1 Payout</span>
                </button>
                    
                <button
                  onClick={() => selectBet('tie')}
                      className={`p-6 rounded-xl font-semibold text-lg ${
                        gameState.selectedBet === 'tie'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-yellow-600/20 text-yellow-400 border border-yellow-500'
                      }`}
                    >
                      TIE<br/>
                      <span className="text-sm">9:1 Payout</span>
                </button>
                    
                <button
                  onClick={() => selectBet('tiger')}
                      className={`p-6 rounded-xl font-semibold text-lg ${
                        gameState.selectedBet === 'tiger'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-600/20 text-blue-400 border border-blue-500'
                      }`}
                    >
                      TIGER<br/>
                      <span className="text-sm">2:1 Payout</span>
                </button>
              </div>

                  <div className="mb-6">
                    <p className="text-gray-400 mb-2">Bet Amount: ₹{gameState.currentBet}</p>
              </div>

                  <button
                    onClick={async () => {
                      if (!gameState.selectedBet) {
                        toast.error('Please select Dragon, Tiger, or Tie')
                        return
                      }

                      setGameState(prev => ({ ...prev, isDealing: true }))
                      
                      const result = await playGame(gameState.currentBet, {
                        selectedBet: gameState.selectedBet
                      })

                      if (result) {
                        setGameState(prev => ({
                          ...prev,
                          isDealing: false,
                          dragonCard: { rank: result.gameData.dragonCard, suit: 'hearts' },
                          tigerCard: { rank: result.gameData.tigerCard, suit: 'spades' },
                          gameResult: result.gameData.winner,
                          gameHistory: [
                            `${result.gameData.winner.toUpperCase()} (D:${result.gameData.dragonCard} T:${result.gameData.tigerCard}) - ${result.outcome === 'win' ? 'WON' : 'LOST'}`,
                            ...prev.gameHistory.slice(0, 9)
                          ]
                        }))
                      } else {
                        setGameState(prev => ({ ...prev, isDealing: false }))
                      }
                    }}
                    disabled={isPlaying || !gameState.selectedBet}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-lg font-semibold text-lg"
                  >
                    {isPlaying ? 'Dealing...' : 'Deal Cards'}
                  </button>
                </div>
              )}

              {gameState.isDealing && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                  <p className="text-white">Dealing cards securely...</p>
                </div>
              )}

              {gameState.gameResult && (
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-6">
                    {gameState.gameResult.toUpperCase()} WINS!
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-8 mb-6 max-w-md mx-auto">
                    <div>
                      <p className="text-red-400 font-semibold mb-2">DRAGON</p>
                      {gameState.dragonCard && <PlayingCard card={gameState.dragonCard} />}
                    </div>
                    
                    <div>
                      <p className="text-blue-400 font-semibold mb-2">TIGER</p>
                      {gameState.tigerCard && <PlayingCard card={gameState.tigerCard} />}
                    </div>
                  </div>

                  {gameResult && gameResult.outcome === 'win' && (
                    <p className="text-green-400 text-xl font-bold mb-4">
                      Won ₹{gameResult.winAmount}!
                    </p>
                  )}

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
                <h3 className="text-xl font-bold text-white mb-4">Recent Games</h3>
              <div className="space-y-2">
                  {gameState.gameHistory.slice(0, 5).map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <span className="text-gray-300 text-sm">Game {gameState.gameHistory.length - index}</span>
                      <span className={`font-semibold text-sm ${result.includes('WON') ? 'text-green-400' : 'text-red-400'}`}>
                    {result}
                      </span>
                  </div>
                ))}
                </div>
              </div>
            )}
    </div>
    </>
      )}
    </SecureGameWrapper>
  )
}
