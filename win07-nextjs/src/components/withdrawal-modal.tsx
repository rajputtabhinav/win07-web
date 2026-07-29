"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Minus, 
  CheckCircle,
  AlertCircle,
  Wallet,
  Crown,
  Users,
  Target
} from 'lucide-react'
import { useWallet } from '@/contexts/wallet-context'
import { toast } from 'sonner'

interface WithdrawalModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WithdrawalModal({ isOpen, onClose }: WithdrawalModalProps) {
  const wallet = useWallet()
  const [amount, setAmount] = useState(30)
  const [upiId, setUpiId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Get user tier and withdrawal limits
  const userTier = wallet.getUserTier()
  const limits = wallet.getWithdrawalLimits()
  const validation = wallet.canWithdraw(amount)

  const handleWithdrawal = async () => {
    if (!upiId.trim()) {
      toast.error('Please enter your UPI ID')
      return
    }

    // Use the new tier-based validation
    if (!validation.allowed) {
      toast.error(validation.reason!)
      return
    }

    setIsProcessing(true)

    // Simulate processing time
    setTimeout(() => {
      const success = wallet.withdraw(amount)
      
      if (success) {
        toast.success(`💸 Withdrawal of ₹${amount} initiated to ${upiId}`)
        toast.info('Funds will be transferred within 24 hours')
        onClose()
        setAmount(30)
        setUpiId('')
      }
      
      setIsProcessing(false)
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-lg font-bold text-white">💸 Withdraw Funds</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* User Tier Information */}
            <div className={`bg-gradient-to-r from-slate-800 to-slate-700 border rounded-lg p-3`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Crown className={`h-4 w-4 ${userTier.color}`} />
                  <span className={`font-bold ${userTier.color}`}>{userTier.name} Tier</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Users className="h-3 w-3" />
                  <span>{wallet.referralCount} referrals</span>
                </div>
              </div>
              <p className="text-gray-300 text-xs">{userTier.description}</p>
              
              {/* Withdrawal Limits */}
              <div className="mt-2 pt-2 border-t border-slate-600">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Daily Limit</p>
                    <p className="text-white font-semibold">₹{limits.dailyLimit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Remaining Today</p>
                    <p className="text-green-400 font-semibold">₹{limits.remainingToday.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Referral Requirement Message for Basic Users */}
              {userTier.name === 'Basic' && wallet.referralCount < 3 && (
                <div className="mt-2 pt-2 border-t border-yellow-500/30">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Target className="h-3 w-3" />
                    <span className="text-xs font-semibold">Need 3 referrals for higher limits!</span>
                  </div>
                </div>
              )}
            </div>

            {/* Available Balance */}
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
              <p className="text-green-400 text-sm font-semibold">Available Cash Balance</p>
              <p className="text-white text-xl font-bold">₹{wallet.cashBalance.toLocaleString()}</p>
              <p className="text-gray-400 text-xs">Only cash can be withdrawn</p>
            </div>

            {/* Withdrawal Amount */}
            <div>
              <label className="block text-white font-semibold mb-2 text-sm">
                Withdrawal Amount (Minimum ₹30)
              </label>
              <input
                type="number"
                min="30"
                max={Math.min(wallet.cashBalance, limits.maxSingle, limits.remainingToday)}
                value={amount}
                onChange={(e) => setAmount(Math.max(30, Math.min(limits.maxSingle, parseInt(e.target.value) || 30)))}
                className={`w-full bg-slate-900 border rounded-lg px-4 py-3 text-white font-mono text-lg focus:outline-none ${
                  validation.allowed ? 'border-slate-600 focus:border-purple-500' : 'border-red-500'
                }`}
                placeholder="Enter amount"
              />
              {!validation.allowed && (
                <p className="text-red-400 text-xs mt-1">{validation.reason}</p>
              )}
            </div>

            {/* Smart Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {(() => {
                const maxAmount = Math.min(wallet.cashBalance, limits.remainingToday, limits.maxSingle)
                let quickAmounts: number[] = []
                
                if (userTier.name === 'Basic') {
                  quickAmounts = [30]
                } else if (userTier.name === 'Bronze') {
                  quickAmounts = [100, 300, Math.min(500, maxAmount)]
                } else if (userTier.name === 'Gold') {
                  quickAmounts = [1000, 5000, Math.min(10000, maxAmount)]
                } else { // Grandmaster
                  quickAmounts = [10000, 50000, Math.min(100000, maxAmount)]
                }
                
                return quickAmounts.filter(amt => amt <= maxAmount && amt >= 30).map(amt => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                      amount === amt
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                    }`}
                  >
                    ₹{amt >= 1000 ? `${amt/1000}k` : amt}
                  </button>
                ))
              })()}
            </div>

            {/* UPI ID Input */}
            <div>
              <label className="block text-white font-semibold mb-2 text-sm">
                Your UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@paytm / yourname@gpay"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white font-mono focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-yellow-400 text-sm font-semibold">Important:</p>
                  <ul className="text-gray-300 text-xs mt-1 space-y-1">
                    <li>• Minimum withdrawal: ₹100</li>
                    <li>• Processing time: 1-24 hours</li>
                    <li>• Only cash balance can be withdrawn</li>
                    <li>• Ensure UPI ID is correct</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Withdrawal Button */}
            <button
              onClick={handleWithdrawal}
              disabled={isProcessing || amount < 100 || amount > wallet.cashBalance || !upiId.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Minus className="h-4 w-4" />
                  </motion.div>
                  Processing...
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4" />
                  Withdraw ₹{amount.toLocaleString()}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
