"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Upload, 
  QrCode, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
  Download
} from 'lucide-react'
import { useWallet } from '@/contexts/wallet-context'
import { toast } from 'sonner'
import QRCode from 'qrcode'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
}

interface DepositState {
  step: 'amount' | 'qr' | 'upload' | 'verifying' | 'success'
  amount: number
  selectedUPI: string
  qrDataURL: string
  uploadedImage: File | null
  verificationResult: any
  isIndCoinsPackage: boolean
  indCoinsAmount: number
}

const UPI_IDS = [
  'abhinavrajput2424@ybl',
  'abhinavrajput2424@axl',
  'abhinavrajput24241@ybl'
]

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const wallet = useWallet()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [depositState, setDepositState] = useState<DepositState>({
    step: 'amount',
    amount: 150,
    selectedUPI: '',
    qrDataURL: '',
    uploadedImage: null,
    verificationResult: null,
    isIndCoinsPackage: false,
    indCoinsAmount: 0
  })

  // Check for IND coins package on modal open
  useEffect(() => {
    if (isOpen) {
      const indCoinsPackage = localStorage.getItem('indCoinsPackage')
      if (indCoinsPackage) {
        try {
          const packageData = JSON.parse(indCoinsPackage)
          setDepositState(prev => ({
            ...prev,
            amount: packageData.price,
            isIndCoinsPackage: true,
            indCoinsAmount: packageData.coins,
            step: 'qr' // Skip amount selection for IND coins
          }))
          // Clear the package data
          localStorage.removeItem('indCoinsPackage')
          // Generate QR immediately
          setTimeout(() => generateQR(), 100)
        } catch (error) {
          console.error('Error parsing IND coins package:', error)
        }
      }
    }
  }, [isOpen])

  // Get random UPI ID to distribute payment load
  const getRandomUPI = () => {
    const randomIndex = Math.floor(Math.random() * UPI_IDS.length)
    return UPI_IDS[randomIndex]
  }

  // Generate UPI QR Code with logo overlay
  const generateQR = async () => {
    const upiId = getRandomUPI()
    const upiString = `upi://pay?pa=${upiId}&pn=WIN07%20Gaming&am=${depositState.amount}&cu=INR&tn=WIN07%20Deposit%20₹${depositState.amount}`
    
    try {
      // Generate base QR code
      const qrDataURL = await QRCode.toDataURL(upiString, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H' // High error correction to allow logo overlay
      })

      // Create canvas to add logo overlay
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 256
      canvas.height = 256

      // Load and draw QR code
      const qrImage = new Image()
      qrImage.onload = async () => {
        ctx?.drawImage(qrImage, 0, 0, 256, 256)

        // Load and draw logo
        const logoImage = new Image()
        logoImage.onload = () => {
          const logoSize = 48
          const logoX = (256 - logoSize) / 2
          const logoY = (256 - logoSize) / 2
          
          // Draw white background circle for logo
          if (ctx) {
            ctx.fillStyle = 'white'
            ctx.beginPath()
            ctx.arc(128, 128, logoSize / 2 + 4, 0, 2 * Math.PI)
            ctx.fill()
            
            // Draw logo
            ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)
          }

          // Get final QR code with logo
          const finalQRDataURL = canvas.toDataURL('image/png')
          
          setDepositState(prev => ({
            ...prev,
            step: 'qr',
            selectedUPI: upiId,
            qrDataURL: finalQRDataURL
          }))
        }
        logoImage.src = '/logo.svg'
      }
      qrImage.src = qrDataURL
      
    } catch (error) {
      toast.error('Failed to generate QR code')
    }
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      setDepositState(prev => ({
        ...prev,
        uploadedImage: file,
        step: 'verifying'
      }))

      verifyPayment(file)
    }
  }

  // Verify payment using Anthropic Vision API
  const verifyPayment = async (imageFile: File) => {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('expectedAmount', depositState.amount.toString())
      formData.append('upiId', depositState.selectedUPI)

      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success && result.verifiedAmount === depositState.amount) {
        // Payment verified successfully
        const success = wallet.deposit(depositState.amount)
        
        if (success) {
          setDepositState(prev => ({
            ...prev,
            step: 'success',
            verificationResult: result
          }))
          
          if (depositState.isIndCoinsPackage) {
            // Add IND coins to wallet
            wallet.buyIndCoins(depositState.indCoinsAmount)
            toast.success(`🎉 Payment verified! ${depositState.indCoinsAmount.toLocaleString()} IND coins added to your wallet`)
          } else {
            toast.success(`🎉 Payment verified! ₹${depositState.amount} added to your wallet`)
          }
          
          // Auto close after 3 seconds
          setTimeout(() => {
            onClose()
            resetModal()
          }, 3000)
        }
      } else {
        // Sanitize error message to remove any UPI IDs for privacy
        const sanitizedMessage = (result.message || 'Payment verification failed')
          .replace(/@[a-zA-Z0-9]+/g, '@***')  // Replace UPI IDs like @ybl, @axl
          .replace(/\b[a-zA-Z0-9]+@[a-zA-Z0-9]+\b/g, '***@***')  // Replace full UPI IDs
          .replace(/\b\d{8,12}[-.]?\d{0,2}@[a-zA-Z0-9]+/g, '***@***')  // Replace phone-based UPI IDs
        
        toast.error(sanitizedMessage)
        setDepositState(prev => ({ ...prev, step: 'upload' }))
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.')
      setDepositState(prev => ({ ...prev, step: 'upload' }))
    }
  }

  const resetModal = () => {
    setDepositState({
      step: 'amount',
      amount: 150,
      selectedUPI: '',
      qrDataURL: '',
      uploadedImage: null,
      verificationResult: null,
      isIndCoinsPackage: false,
      indCoinsAmount: 0
    })
  }



  const downloadQR = () => {
    const link = document.createElement('a')
    link.download = `WIN07-QR-${depositState.amount}.png`
    link.href = depositState.qrDataURL
    link.click()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-lg font-bold text-white">
              {depositState.isIndCoinsPackage ? '🪙 Buy IND Coins' : '💰 Deposit Funds'}
            </h2>
            <button
              onClick={() => {
                onClose()
                resetModal()
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
            {/* Step 1: Amount Selection */}
            {depositState.step === 'amount' && !depositState.isIndCoinsPackage && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">
                    Deposit Amount (Minimum ₹150)
                  </label>
                  <input
                    type="number"
                    min="150"
                    max="100000"
                    value={depositState.amount}
                    onChange={(e) => setDepositState(prev => ({ 
                      ...prev, 
                      amount: Math.max(150, parseInt(e.target.value) || 150)
                    }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white font-mono text-sm focus:border-purple-500 focus:outline-none"
                    placeholder="Enter amount"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-1">
                  {[150, 500, 1000, 2500, 5000, 10000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setDepositState(prev => ({ ...prev, amount }))}
                      className={`py-1 px-2 rounded text-xs font-semibold transition-colors ${
                        depositState.amount === amount
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                      }`}
                    >
                      ₹{amount >= 1000 ? `${amount/1000}K` : amount}
                    </button>
                  ))}
                </div>

                <button
                  onClick={generateQR}
                  disabled={depositState.amount < 150}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <QrCode className="h-3 w-3" />
                  Generate QR
                </button>
              </div>
            )}

            {/* Step 2: QR Code Display */}
            {depositState.step === 'qr' && (
              <div className="space-y-4 text-center">
                <div className="bg-white p-4 rounded-xl mx-auto w-fit">
                  {depositState.qrDataURL ? (
                    <img 
                      src={depositState.qrDataURL} 
                      alt="UPI QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  ) : (
                    <div className="w-48 h-48 mx-auto flex items-center justify-center bg-gray-100 rounded-lg">
                      <span className="text-gray-500">Generating QR...</span>
                    </div>
                  )}
                </div>



                <div className={`${depositState.isIndCoinsPackage ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-blue-500/20 border-blue-500/30'} border rounded-lg p-3`}>
                  {depositState.isIndCoinsPackage ? (
                    <>
                      <p className="text-yellow-400 text-sm font-semibold">🪙 IND Coins Package: {depositState.indCoinsAmount.toLocaleString()} Coins</p>
                      <p className="text-green-400 text-sm font-semibold">Amount to Pay: ₹{depositState.amount.toLocaleString()}</p>
                      <p className="text-gray-300 text-xs mt-1">
                        Scan QR code to purchase {depositState.indCoinsAmount.toLocaleString()} IND coins for ₹{depositState.amount.toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-blue-400 text-sm font-semibold">Amount to Pay: ₹{depositState.amount}</p>
                      <p className="text-gray-300 text-xs mt-1">
                        Scan QR code to pay exactly ₹{depositState.amount}
                      </p>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={downloadQR}
                    className="bg-slate-700 hover:bg-slate-600 text-white py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                  <button
                    onClick={() => setDepositState(prev => ({ ...prev, step: 'upload' }))}
                    className="bg-green-600 hover:bg-green-700 text-white py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Camera className="h-3 w-3" />
                    I Paid
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Screenshot Upload */}
            {depositState.step === 'upload' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-white font-semibold mb-2">Upload Payment Screenshot</h3>
                  {depositState.isIndCoinsPackage ? (
                    <p className="text-gray-400 text-sm">
                      Upload a clear screenshot of your successful payment of ₹{depositState.amount.toLocaleString()} for {depositState.indCoinsAmount.toLocaleString()} IND coins
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      Upload a clear screenshot of your successful payment of ₹{depositState.amount}
                    </p>
                  )}
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors"
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-white text-sm font-semibold">Click to upload screenshot</p>
                  <p className="text-gray-400 text-xs">PNG, JPG up to 5MB</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-400 text-sm font-semibold">Important:</p>
                  <ul className="text-gray-300 text-xs mt-1 space-y-1">
                    <li>• Upload a clear screenshot showing the payment amount</li>
                    <li>• Payment must be exactly ₹{depositState.amount}</li>
                    <li>• Screenshot should show successful transaction</li>
                    <li>• Verification takes 10-30 seconds</li>
                  </ul>
                </div>

                <button
                  onClick={() => setDepositState(prev => ({ ...prev, step: 'qr' }))}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-1.5 rounded text-xs font-semibold"
                >
                  ← Back to QR
                </button>
              </div>
            )}

            {/* Step 4: Verifying */}
            {depositState.step === 'verifying' && (
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Verifying Payment...</h3>
                  <p className="text-gray-400 text-sm">
                    Our AI is analyzing your screenshot to verify the payment of ₹{depositState.amount}
                  </p>
                </div>
                
                <div className="bg-slate-900 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                    <span className="text-purple-400 text-sm">AI Verification in Progress</span>
                  </div>
                  <p className="text-gray-400 text-xs">Please wait while we verify your payment...</p>
                </div>
              </div>
            )}

            {/* Step 5: Success */}
            {depositState.step === 'success' && (
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-400" />
                </div>
                <div>
                  <h3 className="text-green-400 font-bold text-lg">Payment Verified! 🎉</h3>
                  {depositState.isIndCoinsPackage ? (
                    <p className="text-white text-sm">
                      {depositState.indCoinsAmount.toLocaleString()} IND coins have been added to your wallet
                    </p>
                  ) : (
                    <p className="text-white text-sm">
                      ₹{depositState.amount} has been added to your wallet
                    </p>
                  )}
                </div>
                
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                  {depositState.isIndCoinsPackage ? (
                    <>
                      <p className="text-yellow-400 text-sm font-semibold">
                        New IND Coins Balance: {wallet.indCoins.toLocaleString()} 🪙
                      </p>
                      <p className="text-gray-300 text-xs">Ready to access premium features!</p>
                    </>
                  ) : (
                    <>
                      <p className="text-green-400 text-sm font-semibold">
                        New Balance: ₹{wallet.cashBalance.toLocaleString()}
                      </p>
                      <p className="text-gray-300 text-xs">Ready to play and win big!</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
