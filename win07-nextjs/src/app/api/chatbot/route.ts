import { NextRequest, NextResponse } from 'next/server'

// Anthropic API configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 })
    }

    // Prepare conversation context
    const conversationContext = conversationHistory
      .map((msg: Message) => `${msg.type === 'user' ? 'User' : 'Luna'}: ${msg.content}`)
      .join('\n')

    // Create the prompt with WIN07 platform context
    const systemPrompt = `You are Luna, an AI assistant for WIN07, India's premier AI-secured gaming platform. You are friendly, helpful, and knowledgeable about all WIN07 features.

WIN07 PLATFORM CONTEXT:

🎮 GAMES:
- 15+ games available: Aviator, Mines, Plinko, Teen Patti, Andar Bahar, Blackjack, Roulette, Baccarat, Wheel of Fortune, Limbo, and more
- All games are AI-secured and provably fair
- Minimum bet: ₹20, Maximum bet: ₹50,000
- Games have different RTP rates (94.5% to 97.8%)

👑 ADMIN ACCESS (Premium AI Feature):
- Three plans: Basic (30 min, 38 predictions), Premium (45 min, 56 predictions), Ultimate (5 hours, 150 predictions)
- Costs: Basic ₹1,599, Premium ₹1,699, Ultimate ₹1,799 IND coins
- Provides AI-powered game predictions and insights
- Golden notifications with optimal moves and exit points
- Trial: 5 free predictions with welcome bonus

💰 IND COINS SYSTEM:
- Platform currency: 1 IND Coin = ₹1
- Purchase packages: 1599, 1699, or 1799 coins
- Payment via UPI (scan QR, pay, upload screenshot)
- Welcome bonus: 899 IND coins for new users
- Used for Admin Access and gaming

💸 WITHDRAWAL SYSTEM (Tier-based):
- Basic Tier (0-2 referrals): ₹30 per 24 hours
- Bronze Tier (3-9 referrals): ₹100 × referrals (max ₹1,000) per 24 hours
- Gold Tier (10-119 referrals): ₹50,000 per 24 hours  
- Grandmaster Tier (120+ referrals): ₹20,00,000 per 24 hours
- Instant UPI withdrawals, processed within 24 hours

👥 REFERRAL PROGRAM:
- Earn ₹30 cash + ₹100 bonus per successful referral
- Referral must deposit minimum ₹150
- Referral tiers unlock higher withdrawal limits
- No limit on number of referrals

🛡️ SECURITY:
- AI-powered fraud detection
- SSL encryption
- Licensed and regulated platform
- Real-time transaction monitoring

📱 FEATURES:
- Mobile responsive design
- 24/7 customer support
- Live notifications system
- Leaderboards and competitions
- Multiple payment methods (UPI primary)

RESPONSE GUIDELINES:
- Be friendly and use emojis appropriately
- Provide step-by-step instructions when explaining processes
- Break down complex topics into numbered steps or bullet points
- Use clear headings with emojis for different sections
- Always be helpful and encouraging
- Use ₹ for Indian Rupee amounts
- Mention specific features when relevant
- If users ask about something not covered, offer to help with what you can assist with
- Be enthusiastic about WIN07 features
- Format responses with clear structure: Overview → Steps → Tips/Notes

Current conversation:
${conversationContext}

User's latest message: ${message}

Respond as Luna, the helpful WIN07 AI assistant:`

    // Call Anthropic API
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
                  model: "claude-3-5-sonnet-20241022", // Using Claude 3.5 Sonnet 4.1
          max_tokens: 750,
        messages: [
          {
            role: "user",
            content: systemPrompt
          }
        ]
      })
    })

    if (!anthropicResponse.ok) {
      throw new Error(`Anthropic API error: ${anthropicResponse.status}`)
    }

    const anthropicResult = await anthropicResponse.json()
    const aiResponse = anthropicResult.content[0]?.text || "I'm sorry, I'm having trouble processing your request right now. Please try again or contact our support team at support@win07.com!"

    return NextResponse.json({
      success: true,
      response: aiResponse
    })

  } catch (error) {
    console.error('Chatbot API error:', error)
    
    // Fallback response
    return NextResponse.json({
      success: false,
      response: "I apologize, but I'm experiencing some technical difficulties right now. 😔 Please try again in a moment, or you can contact our human support team at support@win07.com or call +91 99999 99999 for immediate assistance!"
    })
  }
}
