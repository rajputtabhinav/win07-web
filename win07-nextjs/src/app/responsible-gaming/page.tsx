"use client"

import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { 
  Shield, 
  Clock, 
  AlertTriangle, 
  Heart,
  PhoneCall,
  Mail,
  ExternalLink,
  Users,
  Settings,
  Ban
} from 'lucide-react'

export default function ResponsibleGamingPage() {
  const guidelines = [
    {
      icon: Clock,
      title: "Set Time Limits",
      description: "Gaming should be fun, not consume your entire day. Set specific time limits for your gaming sessions.",
      tips: [
        "Play for a maximum of 2-3 hours per day",
        "Take regular breaks every 30 minutes",
        "Set reminders to stop playing",
        "Don't skip meals or sleep for gaming"
      ]
    },
    {
      icon: Shield,
      title: "Set Money Limits",
      description: "Only gamble with money you can afford to lose. Never chase losses with bigger bets.",
      tips: [
        "Set daily/weekly deposit limits",
        "Never use borrowed money for gaming",
        "Don't chase losses with bigger bets",
        "Keep track of your spending"
      ]
    },
    {
      icon: Heart,
      title: "Gaming vs Life Balance",
      description: "Maintain a healthy balance between gaming and other important aspects of your life.",
      tips: [
        "Prioritize family, work, and health",
        "Don't neglect social relationships",
        "Maintain other hobbies and interests",
        "Seek support if gaming affects daily life"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Recognize Warning Signs",
      description: "Be aware of signs that your gaming might be becoming problematic.",
      tips: [
        "Spending more time/money than planned",
        "Lying about gaming activities",
        "Feeling anxious when not playing",
        "Neglecting responsibilities"
      ]
    }
  ]

  const tools = [
    {
      title: "Deposit Limits",
      description: "Set daily, weekly, or monthly limits on how much you can deposit",
      action: "Contact Support to Set Limits"
    },
    {
      title: "Session Time Alerts",
      description: "Get notifications after playing for a specified amount of time",
      action: "Enable in Settings"
    },
    {
      title: "Self-Exclusion",
      description: "Temporarily or permanently block your account from gaming",
      action: "Request Self-Exclusion"
    },
    {
      title: "Reality Check",
      description: "Regular pop-ups showing how long you've been playing",
      action: "Enable Reality Checks"
    }
  ]

  const resources = [
    {
      name: "National Institute of Mental Health",
      website: "nimhans.ac.in",
      phone: "+91-80-26995000",
      description: "Professional mental health support and addiction counseling"
    },
    {
      name: "Gambling Therapy",
      website: "gamblingtherapy.org",
      phone: "Available Online",
      description: "Free online support for gambling addiction worldwide"
    },
    {
      name: "WIN07Pro Support Team",
      website: "support@win07pro.com",
      phone: "24/7 Chat Available",
      description: "Our dedicated team for responsible gaming support"
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
            <Heart className="h-8 w-8 text-red-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Responsible Gaming</h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            At WIN07, we believe gaming should be fun, safe, and responsible. Learn how to maintain healthy gaming habits.
          </p>
        </motion.div>

        {/* Our Commitment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Our Commitment to You</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            WIN07 is committed to promoting responsible gaming practices. We provide tools, resources, and support 
            to help you maintain control over your gaming activities. Remember, gaming should enhance your life, 
            not control it.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <Shield className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-white font-medium">Player Protection</p>
            </div>
            <div className="text-center">
              <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-white font-medium">Support & Education</p>
            </div>
            <div className="text-center">
              <Settings className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-white font-medium">Control Tools</p>
            </div>
          </div>
        </motion.div>

        {/* Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Responsible Gaming Guidelines</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {guidelines.map((guideline, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <guideline.icon className="h-6 w-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">{guideline.title}</h3>
                </div>
                <p className="text-gray-300 mb-4">{guideline.description}</p>
                <ul className="space-y-2">
                  {guideline.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="text-gray-400 text-sm flex items-start gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Control Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Self-Control Tools</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-3">{tool.title}</h3>
                <p className="text-gray-300 mb-4">{tool.description}</p>
                <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  {tool.action}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Warning Signs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <h3 className="text-xl font-bold text-white">When to Seek Help</h3>
            </div>
            <p className="text-gray-300 mb-4">
              If you recognize any of these signs in yourself or someone you know, it may be time to seek professional help:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2">
                <li className="text-red-300 text-sm flex items-start gap-2">
                  <Ban className="h-3 w-3 mt-1 flex-shrink-0" />
                  <span>Unable to control gaming time or spending</span>
                </li>
                <li className="text-red-300 text-sm flex items-start gap-2">
                  <Ban className="h-3 w-3 mt-1 flex-shrink-0" />
                  <span>Lying to family/friends about gaming activities</span>
                </li>
                <li className="text-red-300 text-sm flex items-start gap-2">
                  <Ban className="h-3 w-3 mt-1 flex-shrink-0" />
                  <span>Borrowing money or selling items to fund gaming</span>
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="text-red-300 text-sm flex items-start gap-2">
                  <Ban className="h-3 w-3 mt-1 flex-shrink-0" />
                  <span>Neglecting work, school, or family responsibilities</span>
                </li>
                <li className="text-red-300 text-sm flex items-start gap-2">
                  <Ban className="h-3 w-3 mt-1 flex-shrink-0" />
                  <span>Feeling anxious or depressed when not gaming</span>
                </li>
                <li className="text-red-300 text-sm flex items-start gap-2">
                  <Ban className="h-3 w-3 mt-1 flex-shrink-0" />
                  <span>Chasing losses with increasingly larger bets</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Help Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Get Help & Support</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-3">{resource.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{resource.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-blue-400" />
                    <a 
                      href={`https://${resource.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      {resource.website}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 text-sm">{resource.phone}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact for Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">Need Immediate Support?</h3>
          <p className="text-gray-300 mb-6">
            Our support team is trained to help with responsible gaming concerns. Don't hesitate to reach out.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <Mail className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Email Support</h4>
              <p className="text-sm text-gray-400">responsible-gaming@win07.com</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <PhoneCall className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">24/7 Helpline</h4>
              <p className="text-sm text-gray-400">+91 99999 99999</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            All conversations are confidential and handled with care
          </p>
        </motion.div>
      </div>
    </div>
  )
}
