// Secure Baccarat Game - Server-Side Logic Implementation
"use client"

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Shield, Play } from 'lucide-react'
import { Header } from '@/components/header'
import { SecureGameWrapper } from '@/components/game/SecureGameWrapper'
import { PlayingCard } from '@/components/ui/playing-card'
import { GameErrorBoundary } from '@/components/ErrorBoundary'

interface BaccaratGameState {
  currentBet: number
  selectedBet: 'player' | 'banker' | 'tie' | null
  playerCards: any[]
  bankerCards: any[]
  playerTotal: number
  bankerTotal: number
  gameResult: 'player' | 'banker' | 'tie' | null
  gameHistory: string[]
  isDealing: boolean
}

export default function SecureBaccaratPage() {
  const [gameState, setGameState] = useState<BaccaratGameState>({
    currentBet: 50,
    selectedBet: null,
    playerCards: [],
    bankerCards: [],
    playerTotal: 0,
    bankerTotal: 0,
    gameResult: null,
    gameHistory: [],
    isDealing: false
  })

  const selectBet = useCallback((bet: 'player' | 'banker' | 'tie') => {
    setGameState(prev => ({ ...prev, selectedBet: bet }))
  }, [])

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      selectedBet: null,
      playerCards: [],
      bankerCards: [],
      playerTotal: 0,
      bankerTotal: 0,
      gameResult: null,
      isDealing: false
    }))
  }, [])

  return (
    <GameErrorBoundary gameName="Baccarat">
      <SecureGameWrapper gameName="baccarat">
        {({ playGame, isPlaying, gameResult, balance }) => (
          <>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <Shield className="h-8 w-8 text-green-400" />
                  Secure Baccarat
                </h1>
                <p className="text-gray-400">Server-side verified card game</p>
              </div>

              {/* Game Area */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                {!gameState.isDealing && !gameState.gameResult && (
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-6">Choose Your Bet</h3>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6 max-w-lg mx-auto">
                <button
                  onClick={() => selectBet('player')}
                        className={`p-6 rounded-xl font-semibold text-lg ${
                          gameState.selectedBet === 'player'
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-600/20 text-blue-400 border border-blue-500'
                        }`}
                      >
                        PLAYER<br/>
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
                  onClick={() => selectBet('banker')}
                        className={`p-6 rounded-xl font-semibold text-lg ${
                          gameState.selectedBet === 'banker'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-600/20 text-red-400 border border-red-500'
                        }`}
                      >
                        BANKER<br/>
                        <span className="text-sm">1.95:1 Payout</span>
                </button>
              </div>

                    <div className="mb-6">
                      <p className="text-gray-400 mb-2">Bet Amount: ₹{gameState.currentBet}</p>
              </div>

                    <button
                      onClick={async () => {
                        if (!gameState.selectedBet) {
                          toast.error('Please select Player, Banker, or Tie')
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
                            playerCards: result.gameData.playerCards,
                            bankerCards: result.gameData.bankerCards,
                            playerTotal: result.gameData.playerTotal,
                            bankerTotal: result.gameData.bankerTotal,
                            gameResult: result.gameData.winner,
                            gameHistory: [
                              `${result.gameData.winner.toUpperCase()} (P:${result.gameData.playerTotal} B:${result.gameData.bankerTotal}) - ${result.outcome === 'win' ? 'WON' : 'LOST'}`,
                              ...prev.gameHistory.slice(0, 9)
                            ]
                          }))
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
                    
                    <div className="grid grid-cols-2 gap-8 mb-6">
                      <div>
                        <p className="text-blue-400 font-semibold mb-2">PLAYER ({gameState.playerTotal})</p>
                        <div className="flex justify-center gap-2">
                          {gameState.playerCards.map((card, index) => (
                            <PlayingCard key={index} card={card} />
                ))}
              </div>
            </div>

                      <div>
                        <p className="text-red-400 font-semibold mb-2">BANKER ({gameState.bankerTotal})</p>
                        <div className="flex justify-center gap-2">
                          {gameState.bankerCards.map((card, index) => (
                            <PlayingCard key={index} card={card} />
                          ))}
                </div>
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
            </div>
          </>
        )}
      </SecureGameWrapper>
    </GameErrorBoundary>
  )
}
