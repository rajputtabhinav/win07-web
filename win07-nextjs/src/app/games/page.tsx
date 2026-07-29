// Games Hub - Lazy Loading Implementation
"use client"

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Gamepad2, Shield, Star } from 'lucide-react'
import { Header } from '@/components/header'
import Link from 'next/link'

const GAMES = [
  {
    id: 'teen-patti',
    name: 'Teen Patti',
    description: 'Classic Indian card game',
    category: 'Cards',
    minBet: 20,
    maxBet: 10000,
    thumbnail: '/thumbnails/teen-patti.svg',
    featured: true,
    rtp: '95.5%'
  },
  {
    id: 'roulette',
    name: 'Roulette',
    description: 'European roulette wheel',
    category: 'Casino',
    minBet: 10,
    maxBet: 5000,
    thumbnail: '/thumbnails/roulette.svg',
    featured: true,
    rtp: '97.3%'
  },
  {
    id: 'dragon-tiger',
    name: 'Dragon Tiger',
    description: 'Fast-paced card battle',
    category: 'Cards',
    minBet: 20,
    maxBet: 8000,
    thumbnail: '/thumbnails/dragon-tiger.svg',
    featured: false,
    rtp: '96.8%'
  },
  {
    id: 'wheel',
    name: 'Wheel',
    description: 'Spin the fortune wheel',
    category: 'Wheel',
    minBet: 10,
    maxBet: 2000,
    thumbnail: '/thumbnails/wheel.svg',
    featured: true,
    rtp: '95.0%'
  },
  {
    id: 'blackjack',
    name: 'Blackjack',
    description: 'Beat the dealer to 21',
    category: 'Cards',
    minBet: 25,
    maxBet: 15000,
    thumbnail: '/thumbnails/blackjack.svg',
    featured: false,
    rtp: '99.5%'
  },
  {
    id: 'baccarat',
    name: 'Baccarat',
    description: 'High-stakes card game',
    category: 'Cards',
    minBet: 50,
    maxBet: 20000,
    thumbnail: '/thumbnails/baccarat.svg',
    featured: false,
    rtp: '98.8%'
  },
  {
    id: 'andar-bahar',
    name: 'Andar Bahar',
    description: 'Traditional Indian game',
    category: 'Cards',
    minBet: 15,
    maxBet: 5000,
    thumbnail: '/thumbnails/andar-bahar.svg',
    featured: true,
    rtp: '96.2%'
  },
  {
    id: 'mines',
    name: 'Mines',
    description: 'Navigate the minefield',
    category: 'Strategy',
    minBet: 10,
    maxBet: 3000,
    thumbnail: '/thumbnails/mines.svg',
    featured: false,
    rtp: '97.0%'
  },
  {
    id: 'aviator',
    name: 'Aviator',
    description: 'Cash out before crash',
    category: 'Crash',
    minBet: 10,
    maxBet: 10000,
    thumbnail: '/thumbnails/aviator.svg',
    featured: true,
    rtp: '97.0%'
  }
]

export default function GamesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  const filteredGames = useMemo(() => {
    return GAMES.filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || game.category === categoryFilter
      const matchesFeatured = !showFeaturedOnly || game.featured
      
      return matchesSearch && matchesCategory && matchesFeatured
    })
  }, [searchTerm, categoryFilter, showFeaturedOnly])

  const categories = ['all', ...Array.from(new Set(GAMES.map(game => game.category)))]

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Shield className="h-8 w-8 text-green-400" />
              Secure Games
          </h1>
            <p className="text-gray-400">All games use server-side cryptographic security</p>
          </div>

          {/* Filters */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Search Games</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search games..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
            </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Filter</label>
                <button
                  onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    showFeaturedOnly
                      ? 'bg-yellow-600 border-yellow-500 text-white'
                      : 'bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <Star className="h-4 w-4 mr-2 inline" />
                  {showFeaturedOnly ? 'Featured Only' : 'All Games'}
                </button>
            </div>

              <div className="flex items-end">
                <div className="text-center w-full">
                  <p className="text-gray-400 text-sm">Games Found</p>
                  <p className="text-2xl font-bold text-white">{filteredGames.length}</p>
            </div>
          </div>
            </div>
          </div>

        {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game, index) => (
        <motion.div
                key={game.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                    <Gamepad2 className="h-16 w-16 text-purple-400" />
                  </div>
                  
                  {game.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Featured
                    </div>
                  )}
                  
                  <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Secure
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{game.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Min Bet</p>
                      <p className="text-green-400 font-semibold">₹{game.minBet}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Max Bet</p>
                      <p className="text-red-400 font-semibold">₹{game.maxBet.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-500 text-sm">Return to Player</p>
                    <p className="text-purple-400 font-semibold">{game.rtp}</p>
                  </div>
                  
                  <Link href={`/games/${game.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200"
                    >
                      <Play className="h-4 w-4 mr-2 inline" />
                      Play Now
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div className="text-center py-12">
              <Gamepad2 className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Games Found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
                  </div>
          )}

          {/* Security Notice */}
          <div className="mt-8 bg-green-900/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-green-400" />
              <h3 className="text-lg font-bold text-green-400">Cryptographically Secure Gaming</h3>
          </div>
            <p className="text-green-300">
              All our games use server-side cryptographic random number generation. Game outcomes are 
              calculated on our secure servers and cannot be manipulated or predicted. Every game is 
              provably fair with transparent RTP rates.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}