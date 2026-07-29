// Secure Wheel Game - Server-Side Logic Implementation
"use client"

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, Shield } from 'lucide-react'
import { Header } from '@/components/header'
import { SecureGameWrapper } from '@/components/game/SecureGameWrapper'

interface WheelGameState {
  currentBet: number
  isSpinning: boolean
  lastResult: number | null
  gameHistory: number[]
  rotation: number
}

const WHEEL_SEGMENTS = [
  { multiplier: 0, color: 'bg-gray-600', label: '0x' },
  { multiplier: 1.2, color: 'bg-blue-600', label: '1.2x' },
  { multiplier: 1.5, color: 'bg-green-600', label: '1.5x' },
  { multiplier: 2, color: 'bg-yellow-600', label: '2x' },
  { multiplier: 3, color: 'bg-orange-600', label: '3x' },
  { multiplier: 5, color: 'bg-red-600', label: '5x' },
  { multiplier: 10, color: 'bg-purple-600', label: '10x' },
  { multiplier: 50, color: 'bg-pink-600', label: '50x' }
]

export default function SecureWheelPage() {
  const [gameState, setGameState] = useState<WheelGameState>({
    currentBet: 50,
    isSpinning: false,
    lastResult: null,
    gameHistory: [],
    rotation: 0
  })

  return (
    <SecureGameWrapper gameName="wheel">
      {({ playGame, isPlaying, gameResult, balance }) => (
        <>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <Shield className="h-8 w-8 text-green-400" />
                Secure Wheel
              </h1>
              <p className="text-gray-400">Server-side verified wheel game</p>
            </div>

            {/* Balance Display */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Cash Balance</p>
                <p className="text-3xl font-bold text-green-400">₹{balance.cashBalance?.toLocaleString() || 0}</p>
              </div>
            </div>

            {/* Wheel Game */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
              <div className="text-center">
                <div className="relative w-80 h-80 mx-auto mb-6">
                  <motion.div
                    className="w-full h-full rounded-full border-4 border-purple-500 relative overflow-hidden"
                    animate={{ rotate: gameState.rotation }}
                    transition={{ duration: 3, ease: "easeOut" }}
                  >
                    {WHEEL_SEGMENTS.map((segment, index) => (
                      <div
                        key={index}
                        className={`absolute w-1/2 h-1/2 ${segment.color} flex items-center justify-center`}
                        style={{
                          transformOrigin: 'right bottom',
                          transform: `rotate(${index * 45}deg)`,
                          clipPath: 'polygon(0 100%, 100% 100%, 50% 0)'
                        }}
                      >
                        <span className="text-white font-bold text-sm transform -rotate-45">
                          {segment.label}
                        </span>
            </div>
                    ))}
                  </motion.div>
                  
                  <div className="absolute top-0 left-1/2 w-4 h-4 bg-white rounded-full transform -translate-x-1/2 -translate-y-2 z-10"></div>
                  
                  {gameState.isSpinning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <div className="text-white font-bold text-xl">SPINNING...</div>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <p className="text-gray-400 mb-2">Bet Amount</p>
                  <p className="text-2xl font-bold text-purple-400">₹{gameState.currentBet}</p>
          </div>

                <button
                  onClick={async () => {
                    setGameState(prev => ({ ...prev, isSpinning: true }))
                    
                    const result = await playGame(gameState.currentBet, {})

                    if (result) {
                      const newRotation = gameState.rotation + 1440 + (result.gameData.segmentIndex * 45)
                      
                      setGameState(prev => ({
                        ...prev,
                        rotation: newRotation,
                        lastResult: result.gameData.multiplier,
                        gameHistory: [result.gameData.multiplier, ...prev.gameHistory.slice(0, 9)]
                      }))

                      setTimeout(() => {
                        setGameState(prev => ({ ...prev, isSpinning: false }))
                      }, 3000)
                    } else {
                      setGameState(prev => ({ ...prev, isSpinning: false }))
                    }
                  }}
                  disabled={isPlaying || gameState.isSpinning}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-lg font-semibold text-lg"
                >
                  <Play className="h-4 w-4 mr-2 inline" />
                  {gameState.isSpinning ? 'Spinning...' : 'Spin Wheel'}
                </button>
              </div>
            </div>

            {/* Game History */}
            {gameState.gameHistory.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Recent Spins</h3>
                <div className="flex flex-wrap gap-2">
                  {gameState.gameHistory.map((multiplier, index) => (
                  <div
                    key={index}
                      className={`px-3 py-2 rounded-lg font-bold text-white ${
                        multiplier === 0 ? 'bg-gray-600' :
                        multiplier >= 10 ? 'bg-purple-600' :
                        multiplier >= 5 ? 'bg-red-600' :
                        multiplier >= 2 ? 'bg-orange-600' :
                        'bg-blue-600'
                      }`}
                    >
                      {multiplier}x
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
