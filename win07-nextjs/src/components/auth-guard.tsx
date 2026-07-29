"use client"

import { useUser, SignInButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Gamepad2, Lock } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  gameName?: string
}

export function AuthGuard({ children, gameName = "this game" }: AuthGuardProps) {
  const { user, isSignedIn, isLoaded } = useUser()

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Show sign-in prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-center justify-center min-h-screen p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center max-w-md w-full"
          >
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Lock className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
              <p className="text-gray-300 mb-6">
                Please sign in to play {gameName} and access all WIN07 gaming features
              </p>
            </div>

            <div className="space-y-4">
              <SignInButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Gamepad2 className="h-5 w-5" />
                  Sign In to Play
                </motion.button>
              </SignInButton>

              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">New to WIN07?</p>
                <SignInButton mode="modal">
                  <button className="text-purple-400 hover:text-purple-300 font-semibold text-sm transition-colors">
                    Create Account - It's Free!
                  </button>
                </SignInButton>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Secure Login
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Instant Access
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  15+ Games
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // User is authenticated, render the protected content
  return <>{children}</>
}
