# WIN07 - Next.js Gaming Platform

A modern, full-stack gaming platform built with Next.js, TypeScript, and Tailwind CSS. Features 15+ popular games including Aviator, Stickman Project, and classic casino games.

## 🚀 Features

### 🎮 Games
- **Stickman Project** - Epic action game with combat mechanics
- **Aviator** - Crash game with real-time multipliers
- **Teen Patti** - Classic Indian card game
- **Andar Bahar** - Traditional betting game
- **Roulette, Blackjack, Baccarat** - Casino classics
- **Mines, Crash, Plinko** - Modern casino games
- **And 6 more exciting games!**

### 💰 Features
- **Secure Authentication** - Clerk-powered auth system
- **Wallet System** - Deposits, withdrawals, balance management
- **Referral Program** - Earn 10% commission on referrals
- **Real-time Gaming** - Live multiplayer experiences
- **Transaction History** - Complete financial tracking
- **Admin Dashboard** - Full platform management
- **Mobile Responsive** - Perfect on all devices

### 🛠️ Technology Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Forms**: React Hook Form + Zod
- **Database**: TypeScript-based local storage (demo)

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd win07-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env.local` file:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Clerk URLs
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage

### For Players
1. **Sign Up** - Create account with email/social login
2. **Get Bonus** - Receive ₹1000 starting balance
3. **Choose Game** - Browse 15+ available games
4. **Play & Win** - Enjoy real-time gaming experience
5. **Cash Out** - Instant withdrawals via UPI

### For Admins
1. **Access Admin Panel** - Login with admin credentials
2. **Manage Users** - View and manage all users
3. **Monitor Transactions** - Track all financial activities
4. **Game Analytics** - View game performance stats
5. **System Settings** - Configure platform settings

## 🎮 Game Details

### Stickman Project
- **Genre**: Action/Combat
- **Players**: Single-player
- **Controls**: WASD/Arrow keys + X to attack
- **Objective**: Survive waves of enemies

### Aviator
- **Genre**: Casino/Crash
- **Players**: Multiplayer
- **Betting**: ₹10 - ₹1000 per round
- **Objective**: Cash out before plane crashes

### Card Games (Teen Patti, Andar Bahar, etc.)
- **Genre**: Cards/Casino
- **Players**: Multiplayer tables
- **Betting**: Variable limits
- **Rules**: Traditional Indian card game rules

## 📱 Mobile Experience

The platform is fully responsive and optimized for mobile devices:
- Touch-friendly controls
- Swipe gestures
- Mobile-first design
- PWA capabilities
- Offline functionality

## 🔒 Security

- **Authentication**: Clerk-powered secure auth
- **Data Protection**: Encrypted user data
- **Secure Payments**: PCI-compliant payment processing
- **Rate Limiting**: API protection against abuse
- **HTTPS**: SSL encryption for all communications

## 🛣️ Roadmap

### Phase 1 (Current)
- ✅ Core platform setup
- ✅ User authentication
- ✅ Basic games (Stickman, Aviator)
- ✅ Wallet system
- ✅ Referral program

### Phase 2 (Coming Soon)
- 🔄 Real database integration (PostgreSQL/MongoDB)
- 🔄 Payment gateway integration
- 🔄 Live chat support
- 🔄 Push notifications
- 🔄 Advanced analytics

### Phase 3 (Future)
- 📅 Live dealer games
- 📅 Tournament system
- 📅 Social features
- 📅 Mobile app (React Native)
- 📅 Cryptocurrency support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: support@win07.com
- **Discord**: [Join our community](https://discord.gg/win07)
- **Documentation**: [docs.win07.com](https://docs.win07.com)
- **Issues**: [GitHub Issues](https://github.com/win07/issues)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Clerk](https://clerk.com/) - Authentication platform
- [Framer Motion](https://framer.com/motion/) - Animation library
- [Vercel](https://vercel.com/) - Deployment platform

---

**WIN07** - Where every game is an adventure! 🎮✨