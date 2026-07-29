// Professional Admin Dashboard - MongoDB Powered
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, RefreshCw, Users, BarChart3, TrendingDown, DollarSign, Activity, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { UserManagement } from '@/components/admin/UserManagement'
import { WithdrawalManagement } from '@/components/admin/WithdrawalManagement'
import { DashboardStats } from '@/components/admin/DashboardStats'
import { logError, logInfo } from '@/lib/centralized-error-handler'

interface AdminPageState {
  isAuthenticated: boolean
  sessionToken: string
  adminData: any
  withdrawalData: any
  depositData: any
  activeTab: string
  loading: boolean
  lastUpdate: Date
}

export default function AdminPage() {
  const [adminPhone, setAdminPhone] = useState('')
  const [password, setPassword] = useState('')
  const [state, setState] = useState<AdminPageState>({
    isAuthenticated: false,
    sessionToken: '',
    adminData: null,
    withdrawalData: null,
    depositData: null,
    activeTab: 'dashboard',
    loading: false,
    lastUpdate: new Date()
  })

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (state.isAuthenticated && state.sessionToken) {
      const interval = setInterval(() => {
        fetchAllData()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [state.isAuthenticated, state.sessionToken])

  const authenticate = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: adminPhone, password })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.sessionToken) {
          setState(prev => ({
            ...prev,
            sessionToken: data.sessionToken,
            isAuthenticated: true
          }))
          
          await fetchAllData(data.sessionToken)
          toast.success('Welcome to Admin Dashboard!')
          logInfo('Admin login successful', { adminPhone })
        }
      } else {
        toast.error('Invalid credentials')
        logError('Admin login failed', undefined, { adminPhone })
      }
    } catch (error) {
      logError('Admin authentication error', error, { adminPhone })
      toast.error('Authentication error')
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const fetchAllData = async (token?: string) => {
    const authToken = token || state.sessionToken
    if (!authToken) return

    try {
      setState(prev => ({ ...prev, loading: true }))
      
      const [adminResponse, withdrawalResponse, depositResponse] = await Promise.all([
        fetch('/api/admin/dashboard', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ action: 'getAdminData' })
        }),
        fetch('/api/admin/dashboard', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ action: 'getWithdrawals' })
        }),
        fetch('/api/admin/dashboard', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ action: 'getDeposits' })
        })
      ])

      if (adminResponse.ok) {
        const adminData = await adminResponse.json()
        setState(prev => ({ ...prev, adminData: adminData.data }))
      }

      if (withdrawalResponse.ok) {
        const withdrawalData = await withdrawalResponse.json()
        setState(prev => ({ ...prev, withdrawalData: withdrawalData.data }))
      }

      if (depositResponse.ok) {
        const depositData = await depositResponse.json()
        setState(prev => ({ ...prev, depositData: depositData.data }))
      }

      setState(prev => ({ ...prev, lastUpdate: new Date() }))
      logInfo('Admin data refreshed successfully')
      
    } catch (error) {
      logError('Failed to fetch admin data', error)
      toast.error('Failed to load admin data')
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const processWithdrawal = async (withdrawalId: string, status: 'approved' | 'rejected', adminNote?: string) => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.sessionToken}`
        },
        body: JSON.stringify({
          action: 'processWithdrawal',
          data: { withdrawalId, status, adminNote }
        })
      })
      
      if (response.ok) {
        toast.success(`Withdrawal ${status} successfully`)
        await fetchAllData()
        logInfo(`Withdrawal ${status}`, { withdrawalId, status })
      }
    } catch (error) {
      logError('Withdrawal processing error', error, { withdrawalId, status })
      toast.error('Failed to process withdrawal')
    }
  }

  const handleUserSelect = (user: any) => {
    logInfo('User selected for details', { userId: user.id })
  }

  const handleWalletAction = async (user: any, action: string, operation: string) => {
    logInfo('Wallet action initiated', { userId: user.id, action, operation })
  }

  // Login Form
  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full mx-4"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Access</h1>
              <p className="text-gray-400">WIN07Pro MongoDB Control Panel</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Admin Phone Number
              </label>
              <input
                type="tel"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                placeholder="Enter admin phone number"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && authenticate()}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                placeholder="Enter admin password"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={authenticate}
              disabled={state.loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 px-4 rounded-lg font-semibold"
            >
              {state.loading ? 'Authenticating...' : 'Access Admin Panel'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">WIN07Pro Admin</h1>
              <p className="text-gray-400">MongoDB-Powered Control Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Last Update</p>
              <p className="text-white font-mono text-sm">{state.lastUpdate.toLocaleString()}</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchAllData()}
              disabled={state.loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-2 rounded-lg"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800 border-b border-slate-700 px-6">
        <div className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'withdrawals', label: 'Withdrawals', icon: TrendingDown },
            { id: 'deposits', label: 'Deposits', icon: DollarSign },
            { id: 'activity', label: 'Game Activity', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setState(prev => ({ ...prev, activeTab: tab.id }))}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  state.activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-6">
        {/* Dashboard Tab */}
        {state.activeTab === 'dashboard' && state.adminData && (
          <DashboardStats adminData={state.adminData} />
        )}

        {/* Users Tab */}
        {state.activeTab === 'users' && state.adminData && (
          <UserManagement
            users={state.adminData.users}
            onUserSelect={handleUserSelect}
            onWalletAction={handleWalletAction}
            sessionToken={state.sessionToken}
          />
        )}

        {/* Withdrawals Tab */}
        {state.activeTab === 'withdrawals' && (
          <WithdrawalManagement
            withdrawalData={state.withdrawalData}
            onProcessWithdrawal={processWithdrawal}
            onRefresh={() => fetchAllData()}
          />
        )}

        {/* Deposits Tab */}
        {state.activeTab === 'deposits' && state.depositData && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              Recent Deposits
            </h3>
            <div className="space-y-3">
              {state.depositData.processed?.map((deposit: any) => (
                <div key={deposit.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <p className="text-white font-semibold">{deposit.userName}</p>
                    <p className="text-gray-400 text-sm">₹{deposit.amount.toLocaleString()}</p>
                    <p className="text-gray-400 text-xs">{new Date(deposit.timestamp).toLocaleString()}</p>
                  </div>
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                    {deposit.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game Activity Tab */}
        {state.activeTab === 'activity' && state.adminData && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-400" />
              Live Game Activity
            </h3>
            <div className="space-y-3">
              {state.adminData.gameActivity?.map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.outcome === 'win' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{activity.userName}</p>
                      <p className="text-gray-400 text-sm">{activity.game} • {new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      activity.outcome === 'win' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {activity.outcome === 'win' ? '+' : '-'}₹{Math.abs(activity.profit).toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm">Bet: ₹{activity.betAmount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
