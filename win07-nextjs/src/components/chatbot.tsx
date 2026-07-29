"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot,
  User,
  Minimize2,
  Maximize2,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm Luna, your AI assistant for WIN07! 🌟 I can help you with games, Admin Access, IND Coins, referrals, withdrawals, and any questions about our platform. How can I assist you today?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      // Call Anthropic API for AI response
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory: messages.slice(-5) // Send last 5 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: data.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)
      }, 1000)

    } catch (error) {
      console.error('Chatbot error:', error)
      setIsTyping(false)
      
      // Fallback response based on keywords
      const fallbackResponse = getFallbackResponse(inputMessage)
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: fallbackResponse,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      }, 1000)
    }
  }

  const getFallbackResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('admin access') || lowerMessage.includes('prediction')) {
             return "🎯 **Admin Access - Step by Step Guide**\n\n**What is it?**\nAI-powered game predictions to help you win more!\n\n**📋 Available Plans:**\n1. **Free Trial** - 15 min access, 5 predictions (FREE for new users!)\n2. **Basic** - 30 min access, 38 predictions (₹1,599)\n3. **Premium** - 45 min access, 56 predictions (₹1,699)  \n4. **Ultimate** - 5 hours access, 150 predictions (₹1,799)\n\n**🎁 Free Trial:**\nUse your 899 welcome coins to activate FREE trial!\n\n**💡 How it works:**\n1. Activate Free Trial or purchase a plan\n2. Start any game\n3. Receive golden notifications with predictions\n4. Follow AI guidance for better wins!\n\nWant details about a specific plan?"
    }
    
    if (lowerMessage.includes('ind coins') || lowerMessage.includes('coins')) {
      return "💰 **IND Coins - Complete Guide**\n\n**💡 What are IND Coins?**\nOur platform currency where 1 coin = ₹1\n\n**🎁 Welcome Bonus:**\nGet 899 IND Coins FREE when you sign up!\n\n**📦 Purchase Packages:**\n1. **Starter** - 1,599 coins (₹1,599)\n2. **Popular** - 1,699 coins (₹1,699)\n3. **Premium** - 1,799 coins (₹1,799)\n\n**💳 How to Buy:**\n1. Select a package\n2. Scan UPI QR code\n3. Complete payment in your UPI app\n4. Upload payment screenshot\n5. Coins added instantly!\n\n**🎮 Uses:**\n- Admin Access plans\n- Game betting\n- Premium features\n\nNeed help with the purchase process?"
    }
    
    if (lowerMessage.includes('withdrawal') || lowerMessage.includes('withdraw')) {
      return "💸 **Withdrawal System - Tier Based**\n\n**🏆 Your Tier Determines Limits:**\n\n**🥉 Basic (0-2 referrals):**\n- ₹30 per 24 hours\n- Minimum withdrawal: ₹30\n\n**🥈 Bronze (3-9 referrals):**\n- ₹100 × your referrals (max ₹1,000/day)\n- Example: 5 referrals = ₹500/day\n\n**🥇 Gold (10-119 referrals):**\n- ₹50,000 per 24 hours\n- High-tier benefits\n\n**💎 Grandmaster (120+ referrals):**\n- ₹20,00,000 per 24 hours\n- Ultimate withdrawal power!\n\n**⚡ Process:**\n1. Check your tier in dashboard\n2. Enter withdrawal amount\n3. Provide UPI details\n4. Get money within 24 hours\n\n**💡 Pro Tip:** Refer friends to upgrade your tier!"
    }
    
    if (lowerMessage.includes('referral') || lowerMessage.includes('refer')) {
      return "Our referral system has 4 tiers! 👥 Earn ₹30 cash + ₹100 bonus per referral. Bronze (3-9), Gold (10-119), Grandmaster (120+) unlock higher withdrawal limits. Share your referral code!"
    }
    
    if (lowerMessage.includes('game') || lowerMessage.includes('play')) {
      return "We have 15+ amazing games! 🎮 Aviator, Mines, Teen Patti, Andar Bahar, Roulette, and more. All games are AI-secured and fair. Which game interests you most?"
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('deposit')) {
      return "We accept UPI payments for instant deposits! 💳 Scan QR codes, pay via your UPI app, upload screenshot for verification. Usually processed within minutes. Having payment issues?"
    }
    
    if (lowerMessage.includes('security') || lowerMessage.includes('safe')) {
      return "WIN07 is completely secure! 🛡️ We use AI-powered fraud detection, SSL encryption, and are fully licensed. Your data and funds are always protected. Any specific security concerns?"
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
             return "I'm here to help 24/7! 🤖 You can also email support@win07pro.com for additional support. What specific issue can I assist you with?"
    }
    
    return "I'm Luna, your WIN07 assistant! 🌟 I can help with games, Admin Access, IND Coins, referrals, withdrawals, payments, and more. Could you please be more specific about what you need help with?"
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickActions = [
    "How does Admin Access work?",
    "How to buy IND Coins?",
    "Withdrawal limits explained",
    "Referral program guide",
    "Available games list"
  ]

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 md:p-4 rounded-full shadow-2xl"
          >
            <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-400 rounded-full animate-pulse"></div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                         className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl ${
               isMinimized ? 'w-60 md:w-64' : 'w-64 md:w-72'
             } max-w-[calc(100vw-2rem)] transition-all duration-300`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900"></div>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Luna AI</h3>
                  <p className="text-purple-300 text-xs">WIN07 Assistant • Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-gray-400 hover:text-white p-1 rounded"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white p-1 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                                     <div className="h-48 md:h-64 overflow-y-auto p-3 space-y-3">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.type === 'user' 
                              ? 'bg-blue-500' 
                              : 'bg-gradient-to-r from-purple-500 to-blue-500'
                          }`}>
                            {message.type === 'user' ? (
                              <User className="h-3 w-3 text-white" />
                            ) : (
                              <Bot className="h-3 w-3 text-white" />
                            )}
                          </div>
                                                     <div className={`p-2 rounded-lg ${
                             message.type === 'user'
                               ? 'bg-blue-500 text-white rounded-br-none'
                               : 'bg-slate-800 text-gray-300 rounded-bl-none'
                           }`}>
                             <div className="text-xs whitespace-pre-line">{message.content}</div>
                             <p className={`text-xs mt-1 ${
                               message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                             }`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="flex gap-2 max-w-[80%]">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                            <Bot className="h-3 w-3 text-white" />
                          </div>
                          <div className="bg-slate-800 p-3 rounded-xl rounded-bl-none">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Actions */}
                  {messages.length <= 1 && (
                    <div className="px-4 pb-4">
                      <p className="text-gray-400 text-xs mb-2">Quick questions:</p>
                      <div className="space-y-1">
                        {quickActions.slice(0, 3).map((action, index) => (
                          <button
                            key={index}
                            onClick={() => setInputMessage(action)}
                            className="block w-full text-left px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                                     {/* Input Area */}
                   <div className="p-3 border-t border-slate-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                                                 className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-xs focus:border-purple-500 focus:outline-none"
                        disabled={isTyping}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={isTyping || !inputMessage.trim()}
                                                 className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white p-1.5 rounded-lg transition-colors"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                                         <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                       <Sparkles className="h-2.5 w-2.5" />
                       win07pro.com
                     </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
