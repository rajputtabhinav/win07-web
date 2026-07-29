import { NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth'
import { databaseService } from '@/lib/database-service'
import { NextRequest } from 'next/server'

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const stats = await databaseService.calculateAdminStats()
    const users = await databaseService.getAllUsers()
    const transactions = await databaseService.getTransactions()
    
    // Prepare data for AI analysis
    const analysisData = {
      platformStats: stats,
      userMetrics: {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        highValueUsers: users.filter(u => u.totalDeposits > 10000).length,
        riskUsers: users.filter(u => u.riskLevel === 'high').length,
        tierDistribution: users.reduce((acc, user) => {
          acc[user.tier] = (acc[user.tier] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      },
      transactionMetrics: {
        totalTransactions: transactions.length,
        recentTransactions: transactions.filter(t => 
          new Date(t.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
        ).length,
        largeTransactions: transactions.filter(t => t.amount > 5000).length
      }
    }

    // Create AI prompt for insights
    const prompt = `
    As AdminAI for WIN07 Gaming Platform, analyze this data and provide actionable insights:
    
    PLATFORM DATA:
    ${JSON.stringify(analysisData, null, 2)}
    
    Please provide insights in the following JSON format:
    {
      "platformHealth": {
        "status": "healthy|warning|critical",
        "score": 0-100,
        "summary": "Brief health assessment"
      },
      "userInsights": {
        "engagement": "Brief engagement analysis",
        "retention": "User retention insights", 
        "riskFactors": ["List of risk factors"]
      },
      "revenueInsights": {
        "performance": "Revenue performance analysis",
        "opportunities": ["Growth opportunities"],
        "concerns": ["Revenue concerns if any"]
      },
      "recommendations": [
        {
          "priority": "high|medium|low",
          "category": "user|revenue|security|platform",
          "action": "Specific recommendation",
          "impact": "Expected impact"
        }
      ],
      "alerts": [
        {
          "type": "warning|info|critical",
          "message": "Alert message",
          "action": "Recommended action"
        }
      ]
    }
    
    Focus on actionable insights that help improve platform performance and user experience.
    `

    // Call Anthropic API for insights
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const result = await response.json()
    const aiInsights = result.content[0]?.text

    let parsedInsights
    try {
      parsedInsights = JSON.parse(aiInsights)
    } catch (error) {
      console.error('Error parsing AI insights:', error)
      parsedInsights = {
        platformHealth: { status: "healthy", score: 85, summary: "Platform operating normally" },
        userInsights: { engagement: "Good user engagement", retention: "Stable retention", riskFactors: [] },
        revenueInsights: { performance: "Steady revenue", opportunities: [], concerns: [] },
        recommendations: [],
        alerts: []
      }
    }

    return NextResponse.json({
      success: true,
      insights: parsedInsights,
      rawData: analysisData,
      timestamp: new Date(),
      aiModel: "claude-3-5-sonnet-20241022"
    })

  } catch (error) {
    console.error('Error generating AI insights:', error)
    
    // Fallback insights if AI fails
    const fallbackInsights = {
      platformHealth: { 
        status: "healthy", 
        score: 80, 
        summary: "Platform operational - AI analysis temporarily unavailable" 
      },
      userInsights: { 
        engagement: "Monitoring user engagement", 
        retention: "Tracking retention metrics", 
        riskFactors: ["AI analysis unavailable"] 
      },
      revenueInsights: { 
        performance: "Revenue tracking active", 
        opportunities: ["AI recommendations temporarily unavailable"], 
        concerns: [] 
      },
      recommendations: [{
        priority: "medium",
        category: "platform",
        action: "Restore AI analysis functionality",
        impact: "Improved admin insights"
      }],
      alerts: [{
        type: "warning",
        message: "AI insights temporarily unavailable",
        action: "Check Anthropic API configuration"
      }]
    }

    return NextResponse.json({
      success: false,
      insights: fallbackInsights,
      error: 'AI analysis temporarily unavailable',
      timestamp: new Date()
    })
  }
})

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const { query, context } = await req.json()
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const stats = await databaseService.calculateAdminStats()
    
    const prompt = `
    As AdminAI for WIN07 Gaming Platform, answer this admin query:
    
    QUERY: ${query}
    
    CONTEXT: ${context || 'General platform inquiry'}
    
    CURRENT PLATFORM DATA:
    - Total Users: ${stats.totalUsers}
    - Active Users: ${stats.activeUsers}
    - Total Deposits: ₹${stats.totalDeposits}
    - Platform Revenue: ₹${stats.platformRevenue}
    - Pending Withdrawals: ${stats.pendingWithdrawals}
    
    Provide a helpful, specific answer based on the current platform data.
    Keep the response concise and actionable.
    `

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: prompt
        }]
      })
    })

    const result = await response.json()
    const aiResponse = result.content[0]?.text || "I'm unable to process that query right now."

    return NextResponse.json({
      success: true,
      response: aiResponse,
      query,
      timestamp: new Date()
    })

  } catch (error) {
    console.error('Error processing AI query:', error)
    return NextResponse.json({
      success: false,
      response: "I'm experiencing some technical difficulties. Please try again later.",
      error: 'AI query processing failed'
    }, { status: 500 })
  }
})
