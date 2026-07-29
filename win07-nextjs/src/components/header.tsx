"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SignInButton, SignUpButton, useUser, UserButton } from '@clerk/nextjs'
import { Menu, X, Gamepad2, Wallet, Trophy, Users, Settings, Crown, Plus } from 'lucide-react'
import Link from 'next/link'
import { IndCoins } from './ind-coins'
import { useWallet } from '@/contexts/wallet-context'

export function Header() {
  const { isSignedIn, user } = useUser()
  const wallet = useWallet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showAdminAccess, setShowAdminAccess] = useState(false)

  const navigation = [
    { name: 'Games', href: '/games', icon: Gamepad2 },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Referrals', href: '/referrals', icon: Users },
  ]

  return (
    <header className="relative z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-3 lg:px-6">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">W7</span>
              </div>
              <span className="text-lg font-bold text-white">WIN07</span>
            </motion.div>
          </Link>
        </div>

        {/* Mobile header - IND Coins + Menu */}
        <div className="flex lg:hidden items-center gap-2">
          {isSignedIn && (
            <div className="flex items-center">
              <IndCoins showInHeader={true} />
            </div>
          )}
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-300"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-1 text-xs font-semibold leading-6 text-gray-300 hover:text-white transition-colors"
            >
              <item.icon className="h-3 w-3" />
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <IndCoins showInHeader={true} />
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/20 transition-all duration-200"
                >
                  <Wallet className="h-3 w-3" />
                  Dashboard
                </motion.button>
              </Link>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </div>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="text-sm font-semibold leading-6 text-gray-300 hover:text-white transition-colors">
                  Log in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                >
                  Sign up
                </motion.button>
              </SignUpButton>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden"
          >
            <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-slate-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10"
            >
              <div className="flex items-center justify-between">
                <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">W7</span>
                    </div>
                    <span className="text-xl font-bold text-white">WIN07</span>
                  </div>
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-300 hover:bg-gray-50/10 hover:text-white transition-colors"
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  
                  <div className="py-6">
                    {isSignedIn ? (
                      <div className="space-y-4">
                        <Link
                          href="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="-mx-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-white bg-gradient-to-r from-purple-500 to-blue-500"
                        >
                          <Wallet className="h-4 w-4" />
                          Dashboard
                        </Link>
                        {/* Mobile IND Coins Display */}
                        <div className="px-3 mb-4">
                          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-semibold text-sm">💰 IND Coins</span>
                              <span className="text-yellow-400 font-bold text-lg">
                                {wallet.indCoins.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setShowAdminAccess(true)
                                  setMobileMenuOpen(false)
                                }}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                                  wallet.hasAdminAccess() 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-purple-600 text-white'
                                }`}
                              >
                                <Crown className="h-3 w-3" />
                                {wallet.hasAdminAccess() ? 'Active' : 'Get Admin'}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setShowBuyModal(true)
                                  setMobileMenuOpen(false)
                                }}
                                className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 rounded text-xs font-semibold"
                              >
                                <Plus className="h-3 w-3" />
                                Buy More
                              </motion.button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 px-3">
                          <UserButton 
                            appearance={{
                              elements: {
                                avatarBox: "w-8 h-8"
                              }
                            }}
                          />
                          <span className="text-white text-sm">
                            {user?.firstName || 'Player'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <SignInButton mode="modal">
                          <button className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-300 hover:bg-gray-50/10 hover:text-white transition-colors w-full text-left">
                            Log in
                          </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <button className="-mx-3 block rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-white bg-gradient-to-r from-purple-500 to-blue-500 w-full text-left">
                            Sign up
                          </button>
                        </SignUpButton>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}