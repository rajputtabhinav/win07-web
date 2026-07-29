"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs'
import {
  Plane,
  Trophy,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Star,
  Gamepad2,
  Coins,
  Gift
} from 'lucide-react'
import { GameGrid } from '@/components/game-grid'
import { StatsSection } from '@/components/stats-section'
import { FeatureSection } from '@/components/feature-section'
import { Header } from '@/components/header'
import { getFeaturedGames } from '@/data/games'
import { GameSystem } from '@/utils/game-system'

const games = getFeaturedGames().map(game => ({
  id: game.id,
  title: game.title,
  description: game.description,
  image: game.thumbnail,
  category: game.category,
  rating: game.rating,
  players: game.players,
  featured: game.featured
}))

export default function HomePage() {
  const { isSignedIn, user } = useUser()
  const [stats, setStats] = useState({
    totalWinnings: '₹2.5Cr+',
    activePlayers: '50K+',
    uptime: '99.9%'
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              India's{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                #1 Gaming
              </span>
              {' '}Platform
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience the thrill of 15+ popular games with guaranteed payouts,
              instant withdrawals, and 100% secure transactions.
            </p>

            {!isSignedIn ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <SignUpButton mode="modal">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <Plane className="h-5 w-5" />
                    Start Playing Now
                  </motion.button>
                </SignUpButton>

                <SignInButton mode="modal">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all duration-200"
                  >
                    Login Now
                  </motion.button>
                </SignInButton>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <h2 className="text-2xl text-white mb-4">
                  Welcome back, {user?.firstName || 'Player'}! 🎮
                </h2>
                <a href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <Gamepad2 className="h-5 w-5" />
                    Go to Dashboard
                  </motion.button>
                </a>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection stats={stats} />

      {/* Featured Games */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              🎮 15+ Popular Games
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              From classic card games to modern casino favorites - all with real money prizes!
            </p>
          </motion.div>

          <GameGrid games={games} />
        </div>
      </section>

      {/* Features Section */}
      <FeatureSection />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Win Big? 🏆
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join 50,000+ players winning daily on India's most trusted gaming platform
            </p>

            {!isSignedIn && (
              <SignUpButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-12 py-4 rounded-full text-xl font-bold shadow-xl transition-all duration-200 flex items-center gap-3 mx-auto"
                >
                  <Gift className="h-6 w-6" />
                  Get ₹100 Bonus - Sign Up Now!
                </motion.button>
              </SignUpButton>
            )}
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 px-4 border-t border-white/10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex items-center justify-center gap-2 text-green-400">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">SSL Secured</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-blue-400">
              <Zap className="h-5 w-5" />
              <span className="font-semibold">UPI Instant</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Star className="h-5 w-5" />
              <span className="font-semibold">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}