"use client"

import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { 
  CreditCard, 
  Smartphone, 
  Banknote,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Coins,
  ArrowRight,
  QrCode,
  Building
} from 'lucide-react'

export default function PaymentMethodsPage() {
  const upiApps = [
    { name: 'PhonePe', logo: '📱', color: 'bg-purple-500' },
    { name: 'Google Pay', logo: '🔵', color: 'bg-blue-500' },
    { name: 'Paytm', logo: '💙', color: 'bg-blue-600' },
    { name: 'BHIM', logo: '🇮🇳', color: 'bg-orange-500' },
    { name: 'Amazon Pay', logo: '🟠', color: 'bg-orange-600' },
    { name: 'WhatsApp Pay', logo: '💚', color: 'bg-green-500' }
  ]

  const paymentMethods = [
    {
      icon: Smartphone,
      title: "UPI Payments",
      subtitle: "Recommended",
      description: "Instant, secure payments via UPI apps like PhonePe, Google Pay, Paytm",
      features: [
        "Instant deposits (within seconds)",
        "24/7 availability",
        "No additional charges",
        "Bank-level security"
      ],
      limits: "₹1 - ₹2,00,000 per transaction",
      processingTime: "Instant",
      supported: true,
      badge: "Most Popular"
    },
    {
      icon: QrCode,
      title: "QR Code Payments",
      subtitle: "Scan & Pay",
      description: "Scan QR codes to pay instantly through any UPI-enabled app",
      features: [
        "No app downloads needed",
        "Works with any UPI app",
        "Secure QR technology",
        "Auto-verification"
      ],
      limits: "₹1 - ₹2,00,000 per transaction",
      processingTime: "Instant",
      supported: true,
      badge: "Easiest"
    },
    {
      icon: Building,
      title: "Net Banking",
      subtitle: "Coming Soon",
      description: "Direct bank transfers from your savings or current account",
      features: [
        "Direct bank integration",
        "Higher transaction limits",
        "Multi-bank support",
        "OTP verification"
      ],
      limits: "₹1 - ₹5,00,000 per transaction",
      processingTime: "1-5 minutes",
      supported: false,
      badge: "Coming Soon"
    },
    {
      icon: CreditCard,
      title: "Debit/Credit Cards",
      subtitle: "Coming Soon",
      description: "Visa, Mastercard, and RuPay cards accepted",
      features: [
        "International cards accepted",
        "3D Secure protection",
        "Instant processing",
        "CVV verification"
      ],
      limits: "₹1 - ₹1,00,000 per transaction",
      processingTime: "Instant",
      supported: false,
      badge: "Coming Soon"
    }
  ]

  const steps = [
    {
      step: 1,
      title: "Select Package",
      description: "Choose your IND Coins package (1599, 1699, or 1799 coins)",
      icon: Coins
    },
    {
      step: 2,
      title: "Scan QR Code",
      description: "Use any UPI app to scan the payment QR code",
      icon: QrCode
    },
    {
      step: 3,
      title: "Complete Payment",
      description: "Enter UPI PIN and confirm the payment in your app",
      icon: Smartphone
    },
    {
      step: 4,
      title: "Upload Screenshot",
      description: "Take and upload a screenshot of successful payment",
      icon: CheckCircle
    }
  ]

  const securityFeatures = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "All payments are processed through secure banking channels"
    },
    {
      icon: CheckCircle,
      title: "Verified Transactions",
      description: "Every payment is verified using AI-powered fraud detection"
    },
    {
      icon: Clock,
      title: "Real-Time Processing",
      description: "Payments are processed and reflected instantly in your account"
    }
  ]

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
            <CreditCard className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Payment Methods</h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Safe, secure, and instant payment options for purchasing IND Coins and enjoying WIN07 games.
          </p>
        </motion.div>

        {/* UPI Apps Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 mb-12"
        >
          <h2 className="text-xl font-bold text-white mb-4 text-center">Supported UPI Apps</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {upiApps.map((app, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-slate-800/50 rounded-lg p-3 text-center"
              >
                <div className="text-2xl mb-2">{app.logo}</div>
                <p className="text-xs text-white font-medium">{app.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Payment Methods Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8 mb-12"
        >
          {paymentMethods.map((method, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: method.supported ? 1.02 : 1 }}
              className={`rounded-xl p-6 border ${
                method.supported 
                  ? 'bg-slate-800/30 border-slate-700' 
                  : 'bg-slate-800/10 border-slate-700/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    method.supported ? 'bg-purple-500/20' : 'bg-gray-500/20'
                  }`}>
                    <method.icon className={`h-6 w-6 ${
                      method.supported ? 'text-purple-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{method.title}</h3>
                    <p className={`text-sm ${
                      method.supported ? 'text-purple-400' : 'text-gray-500'
                    }`}>{method.subtitle}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  method.badge === 'Most Popular' ? 'bg-green-500/20 text-green-400' :
                  method.badge === 'Easiest' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {method.badge}
                </span>
              </div>
              
              <p className="text-gray-300 mb-4">{method.description}</p>
              
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Limits</p>
                    <p className="text-white font-medium">{method.limits}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Processing</p>
                    <p className="text-white font-medium">{method.processingTime}</p>
                  </div>
                </div>
              </div>
              
              <ul className="space-y-2">
                {method.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="text-gray-400 text-sm flex items-center gap-2">
                    <CheckCircle className={`h-3 w-3 ${
                      method.supported ? 'text-green-400' : 'text-gray-500'
                    }`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* How to Pay Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">How to Purchase IND Coins</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="mb-2">
                    <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs font-bold">
                      Step {step.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-purple-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Security & Trust</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 text-center"
              >
                <feature.icon className="h-8 w-8 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Important Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Payment Tips */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Payment Tips</h3>
            </div>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>Ensure you have sufficient balance in your UPI app</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>Double-check the payment amount before confirming</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>Take a clear screenshot of the successful payment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>Contact support if payment is not reflected within 1 hour</span>
              </li>
            </ul>
          </div>

          {/* Important Notice */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-400" />
              <h3 className="text-xl font-bold text-white">Important Notice</h3>
            </div>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>WIN07 never charges any processing fees for deposits</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>Only pay through official WIN07 QR codes or UPI IDs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>Never share your UPI PIN or OTP with anyone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>Report any suspicious activity to support immediately</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
