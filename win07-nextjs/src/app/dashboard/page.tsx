"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  Plus, 
  Minus, 
  TrendingUp, 
  Trophy, 
  Users, 
  History,
  Gift,
  Copy,
  Share,
  Star
} from 'lucide-react'
import { Header } from '@/components/header'
import { useWallet } from '@/contexts/wallet-context'
import { DepositModal } from '@/components/deposit-modal'
import { WithdrawalModal } from '@/components/withdrawal-modal'
import { IndCoins } from '@/components/ind-coins'
import { toast } from 'sonner'
import { PageLoadingScreen } from '@/components/loading-screen'

export default function DashboardPage() {
  const { user } = useUser()
  const wallet = useWallet()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)

  // Simulate loading time
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800) // 0.8 second loading
    
    return () => clearTimeout(timer)
  }, [])

  // Check for IND coins purchase redirect
  useEffect(() => {
    const tab = searchParams.get('tab')
    const indcoins = searchParams.get('indcoins')
    
    if (tab === 'deposit' && indcoins === 'true') {
      setShowDepositModal(true)
      // Clean up URL
      router.replace('/dashboard')
    }
  }, [searchParams, router])

  const copyReferralCode = () => {
    const referralCode = `WIN07${user?.id?.slice(-6)?.toUpperCase() || 'REF123'}`
    navigator.clipboard.writeText(referralCode)
    toast.success('Referral code copied!')
  }

  const shareReferral = () => {
    const referralCode = `WIN07${user?.id?.slice(-6)?.toUpperCase() || 'REF123'}`
    if (navigator.share) {
      navigator.share({
        title: 'Join WIN07',
        text: `Use my referral code: ${referralCode}`,
        url: `${window.location.origin}?ref=${referralCode}`
      })
    } else {
      copyReferralCode()
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-sm">Loading...</div>
      </div>
    )
  }

  // Show loading screen
  if (isLoading) {
    return <PageLoadingScreen pageName="Dashboard" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome - Compact */}
        <div className="mb-3">
          <h1 className="text-sm font-bold text-white">
            Welcome back, {user.firstName || 'Player'}! 🎮
          </h1>
        </div>

        {/* Wallet Stats - Compact */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 mb-4">
          <div className="bg-green-500/20 border border-green-500/20 rounded p-2">
            <div className="flex items-center gap-1">
              <Wallet className="h-3 w-3 text-green-400" />
              <div>
                <p className="text-green-400 text-xs">Cash</p>
                <p className="text-xs font-bold text-white">₹{wallet.cashBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/20 rounded p-2">
            <div className="flex items-center gap-1">
              <Gift className="h-3 w-3 text-yellow-400" />
              <div>
                <p className="text-yellow-400 text-xs">Bonus</p>
                <p className="text-xs font-bold text-white">₹{wallet.bonusBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded p-2">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 text-yellow-500">🪙</div>
              <div>
                <p className="text-yellow-400 text-xs">IND</p>
                <p className="text-xs font-bold text-white">{wallet.indCoins.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/20 border border-blue-500/20 rounded p-2">
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3 text-blue-400" />
              <div>
                <p className="text-blue-400 text-xs">Won</p>
                <p className="text-xs font-bold text-white">₹{wallet.totalWinnings?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-500/20 border border-purple-500/20 rounded p-2">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-purple-400" />
              <div>
                <p className="text-purple-400 text-xs">Games</p>
                <p className="text-xs font-bold text-white">{wallet.gamesPlayed || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-500/20 border border-orange-500/20 rounded p-2">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-orange-400" />
              <div>
                <p className="text-orange-400 text-xs">Refs</p>
                <p className="text-xs font-bold text-white">{wallet.referralCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <h3 className="text-white font-semibold mb-2 text-xs flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setShowDepositModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Deposit
              </button>
              <button 
                onClick={() => setShowWithdrawalModal(true)}
                disabled={wallet.cashBalance < 100}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1"
              >
                <Minus className="h-3 w-3" />
                Withdraw
              </button>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <h3 className="text-white font-semibold mb-2 text-xs flex items-center gap-1">
              <Users className="h-3 w-3" />
              Referral
            </h3>
            <div className="bg-slate-900 rounded p-2 mb-2">
              <p className="text-white font-mono text-xs text-center">
                WIN07{user?.id?.slice(-6)?.toUpperCase() || 'REF123'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={copyReferralCode}
                className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
              <button 
                onClick={shareReferral}
                className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1"
              >
                <Share className="h-3 w-3" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* IND Coins Section */}
        <div className="mb-6">
          <IndCoins />
        </div>

        {/* Recent Transactions - Compact */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
          <h3 className="text-white font-semibold mb-2 text-xs flex items-center gap-1">
            <History className="h-3 w-3" />
            Transactions
          </h3>
          <div className="space-y-2">
            {wallet.transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-1.5 px-2 bg-slate-900/50 rounded"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    transaction.type === 'win' ? 'bg-green-400' :
                    transaction.type === 'challenge' ? 'bg-blue-400' :
                    transaction.type === 'deposit' ? 'bg-purple-400' :
                    'bg-red-400'
                  }`} />
                  <div>
                    <p className="text-white text-xs font-medium capitalize">
                      {transaction.type} - {transaction.game}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {transaction.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className={`text-xs font-bold ${
                  transaction.type === 'win' || transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'win' || transaction.type === 'deposit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                </div>
              </div>
            ))}
            {wallet.transactions.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                <p className="text-xs">No transactions yet</p>
                <p className="text-xs">Start playing to see your history</p>
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