"use client"

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Header } from '@/components/header'
import { useWallet } from '@/contexts/wallet-context'
import { DepositModal } from '@/components/deposit-modal'
import { WithdrawalModal } from '@/components/withdrawal-modal'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Gift, 
  Clock,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Crown,
  Users,
  Trophy,
  Star
} from 'lucide-react'

export default function WalletPage() {
  const { user } = useUser()
  const wallet = useWallet()
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [showBalance, setShowBalance] = useState(true)

  const userTier = wallet.getUserTier()
  const recentTransactions = wallet.transactions.slice(0, 10)

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <Plus className="h-4 w-4 text-green-400" />
      case 'withdrawal': return <Minus className="h-4 w-4 text-red-400" />
      case 'win': return <Trophy className="h-4 w-4 text-yellow-400" />
      case 'loss': return <TrendingDown className="h-4 w-4 text-red-400" />
      case 'referral': return <Users className="h-4 w-4 text-purple-400" />
      case 'bonus': return <Gift className="h-4 w-4 text-blue-400" />
      default: return <DollarSign className="h-4 w-4 text-gray-400" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': 
      case 'win': 
      case 'referral': 
      case 'bonus': 
        return 'text-green-400'
      case 'withdrawal': 
      case 'loss': 
        return 'text-red-400'
      default: 
        return 'text-gray-400'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Please sign in to view your wallet</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Wallet className="h-8 w-8 text-purple-400" />
              Your Wallet
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <span className="text-lg">{wallet.userEmoji}</span>
              <span>Welcome back, {user.firstName || 'Player'}!</span>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Cash Balance */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-6 w-6 text-green-400" />
                  <h2 className="text-lg font-semibold text-white">Cash Balance</h2>
                </div>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-gray-400 hover:text-white"
                >
                  {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              <div className="text-2xl font-bold text-green-400 mb-2">
                {showBalance ? `₹${wallet.cashBalance.toLocaleString()}` : '₹****'}
              </div>
              <div className="text-sm text-gray-400">Available for withdrawal</div>
            </div>

            {/* Bonus Balance */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="h-6 w-6 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Bonus Balance</h2>
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {showBalance ? `₹${wallet.bonusBalance.toLocaleString()}` : '₹****'}
              </div>
              <div className="text-sm text-gray-400">For gaming only</div>
            </div>

            {/* Total Balance */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="h-6 w-6 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Total Balance</h2>
              </div>
              <div className="text-2xl font-bold text-purple-400 mb-2">
                {showBalance ? `₹${wallet.balance.toLocaleString()}` : '₹****'}
              </div>
              <div className="text-sm text-gray-400">Combined balance</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl font-semibold transition-colors"
            >
              <Plus className="h-5 w-5" />
              Deposit Money
            </button>
            
            <button
              onClick={() => setShowWithdrawalModal(true)}
              className="flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl font-semibold transition-colors"
            >
              <Minus className="h-5 w-5" />
              Withdraw Money
            </button>
          </div>

          {/* Account Tier & Withdrawal Limits */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="h-6 w-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Account Tier & Withdrawal Limits</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-2xl font-bold mb-2 ${userTier.color}`}>
                  {userTier.name}
                </div>
                <div className="text-sm text-gray-400">Current Tier</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {wallet.referralCount}
                </div>
                <div className="text-sm text-gray-400">Total Referrals</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  ₹{userTier.withdrawalLimitPer24h.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Daily Withdrawal Limit</div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
              <div className="text-sm text-gray-300">
                <strong className={userTier.color}>{userTier.name} Tier:</strong> {userTier.description}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
              <TrendingUp className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">₹{wallet.totalWon.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Total Won</div>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
              <TrendingDown className="h-6 w-6 text-red-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">₹{wallet.totalLost.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Total Lost</div>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
              <Trophy className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{wallet.gamesPlayed}</div>
              <div className="text-xs text-gray-400">Games Played</div>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
              <Users className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">₹{wallet.referralEarnings.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Referral Earnings</div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
            </div>
            
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <div className="text-white font-medium capitalize">
                          {transaction.type === 'referral' ? 'Referral Reward' : transaction.type}
                        </div>
                        <div className="text-sm text-gray-400">
                          {transaction.game !== 'system' ? transaction.game : 'System'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {(['deposit', 'win', 'referral', 'bonus'].includes(transaction.type) ? '+' : '-')}₹{transaction.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-400">No transactions yet</div>
                <div className="text-sm text-gray-500">Your transaction history will appear here</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DepositModal 
        isOpen={showDepositModal} 
        onClose={() => setShowDepositModal(false)} 
      />
      
      <WithdrawalModal 
        isOpen={showWithdrawalModal} 
        onClose={() => setShowWithdrawalModal(false)} 
      />
    </div>
  )
}
