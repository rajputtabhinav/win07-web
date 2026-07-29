"use client"

import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { FileText, Shield, CreditCard, Users, Crown, AlertTriangle } from 'lucide-react'

export default function TermsOfServicePage() {
  const sections = [
    {
      title: "Account Terms",
      icon: Users,
      content: [
        "Age Requirement: Users must be 18 years or older to create an account and participate in gaming activities.",
        "One Account Per User: Each user is allowed only one account. Multiple accounts will result in account suspension.",
        "Account Security: Users are responsible for maintaining account security and keeping login credentials confidential.",
        "Accurate Information: All registration information must be accurate, complete, and kept up-to-date.",
        "Account Verification: We may require identity verification before allowing withdrawals or high-value transactions."
      ]
    },
    {
      title: "Gaming Rules",
      icon: Shield,
      content: [
        "Fair Play: All games must be played fairly without the use of bots, automated scripts, or cheating methods.",
        "Admin Access: Premium Admin Access features provide game insights but do not guarantee wins or manipulate game outcomes.",
        "Game Integrity: Our AI ensures all games are fair and random. Any attempt to exploit games will result in account termination.",
        "Betting Limits: Users must respect minimum and maximum betting limits as specified for each game.",
        "Game Availability: Games may be temporarily unavailable for maintenance or updates without prior notice."
      ]
    },
    {
      title: "Financial Terms",
      icon: CreditCard,
      content: [
        "IND Coins: 1 IND Coin equals ₹1. IND Coins can be purchased through approved payment methods only.",
        "Deposits: All deposits are processed through secure UPI payments. Deposits are typically instant but may take up to 24 hours.",
        "Withdrawals: Withdrawal limits are based on referral tiers (Basic: ₹30, Bronze: ₹100×referrals, Gold: ₹50,000, Grandmaster: ₹20,00,000).",
        "Processing Fees: We don't charge fees for deposits or withdrawals, but payment gateway fees may apply.",
        "Refunds: Deposits are generally non-refundable except in cases of technical errors or fraud."
      ]
    },
    {
      title: "Referral Program",
      icon: Crown,
      content: [
        "Referral Rewards: Earn ₹30 cash + ₹100 bonus for each successful referral who deposits minimum ₹150.",
        "Tier System: Withdrawal limits increase with successful referrals: Basic (0-2), Bronze (3-9), Gold (10-119), Grandmaster (120+).",
        "Referral Tracking: Only verified users who make qualifying deposits count as successful referrals.",
        "Abuse Prevention: Fake referrals, self-referrals, or coordinated referral schemes will result in account suspension.",
        "Referral Limits: There are no limits on the number of people you can refer to WIN07."
      ]
    },
    {
      title: "Prohibited Activities",
      icon: AlertTriangle,
      content: [
        "Fraudulent Activities: Any form of fraud, money laundering, or illegal financial activities is strictly prohibited.",
        "Multiple Accounts: Creating multiple accounts to exploit bonuses or referral programs will result in permanent ban.",
        "Underage Gaming: Users under 18 years are strictly prohibited from using our platform.",
        "Technical Exploitation: Attempting to exploit technical vulnerabilities or game mechanics is forbidden.",
        "Harassment: Abusive behavior towards other users or support staff will not be tolerated."
      ]
    },
    {
      title: "Liability & Disclaimers",
      icon: FileText,
      content: [
        "Service Availability: WIN07 is provided 'as is' and we don't guarantee 100% uptime or uninterrupted service.",
        "Gaming Risks: Users acknowledge that gaming involves risk and we are not responsible for gambling losses.",
        "Third-Party Services: We are not liable for issues with third-party payment processors or external services.",
        "Technical Issues: We are not responsible for losses due to technical failures, internet connectivity issues, or device problems.",
        "Legal Compliance: Users are responsible for ensuring their gaming activities comply with local laws and regulations."
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <FileText className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Terms of Service</h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Please read these terms carefully before using WIN07. By accessing our platform, you agree to be bound by these terms.
          </p>
          <div className="mt-4 text-sm text-gray-400">
            <span>Last updated: January 2024</span>
          </div>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Agreement to Terms</h2>
          <p className="text-gray-300 leading-relaxed">
            These Terms of Service ("Terms") govern your use of WIN07's gaming platform, including all games, features, 
            Admin Access, IND Coins system, referral program, and related services. By creating an account or using our 
            services, you agree to comply with and be bound by these Terms. If you do not agree with any part of these 
            terms, you must not use our platform.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <section.icon className="h-6 w-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">{section.title}</h3>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-gray-300 leading-relaxed flex items-start gap-3">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Important Notices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 space-y-6"
        >
          {/* Responsible Gaming */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Responsible Gaming</h3>
            <p className="text-gray-300 leading-relaxed">
              WIN07 is committed to promoting responsible gaming. We provide tools for setting deposit limits, 
              self-exclusion options, and resources for users who may need help with gambling-related issues. 
              If you feel you have a gambling problem, please seek help from professional organizations or 
              contact our support team for assistance.
            </p>
          </div>

          {/* Updates to Terms */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Changes to Terms</h3>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. Significant changes will be communicated 
              through email notifications or platform announcements. Continued use of WIN07 after changes 
              constitutes acceptance of the new Terms. We recommend reviewing these Terms periodically.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Contact & Support</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              For questions about these Terms or any issues with our services, please contact us:
            </p>
            <div className="space-y-2 text-gray-300">
              <p><strong>Email:</strong> legal@win07.com</p>
              <p><strong>Support:</strong> support@win07.com</p>
              <p><strong>Phone:</strong> +91 99999 99999</p>
              <p><strong>AI Assistant:</strong> Chat with Luna for instant support</p>
            </div>
          </div>
        </motion.div>

        {/* Final Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <p className="text-red-300 text-sm">
            <strong>Legal Notice:</strong> These Terms are governed by Indian law. Any disputes will be resolved 
            through arbitration in Mumbai, Maharashtra. By using WIN07, you agree to these jurisdiction terms and 
            waive your right to jury trial for any disputes arising from your use of our platform.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
