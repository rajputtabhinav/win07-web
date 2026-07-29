// Secure Blackjack Game - Server-Side Logic Implementation
"use client"

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, Shield, Plus, Minus } from 'lucide-react'
import { Header } from '@/components/header'
import { SecureGameWrapper } from '@/components/game/SecureGameWrapper'
import { PlayingCard } from '@/components/ui/playing-card'

interface BlackjackGameState {
  currentBet: number
  gamePhase: 'betting' | 'dealing' | 'playing' | 'result'
  playerCards: any[]
  dealerCards: any[]
  playerTotal: number
  dealerTotal: number
  canHit: boolean
  canStand: boolean
  gameHistory: string[]
}

export default function SecureBlackjackPage() {
  const [gameState, setGameState] = useState<BlackjackGameState>({
    currentBet: 50,
    gamePhase: 'betting',
    playerCards: [],
    dealerCards: [],
    playerTotal: 0,
    dealerTotal: 0,
    canHit: false,
    canStand: false,
    gameHistory: []
  })

  const updateBet = useCallback((change: number) => {
    setGameState(prev => ({
      ...prev,
      currentBet: Math.max(20, Math.min(prev.currentBet + change, 10000))
    }))
  }, [])

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'betting',
      playerCards: [],
      dealerCards: [],
      playerTotal: 0,
      dealerTotal: 0,
      canHit: false,
      canStand: false
    }))
  }, [])

  return (
    <SecureGameWrapper gameName="blackjack">
      {({ playGame, isPlaying, gameResult, balance }) => (
    <>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
              <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <Shield className="h-8 w-8 text-green-400" />
                Secure Blackjack
              </h1>
              <p className="text-gray-400">Server-side verified card game</p>
              </div>

            {/* Balance & Betting */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Cash Balance</p>
                <p className="text-3xl font-bold text-green-400 mb-6">₹{balance.cashBalance?.toLocaleString() || 0}</p>

                {gameState.gamePhase === 'betting' && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Place Your Bet</h3>
                    
                    <div className="flex items-center justify-center gap-4 mb-6">
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
                        setGameState(prev => ({ ...prev, gamePhase: 'dealing' }))
                        
                        const result = await playGame(gameState.currentBet, {
                          action: 'deal'
                        })

                        if (result) {
                          setGameState(prev => ({
                            ...prev,
                            gamePhase: 'playing',
                            playerCards: result.gameData.playerCards,
                            dealerCards: result.gameData.dealerCards,
                            playerTotal: result.gameData.playerTotal,
                            dealerTotal: result.gameData.dealerTotal,
                            canHit: result.gameData.canHit,
                            canStand: result.gameData.canStand
                          }))
                        }
                      }}
                      disabled={isPlaying}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-lg font-semibold text-lg"
                    >
                      {isPlaying ? 'Dealing...' : 'Deal Cards'}
                    </button>
                  </div>
                )}

                {gameState.gamePhase === 'dealing' && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                    <p className="text-white">Dealing cards securely...</p>
                  </div>
                )}

                {gameState.gamePhase === 'playing' && (
                  <div className="text-center">
                    <div className="grid grid-cols-2 gap-8 mb-6">
                      <div>
                        <h4 className="text-white font-semibold mb-2">Your Cards ({gameState.playerTotal})</h4>
                        <div className="flex justify-center gap-2">
                          {gameState.playerCards.map((card, index) => (
                            <PlayingCard key={index} card={card} />
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-semibold mb-2">Dealer Cards</h4>
                        <div className="flex justify-center gap-2">
                          {gameState.dealerCards.map((card, index) => (
                            <PlayingCard key={index} card={index === 1 ? { suit: 'back', rank: '?', value: 0 } : card} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={async () => {
                          const result = await playGame(0, { action: 'hit' })
                          if (result) {
                            if (result.gameData.gameOver) {
                              setGameState(prev => ({
                                ...prev,
                                gamePhase: 'result',
                                gameHistory: [
                                  `${result.outcome === 'win' ? 'WON' : 'LOST'} ₹${result.outcome === 'win' ? result.winAmount : gameState.currentBet}`,
                                  ...prev.gameHistory.slice(0, 9)
                                ]
                              }))
                            } else {
                              setGameState(prev => ({
                                ...prev,
                                playerCards: result.gameData.playerCards,
                                playerTotal: result.gameData.playerTotal,
                                canHit: result.gameData.canHit
                              }))
                            }
                          }
                        }}
                        disabled={!gameState.canHit || isPlaying}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg"
                      >
                        Hit
                      </button>
                      
                      <button
                        onClick={async () => {
                          const result = await playGame(0, { action: 'stand' })
                          if (result) {
                            setGameState(prev => ({
                              ...prev,
                              gamePhase: 'result',
                              dealerCards: result.gameData.dealerCards,
                              dealerTotal: result.gameData.dealerTotal,
                              gameHistory: [
                                `${result.outcome === 'win' ? 'WON' : 'LOST'} ₹${result.outcome === 'win' ? result.winAmount : gameState.currentBet}`,
                                ...prev.gameHistory.slice(0, 9)
                              ]
                            }))
                          }
                        }}
                        disabled={!gameState.canStand || isPlaying}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg"
                      >
                        Stand
                      </button>
                    </div>
                  </div>
                )}

                {gameState.gamePhase === 'result' && gameResult && (
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {gameResult.outcome === 'win' ? '🎉 You Won!' : '😔 You Lost!'}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-8 mb-6">
                      <div>
                        <h4 className="text-white font-semibold mb-2">Your Cards ({gameState.playerTotal})</h4>
                        <div className="flex justify-center gap-2">
                          {gameState.playerCards.map((card, index) => (
                            <PlayingCard key={index} card={card} />
                          ))}
                        </div>
              </div>

                      <div>
                        <h4 className="text-white font-semibold mb-2">Dealer Cards ({gameState.dealerTotal})</h4>
                        <div className="flex justify-center gap-2">
                          {gameState.dealerCards.map((card, index) => (
                            <PlayingCard key={index} card={card} />
                          ))}
                        </div>
                      </div>
                    </div>

                    {gameResult.outcome === 'win' && (
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

            {/* Game History */}
            {gameState.gameHistory.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Recent Games</h3>
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
    </div>
    </>
      )}
    </SecureGameWrapper>
  )
}
