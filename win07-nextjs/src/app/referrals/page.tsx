"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Header } from '@/components/header'
import { useWallet } from '@/contexts/wallet-context'
import { applyReferralCode, type ReferralData } from '@/utils/referral-system'
import { Copy, Users, Gift, TrendingUp, Trophy, Plus, CheckCircle, Clock, Share2, Facebook, Twitter, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

// Sharing functions
const shareOnWhatsApp = (referralCode: string) => {
  const message = `🎮 Join WIN07 - India's most powerful AI-secured gaming platform! 
  
✨ Use my referral code: ${referralCode}
🎁 Get ₹899 welcome bonus + exclusive benefits
🚀 15+ games with AI predictions
💰 Instant withdrawals & proven fair play

Join now: ${window.location.origin}/signup?ref=${referralCode}

#WIN07Gaming #IndiaGaming #AIPredictions`
  
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

const shareOnFacebook = (referralCode: string) => {
  const message = `🎮 Discover WIN07 - India's most powerful AI-secured gaming platform! Join me and get exclusive benefits with my referral code: ${referralCode}`
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/signup?ref=' + referralCode)}&quote=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

const shareOnTwitter = (referralCode: string) => {
  const message = `🎮 Just discovered WIN07 - India's most powerful AI-secured gaming platform! 

✨ Join with my code: ${referralCode}
🎁 Get ₹899 welcome bonus
🚀 15+ games with AI predictions
💰 Instant withdrawals

${window.location.origin}/signup?ref=${referralCode}

#WIN07Gaming #IndiaGaming #AIPredictions`
  
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

const shareGeneric = (referralCode: string) => {
  const message = `🎮 Join WIN07 - India's most powerful AI-secured gaming platform!

✨ Use my referral code: ${referralCode}
🎁 Get ₹899 welcome bonus + exclusive benefits
🚀 15+ games with AI predictions  
💰 Instant withdrawals & proven fair play

Join now: ${window.location.origin}/signup?ref=${referralCode}`

  if (navigator.share) {
    navigator.share({
      title: 'WIN07 - AI Gaming Platform',
      text: message,
      url: `${window.location.origin}/signup?ref=${referralCode}`
    })
  } else {
    navigator.clipboard.writeText(message)
    toast.success('Share message copied to clipboard!')
  }
}

export default function ReferralsPage() {
  const { user } = useUser()
  const wallet = useWallet()
  const [referralCode, setReferralCode] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [userReferrals, setUserReferrals] = useState<ReferralData[]>([])

  useEffect(() => {
    if (wallet.referralInfo?.referrals) {
      setUserReferrals(wallet.referralInfo.referrals)
    }
  }, [wallet.referralInfo])

  const copyReferralCode = () => {
    if (wallet.referralInfo?.referralCode) {
      navigator.clipboard.writeText(wallet.referralInfo.referralCode)
      toast.success('Referral code copied! 📋')
    }
  }

  const handleApplyReferralCode = async () => {
    if (!user?.id || !referralCode.trim()) {
      toast.error('Please enter a valid referral code')
      return
    }

    if (wallet.referralInfo?.referredBy) {
      toast.error('You have already used a referral code')
      return
    }

    setIsApplying(true)
    
    try {
      const result = applyReferralCode(user.id, referralCode.trim())
      
      if (result.success) {
        toast.success(result.message)
        setReferralCode('')
        // Reload the page to update the context
        window.location.reload()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to apply referral code')
    } finally {
      setIsApplying(false)
    }
  }

  const getStatusBadge = (status: string, minimumDepositMet: boolean) => {
    if (status === 'rewarded') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
          <CheckCircle className="h-3 w-3" />
          Rewarded
        </span>
      )
    } else if (status === 'completed' || minimumDepositMet) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
          <CheckCircle className="h-3 w-3" />
          Qualified
        </span>
      )
    } else {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      )
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Please sign in to view referrals</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-3 flex items-center justify-center gap-2">
              <Users className="h-6 w-6 text-purple-400" />
              Referral Program
            </h1>
            <p className="text-gray-300 text-sm">
              Invite friends and earn ₹30 cash + ₹100 bonus for every successful referral!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Your Referral Code */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="h-4 w-4 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Your Referral Code</h2>
              </div>
              
              <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-400 mb-2">
                    {wallet.referralInfo?.referralCode || 'Loading...'}
                  </div>
                  <button
                    onClick={copyReferralCode}
                    className="flex items-center gap-1 mx-auto px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                    Copy Code
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                Share this code with friends. They get welcome bonus, you get rewards!
              </div>
            </div>

            {/* Social Sharing */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Share2 className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Share on Social Media</h2>
              </div>
              
              <div className="text-sm text-gray-400 mb-4">
                Share WIN07 with your friends and followers. The more you share, the more you earn!
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => shareOnWhatsApp(wallet.referralInfo?.referralCode || '')}
                  className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </button>
                
                <button
                  onClick={() => shareOnFacebook(wallet.referralInfo?.referralCode || '')}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </button>
                
                <button
                  onClick={() => shareOnTwitter(wallet.referralInfo?.referralCode || '')}
                  className="flex items-center gap-2 px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors text-sm"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </button>
                
                <button
                  onClick={() => shareGeneric(wallet.referralInfo?.referralCode || '')}
                  className="flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                >
                  <Share2 className="h-4 w-4" />
                  More
                </button>
              </div>
            </div>

            {/* Referral Stats */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-6 w-6 text-green-400" />
                <h2 className="text-xl font-semibold text-white">Your Stats</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Referrals</span>
                  <span className="text-white font-semibold">{wallet.referralInfo?.referralCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Earnings</span>
                  <span className="text-green-400 font-semibold">₹{wallet.referralInfo?.totalEarnings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Tier</span>
                  <span className="text-purple-400 font-semibold">{wallet.getUserTier().name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Withdrawal Limit</span>
                  <span className="text-blue-400 font-semibold">₹{wallet.getUserTier().withdrawalLimitPer24h.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Apply Referral Code */}
            {!wallet.referralInfo?.referredBy && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Plus className="h-6 w-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">Got a Referral Code?</h2>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Enter referral code"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    maxLength={10}
                  />
                  <button
                    onClick={handleApplyReferralCode}
                    disabled={isApplying || !referralCode.trim()}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
                  >
                    {isApplying ? 'Applying...' : 'Apply Code'}
                  </button>
                </div>
                
                <div className="text-sm text-gray-400 mt-3">
                  Apply a friend's code to get extra welcome bonus!
                </div>
              </div>
            )}

            {/* Referred By */}
            {wallet.referralInfo?.referredBy && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  <h2 className="text-xl font-semibold text-white">Referred By</h2>
                </div>
                
                <div className="text-center">
                  <div className="text-lg text-green-400 mb-2">You were referred!</div>
                  <div className="text-sm text-gray-400">
                    Thanks for using a referral code. Your friend earned rewards when you made your first deposit!
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* How It Works */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
              <Gift className="h-6 w-6 text-purple-400" />
              How Referrals Work
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Share Your Code</h3>
                <p className="text-gray-400 text-sm">
                  Copy your unique referral code and share it with friends
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Friend Signs Up</h3>
                <p className="text-gray-400 text-sm">
                  Your friend creates an account using your referral code
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Both Get Rewards</h3>
                <p className="text-gray-400 text-sm">
                  When they deposit ₹150+, you get ₹30 cash + ₹100 bonus!
                </p>
              </div>
            </div>
          </div>

          {/* Your Referrals */}
          {userReferrals.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <Users className="h-6 w-6 text-green-400" />
                Your Referrals ({userReferrals.length})
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-gray-400 pb-3">Friend</th>
                      <th className="text-left text-gray-400 pb-3">Date</th>
                      <th className="text-left text-gray-400 pb-3">Status</th>
                      <th className="text-left text-gray-400 pb-3">Reward</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userReferrals.map((referral, index) => (
                      <tr key={referral.refereeId} className="border-b border-slate-800/50">
                        <td className="py-4">
                          <div>
                            <div className="text-white font-medium">{referral.refereeName}</div>
                            <div className="text-gray-400 text-sm">{referral.refereeEmail}</div>
                          </div>
                        </td>
                        <td className="py-4 text-gray-300">
                          {new Date(referral.timestamp).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          {getStatusBadge(referral.status, referral.minimumDepositMet)}
                        </td>
                        <td className="py-4">
                          <span className={`font-medium ${
                            referral.status === 'rewarded' ? 'text-green-400' : 'text-gray-400'
                          }`}>
                            ₹{referral.rewardAmount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tier Benefits */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mt-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-yellow-400" />
              Referral Tier Benefits
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { name: 'Basic', refs: '0-2', limit: '₹100', color: 'gray' },
                { name: 'Bronze', refs: '3-12', limit: 'Up to ₹1,200', color: 'orange' },
                { name: 'Gold', refs: '13-49', limit: '₹50,000', color: 'yellow' },
                { name: 'Grandmaster', refs: '120+', limit: '₹20,00,000', color: 'purple' }
              ].map((tier) => (
                <div key={tier.name} className={`border-2 border-${tier.color}-500/30 bg-${tier.color}-500/10 rounded-lg p-3`}>
                  <div className={`text-${tier.color}-400 font-bold text-sm mb-1`}>{tier.name}</div>
                  <div className="text-white text-xs mb-1">{tier.refs} referrals</div>
                  <div className={`text-${tier.color}-300 font-semibold text-xs`}>{tier.limit}/day</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}