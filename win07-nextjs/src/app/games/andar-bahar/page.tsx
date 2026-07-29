// Secure Andar Bahar Game - Server-Side Logic Implementation
"use client"

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Shield, Play } from 'lucide-react'
import { Header } from '@/components/header'
import { SecureGameWrapper } from '@/components/game/SecureGameWrapper'
import { PlayingCard } from '@/components/ui/playing-card'
import { GameErrorBoundary } from '@/components/ErrorBoundary'

interface AndarBaharGameState {
  currentBet: number
  selectedBet: 'andar' | 'bahar' | null
  jokerCard: any | null
  andarCards: any[]
  baharCards: any[]
  gameResult: 'andar' | 'bahar' | null
  gameHistory: string[]
  isDealing: boolean
}

export default function SecureAndarBaharPage() {
  const [gameState, setGameState] = useState<AndarBaharGameState>({
    currentBet: 50,
    selectedBet: null,
    jokerCard: null,
    andarCards: [],
    baharCards: [],
    gameResult: null,
    gameHistory: [],
    isDealing: false
  })

  const selectBet = useCallback((bet: 'andar' | 'bahar') => {
    setGameState(prev => ({ ...prev, selectedBet: bet }))
  }, [])

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      selectedBet: null,
      jokerCard: null,
      andarCards: [],
      baharCards: [],
      gameResult: null,
      isDealing: false
    }))
  }, [])

  return (
    <GameErrorBoundary gameName="Andar Bahar">
      <SecureGameWrapper gameName="andar-bahar">
        {({ playGame, isPlaying, gameResult, balance }) => (
    <>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <Shield className="h-8 w-8 text-green-400" />
                  Secure Andar Bahar
                </h1>
                <p className="text-gray-400">Server-side verified traditional game</p>
              </div>

              {/* Game Area */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                {!gameState.isDealing && !gameState.gameResult && (
                <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-6">Choose Your Side</h3>
                    
                    <div className="grid grid-cols-2 gap-6 mb-6 max-w-md mx-auto">
                <button
                  onClick={() => selectBet('andar')}
                        className={`p-8 rounded-xl font-semibold text-lg ${
                          gameState.selectedBet === 'andar'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-600/20 text-red-400 border border-red-500'
                        }`}
                      >
                        ANDAR<br/>
                        <span className="text-sm">2:1 Payout</span>
                </button>
                      
                <button
                  onClick={() => selectBet('bahar')}
                        className={`p-8 rounded-xl font-semibold text-lg ${
                          gameState.selectedBet === 'bahar'
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-600/20 text-blue-400 border border-blue-500'
                        }`}
                      >
                        BAHAR<br/>
                        <span className="text-sm">2:1 Payout</span>
                </button>
              </div>

                    <div className="mb-6">
                      <p className="text-gray-400 mb-2">Bet Amount: ₹{gameState.currentBet}</p>
              </div>

                    <button
                      onClick={async () => {
                        if (!gameState.selectedBet) {
                          toast.error('Please select Andar or Bahar')
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
                            jokerCard: result.gameData.jokerCard,
                            andarCards: result.gameData.andarCards,
                            baharCards: result.gameData.baharCards,
                            gameResult: result.gameData.winner,
                            gameHistory: [
                              `${result.gameData.winner.toUpperCase()} - ${result.outcome === 'win' ? 'WON' : 'LOST'}`,
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
                    
                    {/* Joker Card */}
                    <div className="mb-6">
                      <p className="text-yellow-400 font-semibold mb-2">JOKER CARD</p>
                      {gameState.jokerCard && <PlayingCard card={gameState.jokerCard} />}
                    </div>

                    {/* Game Cards */}
                    <div className="grid grid-cols-2 gap-8 mb-6">
                      <div>
                        <p className="text-red-400 font-semibold mb-2">ANDAR ({gameState.andarCards.length})</p>
                        <div className="flex flex-wrap justify-center gap-1">
                          {gameState.andarCards.map((card, index) => (
                            <PlayingCard key={index} card={card} size="small" />
                ))}
              </div>
            </div>

                      <div>
                        <p className="text-blue-400 font-semibold mb-2">BAHAR ({gameState.baharCards.length})</p>
                        <div className="flex flex-wrap justify-center gap-1">
                          {gameState.baharCards.map((card, index) => (
                            <PlayingCard key={index} card={card} size="small" />
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
