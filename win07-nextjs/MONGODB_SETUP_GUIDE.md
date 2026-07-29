# 🗄️ MongoDB Setup Guide for WIN07 Gaming Platform

## 🎯 **Quick Setup Options**

### **Option 1: MongoDB Atlas (Cloud) - RECOMMENDED**
1. **Go to**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create free account** and new cluster
3. **Get connection string**: `mongodb+srv://username:password@cluster.mongodb.net/win07gaming`
4. **Update `.env.local`**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/win07gaming
   ```

### **Option 2: Local MongoDB Installation**
1. **Download**: [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. **Install** MongoDB on your system
3. **Start MongoDB**:
   ```bash
   mongod --dbpath C:\data\db
   ```
4. **Update `.env.local`**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/win07gaming
   ```

### **Option 3: Docker (If you have Docker)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 🔧 **Environment Configuration**

Create/update your `.env.local` file:
```env
# MongoDB Database Configuration
MONGODB_URI=mongodb://localhost:27017/win07gaming
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/win07gaming

# Admin Authentication
ADMIN_PHONE_NUMBER=8299072802
ADMIN_PASSWORD=24Kittu@24
NEXT_PUBLIC_ADMIN_PASSWORD=24Kittu@24
ADMIN_JWT_SECRET=win07-super-secure-jwt-secret-key-32-characters-minimum

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Optional
WEBSOCKET_PORT=8080
```

## 🚀 **Starting Your Application**

### **Step 1: Ensure MongoDB is Running**
```bash
# If using local MongoDB
mongod

# If using Atlas, just ensure your connection string is correct
```

### **Step 2: Initialize Database**
```bash
# Start the application
npm run dev

# Initialize database (one-time setup)
curl -X POST http://localhost:3000/api/startup
```

### **Step 3: Verify Setup**
```bash
# Check health
curl http://localhost:3000/api/health

# Should return:
{
  "status": "healthy",
  "database": {
    "connected": true,
    "collections": ["users", "transactions", "withdrawals", ...]
  }
}
```

## 📊 **Database Collections**

Your database will automatically create these collections:

### **1. Users Collection**
```javascript
{
  clerkUserId: "user_123",
  email: "user@example.com",
  name: "John Doe",
  cashBalance: 1000,
  bonusBalance: 500,
  indCoins: 899,
  totalDeposits: 2000,
  totalWithdrawals: 500,
  gamesPlayed: 25,
  tier: "Bronze",
  status: "online"
}
```

### **2. Transactions Collection**
```javascript
{
  userId: "ObjectId",
  clerkUserId: "user_123",
  type: "deposit",
  amount: 500,
  walletType: "cash",
  description: "User deposit of ₹500",
  status: "completed",
  createdAt: "2024-12-08T10:00:00Z"
}
```

### **3. Withdrawals Collection**
```javascript
{
  userId: "ObjectId",
  clerkUserId: "user_123",
  userName: "John Doe",
  amount: 1000,
  method: "upi",
  accountDetails: { upiId: "user@paytm" },
  status: "pending",
  createdAt: "2024-12-08T10:00:00Z"
}
```

## 🛠️ **Admin Dashboard Features**

### **Real-time Data Display**:
- ✅ **User Management**: Live user data from MongoDB
- ✅ **Transaction Monitoring**: Real-time transaction history
- ✅ **Withdrawal Processing**: Pending/approved withdrawals
- ✅ **Game Analytics**: Live game activity and statistics
- ✅ **Financial Reports**: Revenue, deposits, withdrawals

### **Database-Powered Analytics**:
- ✅ **User Statistics**: Aggregated user behavior data
- ✅ **Game Performance**: Win rates, popular games, revenue
- ✅ **Financial Insights**: Deposit/withdrawal patterns
- ✅ **Risk Assessment**: User risk levels and patterns

## 🔍 **Troubleshooting**

### **Common Issues**:

1. **Connection Error**: 
   ```
   Error: MongoNetworkError
   ```
   **Solution**: Ensure MongoDB is running and connection string is correct

2. **Authentication Failed**:
   ```
   Error: Authentication failed
   ```
   **Solution**: Check MongoDB username/password in connection string

3. **Database Not Found**:
   ```
   Error: Database win07gaming not found
   ```
   **Solution**: Database will be created automatically on first use

4. **Index Creation Failed**:
   ```
   Error: Index already exists
   ```
   **Solution**: This is normal, indexes are created once

### **Debug Commands**:
```bash
# Check database connection
curl http://localhost:3000/api/health

# Initialize database
curl -X POST http://localhost:3000/api/startup

# Check server logs
npm run dev (check console output)
```

## 📱 **Testing the Setup**

### **1. Test User Registration**:
1. Go to `/signup` and create a new account
2. Check admin dashboard to see new user
3. Verify user appears in MongoDB

### **2. Test Wallet Operations**:
1. Go to `/wallet` and make a deposit
2. Check transaction appears in admin dashboard
3. Verify balance updates in real-time

### **3. Test Admin Dashboard**:
1. Go to `/admin` and login
2. Verify all user data loads from MongoDB
3. Test withdrawal processing
4. Check all updates reflect immediately

## 🎉 **Benefits Achieved**

### **Reliability**:
- ✅ **No Data Loss**: Permanent storage in MongoDB
- ✅ **ACID Compliance**: Database transactions
- ✅ **Backup Support**: MongoDB backup tools
- ✅ **Disaster Recovery**: Professional database features

### **Performance**:
- ✅ **Fast Queries**: Optimized database indexes
- ✅ **Scalable**: Handle thousands of users
- ✅ **Efficient**: Proper database design
- ✅ **Real-time**: Live data updates

### **Security**:
- ✅ **Data Validation**: Schema-based validation
- ✅ **Access Control**: Secure database operations
- ✅ **Audit Trail**: Complete operation logging
- ✅ **Compliance**: Financial transaction standards

## 🚨 **Important Notes**

### **For Production**:
- Use **MongoDB Atlas** for cloud hosting
- Set up **database backups** 
- Configure **monitoring** and alerts
- Use **replica sets** for high availability

### **For Development**:
- Local MongoDB is fine for testing
- Use **MongoDB Compass** for database visualization
- Monitor **database logs** for issues
- Test **all user flows** thoroughly

## 🎯 **Success Indicators**

Your setup is working correctly if:
- ✅ `/api/health` returns "healthy" status
- ✅ Admin dashboard loads user data
- ✅ User registrations appear in admin panel
- ✅ Wallet operations update balances immediately
- ✅ All transactions are logged and visible

**Your WIN07 Gaming Platform is now powered by MongoDB!** 🎉
