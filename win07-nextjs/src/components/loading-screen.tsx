"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Loading Spinner */}
        <motion.div
          className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Loading Text */}
        <motion.p
          className="text-white text-lg font-semibold"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        >
          {message}
        </motion.p>
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-1 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-purple-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Game Loading Screen
export function GameLoadingScreen({ gameName }: { gameName: string }) {
  return (
    <LoadingScreen message={`Loading ${gameName}...`} />
  )
}

// Game Starting Screen (when user clicks play)
export function GameStartingScreen({ gameName }: { gameName: string }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Loading Spinner */}
        <motion.div
          className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Loading Text */}
        <motion.p
          className="text-white text-xl font-bold mb-2"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
        >
          Starting {gameName}...
        </motion.p>
        
        <motion.p
          className="text-gray-400 text-sm"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        >
          Please wait while we set up your game
        </motion.p>
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-1 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Page Loading Screen  
export function PageLoadingScreen({ pageName }: { pageName: string }) {
  return (
    <LoadingScreen message={`Loading ${pageName}...`} />
  )
}