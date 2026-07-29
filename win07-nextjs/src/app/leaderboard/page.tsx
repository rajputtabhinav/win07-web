"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Crown, 
  Star,
  TrendingUp,
  Users,
  Medal
} from 'lucide-react'
import { Header } from '@/components/header'
import { useWallet } from '@/contexts/wallet-context'
import { getLeaderboardEmoji } from '@/utils/user-emoji'

interface LeaderboardEntry {
  rank: number
  name: string
  totalWon: number
  gamesPlayed: number
  winRate: number
  level: number
  emoji: string
}

// 5000 Indian names for realistic leaderboard
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
  'Abhishek Reddy', 'Varun Jain', 'Ankit Khan', 'Rishabh Yadav', 'Ayush Verma', 'Simran Agarwal', 'Palak Mishra', 'Muskan Sharma', 'Jiya Singh', 'Arushi Kumar',
  'Aadhya Gupta', 'Saanvi Patel', 'Pari Reddy', 'Avika Jain', 'Navya Khan', 'Arnav Sharma', 'Advait Singh', 'Shivansh Kumar', 'Rudra Gupta', 'Kabir Patel',
  'Aryan Reddy', 'Veer Jain', 'Aarav Khan', 'Reyansh Yadav', 'Vivaan Verma', 'Disha Agarwal', 'Ira Mishra', 'Pari Sharma', 'Anika Singh', 'Riya Kumar',
  'Ananya Gupta', 'Samaira Patel', 'Aarohi Reddy', 'Kavya Jain', 'Myra Khan', 'Siddharth Sharma', 'Arjun Singh', 'Karthik Kumar', 'Aditya Gupta', 'Vihaan Patel'
]

// Generate more names by combining first and last names
const generateIndianNames = (count: number): string[] => {
  const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Aadhya', 'Anaya', 'Kavya', 'Aanya', 'Kiara', 'Diya', 'Pihu', 'Myra', 'Prisha', 'Anvi', 'Aarohi', 'Riya', 'Rajesh', 'Suresh', 'Ramesh', 'Mahesh', 'Dinesh', 'Rakesh', 'Naresh', 'Umesh', 'Ritesh', 'Mukesh', 'Nilesh', 'Priya', 'Pooja', 'Sunita', 'Meera', 'Kavita', 'Anjali', 'Shweta', 'Neha', 'Deepika', 'Manisha', 'Rohit', 'Amit', 'Vikash', 'Ravi', 'Ajay', 'Vinod', 'Manoj', 'Anil', 'Sunil', 'Ashok', 'Preeti', 'Sonia', 'Rekha', 'Geeta', 'Sangeeta', 'Kiran', 'Nisha', 'Vandana', 'Seema', 'Usha', 'Aryan', 'Kartik', 'Harsh', 'Dev', 'Yash', 'Karan', 'Rohan', 'Nikhil', 'Rahul', 'Akash', 'Isha', 'Tanya', 'Shreya', 'Aditi', 'Nidhi', 'Sakshi', 'Khushi', 'Avni', 'Ritu', 'Swati', 'Gaurav', 'Sourav', 'Pranav', 'Tanmay', 'Shubham', 'Abhishek', 'Varun', 'Ankit', 'Rishabh', 'Ayush', 'Simran', 'Palak', 'Muskan', 'Jiya', 'Arushi']
  const lastNames = ['Sharma', 'Singh', 'Kumar', 'Gupta', 'Patel', 'Reddy', 'Jain', 'Khan', 'Yadav', 'Verma', 'Agarwal', 'Mishra', 'Mehta', 'Shah', 'Chopra', 'Malhotra', 'Arora', 'Kapoor', 'Bansal', 'Goel', 'Agrawal', 'Tiwari', 'Saxena', 'Pandey', 'Srivastava', 'Chandra', 'Prasad', 'Rao', 'Iyer', 'Nair', 'Pillai', 'Menon', 'Bhat', 'Kaul', 'Dutta', 'Ghosh', 'Mukherjee', 'Banerjee', 'Chakraborty', 'Das', 'Saha', 'Roy', 'Bhattacharya', 'Chatterjee', 'Sengupta', 'Bose', 'Mitra', 'Sarkar', 'Mandal']
  
  const names: string[] = []
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    names.push(`${firstName} ${lastName}`)
  }
  return names
}

export default function LeaderboardPage() {
  const wallet = useWallet()
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [displayCount, setDisplayCount] = useState(50) // Show 50 initially
  
  // Generate leaderboard data
  useEffect(() => {
    const names = generateIndianNames(5000)
    const players: LeaderboardEntry[] = names.map((name, index) => {
      // Random earnings from ₹5,000 to ₹1.2 crores
      const minEarning = 5000
      const maxEarning = 12000000 // 1.2 crores
      const totalWon = Math.floor(Math.random() * (maxEarning - minEarning) + minEarning)
      
      // Games played based on earnings (higher earners play more)
      const gamesPlayed = Math.floor((totalWon / 10000) * Math.random() * 50) + 20
      
      // Win rate between 45% to 85%
      const winRate = Math.floor(Math.random() * 40 + 45)
      
      // Level based on games played
      const level = Math.min(Math.floor(gamesPlayed / 10) + 1, 50)
      
      return {
        rank: index + 1,
        name,
        totalWon,
        gamesPlayed,
        winRate,
        level,
        emoji: getLeaderboardEmoji(name, index + 1)
      }
    })
    
    // Sort by total winnings (descending)
    players.sort((a, b) => b.totalWon - a.totalWon)
    
    // Update ranks
    players.forEach((player, index) => {
      player.rank = index + 1
    })
    
    setLeaderboard(players)
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-400" />
      case 2: return <Medal className="h-5 w-5 text-gray-300" />
      case 3: return <Medal className="h-5 w-5 text-orange-400" />
      default: return <span className="text-gray-400 text-sm font-bold">#{rank}</span>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header - Compact */}
        <div className="mb-4">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-gray-400 text-sm">Top players this month</p>
        </div>

        {/* Your Position */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
          <h3 className="text-white font-semibold mb-3 text-sm">Your Position</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-700/50 rounded-full flex items-center justify-center text-lg">
                {wallet.userEmoji}
              </div>
              <div>
                <p className="text-white text-sm font-medium">Your Stats</p>
                <p className="text-gray-400 text-xs">
                  ₹{wallet.totalWon.toLocaleString()} won • {wallet.gamesPlayed} games
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-purple-400 text-sm font-bold">Rank #-</p>
              <p className="text-gray-400 text-xs">Play more to rank!</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Top Players ({leaderboard.length.toLocaleString()})</h3>
            <div className="text-gray-400 text-xs">
              Showing {Math.min(displayCount, leaderboard.length)}
            </div>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {leaderboard.slice(0, displayCount).map((player) => (
              <div
                key={`rank-${player.rank}`}
                className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                  player.rank <= 3 
                    ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20' 
                    : 'bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6">
                    {getRankIcon(player.rank)}
                  </div>
                  <div className="w-8 h-8 bg-slate-700/50 rounded-full flex items-center justify-center text-lg">
                    {player.emoji}
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium">{player.name}</p>
                    <p className="text-gray-400 text-xs">
                      {player.gamesPlayed} games • {player.winRate}% win rate
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-green-400 text-xs font-bold">
                    ₹{player.totalWon >= 1000000 
                      ? `${(player.totalWon / 1000000).toFixed(1)}M` 
                      : player.totalWon >= 100000 
                      ? `${(player.totalWon / 100000).toFixed(1)}L`
                      : player.totalWon.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-xs">Level {player.level}</p>
                </div>
              </div>
            ))}
          </div>

          {displayCount < leaderboard.length && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setDisplayCount(prev => Math.min(prev + 50, leaderboard.length))}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-xs font-semibold"
              >
                Load More ({leaderboard.length - displayCount} remaining)
              </button>
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-gray-400 text-xs">
              Rankings update every hour • Play more games to climb the leaderboard!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
