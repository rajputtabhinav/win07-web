"use client"

import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Shield, Lock, Eye, Users, CreditCard, Clock } from 'lucide-react'

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "Information We Collect",
      icon: Users,
      content: [
        "Personal Information: Name, email address, phone number, and date of birth for account verification and age confirmation.",
        "Financial Information: UPI IDs, transaction history, and payment preferences for secure financial transactions.",
        "Gaming Data: Game preferences, playing patterns, win/loss records, and Admin Access usage for personalized experience.",
        "Device Information: IP address, device type, browser information, and location data for security and fraud prevention.",
        "Communication Data: Support tickets, chat logs, and feedback to improve our services and resolve issues."
      ]
    },
    {
      title: "How We Use Your Information",
      icon: Shield,
      content: [
        "Account Management: Creating and maintaining your gaming account, processing transactions, and providing customer support.",
        "Game Operations: Enabling gameplay, tracking statistics, providing Admin Access features, and ensuring fair gaming.",
        "Security & Fraud Prevention: Monitoring for suspicious activities, preventing fraud, and maintaining platform integrity.",
        "Personalization: Customizing your gaming experience, recommending games, and providing relevant promotions.",
        "Legal Compliance: Meeting regulatory requirements, resolving disputes, and cooperating with law enforcement when required."
      ]
    },
    {
      title: "Information Sharing",
      icon: Eye,
      content: [
        "Service Providers: We share necessary information with payment processors, verification services, and technical support providers.",
        "Legal Requirements: Information may be disclosed to comply with legal obligations, court orders, or government requests.",
        "Business Transfers: In case of merger, acquisition, or sale, user information may be transferred as part of business assets.",
        "Consent-Based Sharing: We may share information with your explicit consent for specific purposes like referral programs.",
        "No Sale of Data: We never sell your personal information to third parties for marketing or advertising purposes."
      ]
    },
    {
      title: "Data Security",
      icon: Lock,
      content: [
        "Encryption: All data transmission is protected using SSL/TLS encryption and stored using AES-256 encryption standards.",
        "AI Security: Our advanced AI monitors all transactions and activities in real-time to detect and prevent fraud.",
        "Access Controls: Multi-factor authentication and role-based access ensure only authorized personnel can access data.",
        "Regular Audits: We conduct periodic security audits and penetration testing to identify and fix vulnerabilities.",
        "Compliance: We maintain compliance with industry standards including PCI DSS for payment data protection."
      ]
    },
    {
      title: "Your Rights",
      icon: CreditCard,
      content: [
        "Access: You can request a copy of all personal information we hold about you at any time.",
        "Correction: You have the right to correct any inaccurate or incomplete personal information.",
        "Deletion: You can request deletion of your account and associated data, subject to legal retention requirements.",
        "Portability: You can request your data in a portable format to transfer to another service provider.",
        "Opt-Out: You can opt out of marketing communications while continuing to receive essential service notifications."
      ]
    },
    {
      title: "Data Retention",
      icon: Clock,
      content: [
        "Active Accounts: We retain your information as long as your account remains active and you continue using our services.",
        "Inactive Accounts: Accounts inactive for 2+ years may be archived, with personal data anonymized after 5 years.",
        "Transaction Records: Financial transaction data is retained for 7 years to comply with legal and regulatory requirements.",
        "Support Data: Customer support interactions are retained for 3 years to maintain service quality and resolve issues.",
        "Legal Requirements: Some data may be retained longer if required by law, regulation, or ongoing legal proceedings."
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
            <Shield className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Your privacy is our priority. Learn how WIN07 collects, uses, and protects your personal information.
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
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to WIN07</h2>
          <p className="text-gray-300 leading-relaxed">
            At WIN07, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, share, and protect your information when you use our gaming platform, 
            including our AI-secured features, Admin Access, IND Coins system, and all related services. By using WIN07, 
            you agree to the practices described in this policy.
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

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Contact Us About Privacy</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            If you have any questions about this Privacy Policy, your personal information, or how we handle your data, 
            please don't hesitate to contact us:
          </p>
          <div className="space-y-2 text-gray-300">
            <p><strong>Email:</strong> privacy@win07.com</p>
            <p><strong>Phone:</strong> +91 99999 99999</p>
            <p><strong>Address:</strong> WIN07 Gaming Pvt. Ltd., Mumbai, Maharashtra, India</p>
            <p><strong>AI Assistant:</strong> Chat with Luna for instant privacy-related queries</p>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
        >
          <p className="text-yellow-300 text-sm">
            <strong>Important:</strong> This Privacy Policy may be updated periodically to reflect changes in our practices 
            or legal requirements. We will notify users of significant changes through email or platform notifications. 
            Continued use of WIN07 after changes indicates acceptance of the updated policy.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
