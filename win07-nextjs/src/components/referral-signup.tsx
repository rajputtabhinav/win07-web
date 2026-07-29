"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Gift, Info } from 'lucide-react'

interface ReferralSignupProps {
  onReferralCodeChange?: (code: string) => void
}

export function ReferralSignup({ onReferralCodeChange }: ReferralSignupProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [referralCode, setReferralCode] = useState('')
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    // Check for referral code in URL
    const urlReferralCode = searchParams.get('ref')
    if (urlReferralCode) {
      setReferralCode(urlReferralCode.toUpperCase())
      if (onReferralCodeChange) {
        onReferralCodeChange(urlReferralCode.toUpperCase())
      }
      // Store in localStorage for later processing
      localStorage.setItem('pendingReferralCode', urlReferralCode.toUpperCase())
    }
  }, [searchParams, onReferralCodeChange])

  const handleReferralCodeChange = (value: string) => {
    const upperCode = value.toUpperCase()
    setReferralCode(upperCode)
    if (onReferralCodeChange) {
      onReferralCodeChange(upperCode)
    }
    // Store in localStorage for later processing
    if (upperCode) {
      localStorage.setItem('pendingReferralCode', upperCode)
    } else {
      localStorage.removeItem('pendingReferralCode')
    }
  }

  return (
    <div className="space-y-4">
      {/* Referral Code Section */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-purple-400" />
            Referral Code (Optional)
            <button
              type="button"
              onClick={() => setShowInfo(!showInfo)}
              className="text-purple-400 hover:text-purple-300"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        </label>
        
        <input
          type="text"
          value={referralCode}
          onChange={(e) => handleReferralCodeChange(e.target.value)}
          placeholder="Enter referral code for extra bonus"
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          maxLength={10}
        />
        
        {/* Info Tooltip */}
        {showInfo && (
          <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-slate-800 border border-slate-600 rounded-lg text-sm text-gray-300 z-10">
            <div className="space-y-2">
              <div className="font-medium text-purple-400">🎁 Referral Benefits:</div>
              <div>• Get extra welcome bonus when you use a friend's code</div>
              <div>• Your friend earns ₹30 cash + ₹100 bonus when you deposit ₹150+</div>
              <div>• You can also apply a referral code later from the Referrals page</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Benefits Preview */}
      {referralCode && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-purple-400 text-sm">
            <Gift className="h-4 w-4" />
            <span className="font-medium">Great! You'll get extra bonus with code: {referralCode}</span>
          </div>
        </div>
      )}
    </div>
  )
}
