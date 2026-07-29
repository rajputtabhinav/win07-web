"use client"

import { motion } from 'framer-motion'
import { 
  Shield, 
  Zap, 
  Gift, 
  Users, 
  CreditCard, 
  Trophy,
  Clock,
  Smartphone,
  HeadphonesIcon,
  Crown
} from 'lucide-react'

export function FeatureSection() {
  const features = [
    {
      icon: Shield,
      title: 'AI-Secured Platform',
      description: 'Advanced AI security with real-time fraud detection and SSL encryption',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Instant Withdrawals',
      description: 'Get your winnings in seconds with UPI instant transfer',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Gift,
      title: 'Daily Bonuses',
      description: 'Login daily for free coins, bonuses, and special rewards',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'Referral Program',
      description: 'Earn 10% commission on every friend you refer to WIN07',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: CreditCard,
      title: 'Multiple Payment Options',
      description: 'UPI, Net Banking, Cards - choose your preferred payment method',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Trophy,
      title: 'Leaderboards',
      description: 'Compete with players worldwide and win exclusive prizes',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Clock,
      title: '24/7 Gaming',
      description: 'Play anytime, anywhere with our always-on gaming platform',
      color: 'from-teal-500 to-green-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Perfect gaming experience on all devices - mobile, tablet, desktop',
      color: 'from-rose-500 to-pink-500'
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Round-the-clock customer support via chat, email, and phone',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Crown,
      title: 'Admin Access',
      description: 'Premium AI predictions with 95% win rates - dominate every game!',
      color: 'from-yellow-400 to-orange-500'
    }
  ]

  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Why Choose WIN07? 🌟
          </h2>
          <p className="text-gray-300 text-base max-w-3xl mx-auto">
            Experience India's most trusted AI-secured gaming platform with unmatched security and rewards
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 hover:border-purple-500/50 transition-all duration-300 p-4">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${feature.color} mb-3 group-hover:shadow-lg transition-all duration-300`}
                >
                  <feature.icon className="h-5 w-5 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}