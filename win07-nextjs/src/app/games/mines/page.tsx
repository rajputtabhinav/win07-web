// Secure Mines Game - Server-Side Logic Implementation
"use client"

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Shield, Bomb, Gem } from 'lucide-react'
import { Header } from '@/components/header'
import { SecureGameWrapper } from '@/components/game/SecureGameWrapper'

interface MinesGameState {
  currentBet: number
  selectedMines: number
  gamePhase: 'setup' | 'playing' | 'result'
  revealedCells: Set<number>
  gameBoard: ('mine' | 'gem' | 'hidden')[]
  currentMultiplier: number
  gameHistory: string[]
}

export default function SecureMinesPage() {
  const [gameState, setGameState] = useState<MinesGameState>({
    currentBet: 50,
    selectedMines: 3,
    gamePhase: 'setup',
    revealedCells: new Set(),
    gameBoard: Array(25).fill('hidden'),
    currentMultiplier: 1,
    gameHistory: []
  })

  const startGame = useCallback(async (playGame: Function) => {
    const result = await playGame(gameState.currentBet, {
      mineCount: gameState.selectedMines
    })

    if (result) {
    setGameState(prev => ({
      ...prev,
        gamePhase: 'playing',
        gameBoard: result.gameData.board,
        currentMultiplier: 1,
        revealedCells: new Set()
      }))
    }
  }, [gameState.currentBet, gameState.selectedMines])

  const revealCell = useCallback(async (index: number, playGame: Function) => {
    if (gameState.revealedCells.has(index)) return

    const result = await playGame(0, {
      action: 'reveal',
      cellIndex: index
    })

    if (result) {
      const newRevealed = new Set(gameState.revealedCells)
      newRevealed.add(index)

      setGameState(prev => ({
        ...prev,
        revealedCells: newRevealed,
        currentMultiplier: result.gameData.multiplier,
        gamePhase: result.gameData.gameOver ? 'result' : 'playing',
        gameHistory: result.gameData.gameOver ? [
          `${result.outcome === 'win' ? 'WON' : 'LOST'} ₹${result.outcome === 'win' ? result.winAmount : gameState.currentBet}`,
          ...prev.gameHistory.slice(0, 9)
        ] : prev.gameHistory
      }))
    }
  }, [gameState.revealedCells, gameState.currentBet])

  return (
    <SecureGameWrapper gameName="mines">
      {({ playGame, isPlaying, gameResult, balance }) => (
        <>
      <Header />
      
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <Shield className="h-8 w-8 text-green-400" />
                Secure Mines
              </h1>
              <p className="text-gray-400">Server-side verified mine field</p>
        </div>

            {/* Game Setup */}
            {gameState.gamePhase === 'setup' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-4">Game Setup</h3>
                  
                  <div className="mb-4">
                    <p className="text-gray-400 mb-2">Number of Mines</p>
                  <select
                      value={gameState.selectedMines}
                      onChange={(e) => setGameState(prev => ({ ...prev, selectedMines: Number(e.target.value) }))}
                      className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    >
                      {[1,2,3,4,5].map(num => (
                        <option key={num} value={num}>{num} Mines</option>
                    ))}
                  </select>
                </div>

                  <div className="mb-6">
                    <p className="text-gray-400 mb-2">Bet Amount</p>
                    <p className="text-2xl font-bold text-purple-400">₹{gameState.currentBet}</p>
                  </div>

                  <button
                    onClick={() => startGame(playGame)}
                    disabled={isPlaying}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-semibold"
                  >
                    Start Game
                  </button>
                </div>
              </div>
            )}

            {/* Game Board */}
            {gameState.gamePhase === 'playing' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                <div className="text-center mb-4">
                  <p className="text-white text-lg">Current Multiplier: <span className="text-green-400 font-bold">{gameState.currentMultiplier}x</span></p>
            </div>

                <div className="grid grid-cols-5 gap-2 max-w-md mx-auto mb-6">
                  {Array.from({ length: 25 }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => revealCell(index, playGame)}
                      disabled={gameState.revealedCells.has(index) || isPlaying}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${
                        gameState.revealedCells.has(index)
                          ? gameState.gameBoard[index] === 'mine' 
                            ? 'bg-red-600' 
                            : 'bg-green-600'
                          : 'bg-slate-600 hover:bg-slate-500'
                      }`}
                    >
                      {gameState.revealedCells.has(index) && (
                        gameState.gameBoard[index] === 'mine' ? <Bomb className="h-4 w-4" /> : <Gem className="h-4 w-4" />
                      )}
                    </button>
                ))}
              </div>

                <div className="text-center">
                  <button
                    onClick={async () => {
                      const result = await playGame(0, { action: 'cashout' })
                      if (result) {
                        setGameState(prev => ({
                          ...prev,
                          gamePhase: 'result',
                          gameHistory: [
                            `CASHED OUT ₹${result.winAmount}`,
                            ...prev.gameHistory.slice(0, 9)
                          ]
                        }))
                      }
                    }}
                    disabled={gameState.revealedCells.size === 0 || isPlaying}
                    className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg"
                  >
                    Cash Out (₹{Math.floor(gameState.currentBet * gameState.currentMultiplier)})
                  </button>
                </div>
              </div>
            )}

            {/* Game Result */}
            {gameState.gamePhase === 'result' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Game Over!</h3>
                
                {gameResult && gameResult.outcome === 'win' && (
                  <p className="text-green-400 text-xl font-bold mb-4">
                    Won ₹{gameResult.winAmount}!
                  </p>
                )}

                <button
                  onClick={() => setGameState(prev => ({ ...prev, gamePhase: 'setup' }))}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  Play Again
                </button>
            </div>
            )}
          </div>
        </>
      )}
    </SecureGameWrapper>
  )
}
