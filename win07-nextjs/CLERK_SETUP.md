# Clerk Authentication Setup

## Fix Clerk Connection Timeout Error

The error `VM62:33 Error: Clerk: Failed to load Clerk` occurs because the environment variables are not properly configured.

### Step 1: Create Environment File

Create a file named `.env.local` in the `win07-nextjs` folder with the following content:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c3RpcnJlZC1mZWxpbmUtMjcuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_your_actual_clerk_secret_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Anthropic API for Chatbot
ANTHROPIC_API_KEY=sk-ant-api03-REDACTED-ROTATE-THIS-KEY
```

### Step 2: Get Proper Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application or use existing one
3. Copy the **Publishable Key** and **Secret Key**
4. Replace the placeholder values in `.env.local`

### Step 3: Restart Development Server

After creating the `.env.local` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

This will resolve the Clerk authentication timeout error and make the chatbot work properly.
