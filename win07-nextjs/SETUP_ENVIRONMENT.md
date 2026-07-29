# 🔧 Environment Setup for AI Agent System

## Critical: Create .env file

You MUST create a `.env` file in the `win07-nextjs` directory with these variables:

```env
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here

# Anthropic AI API (Required for AI features)
ANTHROPIC_API_KEY=sk-ant-api03-your_key_here
```

## ⚠️ Current Error Fix

The "Authentication failed" error you're seeing is because:

1. **Missing .env file**: The system can't authenticate users without Clerk keys
2. **Missing Anthropic key**: AI features won't work without the API key

## 🚀 Steps to Fix:

1. **Create .env file** in `win07-nextjs/` directory
2. **Add your Clerk keys** (from Clerk dashboard)
3. **Add your Anthropic key** (the one you provided: `sk-ant-api03-REDACTED-ROTATE-THIS-KEY`)
4. **Restart the dev server**

## 📝 Example .env file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
ANTHROPIC_API_KEY=sk-ant-api03-REDACTED-ROTATE-THIS-KEY
```

## ✅ After Setup:

- ✅ Balance API will work (`/api/wallet/balance`)
- ✅ User creation will be automatic
- ✅ AI insights will be available
- ✅ Real-time updates will start
- ✅ Admin dashboard will be fully functional

## 🎯 Test Commands:

```bash
# 1. Create .env file with your keys
# 2. Restart development server
npm run dev

# 3. Test health endpoint
curl http://localhost:3000/api/health

# 4. Access admin dashboard
# Navigate to http://localhost:3000/admin
```

## 🤖 AI Agent Features Available:

- **Real-time User Management**: Automatic user creation and sync
- **Intelligent Analytics**: AI-powered platform insights  
- **Transaction Monitoring**: Live transaction tracking
- **WebSocket Updates**: Real-time admin dashboard
- **Fraud Detection**: Automated risk assessment
- **Predictive Intelligence**: Growth recommendations

---

**Once you create the .env file with your keys, the authentication errors will be resolved!** 🚀
