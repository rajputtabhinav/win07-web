// Secure Aviator Game - Server-Side Logic Implementation
"use client"

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plane, Shield, TrendingUp } from 'lucide-react'
import { Header } from '@/components/header'
import { SecureGameWrapper } from '@/components/game/SecureGameWrapper'
import { GameErrorBoundary } from '@/components/ErrorBoundary'

interface AviatorGameState {
  currentBet: number
  gamePhase: 'betting' | 'flying' | 'crashed' | 'cashedout'
  currentMultiplier: number
  crashMultiplier: number
  gameHistory: number[]
  autoCashout: number | null
}

export default function SecureAviatorPage() {
  const [gameState, setGameState] = useState<AviatorGameState>({
    currentBet: 50,
    gamePhase: 'betting',
    currentMultiplier: 1,
    crashMultiplier: 0,
    gameHistory: [],
    autoCashout: null
  })

  return (
    <GameErrorBoundary gameName="Aviator">
      <SecureGameWrapper gameName="aviator">
        {({ playGame, isPlaying, gameResult, balance }) => (
          <>
      <Header />
      
            <div className="container mx-auto px-4 py-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <Shield className="h-8 w-8 text-green-400" />
                  Secure Aviator
                </h1>
                <p className="text-gray-400">Server-side verified crash game</p>
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
                <div className="text-center">
                  {/* Plane Animation Area */}
                  <div className="relative h-64 mb-6 bg-gradient-to-b from-blue-900 to-blue-800 rounded-xl overflow-hidden">
                    <motion.div
                      className="absolute bottom-4 left-4"
                      animate={{
                        x: gameState.gamePhase === 'flying' ? 300 : 0,
                        y: gameState.gamePhase === 'flying' ? -200 : 0
                      }}
                      transition={{ duration: 10, ease: "easeInOut" }}
                    >
                      <Plane className="h-8 w-8 text-white" />
                    </motion.div>
                    
                    <div className="absolute top-4 right-4 text-right">
                      <div className="text-4xl font-bold text-white">
                        {gameState.currentMultiplier.toFixed(2)}x
                      </div>
                      {gameState.gamePhase === 'flying' && (
                        <div className="text-green-400 flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          Flying...
                        </div>
                      )}
          </div>
        </div>

                  {gameState.gamePhase === 'betting' && (
                    <div>
        <div className="mb-4">
                        <p className="text-gray-400 mb-2">Bet Amount</p>
                        <p className="text-2xl font-bold text-purple-400">₹{gameState.currentBet}</p>
        </div>

                      <button
                        onClick={async () => {
                          setGameState(prev => ({ ...prev, gamePhase: 'flying', currentMultiplier: 1 }))
                          
                          const result = await playGame(gameState.currentBet, {
                            autoCashout: gameState.autoCashout
                          })

                          if (result) {
                            setGameState(prev => ({
                              ...prev,
                              gamePhase: result.outcome === 'win' ? 'cashedout' : 'crashed',
                              crashMultiplier: result.gameData.crashMultiplier,
                              gameHistory: [result.gameData.crashMultiplier, ...prev.gameHistory.slice(0, 9)]
                            }))
                          }
                        }}
                        disabled={isPlaying}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold text-lg"
                      >
                        Take Off
                      </button>
            </div>
                  )}

                  {gameState.gamePhase === 'flying' && (
                    <button
                      onClick={async () => {
                        const result = await playGame(0, { action: 'cashout' })
                        if (result) {
                          setGameState(prev => ({ ...prev, gamePhase: 'cashedout' }))
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-lg"
                    >
                      Cash Out at {gameState.currentMultiplier.toFixed(2)}x
                    </button>
                  )}

                  {(gameState.gamePhase === 'crashed' || gameState.gamePhase === 'cashedout') && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">
                        {gameState.gamePhase === 'cashedout' ? '🎉 Cashed Out!' : '💥 Crashed!'}
              </h3>
              
                      <p className="text-gray-400 mb-4">
                        Plane crashed at {gameState.crashMultiplier}x
                      </p>

                      {gameResult && gameResult.outcome === 'win' && (
                        <p className="text-green-400 text-xl font-bold mb-4">
                          Won ₹{gameResult.winAmount}!
                        </p>
                      )}

                      <button
                        onClick={() => setGameState(prev => ({ ...prev, gamePhase: 'betting', currentMultiplier: 1 }))}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                      >
                        Fly Again
                      </button>
                  </div>
                  )}
            </div>
          </div>

          {/* Game History */}
              {gameState.gameHistory.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Recent Flights</h3>
                  <div className="flex flex-wrap gap-2">
                    {gameState.gameHistory.map((multiplier, index) => (
                      <div
                        key={index}
                        className={`px-3 py-2 rounded-lg font-bold text-white ${
                          multiplier >= 10 ? 'bg-purple-600' :
                          multiplier >= 5 ? 'bg-red-600' :
                          multiplier >= 2 ? 'bg-orange-600' :
                          'bg-blue-600'
                        }`}
                      >
                        {multiplier.toFixed(2)}x
                      </div>
                    ))}
                  </div>
              </div>
            )}
            </div>
          </>
        )}
      </SecureGameWrapper>
    </GameErrorBoundary>
  )
}
