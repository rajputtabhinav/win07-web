// WebSocket server for real-time admin updates
import { WebSocketServer } from 'ws'
import { databaseService } from './database-service'

let wss: WebSocketServer | null = null

export function initializeWebSocketServer(port: number = 8080) {
  if (wss) return wss

  try {
    wss = new WebSocketServer({ port })

    wss.on('connection', (ws) => {
      console.log('🔌 New admin WebSocket connection')
      
      // Send initial data from database
      const sendInitialData = async () => {
        try {
          const [stats, users, transactions, withdrawals] = await Promise.all([
            databaseService.calculateAdminStats(),
            databaseService.getAllUsers(50),
            databaseService.getTransactions(undefined, 50),
            databaseService.getWithdrawalRequests('pending')
          ])

          const initialData = {
            type: 'connection_established',
            stats,
            users: users.slice(0, 50),
            transactions: transactions.slice(-50),
            withdrawals
          }
          ws.send(JSON.stringify(initialData))
        } catch (error) {
          console.error('Error sending initial data:', error)
        }
      }
      
      sendInitialData()

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString())
        handleWebSocketMessage(ws, data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    })

    ws.on('close', () => {
      console.log('🔌 Admin WebSocket connection closed')
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
      })

    console.log(`🚀 WebSocket server running on port ${port}`)
    return wss
    
  } catch (error) {
    console.error('❌ Failed to initialize WebSocket server:', error)
    console.log(`⚠️ WebSocket server will not be available on port ${port}`)
    return null
  }
}

function handleWebSocketMessage(ws: any, data: any) {
  switch (data.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: new Date() }))
      break
    
    case 'request_user_data':
      const getUserData = async () => {
        try {
          const user = await adminAI.getUser(data.clerkUserId)
          const transactions = await adminAI.getTransactions(data.clerkUserId)
          ws.send(JSON.stringify({
            type: 'user_data',
            user,
            transactions
          }))
        } catch (error) {
          console.error('Error getting user data:', error)
        }
      }
      getUserData()
      break
    
    case 'admin_action':
      handleAdminAction(ws, data)
      break
    
    default:
      console.log('Unknown WebSocket message type:', data.type)
  }
}

async function handleAdminAction(ws: any, data: any) {
  const { action, userId, amount, type } = data

  try {
    switch (action) {
      case 'deposit':
        const user = await adminAI.getUser(userId)
        if (user) {
          const newBalance = type === 'cash' ? user.cashBalance + amount : user.bonusBalance + amount
          await adminAI.updateUser(userId, {
            [type === 'cash' ? 'cashBalance' : 'bonusBalance']: newBalance,
            totalDeposits: user.totalDeposits + (type === 'cash' ? amount : 0)
          })
          
          await adminAI.createTransaction({
            userId,
            clerkUserId: userId,
            type: 'admin_deposit',
            amount,
            walletType: type,
            description: `Admin deposit of ₹${amount} (${type})`,
            status: 'completed'
          })
          
          const updatedUser = await adminAI.getUser(userId)
          ws.send(JSON.stringify({
            type: 'admin_action_success',
            action: 'deposit',
            user: updatedUser
          }))
        }
        break
      
      case 'withdraw':
        const withdrawUser = await adminAI.getUser(userId)
        if (withdrawUser && withdrawUser.cashBalance >= amount) {
          await adminAI.updateUser(userId, {
            cashBalance: withdrawUser.cashBalance - amount,
            totalWithdrawals: withdrawUser.totalWithdrawals + amount
          })
          
          await adminAI.createTransaction({
            userId,
            clerkUserId: userId,
            type: 'admin_withdrawal',
            amount,
            walletType: 'cash',
            description: `Admin withdrawal of ₹${amount}`,
            status: 'completed'
          })
          
          const updatedUser = await adminAI.getUser(userId)
          ws.send(JSON.stringify({
            type: 'admin_action_success',
            action: 'withdraw',
            user: updatedUser
          }))
        } else {
          ws.send(JSON.stringify({
            type: 'admin_action_error',
            action: 'withdraw',
            error: 'Insufficient balance'
          }))
        }
        break
    }
  } catch (error) {
    console.error('Error handling admin action:', error)
    ws.send(JSON.stringify({
      type: 'admin_action_error',
      action,
      error: 'Failed to process admin action'
    }))
  }
}

export { wss }
