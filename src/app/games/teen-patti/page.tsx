"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { ArrowLeft, Cards, TrendingUp, DollarSign, Star, Users, Trophy } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { toast } from 'sonner'

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  rank: string
  value: number
}

interface GameState {
  playerCards: Card[]
  dealerCards: Card[]
  bet: number
  balance: number
  gameStatus: 'betting' | 'playing' | 'finished'
  result: 'win' | 'loss' | 'tie' | null
  playerHand: string
  dealerHand: string
  gameHistory: GameResult[]
}

interface GameResult {
  id: number
  bet: number
  result: 'win' | 'loss' | 'tie'
  payout: number
  playerHand: string
  dealerHand: string
  timestamp: Date
}

const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

export default function TeenPattiPage() {
  const { user, isSignedIn } = useUser()
  
  const [gameState, setGameState] = useState<GameState>({
    playerCards: [],
    dealerCards: [],
    bet: 100,
    balance: 1000,
    gameStatus: 'betting',
    result: null,
    playerHand: '',
    dealerHand: '',
    gameHistory: []
  })

  const [betAmount, setBetAmount] = useState(100)

  // Create deck
  const createDeck = (): Card[] => {
    const deck: Card[] = []
    suits.forEach(suit => {
      ranks.forEach((rank, index) => {
        deck.push({ suit, rank, value: values[index] })
      })
    })
    return shuffleDeck(deck)
  }

  // Shuffle deck
  const shuffleDeck = (deck: Card[]): Card[] => {
    const shuffled = [...deck]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Evaluate hand strength
  const evaluateHand = (cards: Card[]): { rank: number; name: string } => {
    if (cards.length !== 3) return { rank: 0, name: 'Invalid' }

    const sortedCards = [...cards].sort((a, b) => b.value - a.value)
    const values = sortedCards.map(c => c.value)
    const suits = sortedCards.map(c => c.suit)

    // Trail (Three of a kind)
    if (values[0] === values[1] && values[1] === values[2]) {
      return { rank: 6, name: `Trail of ${sortedCards[0].rank}s` }
    }

    // Pure Sequence (Straight Flush)
    const isSequence = values[0] - values[1] === 1 && values[1] - values[2] === 1
    const isFlush = suits[0] === suits[1] && suits[1] === suits[2]
    
    if (isSequence && isFlush) {
      return { rank: 5, name: 'Pure Sequence' }
    }

    // Flush (Color)
    if (isFlush) {
      return { rank: 4, name: 'Flush' }
    }

    // Sequence (Straight)
    if (isSequence) {
      return { rank: 3, name: 'Sequence' }
    }

    // Pair
    if (values[0] === values[1] || values[1] === values[2] || values[0] === values[2]) {
      const pairValue = values[0] === values[1] ? values[0] : 
                       values[1] === values[2] ? values[1] : values[0]
      return { rank: 2, name: `Pair of ${ranks[values.indexOf(pairValue)]}s` }
    }

    // High Card
    return { rank: 1, name: `High Card ${sortedCards[0].rank}` }
  }

  // Start new game
  const startGame = () => {
    if (betAmount > gameState.balance) {
      toast.error('Insufficient balance!')
      return
    }

    const deck = createDeck()
    const playerCards = deck.slice(0, 3)
    const dealerCards = deck.slice(3, 6)

    const playerEval = evaluateHand(playerCards)
    const dealerEval = evaluateHand(dealerCards)

    // Implement 25% win rate for player
    const shouldPlayerWin = Math.random() < 0.25
    let result: 'win' | 'loss' | 'tie'
    let finalPlayerCards = playerCards
    let finalDealerCards = dealerCards

    if (shouldPlayerWin) {
      // Ensure player wins by giving better hand if needed
      if (playerEval.rank <= dealerEval.rank) {
        // Give player a better hand
        finalPlayerCards = [
          { suit: 'hearts', rank: 'A', value: 14 },
          { suit: 'diamonds', rank: 'K', value: 13 },
          { suit: 'clubs', rank: 'Q', value: 12 }
        ]
      }
      result = 'win'
    } else {
      // Ensure dealer wins
      if (dealerEval.rank <= playerEval.rank) {
        // Give dealer a better hand
        finalDealerCards = [
          { suit: 'spades', rank: 'A', value: 14 },
          { suit: 'hearts', rank: 'A', value: 14 },
          { suit: 'diamonds', rank: 'A', value: 14 }
        ]
      }
      result = 'loss'
    }

    const finalPlayerEval = evaluateHand(finalPlayerCards)
    const finalDealerEval = evaluateHand(finalDealerCards)

    const payout = result === 'win' ? betAmount * 2 : 0
    const newBalance = gameState.balance - betAmount + payout

    setGameState(prev => ({
      ...prev,
      playerCards: finalPlayerCards,
      dealerCards: finalDealerCards,
      bet: betAmount,
      balance: newBalance,
      gameStatus: 'finished',
      result,
      playerHand: finalPlayerEval.name,
      dealerHand: finalDealerEval.name,
      gameHistory: [{
        id: Date.now(),
        bet: betAmount,
        result,
        payout,
        playerHand: finalPlayerEval.name,
        dealerHand: finalDealerEval.name,
        timestamp: new Date()
      }, ...prev.gameHistory.slice(0, 9)]
    }))

    if (result === 'win') {
      toast.success(`You won ₹${payout}! ${finalPlayerEval.name} beats ${finalDealerEval.name}`)
    } else {
      toast.error(`You lost ₹${betAmount}. ${finalDealerEval.name} beats ${finalPlayerEval.name}`)
    }

    // Reset for next game
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'betting',
        result: null
      }))
    }, 3000)
  }

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      playerCards: [],
      dealerCards: [],
      gameStatus: 'betting',
      result: null,
      playerHand: '',
      dealerHand: ''
    }))
  }

  const getCardSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts': return '♥️'
      case 'diamonds': return '♦️'
      case 'clubs': return '♣️'
      case 'spades': return '♠️'
      default: return ''
    }
  }

  const getCardColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-black'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/games" className="inline-flex items-center gap-2 text-white hover:text-green-400 transition-colors mb-6">
          <ArrowLeft className="h-5 w-5" />
          Back to Games
        </Link>

        {/* Game Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            🃏 Teen Patti
          </h1>
          <p className="text-green-200 text-lg max-w-2xl mx-auto">
            Classic Indian card game. Get the best 3-card hand to win!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-green-800/50 to-emerald-800/50 backdrop-blur-sm border border-green-600 rounded-2xl p-6"
            >
              {/* Dealer Section */}
              <div className="mb-8">
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Dealer's Hand {gameState.dealerHand && `(${gameState.dealerHand})`}
                </h3>
                <div className="flex justify-center gap-2">
                  {gameState.dealerCards.length > 0 ? gameState.dealerCards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ rotateY: 180 }}
                      animate={{ rotateY: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="bg-white rounded-lg p-3 shadow-lg min-w-[60px] text-center"
                    >
                      <div className={`text-2xl ${getCardColor(card.suit)}`}>
                        {card.rank}
                      </div>
                      <div className="text-lg">
                        {getCardSymbol(card.suit)}
                      </div>
                    </motion.div>
                  )) : (
                    <div className="flex gap-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-blue-900 rounded-lg p-3 min-w-[60px] h-[80px] border-2 border-dashed border-green-400" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* VS Indicator */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white font-bold text-xl">
                  VS
                </div>
              </div>

              {/* Player Section */}
              <div>
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  Your Hand {gameState.playerHand && `(${gameState.playerHand})`}
                </h3>
                <div className="flex justify-center gap-2">
                  {gameState.playerCards.length > 0 ? gameState.playerCards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ rotateY: 180 }}
                      animate={{ rotateY: 0 }}
                      transition={{ delay: index * 0.2 + 0.5 }}
                      className="bg-white rounded-lg p-3 shadow-lg min-w-[60px] text-center"
                    >
                      <div className={`text-2xl ${getCardColor(card.suit)}`}>
                        {card.rank}
                      </div>
                      <div className="text-lg">
                        {getCardSymbol(card.suit)}
                      </div>
                    </motion.div>
                  )) : (
                    <div className="flex gap-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-blue-900 rounded-lg p-3 min-w-[60px] h-[80px] border-2 border-dashed border-blue-400" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Game Result */}
              {gameState.result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-6 p-4 rounded-lg text-center text-white font-bold text-xl ${
                    gameState.result === 'win' ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  {gameState.result === 'win' ? '🎉 You Win!' : '😔 You Lose!'}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Controls & Stats */}
          <div className="space-y-6">
            {/* Balance & Betting */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
            >
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                Balance & Betting
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-green-400 text-sm mb-1">Current Balance</div>
                  <div className="text-2xl font-bold text-white">₹{gameState.balance}</div>
                </div>

                <div>
                  <div className="text-blue-400 text-sm mb-2">Bet Amount</div>
                  <input
                    type="number"
                    min="10"
                    max={gameState.balance}
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(10, Math.min(gameState.balance, parseInt(e.target.value) || 10)))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    disabled={gameState.gameStatus !== 'betting'}
                  />
                </div>

                <div className="flex gap-2">
                  {[50, 100, 200, 500].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(Math.min(amount, gameState.balance))}
                      disabled={gameState.gameStatus !== 'betting' || amount > gameState.balance}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>

                <button
                  onClick={startGame}
                  disabled={gameState.gameStatus !== 'betting' || betAmount > gameState.balance}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-all duration-200"
                >
                  {gameState.gameStatus === 'betting' ? `Deal Cards (₹${betAmount})` : 'Playing...'}
                </button>
              </div>
            </motion.div>

            {/* Game Rules */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
            >
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Hand Rankings
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-yellow-400">
                  <span>Trail (Three of a kind)</span>
                  <span>Highest</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>Pure Sequence</span>
                  <span>2nd</span>
                </div>
                <div className="flex justify-between text-blue-400">
                  <span>Flush (Same suit)</span>
                  <span>3rd</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Sequence</span>
                  <span>4th</span>
                </div>
                <div className="flex justify-between text-orange-400">
                  <span>Pair</span>
                  <span>5th</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>High Card</span>
                  <span>Lowest</span>
                </div>
              </div>
            </motion.div>

            {/* Game History */}
            {gameState.gameHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
              >
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  Recent Games
                </h3>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gameState.gameHistory.map((game) => (
                    <div key={game.id} className={`p-3 rounded-lg border ${
                      game.result === 'win' ? 'bg-green-900/20 border-green-600' : 'bg-red-900/20 border-red-600'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-semibold ${game.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                          {game.result === 'win' ? '+' : '-'}₹{game.result === 'win' ? game.payout : game.bet}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {game.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {game.playerHand} vs {game.dealerHand}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}