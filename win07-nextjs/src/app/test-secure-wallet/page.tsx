"use client"

import { useSecureWallet } from '@/contexts/secure-wallet-context'
import { useUser } from '@clerk/nextjs'
import { useState } from 'react'

export default function TestSecureWalletPage() {
  const { user, isLoaded } = useUser()
  const wallet = useSecureWallet()
  const [testAmount, setTestAmount] = useState(100)
  const [loading, setLoading] = useState(false)

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Please Sign In</h1>
        <p className="text-gray-400">You need to be signed in to test the secure wallet.</p>
      </div>
    )
  }

  const handleTestDeposit = async () => {
    setLoading(true)
    try {
      const success = await wallet.deposit(testAmount, { gateway: 'test' }, true)
      console.log('Deposit result:', success)
    } catch (error) {
      console.error('Deposit error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestBet = async () => {
    setLoading(true)
    try {
      const success = await wallet.placeChallenge(testAmount, 'test-game')
      console.log('Bet result:', success)
    } catch (error) {
      console.error('Bet error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestWin = async () => {
    setLoading(true)
    try {
      const success = await wallet.addWinning(testAmount * 2, 'test-game', { multiplier: 2 })
      console.log('Win result:', success)
    } catch (error) {
      console.error('Win error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const success = await wallet.refreshBalance()
      console.log('Refresh result:', success)
    } catch (error) {
      console.error('Refresh error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Secure Wallet Test Page
        </h1>

        {/* Wallet Status */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Wallet Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">₹{wallet.cashBalance}</div>
              <div className="text-sm text-gray-400">Cash Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">₹{wallet.bonusBalance}</div>
              <div className="text-sm text-gray-400">Bonus Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">₹{wallet.totalWon}</div>
              <div className="text-sm text-gray-400">Total Won</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">₹{wallet.totalLost}</div>
              <div className="text-sm text-gray-400">Total Lost</div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Loading:</span> 
              <span className={wallet.isLoading ? "text-yellow-400" : "text-green-400"}>
                {wallet.isLoading ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Tier:</span> 
              <span className="text-blue-400">{wallet.tier}</span>
            </div>
            <div>
              <span className="text-gray-400">Admin:</span> 
              <span className={wallet.isAdmin() ? "text-green-400" : "text-red-400"}>
                {wallet.isAdmin() ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          
          {wallet.lastUpdated && (
            <div className="mt-2 text-sm text-gray-400">
              Last Updated: {wallet.lastUpdated.toLocaleString()}
            </div>
          )}
        </div>

        {/* Test Controls */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Test Controls</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Test Amount (₹)
            </label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              min="1"
              max="50000"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={handleTestDeposit}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium"
            >
              Test Deposit
            </button>
            
            <button
              onClick={handleTestBet}
              disabled={loading || wallet.cashBalance < testAmount}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium"
            >
              Test Bet
            </button>
            
            <button
              onClick={handleTestWin}
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg font-medium"
            >
              Test Win
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
          {wallet.transactions.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {wallet.transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <div className="font-medium text-white">
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </div>
                    <div className="text-sm text-gray-400">{tx.description}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      tx.type === 'win' || tx.type === 'deposit' 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {tx.type === 'win' || tx.type === 'deposit' ? '+' : '-'}₹{tx.amount}
                    </div>
                    <div className="text-sm text-gray-400">{tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              No transactions yet. Try testing the wallet functions above.
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Name:</span> 
              <span className="text-white ml-2">{wallet.userName}</span>
            </div>
            <div>
              <span className="text-gray-400">Email:</span> 
              <span className="text-white ml-2">{wallet.userEmail}</span>
            </div>
            <div>
              <span className="text-gray-400">Emoji:</span> 
              <span className="text-white ml-2">{wallet.userEmoji}</span>
            </div>
            <div>
              <span className="text-gray-400">Has Withdrawn (Basic):</span> 
              <span className="text-white ml-2">{wallet.hasWithdrawnBasic ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
