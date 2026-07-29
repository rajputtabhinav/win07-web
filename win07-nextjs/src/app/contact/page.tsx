"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'medium'
      })
      setIsSubmitting(false)
    }, 2000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with Luna, our AI assistant',
      detail: 'Available 24/7 for instant support',
      color: 'text-purple-400',
      bgColor: 'from-purple-500/10 to-purple-600/10',
      borderColor: 'border-purple-500/20'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a detailed message',
      detail: 'support@win07.com',
      color: 'text-blue-400',
      bgColor: 'from-blue-500/10 to-blue-600/10',
      borderColor: 'border-blue-500/20'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak with our team directly',
      detail: '+91 99999 99999',
      color: 'text-green-400',
      bgColor: 'from-green-500/10 to-green-600/10',
      borderColor: 'border-green-500/20'
    }
  ]

  const departments = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'payments', label: 'Payments & Withdrawals' },
    { value: 'account', label: 'Account Issues' },
    { value: 'admin-access', label: 'Admin Access Support' },
    { value: 'referrals', label: 'Referral Program' },
    { value: 'feedback', label: 'Feedback & Suggestions' }
  ]

  const priorities = [
    { value: 'low', label: 'Low Priority', description: '48-72 hours response' },
    { value: 'medium', label: 'Medium Priority', description: '24-48 hours response' },
    { value: 'high', label: 'High Priority', description: '4-24 hours response' },
    { value: 'urgent', label: 'Urgent', description: 'Immediate attention required' }
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Contact Us</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Get in touch with our support team. We're here to help you 24/7 with any questions or issues.
          </p>
        </motion.div>

        {/* Contact Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {contactMethods.map((method, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className={`bg-gradient-to-br ${method.bgColor} border ${method.borderColor} rounded-xl p-6 text-center`}
            >
              <method.icon className={`h-8 w-8 ${method.color} mx-auto mb-4`} />
              <h3 className="text-lg font-semibold text-white mb-2">{method.title}</h3>
              <p className="text-gray-400 text-sm mb-3">{method.description}</p>
              <p className={`${method.color} font-medium text-sm`}>{method.detail}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-white font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-white font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-white font-medium mb-2">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select a subject</option>
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>{dept.label}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-white font-medium mb-2">Priority Level</label>
                <div className="grid grid-cols-2 gap-3">
                  {priorities.map((priority) => (
                    <label
                      key={priority.value}
                      className={`cursor-pointer p-3 rounded-lg border transition-colors ${
                        formData.priority === priority.value
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={priority.value}
                        checked={formData.priority === priority.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="text-white font-medium text-sm">{priority.label}</div>
                      <div className="text-gray-400 text-xs">{priority.description}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-white font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none resize-none"
                  placeholder="Describe your issue or question in detail..."
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-purple-500 hover:bg-purple-600'
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-8"
          >
            {/* Office Information */}
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Office Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-purple-400 mt-1" />
                  <div>
                    <p className="text-white font-medium">Address</p>
                    <p className="text-gray-400 text-sm">
                      WIN07 Gaming Pvt. Ltd.<br />
                      Lower Parel, Mumbai<br />
                      Maharashtra 400013, India
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-purple-400 mt-1" />
                  <div>
                    <p className="text-white font-medium">Business Hours</p>
                    <p className="text-gray-400 text-sm">
                      Monday - Sunday: 24/7<br />
                      Support never sleeps!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Times */}
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Expected Response Times</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Live Chat: Instant</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300 text-sm">Email: Within 24 hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300 text-sm">Phone: Within 2 hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                  <span className="text-gray-300 text-sm">Urgent Issues: Immediate</span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Emergency Contact</h3>
              <p className="text-gray-300 text-sm mb-3">
                For urgent account security issues or payment problems:
              </p>
              <div className="space-y-2">
                <p className="text-red-400 font-medium">emergency@win07.com</p>
                <p className="text-red-400 font-medium">+91 99999 99999 (WhatsApp)</p>
              </div>
              <p className="text-gray-400 text-xs mt-3">
                Available 24/7 for critical issues only
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
