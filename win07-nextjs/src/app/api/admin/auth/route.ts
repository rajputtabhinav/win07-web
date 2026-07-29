import { NextRequest, NextResponse } from 'next/server'
import { adminSessionManager } from '@/lib/admin-session'

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json()
    
    // Use environment variables for secure credential verification
    const validPhone = process.env.ADMIN_PHONE_NUMBER || '8299072802'
    const validPassword = process.env.ADMIN_PASSWORD || '24Kittu@24'
    
    if (phone === validPhone && password === validPassword) {
      // Create secure session token
      const sessionToken = await adminSessionManager.createSession(phone)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Admin access granted',
        sessionToken // Return token for future requests
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid credentials' 
      }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Authentication error' 
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const password = url.searchParams.get('password')
    
    // Use environment variable for secure password verification
    const validPassword = process.env.ADMIN_PASSWORD || '24Kittu@24'
    
    if (password === validPassword) {
      return NextResponse.json({ 
        success: true, 
        message: 'Admin access verified',
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid admin password' 
      }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Authentication error' 
    }, { status: 500 })
  }
}
