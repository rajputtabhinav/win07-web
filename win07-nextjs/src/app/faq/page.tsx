"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/header'
import { 
  HelpCircle, 
  ChevronDown, 
  Crown, 
  CreditCard, 
  Users, 
  Shield,
  Gamepad2,
  MessageCircle
} from 'lucide-react'

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('general')
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)

  const categories = [
    { id: 'general', label: 'General', icon: HelpCircle },
    { id: 'account', label: 'Account & Security', icon: Shield },
    { id: 'games', label: 'Games & Admin Access', icon: Crown },
    { id: 'payments', label: 'Payments & IND Coins', icon: CreditCard },
    { id: 'referrals', label: 'Referrals & Tiers', icon: Users },
    { id: 'technical', label: 'Technical Support', icon: Gamepad2 }
  ]

  const faqs = {
    general: [
      {
        question: "What is WIN07?",
        answer: "WIN07 is India's premier AI-secured gaming platform offering 15+ premium games including Aviator, Mines, Teen Patti, and more. We provide a safe, fair, and entertaining gaming experience with features like Admin Access, instant withdrawals, and a tier-based referral system."
      },
      {
        question: "Is WIN07 legal in India?",
        answer: "Yes, WIN07 operates as a skill-based gaming platform in compliance with Indian laws. We are a licensed and regulated gaming platform that emphasizes skill-based games and responsible gaming practices."
      },
      {
        question: "How do I get started on WIN07?",
        answer: "Simply sign up with your email or phone number, verify your account, and you'll receive 899 IND coins as a welcome bonus. You can then explore our games, participate in the referral program, and start your gaming journey!"
      },
      {
        question: "What makes WIN07 different from other gaming platforms?",
        answer: "WIN07 features AI-powered security, Admin Access for game insights, a unique tier-based referral system, instant UPI withdrawals, and our AI assistant Luna for 24/7 support. We focus on transparency, fairness, and user experience."
      }
    ],
    account: [
      {
        question: "How do I create an account?",
        answer: "Click 'Sign Up' on our homepage, enter your email/phone number, create a secure password, and verify your account through OTP. You must be 18+ years old to create an account."
      },
      {
        question: "How do I verify my account?",
        answer: "Account verification is done through OTP during registration. For higher withdrawal limits, you may need to provide ID verification documents which our AI system processes securely."
      },
      {
        question: "I forgot my password. How do I reset it?",
        answer: "Click 'Forgot Password' on the login page, enter your registered email/phone, and follow the instructions sent to you. You can also chat with Luna for immediate assistance."
      },
      {
        question: "Can I have multiple accounts?",
        answer: "No, each user is allowed only one account. Multiple accounts will result in permanent suspension of all associated accounts and forfeiture of any funds."
      }
    ],
    games: [
      {
        question: "What is Admin Access?",
        answer: "Admin Access is our premium AI-powered feature that provides game insights and predictions. It offers three tiers: Basic (30 min), Premium (45 min), and Ultimate (5 hours) with different numbers of predictions to help improve your gaming strategy."
      },
      {
        question: "How does Admin Access work?",
        answer: "Admin Access uses advanced AI to analyze game patterns and provide real-time notifications about optimal moves, exit points, and game insights. You get golden notifications with predictions during your gaming sessions."
      },
      {
        question: "Do I get a free trial of Admin Access?",
        answer: "Yes! New users receive 5 free Admin Access predictions with their 899 welcome IND coins. This lets you experience the premium features before purchasing a full plan."
      },
      {
        question: "Which games are available on WIN07?",
        answer: "We offer 15+ games including Aviator, Mines, Plinko, Wheel of Fortune, Teen Patti, Andar Bahar, Blackjack, Roulette, Baccarat, Limbo, and more. All games are AI-secured and provably fair."
      }
    ],
    payments: [
      {
        question: "What are IND Coins?",
        answer: "IND Coins are our platform currency where 1 IND Coin = ₹1. You can purchase IND Coins through UPI payments in packages of 1599, 1699, or 1799 coins to use for gaming and Admin Access."
      },
      {
        question: "How do I deposit money?",
        answer: "You can deposit money by purchasing IND Coins through UPI payment. Simply select a package, scan the QR code with your UPI app, complete the payment, and upload the payment screenshot for verification."
      },
      {
        question: "What are the withdrawal limits?",
        answer: "Withdrawal limits depend on your referral tier: Basic (₹30/day), Bronze (₹100 × referrals up to ₹1,000), Gold (₹50,000/day), and Grandmaster (₹20,00,000/day). Limits reset every 24 hours."
      },
      {
        question: "How long do withdrawals take?",
        answer: "Withdrawals are processed instantly to within 24 hours. Most UPI withdrawals are completed within minutes once approved by our AI security system."
      }
    ],
    referrals: [
      {
        question: "How does the referral program work?",
        answer: "Refer friends using your unique referral code. When they sign up and deposit ₹150+, you earn ₹30 cash + ₹100 bonus. Your referral tier (Basic, Bronze, Gold, Grandmaster) determines your withdrawal limits."
      },
      {
        question: "What are the referral tiers?",
        answer: "Basic (0-2 referrals), Bronze (3-9 referrals), Gold (10-119 referrals), and Grandmaster (120+ referrals). Each tier offers higher withdrawal limits and additional benefits."
      },
      {
        question: "How do I increase my referral tier?",
        answer: "Make successful referrals where referred users deposit at least ₹150. Each successful referral counts toward your tier advancement and unlocks higher withdrawal limits."
      },
      {
        question: "When do I receive referral rewards?",
        answer: "You receive referral rewards immediately when your referred friend makes their first qualifying deposit of ₹150 or more. Rewards are added to your cash and bonus balance automatically."
      }
    ],
    technical: [
      {
        question: "The game is not loading. What should I do?",
        answer: "Try refreshing the page, clearing your browser cache, or switching to a different browser. If the issue persists, chat with Luna or contact our support team for immediate assistance."
      },
      {
        question: "Can I play on mobile devices?",
        answer: "Yes! WIN07 is fully optimized for mobile devices. You can play all games on smartphones and tablets through your web browser with the same features as desktop."
      },
      {
        question: "My payment was deducted but IND Coins not added. What should I do?",
        answer: "Contact our support immediately with your transaction details. Our AI system usually processes payments instantly, but if there's an issue, our team will resolve it within 24 hours."
      },
      {
        question: "How do I contact customer support?",
        answer: "You can chat with Luna (our AI assistant) for instant help, email support@win07.com, call +91 99999 99999, or use the contact form. We provide 24/7 support for all your queries."
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <HelpCircle className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">FAQ & Help</h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Find answers to frequently asked questions about WIN07. Can't find what you're looking for? 
            Chat with Luna for instant help!
          </p>
        </motion.div>

        {/* Chat with Luna CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6 mb-8 text-center"
        >
          <MessageCircle className="h-8 w-8 text-purple-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Need Instant Help?</h3>
          <p className="text-gray-300 mb-4">
            Chat with Luna, our AI assistant, for immediate answers to your questions!
          </p>
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
            Chat with Luna 🤖
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sticky top-24">
              <h3 className="text-lg font-bold text-white mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id)
                      setActiveQuestion(null)
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
                        : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <category.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* FAQ Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="space-y-4">
              {faqs[activeCategory as keyof typeof faqs].map((faq, index) => (
                <div
                  key={index}
                  className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setActiveQuestion(activeQuestion === index ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                    <motion.div
                      animate={{ rotate: activeQuestion === index ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {activeQuestion === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">Still Need Help?</h3>
          <p className="text-gray-300 mb-6">
            Our support team is here 24/7 to help you with any questions or issues you may have.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <MessageCircle className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Live Chat</h4>
              <p className="text-sm text-gray-400">Chat with Luna for instant help</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <HelpCircle className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Email Support</h4>
              <p className="text-sm text-gray-400">support@win07.com</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <Shield className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Phone Support</h4>
              <p className="text-sm text-gray-400">+91 99999 99999</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
