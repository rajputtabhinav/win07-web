"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Mail, 
  MapPin, 
  Gamepad2,
  Shield,
  Crown,
  Users,
  CreditCard,
  HeadphonesIcon
} from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-1 lg:col-span-1"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
                <Gamepad2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">WIN07</span>
            </div>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              India's premier AI-secured gaming platform. Experience the thrill of 15+ premium games with instant withdrawals, referral rewards, and 24/7 support. Join millions of players worldwide!
            </p>
            <div className="text-xs text-gray-400 mt-4">
              <p>Trusted by millions • Secure platform • 24/7 available</p>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/games', label: 'Games' },
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/referrals', label: 'Referrals' },
                { href: '/leaderboard', label: 'Leaderboard' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' }
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal & Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-white font-semibold text-lg mb-4">Legal & Support</h3>
            <ul className="space-y-2">
              {[
                { href: '/privacy-policy', label: 'Privacy Policy', icon: Shield },
                { href: '/terms-of-service', label: 'Terms of Service', icon: Shield },
                { href: '/responsible-gaming', label: 'Responsible Gaming', icon: Users },
                { href: '/faq', label: 'FAQ & Help', icon: HeadphonesIcon },
                { href: '/payment-methods', label: 'Payment Methods', icon: CreditCard }
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <link.icon className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="h-4 w-4 text-purple-400" />
                <a href="mailto:support@win07pro.com" className="hover:text-purple-400 transition-colors">
                  support@win07pro.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <HeadphonesIcon className="h-4 w-4 text-purple-400" />
                <span>24/7 Live Chat Support Available</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <MapPin className="h-4 w-4 text-purple-400" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>

            {/* Features Highlight */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-xs text-green-400">
                <Crown className="h-3 w-3" />
                <span>Admin Access Available</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-400">
                <CreditCard className="h-3 w-3" />
                <span>Instant UPI Withdrawals</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-orange-400">
                <Users className="h-3 w-3" />
                <span>5M+ Active Players</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="border-t border-slate-700 py-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm text-center md:text-left">
              <p>© {currentYear} WIN07. All rights reserved.</p>
              <p className="text-xs mt-1">Licensed & Regulated Gaming Platform</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Platform Online</span>
              </div>
              <div className="text-xs text-gray-500">
                Server: Mumbai, IN
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
