// Admin User Management Component - Refactored from large AdminPage
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Eye, Edit, Crown, Coins } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  name: string
  cashBalance: number
  bonusBalance: number
  indCoins: number
  referralCount: number
  totalDeposits: number
  totalWithdrawals: number
  gamesPlayed: number
  totalWinnings: number
  totalLosses: number
  tier: string
  lastActivity: string
  status: 'online' | 'offline'
}

interface UserManagementProps {
  users: User[]
  onUserSelect: (user: User) => void
  onWalletAction: (user: User, action: string, operation: string) => void
  sessionToken: string
}

export function UserManagement({ users, onUserSelect, onWalletAction, sessionToken }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [sortBy, setSortBy] = useState('lastActivity')

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTier = filterTier === 'all' || user.tier === filterTier
      return matchesSearch && matchesTier
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'balance':
          return b.cashBalance - a.cashBalance
        case 'games':
          return b.gamesPlayed - a.gamesPlayed
        case 'profit':
          return (b.totalWinnings - b.totalLosses) - (a.totalWinnings - a.totalLosses)
        default:
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      }
    })

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-300 text-sm mb-2">Search Users</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm mb-2">Filter by Tier</label>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Tiers</option>
              <option value="Basic">Basic</option>
              <option value="Bronze">Bronze</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Grandmaster">Grandmaster</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="lastActivity">Last Activity</option>
              <option value="balance">Balance</option>
              <option value="games">Games Played</option>
              <option value="profit">Net Profit</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{filteredUsers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            User Management ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="text-left p-4 text-gray-300 font-semibold">User</th>
                <th className="text-left p-4 text-gray-300 font-semibold">Wallet Info</th>
                <th className="text-left p-4 text-gray-300 font-semibold">Referrals</th>
                <th className="text-left p-4 text-gray-300 font-semibold">Tier</th>
                <th className="text-left p-4 text-gray-300 font-semibold">Games</th>
                <th className="text-left p-4 text-gray-300 font-semibold">Status</th>
                <th className="text-left p-4 text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-slate-700 hover:bg-slate-700/50"
                >
                  <td className="p-4">
                    <div>
                      <p className="text-white font-semibold">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div>
                      <p className="text-green-400 font-semibold">{formatCurrency(user.cashBalance)}</p>
                      {user.bonusBalance > 0 && (
                        <p className="text-orange-400 text-sm">+{formatCurrency(user.bonusBalance)} bonus</p>
                      )}
                      <p className="text-yellow-400 text-sm">{user.indCoins} IND</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-blue-400">D: {formatCurrency(user.totalDeposits)}</span>
                        <span className="text-xs text-red-400">W: {formatCurrency(user.totalWithdrawals)}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div>
                      <p className="text-white font-semibold">{user.referralCount}</p>
                      <p className="text-gray-400 text-xs">referrals</p>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      user.tier === 'Grandmaster' ? 'bg-purple-500/20 text-purple-400' :
                      user.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
                      user.tier === 'Bronze' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {user.tier}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <div>
                      <p className="text-white">{user.gamesPlayed}</p>
                      <p className="text-gray-400 text-sm">
                        {user.totalWinnings > user.totalLosses ? '+' : ''}{formatCurrency(user.totalWinnings - user.totalLosses)}
                      </p>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        user.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                      }`}></span>
                      <span className="text-gray-300 capitalize text-sm">{user.status}</span>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => onUserSelect(user)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-xs"
                        title="View Details"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      
                      <button 
                        onClick={() => onWalletAction(user, 'cash', 'add')}
                        className="bg-green-600 hover:bg-green-700 text-white p-1 rounded text-xs"
                        title="Add Cash"
                      >
                        💰
                      </button>
                      
                      <button 
                        onClick={() => onWalletAction(user, 'cash', 'subtract')}
                        className="bg-red-600 hover:bg-red-700 text-white p-1 rounded text-xs"
                        title="Deduct Cash"
                      >
                        💸
                      </button>
                      
                      <button 
                        onClick={() => onWalletAction(user, 'bonus', 'add')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white p-1 rounded text-xs"
                        title="Add Bonus"
                      >
                        🎁
                      </button>
                      
                      <button 
                        onClick={() => onWalletAction(user, 'ind', 'add')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-1 rounded text-xs"
                        title="Add IND Coins"
                      >
                        <Coins className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
