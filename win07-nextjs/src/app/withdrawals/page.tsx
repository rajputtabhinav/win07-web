"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingDown, 
  Crown, 
  Star,
  Wallet,
  Users,
  Medal,
  Gift,
  DollarSign
} from 'lucide-react'
import { Header } from '@/components/header'
import { useWallet } from '@/contexts/wallet-context'
import { getLeaderboardEmoji } from '@/utils/user-emoji'

interface WithdrawalEntry {
  rank: number
  name: string
  totalWithdrawn: number
  withdrawalCount: number
  tier: string
  lastWithdrawal: string
  emoji: string
}

// Extended 5000+ Indian names for realistic withdrawal leaderboard
const generateIndianNames = (count: number): string[] => {
  const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 
    'Aadhya', 'Anaya', 'Kavya', 'Aanya', 'Kiara', 'Diya', 'Pihu', 'Myra', 'Prisha', 'Anvi', 'Aarohi', 'Riya',
    'Rajesh', 'Suresh', 'Ramesh', 'Mahesh', 'Dinesh', 'Rakesh', 'Naresh', 'Umesh', 'Ritesh', 'Mukesh', 'Nilesh',
    'Priya', 'Pooja', 'Sunita', 'Meera', 'Kavita', 'Anjali', 'Shweta', 'Neha', 'Deepika', 'Manisha',
    'Rohit', 'Amit', 'Vikash', 'Ravi', 'Ajay', 'Vinod', 'Manoj', 'Anil', 'Sunil', 'Ashok',
    'Preeti', 'Sonia', 'Rekha', 'Geeta', 'Sangeeta', 'Kiran', 'Nisha', 'Vandana', 'Seema', 'Usha',
    'Aryan', 'Kartik', 'Harsh', 'Dev', 'Yash', 'Karan', 'Rohan', 'Nikhil', 'Rahul', 'Akash',
    'Isha', 'Tanya', 'Shreya', 'Aditi', 'Nidhi', 'Sakshi', 'Khushi', 'Avni', 'Ritu', 'Swati',
    'Gaurav', 'Sourav', 'Pranav', 'Tanmay', 'Shubham', 'Abhishek', 'Varun', 'Ankit', 'Rishabh', 'Ayush',
    'Simran', 'Palak', 'Muskan', 'Jiya', 'Arushi', 'Saanvi', 'Pari', 'Avika', 'Navya', 'Disha',
    'Arnav', 'Advait', 'Shivansh', 'Rudra', 'Kabir', 'Veer', 'Siddharth', 'Karthik', 'Ananya', 'Samaira',
    'Abhinav', 'Adarsh', 'Akshay', 'Aman', 'Anuj', 'Ashish', 'Deepak', 'Girish', 'Harish', 'Jatin',
    'Kiran', 'Lalit', 'Manish', 'Naveen', 'Pankaj', 'Puneet', 'Rajat', 'Sachin', 'Tarun', 'Vaibhav',
    'Bharti', 'Chitra', 'Divya', 'Ekta', 'Gita', 'Hema', 'Ila', 'Jyoti', 'Kamala', 'Lata',
    'Maya', 'Nita', 'Poonam', 'Radha', 'Shila', 'Tara', 'Uma', 'Vidya', 'Yamini', 'Zoya'
  ]
  
  const lastNames = [
    'Sharma', 'Singh', 'Kumar', 'Gupta', 'Patel', 'Reddy', 'Jain', 'Khan', 'Yadav', 'Verma', 'Agarwal', 'Mishra',
    'Mehta', 'Shah', 'Chopra', 'Malhotra', 'Arora', 'Kapoor', 'Bansal', 'Goel', 'Agrawal', 'Tiwari', 'Saxena',
    'Pandey', 'Srivastava', 'Chandra', 'Prasad', 'Rao', 'Iyer', 'Nair', 'Pillai', 'Menon', 'Bhat', 'Kaul',
    'Dutta', 'Ghosh', 'Mukherjee', 'Banerjee', 'Chakraborty', 'Das', 'Saha', 'Roy', 'Bhattacharya', 'Chatterjee',
    'Sengupta', 'Bose', 'Mitra', 'Sarkar', 'Mandal', 'Ganguly', 'Biswas', 'Chowdhury', 'Kar', 'Paul',
    'Mondal', 'Naskar', 'Halder', 'Samanta', 'Maity', 'Jana', 'Kundu', 'Adhikari', 'Bag', 'Singha',
    'Mahato', 'Parui', 'Koley', 'Giri', 'Maiti', 'Pramanik', 'Ruidas', 'Karmakar', 'Barman', 'Sikdar'
  ]
  
  const names: string[] = []
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    names.push(`${firstName} ${lastName}`)
  }
  return names
}

const getTierFromWithdrawals = (amount: number): string => {
  if (amount >= 1000000) return 'Grandmaster'
  if (amount >= 50000) return 'Platinum'
  if (amount >= 10000) return 'Gold'
  if (amount >= 1000) return 'Bronze'
  return 'Basic'
}

const getTierColor = (tier: string): string => {
  switch (tier) {
    case 'Grandmaster': return 'text-purple-400'
    case 'Platinum': return 'text-blue-400'
    case 'Gold': return 'text-yellow-400'
    case 'Bronze': return 'text-orange-400'
    default: return 'text-gray-400'
  }
}

export default function WithdrawalsPage() {
  const wallet = useWallet()
  
  const [withdrawalLeaderboard, setWithdrawalLeaderboard] = useState<WithdrawalEntry[]>([])
  const [displayCount, setDisplayCount] = useState(50) // Show 50 initially
  
  // Generate withdrawal leaderboard data
  useEffect(() => {
    const names = generateIndianNames(5000)
    const withdrawers: WithdrawalEntry[] = names.map((name, index) => {
      // Random withdrawal amounts from ₹100 to ₹50 lakhs
      const minWithdrawal = 100
      const maxWithdrawal = 5000000 // 50 lakhs
      
      // Higher probability for smaller withdrawals to be realistic
      const rand = Math.random()
      let totalWithdrawn: number
      
      if (rand < 0.4) { // 40% have small withdrawals (₹100-₹10K)
        totalWithdrawn = Math.floor(Math.random() * 9900 + 100)
      } else if (rand < 0.7) { // 30% have medium withdrawals (₹10K-₹1L)
        totalWithdrawn = Math.floor(Math.random() * 90000 + 10000)
      } else if (rand < 0.9) { // 20% have large withdrawals (₹1L-₹10L)
        totalWithdrawn = Math.floor(Math.random() * 900000 + 100000)
      } else { // 10% have very large withdrawals (₹10L-₹50L)
        totalWithdrawn = Math.floor(Math.random() * 4000000 + 1000000)
      }
      
      // Withdrawal count based on total amount
      const withdrawalCount = Math.floor(totalWithdrawn / 5000) + Math.floor(Math.random() * 10) + 1
      
      const tier = getTierFromWithdrawals(totalWithdrawn)
      
      // Random last withdrawal date (within last 30 days)
      const daysAgo = Math.floor(Math.random() * 30)
      const lastWithdrawal = daysAgo === 0 ? 'Today' : 
                           daysAgo === 1 ? 'Yesterday' : 
                           `${daysAgo} days ago`
      
      return {
        rank: index + 1,
        name,
        totalWithdrawn,
        withdrawalCount,
        tier,
        lastWithdrawal,
        emoji: getLeaderboardEmoji(name, index + 1)
      }
    })
    
    // Sort by total withdrawals (descending)
    withdrawers.sort((a, b) => b.totalWithdrawn - a.totalWithdrawn)
    
    // Update ranks
    withdrawers.forEach((withdrawer, index) => {
      withdrawer.rank = index + 1
    })
    
    setWithdrawalLeaderboard(withdrawers)
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-400" />
      case 2: return <Medal className="h-5 w-5 text-gray-300" />
      case 3: return <Medal className="h-5 w-5 text-orange-400" />
      default: return <span className="text-gray-400 text-sm font-bold">#{rank}</span>
    }
  }

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) {
      return `₹${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    } else {
      return `₹${amount.toLocaleString()}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header - Compact */}
        <div className="mb-4">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-green-400" />
            Withdrawal Leaderboard
          </h1>
          <p className="text-gray-400 text-sm">Top withdrawal earners this month</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-green-500/20 border border-green-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <div>
                <p className="text-green-400 text-xs">Total Paid</p>
                <p className="text-sm font-bold text-white">₹{
                  withdrawalLeaderboard.reduce((sum, w) => sum + w.totalWithdrawn, 0)
                    .toLocaleString().length > 8 ? 
                  `${(withdrawalLeaderboard.reduce((sum, w) => sum + w.totalWithdrawn, 0) / 10000000).toFixed(1)}Cr` :
                  withdrawalLeaderboard.reduce((sum, w) => sum + w.totalWithdrawn, 0).toLocaleString()
                }</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/20 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              <div>
                <p className="text-blue-400 text-xs">Active Users</p>
                <p className="text-sm font-bold text-white">{withdrawalLeaderboard.length.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-500/20 border border-purple-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-purple-400" />
              <div>
                <p className="text-purple-400 text-xs">Avg. Withdrawal</p>
                <p className="text-sm font-bold text-white">{
                  withdrawalLeaderboard.length > 0 ? 
                  formatAmount(withdrawalLeaderboard.reduce((sum, w) => sum + w.totalWithdrawn, 0) / withdrawalLeaderboard.length) :
                  '₹0'
                }</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <div>
                <p className="text-yellow-400 text-xs">Top Earner</p>
                <p className="text-sm font-bold text-white">{
                  withdrawalLeaderboard.length > 0 ? formatAmount(withdrawalLeaderboard[0]?.totalWithdrawn || 0) : '₹0'
                }</p>
              </div>
            </div>
          </div>
        </div>

        {/* Your Position */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
          <h3 className="text-white font-semibold mb-3 text-sm">Your Withdrawal Stats</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-700/50 rounded-full flex items-center justify-center text-lg">
                {wallet.userEmoji}
              </div>
              <div>
                <p className="text-white text-sm font-medium">Your Performance</p>
                <p className="text-gray-400 text-xs">
                  ₹{wallet.transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + Math.abs(t.amount), 0).toLocaleString()} withdrawn • {wallet.transactions.filter(t => t.type === 'withdrawal').length} withdrawals
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-400 text-sm font-bold">
                {wallet.getUserTier().name} Tier
              </p>
              <p className="text-gray-400 text-xs">Keep earning!</p>
            </div>
          </div>
        </div>

        {/* Withdrawal Leaderboard */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Top Withdrawal Earners ({withdrawalLeaderboard.length.toLocaleString()})</h3>
            <div className="text-gray-400 text-xs">
              Showing {Math.min(displayCount, withdrawalLeaderboard.length)}
            </div>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {withdrawalLeaderboard.slice(0, displayCount).map((withdrawer) => (
              <motion.div
                key={`withdrawal-rank-${withdrawer.rank}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: withdrawer.rank * 0.01 }}
                className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                  withdrawer.rank <= 3 
                    ? 'bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20' 
                    : 'bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6">
                    {getRankIcon(withdrawer.rank)}
                  </div>
                  <div className="w-8 h-8 bg-slate-700/50 rounded-full flex items-center justify-center text-lg">
                    {withdrawer.emoji}
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium">{withdrawer.name}</p>
                    <p className="text-gray-400 text-xs">
                      {withdrawer.withdrawalCount} withdrawals • {withdrawer.lastWithdrawal}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-green-400 text-xs font-bold">
                    {formatAmount(withdrawer.totalWithdrawn)}
                  </p>
                  <p className={`text-xs font-medium ${getTierColor(withdrawer.tier)}`}>
                    {withdrawer.tier}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {displayCount < withdrawalLeaderboard.length && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setDisplayCount(prev => Math.min(prev + 50, withdrawalLeaderboard.length))}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-xs font-semibold"
              >
                Load More ({withdrawalLeaderboard.length - displayCount} remaining)
              </button>
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-gray-400 text-xs">
              Rankings update every hour • Earn more to climb the withdrawal leaderboard!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
