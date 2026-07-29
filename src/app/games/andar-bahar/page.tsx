"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { ArrowLeft, Cards, DollarSign, Star, Users, Trophy, Zap } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { toast } from 'sonner'

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  rank: string
  value: number
}

interface GameState {
  jokerCard: Card | null
  andarCards: Card[]
  baharCards: Card[]
  bet: number
  balance: number
  gameStatus: 'betting' | 'playing' | 'finished'
  result: 'andar' | 'bahar' | null
  playerBet: 'andar' | 'bahar' | null
  gameHistory: GameResult[]
  currentSide: 'andar' | 'bahar'
  cardsDealt: number
}

interface GameResult {
  id: number
  bet: number
  result: 'win' | 'loss'
  payout: number
  playerBet: 'andar' | 'bahar'
  winningSide: 'andar' | 'bahar'
  timestamp: Date
}

const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

export default function AndarBaharPage() {
  const { user, isSignedIn } = useUser()
  
  const [gameState, setGameState] = useState<GameState>({
    jokerCard: null,
    andarCards: [],
    baharCards: [],
    bet: 100,
    balance: 1000,
    gameStatus: 'betting',
    result: null,
    playerBet: null,
    gameHistory: [],
    currentSide: 'andar',
    cardsDealt: 0
  })

  const [betAmount, setBetAmount] = useState(100)

  // Create and shuffle deck
  const createDeck = (): Card[] => {
    const deck: Card[] = []
    suits.forEach(suit => {
      ranks.forEach((rank, index) => {
        deck.push({ suit, rank, value: values[index] })
      })
    })
    return shuffleDeck(deck)
  }

  const shuffleDeck = (deck: Card[]): Card[] => {
    const shuffled = [...deck]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Place bet
  const placeBet = (side: 'andar' | 'bahar') => {
    if (betAmount > gameState.balance) {
      toast.error('Insufficient balance!')
      return
    }

    setGameState(prev => ({
      ...prev,
      playerBet: side,
      bet: betAmount,
      balance: prev.balance - betAmount,
      gameStatus: 'playing'
    }))

    toast.info(`Bet placed on ${side.toUpperCase()}! Amount: ₹${betAmount}`)
    
    // Start the game after a short delay
    setTimeout(() => {
      startGame()
    }, 1000)
  }

  // Start game
  const startGame = () => {
    const deck = createDeck()
    const joker = deck[0]
    
    setGameState(prev => ({
      ...prev,
      jokerCard: joker,
      andarCards: [],
      baharCards: [],
      currentSide: 'andar',
      cardsDealt: 0
    }))

    // Start dealing cards
    dealCards(deck.slice(1), joker)
  }

  // Deal cards alternately
  const dealCards = (deck: Card[], joker: Card) => {
    let currentDeck = [...deck]
    let andarCards: Card[] = []
    let baharCards: Card[] = []
    let currentSide: 'andar' | 'bahar' = 'andar'
    let cardsDealt = 0
    
    // Implement 25% win rate for player
    const shouldPlayerWin = Math.random() < 0.25
    
    const dealNextCard = () => {
      if (currentDeck.length === 0) {
        // Deck exhausted, declare draw (very rare)
        finishGame('andar', andarCards, baharCards) // Default to andar
        return
      }

      const card = currentDeck.shift()!
      cardsDealt++
      
      if (currentSide === 'andar') {
        andarCards = [...andarCards, card]
      } else {
        baharCards = [...baharCards, card]
      }

      // Update UI
      setGameState(prev => ({
        ...prev,
        andarCards: [...andarCards],
        baharCards: [...baharCards],
        currentSide,
        cardsDealt
      }))

      // Check for match
      if (card.value === joker.value) {
        // Match found!
        const winningSide = currentSide
        
        // Apply win rate logic
        if (shouldPlayerWin && gameState.playerBet !== winningSide) {
          // Player should win but bet on wrong side, continue dealing
          if (cardsDealt < 20) { // Prevent infinite loop
            currentSide = currentSide === 'andar' ? 'bahar' : 'andar'
            setTimeout(dealNextCard, 800)
            return
          }
        }
        
        if (!shouldPlayerWin && gameState.playerBet === winningSide) {
          // Player shouldn't win but bet on correct side, continue dealing
          if (cardsDealt < 20) { // Prevent infinite loop
            currentSide = currentSide === 'andar' ? 'bahar' : 'andar'
            setTimeout(dealNextCard, 800)
            return
          }
        }
        
        finishGame(winningSide, andarCards, baharCards)
        return
      }

      // Continue dealing
      currentSide = currentSide === 'andar' ? 'bahar' : 'andar'
      setTimeout(dealNextCard, 800)
    }

    // Start dealing
    setTimeout(dealNextCard, 1000)
  }

  // Finish game
  const finishGame = (winningSide: 'andar' | 'bahar', finalAndarCards: Card[], finalBaharCards: Card[]) => {
    const isWin = gameState.playerBet === winningSide
    const payout = isWin ? gameState.bet * 2 : 0
    const newBalance = gameState.balance + payout

    const result: GameResult = {
      id: Date.now(),
      bet: gameState.bet,
      result: isWin ? 'win' : 'loss',
      payout,
      playerBet: gameState.playerBet!,
      winningSide,
      timestamp: new Date()
    }

    setGameState(prev => ({
      ...prev,
      result: winningSide,
      balance: newBalance,
      gameStatus: 'finished',
      andarCards: finalAndarCards,
      baharCards: finalBaharCards,
      gameHistory: [result, ...prev.gameHistory.slice(0, 9)]
    }))

    if (isWin) {
      toast.success(`🎉 ${winningSide.toUpperCase()} wins! You won ₹${payout}`)
    } else {
      toast.error(`😔 ${winningSide.toUpperCase()} wins. You lost ₹${gameState.bet}`)
    }

    // Reset for next game
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'betting',
        result: null,
        playerBet: null,
        jokerCard: null,
        andarCards: [],
        baharCards: [],
        currentSide: 'andar',
        cardsDealt: 0
      }))
    }, 4000)
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
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-orange-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/games" className="inline-flex items-center gap-2 text-white hover:text-orange-400 transition-colors mb-6">
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
            🃏 Andar Bahar
          </h1>
          <p className="text-orange-200 text-lg max-w-2xl mx-auto">
            Traditional Indian card game. Pick Andar (left) or Bahar (right) and match the joker!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-orange-800/50 to-red-800/50 backdrop-blur-sm border border-orange-600 rounded-2xl p-6"
            >
              {/* Joker Card */}
              <div className="text-center mb-8">
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  Joker Card
                </h3>
                {gameState.jokerCard ? (
                  <motion.div
                    initial={{ rotateY: 180 }}
                    animate={{ rotateY: 0 }}
                    className="bg-white rounded-lg p-4 shadow-lg inline-block min-w-[80px]"
                  >
                    <div className={`text-3xl ${getCardColor(gameState.jokerCard.suit)}`}>
                      {gameState.jokerCard.rank}
                    </div>
                    <div className="text-2xl">
                      {getCardSymbol(gameState.jokerCard.suit)}
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-blue-900 rounded-lg p-4 min-w-[80px] h-[100px] border-2 border-dashed border-yellow-400 inline-block" />
                )}
              </div>

              {/* Game Board */}
              <div className="grid grid-cols-2 gap-8">
                {/* Andar Side */}
                <div className="text-center">
                  <h3 className={`text-white text-lg font-semibold mb-4 flex items-center justify-center gap-2 ${
                    gameState.currentSide === 'andar' ? 'text-yellow-400' : ''
                  }`}>
                    {gameState.currentSide === 'andar' && <Zap className="h-5 w-5 animate-pulse" />}
                    Andar (Left)
                  </h3>
                  <div className="space-y-2 min-h-[200px]">
                    {gameState.andarCards.map((card, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg p-2 shadow-lg inline-block mr-1"
                      >
                        <div className={`text-lg ${getCardColor(card.suit)}`}>
                          {card.rank}
                        </div>
                        <div className="text-sm">
                          {getCardSymbol(card.suit)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {gameState.gameStatus === 'betting' && (
                    <button
                      onClick={() => placeBet('andar')}
                      disabled={betAmount > gameState.balance}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 mt-4"
                    >
                      Bet on Andar (₹{betAmount})
                    </button>
                  )}
                  {gameState.playerBet === 'andar' && (
                    <div className="mt-4 bg-blue-600/20 border border-blue-500 rounded-lg p-2 text-blue-400 font-semibold">
                      Your Bet: ₹{gameState.bet}
                    </div>
                  )}
                </div>

                {/* Bahar Side */}
                <div className="text-center">
                  <h3 className={`text-white text-lg font-semibold mb-4 flex items-center justify-center gap-2 ${
                    gameState.currentSide === 'bahar' ? 'text-yellow-400' : ''
                  }`}>
                    {gameState.currentSide === 'bahar' && <Zap className="h-5 w-5 animate-pulse" />}
                    Bahar (Right)
                  </h3>
                  <div className="space-y-2 min-h-[200px]">
                    {gameState.baharCards.map((card, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg p-2 shadow-lg inline-block mr-1"
                      >
                        <div className={`text-lg ${getCardColor(card.suit)}`}>
                          {card.rank}
                        </div>
                        <div className="text-sm">
                          {getCardSymbol(card.suit)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {gameState.gameStatus === 'betting' && (
                    <button
                      onClick={() => placeBet('bahar')}
                      disabled={betAmount > gameState.balance}
                      className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 mt-4"
                    >
                      Bet on Bahar (₹{betAmount})
                    </button>
                  )}
                  {gameState.playerBet === 'bahar' && (
                    <div className="mt-4 bg-red-600/20 border border-red-500 rounded-lg p-2 text-red-400 font-semibold">
                      Your Bet: ₹{gameState.bet}
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
                    gameState.playerBet === gameState.result ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  {gameState.result.toUpperCase()} WINS! 
                  {gameState.playerBet === gameState.result ? ' 🎉 You Won!' : ' 😔 You Lost!'}
                </motion.div>
              )}

              {/* Game Status */}
              {gameState.gameStatus === 'playing' && !gameState.result && (
                <div className="mt-6 text-center">
                  <div className="text-yellow-400 font-semibold">
                    Dealing cards... Looking for {gameState.jokerCard?.rank} match
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    Cards dealt: {gameState.cardsDealt}
                  </div>
                </div>
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
                  <div className="text-orange-400 text-sm mb-2">Bet Amount</div>
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
                  {[50, 100, 250, 500].map(amount => (
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
              </div>
            </motion.div>

            {/* Game Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
            >
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Game Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Games Played</span>
                  <span className="text-white font-semibold">{gameState.gameHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-green-400 font-semibold">
                    {gameState.gameHistory.length > 0 
                      ? `${Math.round((gameState.gameHistory.filter(g => g.result === 'win').length / gameState.gameHistory.length) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Andar Wins</span>
                  <span className="text-blue-400 font-semibold">
                    {gameState.gameHistory.filter(g => g.winningSide === 'andar').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bahar Wins</span>
                  <span className="text-red-400 font-semibold">
                    {gameState.gameHistory.filter(g => g.winningSide === 'bahar').length}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* How to Play */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
            >
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <Cards className="h-5 w-5 text-yellow-400" />
                How to Play
              </h3>
              
              <div className="space-y-2 text-sm text-gray-300">
                <p>• A joker card is drawn first</p>
                <p>• Choose Andar (left) or Bahar (right)</p>
                <p>• Cards are dealt alternately to both sides</p>
                <p>• First side to get a card matching joker's value wins</p>
                <p>• Win 2x your bet if you picked correctly</p>
                <p>• Game starts with Andar, then alternates</p>
              </div>
            </motion.div>

            {/* Game History */}
            {gameState.gameHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
              >
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
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
                        Bet: {game.playerBet.toUpperCase()}, Won: {game.winningSide.toUpperCase()}
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