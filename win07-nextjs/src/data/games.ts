import { GameConfig } from '@/types/game'

export const gameConfigs: GameConfig[] = [
  {
    id: 'aviator',
    title: 'Aviator',
    description: 'Watch the plane fly and cash out before it crashes! The ultimate multiplier game.',
    category: 'Casino',
    thumbnail: '/thumbnails/aviator.svg',
    rating: 4.9,
    players: '5.2M',
    featured: true,
    minBet: 20,
    maxBet: 50000,
    rtp: 97.0,
    volatility: 'High'
  },

  {
    id: 'mines',
    title: 'Mines',
    description: 'Find gems while avoiding mines. Choose your risk level and multiply your winnings!',
    category: 'Strategy',
    thumbnail: '/thumbnails/mines.svg',
    rating: 4.7,
    players: '2.8M',
    featured: true,
    minBet: 20,
    maxBet: 50000,
    rtp: 97.5,
    volatility: 'Medium'
  },
  {
    id: 'plinko',
    title: 'Plinko',
    description: 'Drop balls and watch them bounce through pegs to win big multipliers!',
    category: 'Arcade',
    thumbnail: '/thumbnails/plinko.svg',
    rating: 4.6,
    players: '1.7M',
    featured: true,
    minBet: 20,
    maxBet: 50000,
    rtp: 96.8,
    volatility: 'Medium'
  },

  {
    id: 'wheel',
    title: 'Wheel of Fortune',
    description: 'Spin the wheel and win up to 50x your bet! Classic casino excitement.',
    category: 'Casino',
    thumbnail: '/thumbnails/wheel.svg',
    rating: 4.5,
    players: '2.1M',
    minBet: 20,
    maxBet: 50000,
    rtp: 94.5,
    volatility: 'Medium'
  },

  {
    id: 'limbo',
    title: 'Limbo',
    description: 'Go higher for bigger multipliers! How high can you go before you crash?',
    category: 'Casino',
    thumbnail: '/thumbnails/limbo.svg',
    rating: 4.6,
    players: '1.8M',
    minBet: 20,
    maxBet: 50000,
    rtp: 97.8,
    volatility: 'High'
  },
  {
    id: 'teen-patti',
    title: 'Teen Patti',
    description: 'Classic Indian card game with live dealers. Play against the house or other players.',
    category: 'Cards',
    thumbnail: '/thumbnails/teen-patti.svg',
    rating: 4.7,
    players: '3.1M',
    minBet: 20,
    maxBet: 25000,
    rtp: 96.2,
    volatility: 'Medium'
  },
  {
    id: 'andar-bahar',
    title: 'Andar Bahar',
    description: 'Traditional Indian betting game. Simple rules, exciting gameplay!',
    category: 'Cards',
    thumbnail: '/thumbnails/andar-bahar.svg',
    rating: 4.5,
    players: '2.7M',
    minBet: 20,
    maxBet: 25000,
    rtp: 95.8,
    volatility: 'Low'
  },
  {
    id: 'blackjack',
    title: 'Blackjack',
    description: 'Beat the dealer to 21! Classic casino card game with perfect strategy.',
    category: 'Cards',
    thumbnail: '/thumbnails/blackjack.svg',
    rating: 4.8,
    players: '2.2M',
    minBet: 20,
    maxBet: 10000,
    rtp: 99.5,
    volatility: 'Low'
  },
  {
    id: 'roulette',
    title: 'Roulette',
    description: 'European roulette with live dealers. Place your bets and spin to win!',
    category: 'Casino',
    thumbnail: '/thumbnails/roulette.svg',
    rating: 4.6,
    players: '1.9M',
    minBet: 20,
    maxBet: 10000,
    rtp: 97.3,
    volatility: 'Medium'
  },
  {
    id: 'baccarat',
    title: 'Baccarat',
    description: 'Elegant card game favored by high rollers. Bet on Player, Banker, or Tie.',
    category: 'Cards',
    thumbnail: '/thumbnails/baccarat.svg',
    rating: 4.4,
    players: '1.4M',
    minBet: 10,
    maxBet: 50000,
    rtp: 98.9,
    volatility: 'Low'
  },
  {
    id: 'dragon-tiger',
    title: 'Dragon Tiger',
    description: 'Fast-paced card game. Dragon vs Tiger - which will win?',
    category: 'Cards',
    thumbnail: '/thumbnails/dragon-tiger.svg',
    rating: 4.3,
    players: '1.6M',
    minBet: 20,
    maxBet: 25000,
    rtp: 96.7,
    volatility: 'Low'
  }
]

export const getGameById = (id: string): GameConfig | undefined => {
  return gameConfigs.find(game => game.id === id)
}

export const getGamesByCategory = (category: string): GameConfig[] => {
  if (category === 'All') return gameConfigs
  if (category === 'Featured') return gameConfigs.filter(game => game.featured)
  return gameConfigs.filter(game => game.category === category)
}

export const getFeaturedGames = (): GameConfig[] => {
  return gameConfigs.filter(game => game.featured)
}

export const getPopularGames = (limit = 6): GameConfig[] => {
  return [...gameConfigs]
    .sort((a, b) => parseFloat(b.players) - parseFloat(a.players))
    .slice(0, limit)
}
