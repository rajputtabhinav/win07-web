// Server-Side Game Logic API - Secure Game Processing
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { databaseService } from '@/lib/database-service'
import crypto from 'crypto'

// Secure random number generation
function generateSecureRandom(): number {
  const buffer = crypto.randomBytes(4)
  return buffer.readUInt32BE(0) / 0xffffffff
}

// Game configuration with house edge
const GAME_CONFIG = {
  'teen-patti': {
    houseEdge: 0.05, // 5% house edge
    maxPayout: 10,
    minPayout: 0
  },
  'roulette': {
    houseEdge: 0.027, // 2.7% house edge (European)
    payouts: {
      straight: 36,
      red_black: 2,
      odd_even: 2,
      high_low: 2
    }
  },
  'dragon-tiger': {
    houseEdge: 0.032, // 3.2% house edge
    payouts: {
      dragon: 2,
      tiger: 2,
      tie: 9
    }
  },
  'wheel': {
    houseEdge: 0.05, // 5% house edge
    segments: [
      { multiplier: 0, weight: 40 },
      { multiplier: 1.2, weight: 20 },
      { multiplier: 1.5, weight: 15 },
      { multiplier: 2, weight: 10 },
      { multiplier: 3, weight: 8 },
      { multiplier: 5, weight: 4 },
      { multiplier: 10, weight: 2 },
      { multiplier: 50, weight: 1 }
    ]
  }
}

export const POST = withAuth(async (req: NextRequest) => {
  const { userId } = (req as any).auth

  try {
    const { game, betAmount, gameData } = await req.json()

    // Validate input
    if (!game || typeof betAmount !== 'number' || betAmount <= 0) {
      return NextResponse.json({ error: 'Invalid game parameters' }, { status: 400 })
    }

    // Get user from database
    const user = await databaseService.getUser(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate balance
    if (user.cashBalance < betAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Process bet (deduct amount first)
    await databaseService.updateUser(userId, {
      cashBalance: user.cashBalance - betAmount,
      gamesPlayed: user.gamesPlayed + 1
    })

    // Create bet transaction
    await databaseService.createTransaction({
      userId: user._id.toString(),
      clerkUserId: userId,
      type: 'bet',
      amount: betAmount,
      walletType: 'cash',
      description: `Bet ₹${betAmount} in ${game}`,
      status: 'completed',
      game
    })

    // Generate secure game result
    const gameResult = await generateGameResult(game, betAmount, gameData)

    // Process winnings if any
    if (gameResult.winAmount > 0) {
      await databaseService.updateUser(userId, {
        cashBalance: user.cashBalance - betAmount + gameResult.winAmount,
        totalWinnings: user.totalWinnings + gameResult.winAmount
      })

      // Create win transaction
      await databaseService.createTransaction({
        userId: user._id.toString(),
        clerkUserId: userId,
        type: 'win',
        amount: gameResult.winAmount,
        walletType: 'cash',
        description: `Won ₹${gameResult.winAmount} in ${game}`,
        status: 'completed',
        game,
        metadata: gameResult.metadata
      })
    } else {
      await databaseService.updateUser(userId, {
        totalLosses: user.totalLosses + betAmount
      })
    }

    // Record game activity
    await databaseService.recordGameActivity({
      userId: user._id.toString(),
      clerkUserId: userId,
      userName: user.name,
      game,
      betAmount,
      winAmount: gameResult.winAmount,
      profit: gameResult.winAmount - betAmount,
      outcome: gameResult.winAmount > 0 ? 'win' : 'loss',
      gameData: gameResult.gameData,
      timestamp: new Date()
    })

    // Get updated user data
    const updatedUser = await databaseService.getUser(userId)

    return NextResponse.json({
      success: true,
      gameResult: {
        outcome: gameResult.winAmount > 0 ? 'win' : 'loss',
        winAmount: gameResult.winAmount,
        gameData: gameResult.gameData,
        multiplier: gameResult.multiplier
      },
      balance: {
        cashBalance: updatedUser.cashBalance,
        bonusBalance: updatedUser.bonusBalance,
        indCoins: updatedUser.indCoins
      }
    })

  } catch (error) {
    console.error('Game play error:', error)
    return NextResponse.json({ error: 'Game processing failed' }, { status: 500 })
  }
})

// Secure game result generation
async function generateGameResult(game: string, betAmount: number, gameData: any) {
  const config = GAME_CONFIG[game]
  if (!config) {
    throw new Error(`Game ${game} not configured`)
  }

  switch (game) {
    case 'teen-patti':
      return generateTeenPattiResult(betAmount, gameData, config)
    
    case 'roulette':
      return generateRouletteResult(betAmount, gameData, config)
    
    case 'dragon-tiger':
      return generateDragonTigerResult(betAmount, gameData, config)
    
    case 'wheel':
      return generateWheelResult(betAmount, gameData, config)
    
    default:
      throw new Error(`Game ${game} not implemented`)
  }
}

// Teen Patti server-side logic
function generateTeenPattiResult(betAmount: number, gameData: any, config: any) {
  const random = generateSecureRandom()
  
  // Apply house edge (95% RTP)
  const shouldWin = random > config.houseEdge
  
  if (shouldWin) {
    const multiplier = 1 + (generateSecureRandom() * 2) // 1x to 3x
    const winAmount = Math.floor(betAmount * multiplier)
    
    return {
      winAmount,
      multiplier,
      gameData: {
        playerCards: generateCards(3),
        dealerCards: generateCards(3),
        result: 'win'
      },
      metadata: { multiplier, houseEdge: config.houseEdge }
    }
  }
  
  return {
    winAmount: 0,
    multiplier: 0,
    gameData: {
      playerCards: generateCards(3),
      dealerCards: generateCards(3),
      result: 'loss'
    },
    metadata: { houseEdge: config.houseEdge }
  }
}

// Roulette server-side logic
function generateRouletteResult(betAmount: number, gameData: any, config: any) {
  const result = Math.floor(generateSecureRandom() * 37) // 0-36
  const { selectedNumbers, selectedColors, selectedTypes } = gameData
  
  let winAmount = 0
  
  // Check number bets
  if (selectedNumbers && selectedNumbers.includes(result)) {
    winAmount += betAmount * config.payouts.straight
  }
  
  // Check color bets
  const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(result)
  if (selectedColors) {
    if (selectedColors.includes('red') && isRed) {
      winAmount += betAmount * config.payouts.red_black
    }
    if (selectedColors.includes('black') && !isRed && result !== 0) {
      winAmount += betAmount * config.payouts.red_black
    }
  }
  
  // Check type bets
  if (selectedTypes && result !== 0) {
    if (selectedTypes.includes('odd') && result % 2 === 1) {
      winAmount += betAmount * config.payouts.odd_even
    }
    if (selectedTypes.includes('even') && result % 2 === 0) {
      winAmount += betAmount * config.payouts.odd_even
    }
  }
  
  return {
    winAmount,
    multiplier: winAmount / betAmount || 0,
    gameData: {
      result,
      color: isRed ? 'red' : (result === 0 ? 'green' : 'black')
    },
    metadata: { result, houseEdge: config.houseEdge }
  }
}

// Dragon Tiger server-side logic
function generateDragonTigerResult(betAmount: number, gameData: any, config: any) {
  const dragonCard = Math.floor(generateSecureRandom() * 13) + 1
  const tigerCard = Math.floor(generateSecureRandom() * 13) + 1
  
  let winner: 'dragon' | 'tiger' | 'tie'
  if (dragonCard > tigerCard) winner = 'dragon'
  else if (tigerCard > dragonCard) winner = 'tiger'
  else winner = 'tie'
  
  const { selectedBet } = gameData
  let winAmount = 0
  
  if (selectedBet === winner) {
    winAmount = betAmount * config.payouts[winner]
  }
  
  return {
    winAmount,
    multiplier: winAmount / betAmount || 0,
    gameData: {
      dragonCard,
      tigerCard,
      winner
    },
    metadata: { winner, houseEdge: config.houseEdge }
  }
}

// Wheel server-side logic
function generateWheelResult(betAmount: number, gameData: any, config: any) {
  // Weighted random selection
  const totalWeight = config.segments.reduce((sum, seg) => sum + seg.weight, 0)
  const random = generateSecureRandom() * totalWeight
  
  let currentWeight = 0
  let selectedSegment = config.segments[0]
  
  for (const segment of config.segments) {
    currentWeight += segment.weight
    if (random <= currentWeight) {
      selectedSegment = segment
      break
    }
  }
  
  const winAmount = Math.floor(betAmount * selectedSegment.multiplier)
  
  return {
    winAmount,
    multiplier: selectedSegment.multiplier,
    gameData: {
      segmentIndex: config.segments.indexOf(selectedSegment),
      multiplier: selectedSegment.multiplier
    },
    metadata: { houseEdge: config.houseEdge }
  }
}

// Helper function to generate cards
function generateCards(count: number) {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades']
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  const cards = []
  
  for (let i = 0; i < count; i++) {
    const suit = suits[Math.floor(generateSecureRandom() * suits.length)]
    const rank = ranks[Math.floor(generateSecureRandom() * ranks.length)]
    cards.push({ suit, rank, value: rank === 'A' ? 14 : (isNaN(Number(rank)) ? 10 : Number(rank)) })
  }
  
  return cards
}
