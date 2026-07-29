"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SignUp } from '@clerk/nextjs'
import { ReferralSignup } from '@/components/referral-signup'

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('ref')
  const [currentReferralCode, setCurrentReferralCode] = useState('')

  useEffect(() => {
    // Store referral code in localStorage for later processing
    if (referralCode) {
      localStorage.setItem('pendingReferralCode', referralCode.toUpperCase())
      setCurrentReferralCode(referralCode.toUpperCase())
    }
  }, [referralCode])

  const handleReferralCodeChange = (code: string) => {
    setCurrentReferralCode(code)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Referral Code Input */}
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">Join WIN07 Gaming</h2>
          <ReferralSignup onReferralCodeChange={handleReferralCodeChange} />
        </div>

        {currentReferralCode && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
            <p className="text-green-400 text-sm font-semibold">🎉 Referral Code: {currentReferralCode}</p>
            <p className="text-gray-300 text-xs">You'll get bonus rewards after your first deposit!</p>
          </div>
        )}
        
        <SignUp 
          appearance={{
            elements: {
              card: "bg-slate-800/90 backdrop-blur-sm border border-slate-700",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-300"
            }
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}
