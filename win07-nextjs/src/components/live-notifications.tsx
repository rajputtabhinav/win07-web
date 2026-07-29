"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Coins, DollarSign, Users, Gift, Crown } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useWallet } from '@/contexts/wallet-context'
import { activityTracker } from '@/utils/activity-tracker'

interface WinNotification {
  id: string
  playerName: string
  amount: number
  game: string
  isRealUser: boolean
  timestamp: Date | number
  type?: 'win' | 'withdrawal' | 'referral' | 'signup'
  tier?: string
}

// Indian names for fake notifications
const INDIAN_NAMES = [
  'Aarav Sharma', 'Vivaan Singh', 'Aditya Kumar', 'Vihaan Gupta', 'Arjun Patel', 'Sai Reddy', 'Reyansh Jain', 'Ayaan Khan', 'Krishna Yadav', 'Ishaan Verma',
  'Shaurya Agarwal', 'Atharv Mishra', 'Aadhya Sharma', 'Anaya Singh', 'Kavya Kumar', 'Aanya Gupta', 'Kiara Patel', 'Diya Reddy', 'Pihu Jain', 'Myra Khan',
  'Prisha Yadav', 'Anvi Verma', 'Aarohi Agarwal', 'Riya Mishra', 'Rajesh Kumar', 'Suresh Singh', 'Ramesh Sharma', 'Mahesh Gupta', 'Dinesh Patel', 'Rakesh Reddy',
  'Naresh Jain', 'Umesh Khan', 'Ritesh Yadav', 'Mukesh Verma', 'Nilesh Agarwal', 'Priya Sharma', 'Pooja Singh', 'Sunita Kumar', 'Meera Gupta', 'Kavita Patel',
  'Anjali Reddy', 'Shweta Jain', 'Neha Khan', 'Deepika Yadav', 'Manisha Verma', 'Rohit Sharma', 'Amit Singh', 'Vikash Kumar', 'Ravi Gupta', 'Ajay Patel',
  'Vinod Reddy', 'Manoj Jain', 'Anil Khan', 'Sunil Yadav', 'Ashok Verma', 'Preeti Agarwal', 'Sonia Mishra', 'Rekha Sharma', 'Geeta Singh', 'Sangeeta Kumar',
  'Kiran Gupta', 'Nisha Patel', 'Vandana Reddy', 'Seema Jain', 'Usha Khan', 'Aryan Sharma', 'Kartik Singh', 'Harsh Kumar', 'Dev Gupta', 'Yash Patel',
  'Karan Reddy', 'Rohan Jain', 'Nikhil Khan', 'Rahul Yadav', 'Akash Verma', 'Isha Agarwal', 'Tanya Mishra', 'Shreya Sharma', 'Aditi Singh', 'Nidhi Kumar',
  'Sakshi Gupta', 'Khushi Patel', 'Avni Reddy', 'Ritu Jain', 'Swati Khan', 'Gaurav Sharma', 'Sourav Singh', 'Pranav Kumar', 'Tanmay Gupta', 'Shubham Patel',
  'Abhishek Reddy', 'Varun Jain', 'Ankit Khan', 'Rishabh Yadav', 'Ayush Verma', 'Simran Agarwal', 'Palak Mishra', 'Muskan Sharma', 'Jiya Singh', 'Arushi Kumar'
]

const GAMES = ['Aviator', 'Mines', 'Wheel', 'Teen Patti', 'Andar Bahar', 'Limbo', 'Blackjack', 'Roulette', 'Baccarat', 'Crazy Time', 'Crash']

export function LiveNotifications() {
  const { user } = useUser()
  const wallet = useWallet()
  const [notifications, setNotifications] = useState<WinNotification[]>([])

  // Subscribe to global activity tracker
  useEffect(() => {
    const unsubscribe = activityTracker.subscribe((activity) => {
      if (activity.action === 'win' || activity.action === 'big_win' || activity.action === 'jackpot') {
        // Add variety to fake notifications
        const tiers = ['Basic', 'Bronze', 'Gold', 'Grandmaster']
        const notificationTypes = ['win', 'withdrawal', 'referral', 'signup']
        const randomTier = tiers[Math.floor(Math.random() * tiers.length)]
        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
        
        // Adjust amount and game based on type
        let displayAmount = activity.amount
        let displayGame = activity.game || 'Game'
        
        if (Math.random() < 0.3) { // 30% chance for non-win notifications
          const typeRandom = Math.random()
          if (typeRandom < 0.4) {
            displayGame = 'Withdrawal'
            displayAmount = [500, 1000, 2000, 5000, 10000][Math.floor(Math.random() * 5)]
          } else if (typeRandom < 0.7) {
            displayGame = 'Referral Bonus'
            displayAmount = 130
          } else {
            displayGame = 'Welcome Bonus'
            displayAmount = 899
          }
        }

        const notification: WinNotification = {
          id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          playerName: activity.userName,
          amount: displayAmount,
          game: displayGame,
          isRealUser: false,
          timestamp: activity.timestamp,
          type: displayGame === 'Withdrawal' ? 'withdrawal' : 
                displayGame === 'Referral Bonus' ? 'referral' :
                displayGame === 'Welcome Bonus' ? 'signup' : 'win',
          tier: randomTier
        }

        setNotifications(prev => [notification, ...prev.slice(0, 4)]) // Keep only 5 notifications

        // Remove notification after random time (3-5 seconds)
        const removeDelay = Math.random() * 2000 + 3000
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id))
        }, removeDelay)
      }
    })

    return unsubscribe
  }, [])

  // Track real user wins from recentWins array
  useEffect(() => {
    if (wallet?.recentWins && user && wallet.recentWins.length > 0) {
      const latestWin = wallet.recentWins[0]
      
      // Check if this is a new win (not already notified)
      const latestWinTime = typeof latestWin.timestamp === 'number' ? latestWin.timestamp : new Date(latestWin.timestamp).getTime()
      const alreadyNotified = notifications.some(n => 
        n.isRealUser && 
        Math.abs(new Date(n.timestamp).getTime() - latestWinTime) < 1000
      )
      
      if (!alreadyNotified) {
        const gameNames: { [key: string]: string } = {
          'aviator': 'Aviator',
          'mines': 'Mines',
          'wheel': 'Wheel',
          'teen-patti': 'Teen Patti',
          'andar-bahar': 'Andar Bahar',
          'limbo': 'Limbo',
          'blackjack': 'Blackjack',
          'roulette': 'Roulette',
          'baccarat': 'Baccarat',
          'crazy-time': 'Crazy Time',
          'crash': 'Crash'
        }
        
        const realNotification: WinNotification = {
          id: latestWin.id || `real_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          playerName: user.firstName || 'You',
          amount: latestWin.amount,
          game: latestWin.game || 'Game',
          isRealUser: true,
          timestamp: latestWin.timestamp,
          type: latestWin.type || 'win',
          tier: latestWin.tier
        }

        setNotifications(prev => [realNotification, ...prev.slice(0, 4)])

        // Remove notification after 5 seconds (longer for real user)
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== realNotification.id))
        }, 5000)
      }
    }
  }, [wallet?.recentWins, user, notifications])

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `₹${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`
    } else {
      return `₹${amount.toLocaleString()}`
    }
  }

  const getNotificationIcon = (amount: number, type?: string, tier?: string) => {
    // Different icons based on notification type
    if (type === 'withdrawal') {
      return <DollarSign className="h-3 w-3 text-green-400" />
    } else if (type === 'referral') {
      return <Users className="h-3 w-3 text-blue-400" />
    } else if (type === 'signup') {
      return <Gift className="h-3 w-3 text-purple-400" />
    }
    
    // For win notifications, use amount-based icons
    if (amount >= 50000) return <Trophy className="h-3 w-3 text-yellow-400" />
    if (amount >= 10000) return <Star className="h-3 w-3 text-purple-400" />
    return <Coins className="h-3 w-3 text-green-400" />
  }

  const getNotificationColor = (amount: number) => {
    if (amount >= 50000) return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
    if (amount >= 10000) return 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
    if (amount >= 1000) return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
    return 'from-green-500/20 to-emerald-500/20 border-green-500/30'
  }

  return (
    <div className="fixed left-4 bottom-4 z-50 space-y-1.5 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ x: -300, y: 50, opacity: 0, scale: 0.8 }}
            animate={{ 
              x: 0, 
              y: 0,
              opacity: 1, 
              scale: 1
            }}
            exit={{ 
              x: -300, 
              y: 20,
              opacity: 0, 
              scale: 0.8
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.6 
            }}
            className={`bg-gradient-to-r ${getNotificationColor(notification.amount)} backdrop-blur-md border rounded-lg p-1.5 shadow-lg max-w-48 relative overflow-hidden`}
            style={{
              boxShadow: '0 10px 25px rgba(0,0,0,0.3), 0 0 20px rgba(139, 92, 246, 0.2)'
            }}
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse" />
            
            {/* Content - Ultra Compact */}
            <div className="relative flex items-center gap-1.5">
              <motion.div
                animate={notification.amount >= 10000 ? { 
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{ duration: 0.6 }}
              >
                {getNotificationIcon(notification.amount, notification.type, notification.tier)}
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate ${
                  notification.isRealUser ? 'text-yellow-400' : 'text-white'
                }`}>
                  {(() => {
                    const name = notification.isRealUser ? '🎉 You' : notification.playerName.split(' ')[0]
                    const amount = formatAmount(notification.amount)
                    
                    switch (notification.type) {
                      case 'withdrawal':
                        return `${name} withdrew ${amount}`
                      case 'referral':
                        return `${name} earned ${amount}`
                      case 'signup':
                        return `${name} joined & got ${amount}`
                      default:
                        return `${name} won ${amount}`
                    }
                  })()}
                  {notification.isRealUser && (
                    <span className="ml-1 w-1 h-1 bg-yellow-400 rounded-full inline-block animate-pulse" />
                  )}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 truncate">
                    {notification.game}
                  </p>
                  {notification.tier && (
                    <div className="flex items-center gap-1">
                      <Crown className={`h-2.5 w-2.5 ${
                        notification.tier === 'Grandmaster' ? 'text-purple-400' :
                        notification.tier === 'Gold' ? 'text-yellow-400' :
                        notification.tier === 'Bronze' ? 'text-orange-400' : 'text-gray-400'
                      }`} />
                      <span className={`text-xs font-medium ${
                        notification.tier === 'Grandmaster' ? 'text-purple-400' :
                        notification.tier === 'Gold' ? 'text-yellow-400' :
                        notification.tier === 'Bronze' ? 'text-orange-400' : 'text-gray-400'
                      }`}>
                        {notification.tier === 'Grandmaster' ? 'GM' : notification.tier.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Admin Access Promotion for Big Wins */}
                {notification.amount >= 500 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-0.5 pt-0.5 border-t border-yellow-400/20"
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-yellow-400">👑 Admin Access</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Simple celebration for big wins */}
            {notification.amount >= 50000 && (
              <div className="absolute -top-0.5 -right-0.5">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 0.6, repeat: 1 }}
                  className="text-yellow-400 text-xs"
                >
                  ✨
                </motion.div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
