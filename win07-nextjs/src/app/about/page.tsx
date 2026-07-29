"use client"

import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { 
  Shield, 
  Users, 
  Trophy, 
  Crown,
  Gamepad2,
  Zap,
  Star,
  Target,
  Clock,
  HeadphonesIcon
} from 'lucide-react'

export default function AboutPage() {
  const stats = [
    { label: 'Active Players', value: '5M+', icon: Users, color: 'text-blue-400' },
    { label: 'Games Available', value: '15+', icon: Gamepad2, color: 'text-purple-400' },
    { label: 'Total Winnings Paid', value: '₹100Cr+', icon: Trophy, color: 'text-yellow-400' },
    { label: 'Countries Served', value: '25+', icon: Star, color: 'text-green-400' }
  ]

  const features = [
    {
      icon: Shield,
      title: 'AI-Secured Platform',
      description: 'Advanced artificial intelligence secures every transaction and game session with real-time fraud detection.'
    },
    {
      icon: Crown,
      title: 'Admin Access',
      description: 'Premium AI-powered game predictions and insights for enhanced gaming experience and better win rates.'
    },
    {
      icon: Zap,
      title: 'Instant Withdrawals',
      description: 'Get your winnings in seconds with UPI instant transfer. No delays, no hassles - just instant money.'
    },
    {
      icon: Users,
      title: 'Referral System',
      description: 'Tier-based referral program with Basic, Bronze, Gold, and Grandmaster levels offering different benefits.'
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Round-the-clock customer support with our AI assistant "Luna" and human experts always available.'
    },
    {
      icon: Target,
      title: 'Fair Gaming',
      description: 'Transparent algorithms, certified RTP rates, and provably fair gaming ensure everyone has equal chances.'
    }
  ]

  const team = [
    {
      name: 'Rajesh Kumar',
      role: 'CEO & Founder',
      bio: 'Former gaming industry veteran with 15+ years experience in building world-class gaming platforms.',
      image: '👨‍💼'
    },
    {
      name: 'Priya Sharma',
      role: 'CTO',
      bio: 'AI and blockchain expert leading our technology innovation and security infrastructure.',
      image: '👩‍💻'
    },
    {
      name: 'Vikash Singh',
      role: 'Head of Gaming',
      bio: 'Game design specialist ensuring the best user experience across all our gaming offerings.',
      image: '👨‍🎮'
    },
    {
      name: 'Luna AI',
      role: 'AI Assistant',
      bio: 'Our intelligent chatbot powered by advanced AI, helping players 24/7 with instant support.',
      image: '🤖'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">WIN07</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            India's most trusted AI-secured gaming platform, revolutionizing online gaming with cutting-edge technology, 
            instant rewards, and an unparalleled user experience.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
              <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-3`} />
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Our Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Story</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Founded in 2023, WIN07 emerged from a vision to create India's most secure and entertaining gaming platform. 
                  We recognized the need for a platform that combines cutting-edge AI security with traditional Indian gaming preferences.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Our team of gaming experts, AI specialists, and security professionals worked tirelessly to create a platform that 
                  not only provides thrilling entertainment but also ensures complete safety and fairness for every player.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Today, WIN07 serves millions of players across 25+ countries, offering 15+ premium games with features like 
                  Admin Access, instant withdrawals, and our revolutionary tier-based referral system.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-8 rounded-full">
                  <Gamepad2 className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Why Choose WIN07?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
              >
                <feature.icon className="h-8 w-8 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center"
              >
                <div className="text-4xl mb-4">{member.image}</div>
                <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                <p className="text-purple-400 text-sm mb-3">{member.role}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mission & Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-gray-300 leading-relaxed">
                To revolutionize online gaming in India by providing the most secure, fair, and entertaining platform that 
                empowers every player to achieve their gaming dreams while maintaining the highest standards of safety and transparency.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-gray-300 leading-relaxed">
                To become the global leader in AI-secured gaming, setting new standards for player protection, game fairness, 
                and user experience while fostering a responsible gaming community worldwide.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
