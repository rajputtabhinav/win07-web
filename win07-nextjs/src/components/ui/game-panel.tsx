"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Coins, 
  TrendingUp, 
  Play, 
  Zap,
  Target
} from 'lucide-react'
import { useWallet } from '@/contexts/wallet-context'
import { toast } from 'sonner'

interface GamePanelProps {
  gameId: string
  onAmountChange: (amount: number) => void
  disabled?: boolean
  minAmount?: number
  maxAmount?: number
}

export function GamePanel({
  gameId,
  onAmountChange,
  disabled = false,
  minAmount = 20,
  maxAmount = 50000
}: GamePanelProps) {
  const wallet = useWallet()
  const [challengeAmount, setChallengeAmount] = useState(25)
  
  const quickAmounts = [25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000]

  // Filter quick amounts based on balance and limits
  const availableQuickAmounts = quickAmounts.filter(amount => 
    amount >= minAmount && 
    amount <= maxAmount && 
    amount <= wallet.balance
  )

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
      {/* Header - Compact */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Challenge Amount</h3>
        <div className="text-green-400 font-bold text-xs">
          ₹{wallet.balance.toLocaleString()}
        </div>
      </div>

      {/* Challenge Amount - Dropdown */}
      <div className="mb-3">
        <label className="block text-white font-semibold mb-1.5 text-xs">
          Amount
        </label>
        <select
          value={challengeAmount}
          onChange={(e) => {
            const amount = parseInt(e.target.value)
            setChallengeAmount(amount)
            onAmountChange(amount)
          }}
          disabled={disabled}
          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:border-purple-500 focus:outline-none disabled:opacity-50"
        >
          {availableQuickAmounts.map((amount) => (
            <option key={amount} value={amount}>
              ₹{amount >= 1000 ? `${amount/1000}K` : amount}
            </option>
          ))}
        </select>
      </div>


    </div>
  )
}
