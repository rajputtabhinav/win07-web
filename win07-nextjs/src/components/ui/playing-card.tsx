"use client"

import React from 'react'
import { motion } from 'framer-motion'

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  value: string
  numericValue: number
}

interface PlayingCardProps {
  card?: Card
  hidden?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
  animate?: boolean
}

const SUITS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
}

const SUIT_COLORS = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-black',
  spades: 'text-black'
}

const CARD_SIZES = {
  small: 'w-12 h-16 text-xs',
  medium: 'w-16 h-24 text-lg',
  large: 'w-20 h-28 text-xl'
}

export function createCard(numericValue: number, suitIndex?: number): Card {
  const suits: Array<keyof typeof SUITS> = ['hearts', 'diamonds', 'clubs', 'spades']
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  
  const suit = suits[suitIndex ?? Math.floor(Math.random() * 4)]
  const value = values[(numericValue - 1) % 13]
  
  return {
    suit,
    value,
    numericValue
  }
}

export function PlayingCard({ 
  card, 
  hidden = false, 
  size = 'medium', 
  className = '', 
  animate = true 
}: PlayingCardProps) {
  const cardElement = (
    <div className={`
      ${CARD_SIZES[size]} 
      ${className}
      bg-white rounded-lg shadow-lg border-2 border-gray-300 
      flex flex-col items-center justify-between p-1
      relative overflow-hidden
    `}>
      {hidden ? (
        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white rounded-full opacity-50"></div>
        </div>
      ) : card ? (
        <>
          {/* Top left corner */}
          <div className={`${SUIT_COLORS[card.suit]} font-bold flex flex-col items-center leading-none`}>
            <div>{card.value}</div>
            <div className="text-sm">{SUITS[card.suit]}</div>
          </div>
          
          {/* Center suit symbol */}
          <div className={`${SUIT_COLORS[card.suit]} text-2xl font-bold`}>
            {SUITS[card.suit]}
          </div>
          
          {/* Bottom right corner (rotated) */}
          <div className={`${SUIT_COLORS[card.suit]} font-bold flex flex-col items-center leading-none rotate-180`}>
            <div>{card.value}</div>
            <div className="text-sm">{SUITS[card.suit]}</div>
          </div>
          
          {/* Card pattern for face cards */}
          {['J', 'Q', 'K'].includes(card.value) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`${SUIT_COLORS[card.suit]} text-4xl opacity-20`}>
                {card.value}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
          <div className="text-gray-400">?</div>
        </div>
      )}
    </div>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ rotateY: 180, scale: 0.8, opacity: 0 }}
        animate={{ rotateY: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
      >
        {cardElement}
      </motion.div>
    )
  }

  return cardElement
}

export default PlayingCard
