import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Anthropic API configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

// In-memory store for processed screenshots (in production, use Redis or database)
const processedScreenshots = new Map<string, { amount: number, timestamp: number, count: number }>()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const expectedAmount = parseInt(formData.get('expectedAmount') as string)
    const upiId = formData.get('upiId') as string

    if (!imageFile || !expectedAmount || !upiId) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    // Convert image to base64 and create hash for duplicate detection
    const arrayBuffer = await imageFile.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = imageFile.type
    
    // Create hash of image to detect duplicates
    const imageHash = crypto.createHash('sha256').update(Buffer.from(arrayBuffer)).digest('hex')
    
    // Check if this screenshot was already processed successfully
    const existingRecord = processedScreenshots.get(imageHash)
    if (existingRecord) {
      const timeDiff = Date.now() - existingRecord.timestamp
      const hoursPassed = timeDiff / (1000 * 60 * 60)
      
      // If same screenshot was used within 24 hours, reject it
      if (hoursPassed < 24) {
        return NextResponse.json({
          success: false,
          message: `This payment screenshot was already verified ${existingRecord.count} time(s). Please upload a new, unique payment screenshot.`,
          confidence: 0
        })
      } else {
        // Remove old record if it's more than 24 hours old
        processedScreenshots.delete(imageHash)
      }
    }

    // Prepare Anthropic API request
    const anthropicPayload = {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please analyze this payment screenshot and verify if it shows a successful UPI payment. Look for:

1. Payment amount: Should be exactly ₹${expectedAmount}
2. Payment status: Should show "SUCCESS", "COMPLETED", or similar
3. UPI transaction: Should be a valid UPI payment
4. Recipient: Should show payment to a valid UPI recipient

Respond with a JSON object:
{
  "isValidPayment": boolean,
  "amountFound": number,
  "paymentStatus": string,
  "confidence": number (0-100),
  "details": "explanation"
}

Be strict - only approve if you're confident this is a genuine payment screenshot for the exact amount.`
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: base64Image
              }
            }
          ]
        }
      ]
    }

    // Call Anthropic API
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(anthropicPayload)
    })

    if (!anthropicResponse.ok) {
      throw new Error(`Anthropic API error: ${anthropicResponse.status}`)
    }

    const anthropicResult = await anthropicResponse.json()
    const analysisText = anthropicResult.content[0]?.text || ''

    // Parse the JSON response from Claude
    let analysis
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse Anthropic response:', parseError)
      return NextResponse.json({
        success: false,
        message: 'Failed to analyze payment screenshot'
      }, { status: 500 })
    }

    // Verify payment based on AI analysis
    const isValid = analysis.isValidPayment && 
                   analysis.amountFound === expectedAmount && 
                   analysis.confidence >= 80 &&
                   (analysis.paymentStatus.toLowerCase().includes('success') || 
                    analysis.paymentStatus.toLowerCase().includes('completed') ||
                    analysis.paymentStatus.toLowerCase().includes('paid'))

    if (isValid) {
      // Store successful verification to prevent reuse
      const existingCount = processedScreenshots.get(imageHash)?.count || 0
      processedScreenshots.set(imageHash, {
        amount: expectedAmount,
        timestamp: Date.now(),
        count: existingCount + 1
      })
      
      // Log successful verification (without exposing UPI ID)
      console.log(`Payment verified: ₹${expectedAmount}`, {
        confidence: analysis.confidence,
        details: 'Payment verification successful',
        imageHash: imageHash.substring(0, 8) + '...' // Log partial hash for debugging
      })

      return NextResponse.json({
        success: true,
        verifiedAmount: expectedAmount,
        confidence: analysis.confidence,
        message: 'Payment verified successfully!',
        details: analysis.details
      })
    } else {
      // Log failed verification (without exposing UPI ID)
      console.log(`Payment verification failed: ₹${expectedAmount}`, {
        confidence: analysis.confidence || 0,
        reason: 'Verification criteria not met'
      })

      // Sanitize error message to remove any UPI IDs for privacy
      const sanitizedMessage = (analysis.details || 'Payment verification failed. Please ensure the screenshot shows a successful payment of the exact amount.')
        .replace(/@[a-zA-Z0-9]+/g, '@***')  // Replace UPI IDs like @ybl, @axl
        .replace(/\b[a-zA-Z0-9]+@[a-zA-Z0-9]+\b/g, '***@***')  // Replace full UPI IDs
        .replace(/\b\d{8,12}[-.]?\d{0,2}@[a-zA-Z0-9]+/g, '***@***')  // Replace phone-based UPI IDs
        .replace(/\([^)]*@[^)]*\)/g, '(***)') // Replace parenthetical UPI references
      
      return NextResponse.json({
        success: false,
        message: sanitizedMessage,
        confidence: analysis.confidence || 0
      })
    }

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({
      success: false,
      message: 'Verification service temporarily unavailable. Please try again.'
    }, { status: 500 })
  }
}
