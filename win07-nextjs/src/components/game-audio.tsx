"use client"

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { motion } from 'framer-motion'

interface GameAudioProps {
  gameType: 'aviator' | 'crash' | 'mines' | 'plinko' | 'geometry-dash' | 'casino' | 'cards'
  isPlaying?: boolean
  volume?: number
  autoPlay?: boolean
}

// Copyright-free background music URLs (you can replace with actual files)
const BACKGROUND_MUSIC = {
  aviator: '/audio/aviator-bg.mp3', // High-energy electronic music
  crash: '/audio/crash-bg.mp3', // Intense techno beats
  mines: '/audio/mines-bg.mp3', // Suspenseful ambient music
  plinko: '/audio/plinko-bg.mp3', // Upbeat casual music
  'geometry-dash': '/audio/geometry-dash-bg.mp3', // Fast-paced electronic music
  casino: '/audio/casino-bg.mp3', // Classic casino ambience
  cards: '/audio/cards-bg.mp3', // Sophisticated jazz music
}

const SOUND_EFFECTS = {
  win: '/audio/win.mp3',
  lose: '/audio/lose.mp3',
  bet: '/audio/bet.mp3',
  cashout: '/audio/cashout.mp3',
  click: '/audio/click.mp3',
  jump: '/audio/jump.mp3',
  explosion: '/audio/explosion.mp3',
  coin: '/audio/coin.mp3',
}

export function GameAudio({ gameType, isPlaying = false, volume = 0.3, autoPlay = true }: GameAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [currentVolume, setCurrentVolume] = useState(volume)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleCanPlay = () => setIsLoaded(true)
    const handleError = () => console.log(`Audio failed to load for ${gameType}`)

    audio.addEventListener('canplaythrough', handleCanPlay)
    audio.addEventListener('error', handleError)

    // Set initial volume
    audio.volume = isMuted ? 0 : currentVolume

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay)
      audio.removeEventListener('error', handleError)
    }
  }, [gameType, currentVolume, isMuted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !isLoaded) return

    if (isPlaying && autoPlay && !isMuted) {
      audio.play().catch(() => {
        // Autoplay failed, user interaction required
        console.log('Autoplay prevented. User interaction required.')
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, autoPlay, isMuted, isLoaded])

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : currentVolume
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setCurrentVolume(newVolume)
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume
    }
  }

  return (
    <>
      {/* Background Music */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src={BACKGROUND_MUSIC[gameType]}
      />

      {/* Audio Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-4 right-4 z-50"
      >
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3">
          {/* Mute Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleMute}
            className="text-white hover:text-yellow-400 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </motion.button>

          {/* Volume Slider */}
          {!isMuted && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={currentVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${currentVolume * 100}%, #4B5563 ${currentVolume * 100}%, #4B5563 100%)`
              }}
            />
          )}

          {/* Game Type Indicator */}
          <div className="text-xs text-gray-400 capitalize">
            {gameType.replace('-', ' ')}
          </div>
        </div>
      </motion.div>
    </>
  )
}

// Sound Effects Hook
export function useSoundEffects() {
  const playSound = (effect: keyof typeof SOUND_EFFECTS, volume = 0.5) => {
    const audio = new Audio(SOUND_EFFECTS[effect])
    audio.volume = volume
    audio.play().catch(() => {
      // Sound play failed, ignore silently
    })
  }

  return { playSound }
}

// Audio Context for better performance
export function AudioProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize audio context on user interaction
    const initAudio = () => {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContext) {
        const context = new AudioContext()
        if (context.state === 'suspended') {
          context.resume()
        }
      }
    }

    document.addEventListener('click', initAudio, { once: true })
    document.addEventListener('touchstart', initAudio, { once: true })

    return () => {
      document.removeEventListener('click', initAudio)
      document.removeEventListener('touchstart', initAudio)
    }
  }, [])

  return <>{children}</>
}
