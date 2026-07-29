// Admin Dashboard Statistics Component
import React from 'react'
import { motion } from 'framer-motion'
import { Users, DollarSign, TrendingUp, Activity, Crown } from 'lucide-react'

interface DashboardStatsProps {
  adminData: {
    summary: {
      totalUsers: number
      onlineUsers: number
      totalBalance: number
      totalCoins: number
      topUsers: any[]
    }
    systemStats: {
      totalGameRevenue: number
    }
    liveEvents: any[]
  }
}

export function DashboardStats({ adminData }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white">{adminData.summary.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-green-400 text-sm">
              {adminData.summary.onlineUsers} online now
            </p>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-green-400 text-xs">Live</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Balance</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(adminData.summary.totalBalance)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
          <p className="text-yellow-400 text-sm mt-2">
            {formatCurrency(adminData.summary.totalCoins)} in IND coins
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Game Revenue</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(adminData.systemStats.totalGameRevenue)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-400" />
          </div>
          <p className="text-green-400 text-sm mt-2">Platform profit</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Live Events</p>
              <p className="text-3xl font-bold text-white">{adminData.liveEvents.length}</p>
            </div>
            <Activity className="h-8 w-8 text-orange-400" />
          </div>
          <p className="text-blue-400 text-sm mt-2">Real-time activity</p>
        </motion.div>
      </div>

      {/* Top Users */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-400" />
          Top Performers
        </h3>
        <div className="space-y-3">
          {adminData.summary.topUsers.slice(0, 5).map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500 text-slate-900' :
                  index === 1 ? 'bg-gray-400 text-slate-900' :
                  index === 2 ? 'bg-orange-500 text-slate-900' :
                  'bg-slate-600 text-white'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="text-white font-semibold">{user.name}</p>
                  <p className="text-gray-400 text-sm">{user.tier} • {user.gamesPlayed} games</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-semibold">
                  +{formatCurrency(user.totalWinnings - user.totalLosses)}
                </p>
                <p className="text-gray-400 text-sm">{user.referralCount} referrals</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
