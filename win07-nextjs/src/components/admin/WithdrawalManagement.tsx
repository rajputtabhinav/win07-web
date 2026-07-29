// Admin Withdrawal Management Component
import React from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, CheckCircle, XCircle } from 'lucide-react'

interface Withdrawal {
  id: string
  userId: string
  userName: string
  amount: number
  method: string
  upiId?: string
  requestTime: string
  status: string
  adminNotes?: string
}

interface WithdrawalManagementProps {
  withdrawalData: {
    pending: Withdrawal[]
    processed: Withdrawal[]
  } | null
  onProcessWithdrawal: (withdrawalId: string, status: 'approved' | 'rejected', adminNote?: string) => void
  onRefresh: () => void
}

export function WithdrawalManagement({ withdrawalData, onProcessWithdrawal, onRefresh }: WithdrawalManagementProps) {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`
  const formatTime = (dateString: string) => new Date(dateString).toLocaleString()

  if (!withdrawalData) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
        <p className="text-gray-400 mb-4">Click to load withdrawal data</p>
        <button
          onClick={onRefresh}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
        >
          Load Withdrawals
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pending Withdrawals */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-400" />
            Pending Withdrawals
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {withdrawalData.pending?.length || 0}
            </span>
          </h3>
        </div>

        <div className="p-6">
          {withdrawalData.pending && withdrawalData.pending.length > 0 ? (
            <div className="space-y-3">
              {withdrawalData.pending.map((withdrawal) => (
                <motion.div
                  key={withdrawal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{withdrawal.userName}</p>
                      <p className="text-gray-400 text-sm">
                        Amount: {formatCurrency(withdrawal.amount)} • UPI: {withdrawal.upiId}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Requested: {formatTime(withdrawal.requestTime)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onProcessWithdrawal(withdrawal.id, 'approved', 'Admin approved')}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Approve
                      </button>
                      <button
                        onClick={() => onProcessWithdrawal(withdrawal.id, 'rejected', 'Admin rejected')}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <XCircle className="h-3 w-3" />
                        Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingDown className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No pending withdrawals</p>
            </div>
          )}
        </div>
      </div>

      {/* Processed Withdrawals */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white">Recent Processed Withdrawals</h3>
        </div>
        
        <div className="p-6">
          {withdrawalData.processed && withdrawalData.processed.length > 0 ? (
            <div className="space-y-2">
              {withdrawalData.processed.slice(0, 10).map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div>
                    <p className="text-white text-sm">{withdrawal.userName}</p>
                    <p className="text-gray-400 text-xs">
                      {formatCurrency(withdrawal.amount)} • {formatTime(withdrawal.requestTime)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    withdrawal.status === 'approved' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {withdrawal.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No processed withdrawals</p>
          )}
        </div>
      </div>
    </div>
  )
}
