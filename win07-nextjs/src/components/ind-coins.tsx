"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Coins, 
  X, 
  Plus,
  Info,
  CreditCard,
  AlertCircle,
  Crown,
  Zap,
  Clock,
  Target
} from 'lucide-react'
import { useWallet } from '@/contexts/wallet-context'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface IndCoinsProps {
  showInHeader?: boolean
}

export function IndCoins({ showInHeader = false }: IndCoinsProps) {
  const wallet = useWallet()
  const router = useRouter()
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(1599)
  const [showAdminAccess, setShowAdminAccess] = useState(false)

  // Fixed coin packages
  const coinPackages = [
    { coins: 1599, price: 1599 },
    { coins: 1699, price: 1699 },
    { coins: 1799, price: 1799 }
  ]

  // Admin Access plans
  const adminPlans = [
    {
      name: 'Free Trial',
      plan: 'trial' as const,
      cost: 899,
      duration: '15 min',
      notifications: 5,
      description: 'Perfect for new users to try',
      color: 'from-green-500 to-emerald-500',
      isFree: true
    },
    {
      name: 'Basic',
      plan: 'basic' as const,
      cost: 1599,
      duration: '30 min',
      notifications: 38,
      description: 'Perfect for quick wins',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Premium',
      plan: 'premium' as const,
      cost: 1699,
      duration: '45 min',
      notifications: 56,
      description: 'Extended gaming sessions',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Ultimate',
      plan: 'ultimate' as const,
      cost: 1799,
      duration: '5 hours',
      notifications: 150,
      description: 'Maximum dominance',
      color: 'from-yellow-400 to-orange-500',
      popular: true
    }
  ]

  const handleBuyCoins = () => {
    // Always redirect to UPI payment page for IND coins purchase
    toast.info('Redirecting to payment page...')
    // Set the amount in localStorage so the deposit modal can pick it up
    localStorage.setItem('indCoinsPackage', JSON.stringify({
      coins: selectedPackage,
      price: selectedPackage
    }))
    router.push('/dashboard?tab=deposit&indcoins=true')
    setShowBuyModal(false)
  }

  const handleDirectDeposit = () => {
    router.push('/dashboard?tab=deposit&indcoins=true')
    setShowBuyModal(false)
  }

  const handlePurchaseAdminAccess = (plan: 'basic' | 'premium' | 'ultimate') => {
    if (wallet.purchaseAdminAccess(plan)) {
      setShowAdminAccess(false)
    }
  }

  if (showInHeader) {
    return (
      <>
        <div className="flex items-center gap-2">
          {/* IND Coins Display - Enhanced for Mobile */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/25 to-orange-500/25 border border-yellow-500/40 rounded-lg px-2.5 py-1.5 shadow-lg"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Coins className="h-4 w-4 text-yellow-400" />
            </motion.div>
            <span className="text-yellow-400 font-bold text-sm">
              {wallet.indCoins.toLocaleString()}
            </span>
            <span className="text-yellow-400/80 text-xs font-medium">IND</span>
          </motion.div>

          {/* Admin Access Button - Enhanced */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdminAccess(true)}
            className={`relative p-1.5 rounded-lg transition-all duration-200 ${
              wallet.hasAdminAccess() 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/25' 
                : 'bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg shadow-purple-500/25'
            }`}
          >
            <Crown className="h-3 w-3 text-white" />
            {wallet.hasAdminAccess() ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"
              />
            ) : (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"
              />
            )}
          </motion.button>

          {/* Buy Button - Enhanced */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBuyModal(true)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white p-1.5 rounded-lg transition-all duration-200 shadow-lg shadow-yellow-500/25"
          >
            <Plus className="h-3 w-3" />
          </motion.button>
        </div>

        {/* Buy Modal */}
        <AnimatePresence>
          {showBuyModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-xl max-w-xs w-full max-h-[80vh] overflow-y-auto p-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                      <Coins className="h-4 w-4 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-yellow-400 font-bold text-sm">Buy IND Coins</h3>
                      <p className="text-gray-400 text-xs">For Admin Access</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBuyModal(false)}
                    className="p-1 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Package Selection */}
                <div className="space-y-2 mb-4">
                  {coinPackages.map((pkg) => (
                    <motion.button
                      key={pkg.coins}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedPackage(pkg.coins)}
                      className={`w-full p-2 rounded-lg border text-left transition-all ${
                        selectedPackage === pkg.coins
                          ? 'border-yellow-500 bg-yellow-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold text-sm">{pkg.coins} IND</span>
                        <span className="text-yellow-400 text-sm">₹{pkg.price}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Info */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-300 text-xs">
                      IND coins can only be purchased with deposited money for Admin Access plans.
                    </p>
                  </div>
                </div>

                {/* Purchase Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyCoins}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1"
                >
                  <CreditCard className="h-3 w-3" />
                  Pay via UPI
                </motion.button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Admin Access Modal */}
        <AnimatePresence>
          {showAdminAccess && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                      <Crown className="h-5 w-5 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-yellow-400 font-bold text-lg">Admin Access</h3>
                      <p className="text-gray-400 text-xs">Premium AI predictions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAdminAccess(false)}
                    className="p-1 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Current Status */}
                {wallet.hasAdminAccess() && (
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 font-semibold text-sm">ACTIVE - {wallet.adminAccess.plan.toUpperCase()}</span>
                    </div>
                    <p className="text-white text-sm">
                      {wallet.adminAccess.notificationsRemaining} notifications remaining
                    </p>
                    {wallet.adminAccess.expiresAt && (
                      <p className="text-gray-300 text-xs">
                        Expires: {new Date(wallet.adminAccess.expiresAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Trial Status */}
                {wallet.adminAccess.plan === 'trial' && (
                  <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 font-semibold text-sm">FREE TRIAL ACTIVE</span>
                    </div>
                    <p className="text-white text-sm">
                      {wallet.adminAccess.notificationsRemaining} free notifications remaining
                    </p>
                    <p className="text-gray-300 text-xs">
                      Upgrade for unlimited access & longer durations
                    </p>
                  </div>
                )}

                {/* Plans */}
                <div className="space-y-3">
                  {adminPlans.map((plan) => (
                    <motion.div
                      key={plan.plan}
                      whileHover={{ scale: 1.02 }}
                      className={`relative bg-gradient-to-r ${plan.color} p-0.5 rounded-lg ${plan.popular ? 'ring-2 ring-yellow-400' : ''} ${plan.isFree ? 'ring-2 ring-green-400' : ''}`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
                          MOST POPULAR
                        </div>
                      )}
                      {plan.isFree && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
                          FREE FOR NEW USERS
                        </div>
                      )}
                      
                      <div className="bg-slate-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-bold text-sm">{plan.name}</h4>
                          <div className="text-right">
                            {plan.isFree ? (
                              <>
                                <p className="text-green-400 font-bold text-sm">FREE</p>
                                <p className="text-gray-400 text-xs">{plan.cost} coins</p>
                              </>
                            ) : (
                              <>
                                <p className="text-yellow-400 font-bold text-sm">{plan.cost} IND</p>
                                <p className="text-gray-400 text-xs">coins</p>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-xs mb-3">{plan.description}</p>
                        
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-300 text-xs">{plan.duration} duration</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-300 text-xs">{plan.notifications} notifications</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="h-3 w-3 text-green-400" />
                            <span className="text-green-400 text-xs">Premium insights</span>
                          </div>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePurchaseAdminAccess(plan.plan)}
                          disabled={!plan.isFree && wallet.indCoins < plan.cost}
                          className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
                            plan.isFree || wallet.indCoins >= plan.cost
                              ? `bg-gradient-to-r ${plan.color} hover:brightness-110 text-white`
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {plan.isFree ? 'Activate Free Trial' : (wallet.indCoins >= plan.cost ? 'Purchase' : 'Insufficient Coins')}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Info */}
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-white text-xs font-medium mb-1">How Admin Access Works</p>
                      <ul className="text-gray-400 text-xs space-y-1">
                        <li>• Get real-time game predictions</li>
                        <li>• Know optimal exit points</li>
                        <li>• Premium AI insights</li>
                        <li>• Premium golden notifications</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Dashboard version (existing component)  
  return (
    <div className="space-y-4">
      {/* Admin Access Section */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-400" />
            <h3 className="text-white font-bold text-lg">Admin Access</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdminAccess(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
          >
            {wallet.hasAdminAccess() ? 'Upgrade' : 'Activate'}
          </motion.button>
        </div>
        
        {wallet.hasAdminAccess() ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-green-400 font-semibold text-sm">
                {wallet.adminAccess.plan.toUpperCase()} PLAN ACTIVE
              </span>
              <span className="text-yellow-400 text-sm">
                {wallet.adminAccess.notificationsRemaining} notifications left
              </span>
            </div>
            {wallet.adminAccess.expiresAt && (
              <p className="text-gray-400 text-xs">
                Expires: {new Date(wallet.adminAccess.expiresAt).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">
            Premium AI-powered game predictions
          </p>
        )}
      </div>

      {/* Admin Access Modal for Dashboard */}
      <AnimatePresence>
        {showAdminAccess && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-4"
            >
              {/* Same content as header version */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                    <Crown className="h-5 w-5 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-yellow-400 font-bold text-lg">Admin Access</h3>
                    <p className="text-gray-400 text-xs">Unlock 95% win rates</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdminAccess(false)}
                  className="p-1 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Plans */}
              <div className="space-y-3">
                {adminPlans.map((plan) => (
                  <motion.div
                    key={plan.plan}
                    whileHover={{ scale: 1.02 }}
                    className={`relative bg-gradient-to-r ${plan.color} p-0.5 rounded-lg ${plan.popular ? 'ring-2 ring-yellow-400' : ''} ${plan.isFree ? 'ring-2 ring-green-400' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
                        MOST POPULAR
                      </div>
                    )}
                    {plan.isFree && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
                        FREE FOR NEW USERS
                      </div>
                    )}
                    
                    <div className="bg-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-bold text-sm">{plan.name}</h4>
                        <div className="text-right">
                          {plan.isFree ? (
                            <>
                              <p className="text-green-400 font-bold text-sm">FREE</p>
                              <p className="text-gray-400 text-xs">{plan.cost} coins</p>
                            </>
                          ) : (
                            <>
                              <p className="text-yellow-400 font-bold text-sm">{plan.cost} IND</p>
                              <p className="text-gray-400 text-xs">coins</p>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePurchaseAdminAccess(plan.plan)}
                        disabled={!plan.isFree && wallet.indCoins < plan.cost}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          plan.isFree || wallet.indCoins >= plan.cost
                            ? `bg-gradient-to-r ${plan.color} hover:brightness-110 text-white`
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {plan.isFree ? 'Activate Free Trial' : (wallet.indCoins >= plan.cost ? 'Purchase' : 'Insufficient Coins')}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
