"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Users, Play, Crown } from 'lucide-react'
import Image from 'next/image'
import { GameStartingScreen } from '@/components/loading-screen'

interface Game {
  id: string
  title: string
  description: string
  image: string
  category: string
  rating: number
  players: string
  featured?: boolean
}

interface GameGridProps {
  games: Game[]
}

export function GameGrid({ games }: GameGridProps) {
  const [loadingGame, setLoadingGame] = useState<string | null>(null)
  const featuredGames = games.filter(game => game.featured)
  const regularGames = games.filter(game => !game.featured)

  const handlePlayClick = (gameId: string, gameName: string) => {
    setLoadingGame(gameId)
    // Simulate loading time then navigate
    setTimeout(() => {
      setLoadingGame(null)
      window.location.href = `/games/${gameId}`
    }, 1200) // 1.2 seconds loading
  }

  return (
    <>
    <div className="space-y-12">
      {/* Featured Games */}
      {featuredGames.length > 0 && (
        <div>
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white mb-6 flex items-center gap-2"
          >
            <Crown className="h-6 w-6 text-yellow-500" />
            Featured Games
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative cursor-pointer"
                onClick={() => handlePlayClick(game.id, game.title)}
              >
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
                    {/* Game Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={game.image}
                        alt={game.title}
                        width={400}
                        height={300}
                        priority={index === 0} // Add priority to first featured game
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          // Fallback to play button if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {/* Fallback play button */}
                      <div className="absolute inset-0 flex items-center justify-center" style={{display: 'none'}}>
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                          <Play className="h-12 w-12 text-white" />
                        </div>
                      </div>
                      {/* Play overlay on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      {/* Featured Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          FEATURED
                        </span>
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
                          {game.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-400">{game.rating}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                        {game.title}
                      </h3>
                      <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                        {game.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Users className="h-3 w-3" />
                          <span className="text-xs">{game.players}</span>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Play
                        </motion.div>
                      </div>
                    </div>
                  </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Games Grid */}
      <div>
        <motion.h3
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-white mb-6"
        >
          All Games
        </motion.h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="group relative cursor-pointer"
              onClick={() => handlePlayClick(game.id, game.title)}
            >
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
                  {/* Game Image */}
                  <div className="relative h-32 overflow-hidden">
                    <Image
                      src={game.image}
                      alt={game.title}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback to play button if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Fallback play button */}
                    <div className="absolute inset-0 flex items-center justify-center" style={{display: 'none'}}>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    {/* Play overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    {/* Featured Badge */}
                    {game.featured && (
                      <div className="absolute top-2 left-2">
                        <Crown className="h-4 w-4 text-yellow-500" />
                      </div>
                    )}
                  </div>

                  {/* Game Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
                        {game.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-400">{game.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-base font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                      {game.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Users className="h-3 w-3" />
                        <span className="text-xs">{game.players}</span>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-2.5 py-1 rounded text-xs font-semibold transition-all duration-200 flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Play
                      </motion.div>
                    </div>
                  </div>
                </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    
    {/* Game Loading Screen */}
    {loadingGame && (
      <GameStartingScreen 
        gameName={games.find(g => g.id === loadingGame)?.title || 'Game'} 
      />
    )}
  </>
  )
}