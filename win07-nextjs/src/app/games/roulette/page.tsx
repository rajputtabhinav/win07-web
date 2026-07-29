// Secure Roulette Game - Server-Side Logic Implementation
"use client"

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw, Shield } from 'lucide-react'
import { Header } from '@/components/header'
import { SecureGameWrapper } from '@/components/game/SecureGameWrapper'
import { toast } from 'sonner'

interface RouletteGameState {
  currentBet: number
  selectedNumbers: Set<number>
  selectedColors: Set<'red' | 'black'>
  selectedTypes: Set<'odd' | 'even' | 'low' | 'high'>
  isSpinning: boolean
  lastResult: number | null
  gameHistory: number[]
  rotation: number
}

const ROULETTE_NUMBERS = Array.from({ length: 37 }, (_, i) => i) // 0-36
const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]

export default function SecureRoulettePage() {
  const [gameState, setGameState] = useState<RouletteGameState>({
    currentBet: 50,
    selectedNumbers: new Set(),
    selectedColors: new Set(),
    selectedTypes: new Set(),
    isSpinning: false,
    lastResult: null,
    gameHistory: [],
    rotation: 0
  })

  const getNumberColor = (num: number) => {
    if (num === 0) return 'green'
    return RED_NUMBERS.includes(num) ? 'red' : 'black'
  }

  const resetBets = useCallback(() => {
      setGameState(prev => ({
        ...prev,
        selectedNumbers: new Set(),
        selectedColors: new Set(),
        selectedTypes: new Set()
      }))
  }, [])

  const toggleNumber = useCallback((num: number) => {
    setGameState(prev => {
      const newSelected = new Set(prev.selectedNumbers)
      if (newSelected.has(num)) {
        newSelected.delete(num)
      } else {
        newSelected.add(num)
      }
      return { ...prev, selectedNumbers: newSelected }
    })
  }, [])

  const toggleColor = useCallback((color: 'red' | 'black') => {
    setGameState(prev => {
      const newSelected = new Set(prev.selectedColors)
      if (newSelected.has(color)) {
        newSelected.delete(color)
      } else {
        newSelected.add(color)
      }
      return { ...prev, selectedColors: newSelected }
    })
  }, [])

  const toggleType = useCallback((type: 'odd' | 'even' | 'low' | 'high') => {
    setGameState(prev => {
      const newSelected = new Set(prev.selectedTypes)
      if (newSelected.has(type)) {
        newSelected.delete(type)
      } else {
        newSelected.add(type)
      }
      return { ...prev, selectedTypes: newSelected }
    })
  }, [])

  return (
    <SecureGameWrapper gameName="roulette">
      {({ playGame, isPlaying, gameResult, balance }) => (
    <>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <Shield className="h-8 w-8 text-green-400" />
                Secure Roulette
              </h1>
              <p className="text-gray-400">Server-side verified casino game</p>
        </div>

            {/* Balance Display */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-gray-400 text-sm">Cash Balance</p>
                  <p className="text-2xl font-bold text-green-400">₹{balance.cashBalance?.toLocaleString() || 0}</p>
                  </div>
                <div>
                  <p className="text-gray-400 text-sm">Current Bet</p>
                  <p className="text-2xl font-bold text-purple-400">₹{gameState.currentBet}</p>
              </div>
                <div>
                  <p className="text-gray-400 text-sm">Last Result</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {gameState.lastResult !== null ? gameState.lastResult : '--'}
                  </p>
                </div>
              </div>
            </div>

            {/* Roulette Wheel */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
              <div className="text-center mb-6">
                <div className="relative w-64 h-64 mx-auto mb-6">
                  <motion.div
                    className="w-full h-full border-4 border-purple-500 rounded-full bg-gradient-to-r from-red-600 via-black to-red-600"
                    animate={{ rotate: gameState.rotation }}
                    transition={{ duration: 4, ease: "easeOut" }}
                  >
                    <div className="absolute top-2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2"></div>
                  </motion.div>
                  
                  {gameState.isSpinning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white font-bold text-xl">SPINNING...</div>
                    </div>
                  )}
                </div>

                {/* Betting Options */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => toggleColor('red')}
                    className={`p-4 rounded-lg font-semibold ${
                      gameState.selectedColors.has('red')
                        ? 'bg-red-600 text-white'
                        : 'bg-red-600/20 text-red-400 border border-red-500'
                    }`}
                    disabled={isPlaying}
                  >
                    RED (2:1)
                  </button>
                  
                  <button
                    onClick={() => toggleColor('black')}
                    className={`p-4 rounded-lg font-semibold ${
                      gameState.selectedColors.has('black')
                        ? 'bg-gray-800 text-white border-2 border-white'
                        : 'bg-gray-800/20 text-gray-400 border border-gray-500'
                    }`}
                    disabled={isPlaying}
                  >
                    BLACK (2:1)
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-6">
                  <button
                    onClick={() => toggleType('odd')}
                    className={`p-2 rounded text-sm ${
                      gameState.selectedTypes.has('odd')
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600/20 text-blue-400 border border-blue-500'
                    }`}
                    disabled={isPlaying}
                  >
                    ODD
                  </button>
                  
                  <button
                    onClick={() => toggleType('even')}
                    className={`p-2 rounded text-sm ${
                      gameState.selectedTypes.has('even')
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600/20 text-blue-400 border border-blue-500'
                    }`}
                    disabled={isPlaying}
                  >
                    EVEN
                  </button>
                  
                  <button
                    onClick={() => toggleType('low')}
                    className={`p-2 rounded text-sm ${
                      gameState.selectedTypes.has('low')
                        ? 'bg-green-600 text-white'
                        : 'bg-green-600/20 text-green-400 border border-green-500'
                    }`}
                    disabled={isPlaying}
                  >
                    1-18
                  </button>
                  
                  <button
                    onClick={() => toggleType('high')}
                    className={`p-2 rounded text-sm ${
                      gameState.selectedTypes.has('high')
                        ? 'bg-green-600 text-white'
                        : 'bg-green-600/20 text-green-400 border border-green-500'
                    }`}
                    disabled={isPlaying}
                  >
                    19-36
                  </button>
                </div>

                {/* Number Grid */}
                <div className="grid grid-cols-6 gap-1 mb-6 max-w-md mx-auto">
                  {ROULETTE_NUMBERS.slice(1).map(num => (
                    <button
                      key={num}
                      onClick={() => toggleNumber(num)}
                      className={`p-2 rounded text-sm font-semibold ${
                        gameState.selectedNumbers.has(num)
                          ? 'bg-purple-600 text-white'
                          : `${getNumberColor(num) === 'red' ? 'bg-red-600/20 text-red-400' : 'bg-gray-700 text-white'} border border-slate-600`
                      }`}
                      disabled={isPlaying}
                    >
                      {num}
                    </button>
                  ))}
              </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={resetBets}
                    disabled={isPlaying}
                    className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white px-4 py-2 rounded-lg"
                  >
                    <RotateCcw className="h-4 w-4 mr-2 inline" />
                    Clear Bets
                  </button>
                  
                  <button
                    onClick={async () => {
                      if (gameState.selectedNumbers.size === 0 && 
                          gameState.selectedColors.size === 0 && 
                          gameState.selectedTypes.size === 0) {
                        toast.error('Please place a bet first!')
                        return
                      }

                      setGameState(prev => ({ ...prev, isSpinning: true }))

                      const result = await playGame(gameState.currentBet, {
                        selectedNumbers: Array.from(gameState.selectedNumbers),
                        selectedColors: Array.from(gameState.selectedColors),
                        selectedTypes: Array.from(gameState.selectedTypes)
                      })

                      if (result) {
                        const newRotation = gameState.rotation + 1800 + (result.gameData.result * (360 / 37))
                        
                        setGameState(prev => ({
                          ...prev,
                          rotation: newRotation,
                          lastResult: result.gameData.result,
                          gameHistory: [result.gameData.result, ...prev.gameHistory.slice(0, 9)],
                          selectedNumbers: new Set(),
                          selectedColors: new Set(),
                          selectedTypes: new Set()
                        }))

                        setTimeout(() => {
                          setGameState(prev => ({ ...prev, isSpinning: false }))
                        }, 4000)
                      } else {
                        setGameState(prev => ({ ...prev, isSpinning: false }))
                      }
                    }}
                    disabled={isPlaying || gameState.isSpinning}
                    className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    <Play className="h-4 w-4 mr-2 inline" />
                    {gameState.isSpinning ? 'Spinning...' : 'Spin Wheel'}
                  </button>
                </div>
              </div>
            </div>

            {/* Game History */}
            {gameState.gameHistory.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Recent Results</h3>
                <div className="flex flex-wrap gap-2">
                  {gameState.gameHistory.map((num, index) => (
                  <div
                    key={index}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        num === 0 ? 'bg-green-600' :
                        getNumberColor(num) === 'red' ? 'bg-red-600' : 'bg-gray-800 border border-white'
                      }`}
                    >
                      {num}
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Security Notice */}
            <div className="mt-6 bg-green-900/20 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Shield className="h-4 w-4" />
                <span className="font-semibold">Cryptographically Secure</span>
              </div>
              <p className="text-green-300 text-sm">
                All roulette spins are generated using cryptographically secure random numbers on our servers. 
                Results cannot be predicted or manipulated.
              </p>
            </div>
    </div>
    </>
      )}
    </SecureGameWrapper>
  )
}
