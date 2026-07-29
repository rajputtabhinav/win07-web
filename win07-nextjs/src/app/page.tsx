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
  Gift,
  Crown,
  Clock
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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              India's{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                #1 Gaming
              </span>
              {' '}Platform
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
              Experience AI-secured gaming with {games.length}+ exciting games, 
              stakes from {GameSystem.formatCurrency(20)} to {GameSystem.formatCurrency(50000)}, 
              and instant payouts.
            </p>
            
            {!isSignedIn ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Plane className="h-4 w-4" />
                  Start Playing
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-white/20 transition-all duration-200"
                >
                  Login
                </motion.button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <h2 className="text-xl text-white mb-3">
                  Welcome back, {user?.firstName || 'Player'}! 🎮
                </h2>
                <a href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <Gamepad2 className="h-4 w-4" />
                    Dashboard
                  </motion.button>
                </a>
              </motion.div>
            )}

            {/* Key Features */}
            <div className="flex flex-wrap justify-center gap-3 mt-6 text-xs">
              <span className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
                <Coins className="h-3 w-3" />
                AI-Secured Gaming
              </span>
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full font-semibold">
                {games.length}+ Games
              </span>
              <span className="bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-full font-semibold">
                Real-Time Play
              </span>
            </div>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              🎮 Featured Games
            </h2>
            <p className="text-gray-300 text-base max-w-2xl mx-auto">
              Try our most popular AI-secured games with instant payouts!
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs">
              <span className="bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full">
                Min: {GameSystem.formatCurrency(5)}
              </span>
              <span className="bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full">
                Max: {GameSystem.formatCurrency(50000)}
              </span>
              <span className="bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full">
                High RTP
              </span>
            </div>
          </motion.div>
          
          <GameGrid games={games} />
          
          {/* View All Games Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <a href="/games">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <Gamepad2 className="h-4 w-4" />
                View All Games
              </motion.button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <FeatureSection />

      {/* Admin Access Promotion Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-yellow-600/10 via-orange-600/10 to-red-600/10">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-4 py-2 rounded-full font-bold text-sm mb-4">
              <Crown className="h-4 w-4" />
              PREMIUM FEATURE
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              🎯 Admin Access - Dominate Every Game!
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Get AI-powered predictions with premium insights. 
              Know the next move, optimal exit points, and winning strategies before anyone else!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-yellow-500/20 rounded-xl p-6"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Basic Plan</h3>
                <div className="text-3xl font-bold text-yellow-400 mb-2">1599 <span className="text-sm text-gray-400">IND</span></div>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• 30 minutes access</li>
                  <li>• 50 predictions</li>
                  <li>• Premium insights</li>
                  <li>• Real-time alerts</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-400 rounded-xl p-6 relative"
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-6 w-6 text-slate-900" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ultimate Plan</h3>
                <div className="text-3xl font-bold text-yellow-400 mb-2">1799 <span className="text-sm text-gray-400">IND</span></div>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• 5 HOURS access</li>
                  <li>• 200 predictions</li>
                  <li>• Premium insights</li>
                  <li>• Premium support</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-yellow-500/20 rounded-xl p-6"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Premium Plan</h3>
                <div className="text-3xl font-bold text-yellow-400 mb-2">1699 <span className="text-sm text-gray-400">IND</span></div>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• 45 minutes access</li>
                  <li>• 75 predictions</li>
                  <li>• Premium insights</li>
                  <li>• Priority alerts</li>
                </ul>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 max-w-md mx-auto mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-bold">FREE TRIAL</span>
              </div>
              <p className="text-white font-semibold">Get 899 IND coins FREE on signup!</p>
              <p className="text-gray-300 text-sm">Try 5 predictions risk-free</p>
            </div>
            <p className="text-gray-400 text-sm">
              ⚡ Unlock premium AI predictions with Admin Access ⚡
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Win Big? 🏆
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              Join 50,000+ players on India's most AI-secured gaming platform
            </p>
            
            {!isSignedIn && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-8 py-2.5 rounded-full text-sm font-semibold shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <Gift className="h-4 w-4" />
                Get ₹1000 Bonus - Sign Up!
              </motion.button>
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