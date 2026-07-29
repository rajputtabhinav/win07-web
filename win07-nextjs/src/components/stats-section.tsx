"use client"

import { motion } from 'framer-motion'
import { TrendingUp, Users, Trophy } from 'lucide-react'

interface Stats {
  totalWinnings: string
  activePlayers: string
  uptime: string
}

interface StatsSectionProps {
  stats: Stats
}

export function StatsSection({ stats }: StatsSectionProps) {
  const statsData = [
    {
      icon: Trophy,
      label: 'Total Winnings',
      value: stats.totalWinnings,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Users,
      label: 'Active Players',
      value: stats.activePlayers,
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      label: 'Uptime',
      value: stats.uptime,
      color: 'from-blue-500 to-purple-500'
    }
  ]

  return (
    <section className="py-16 px-4 bg-black/20 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="text-center group"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${stat.color} mb-4 group-hover:shadow-lg transition-all duration-300`}
              >
                <stat.icon className="h-8 w-8 text-white" />
              </motion.div>
              <motion.h3
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: index * 0.2 + 0.2, type: 'spring' }}
                className="text-3xl sm:text-4xl font-bold text-white mb-2"
              >
                {stat.value}
              </motion.h3>
              <p className="text-gray-300 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}