# Game Loading Screen Implementation Guide

## ✅ Already Implemented:
- Andar Bahar ✅
- Dragon Tiger ✅  
- Blackjack ✅
- Roulette ✅

## 🎯 Pattern to Apply to Remaining Games:

### 1. Import the Component:
```typescript
import { GameStartingScreen } from '@/components/loading-screen'
```

### 2. Add State:
```typescript
const [isGameStarting, setIsGameStarting] = useState(false)
```

### 3. Modify Start/Play Function:
```typescript
const startGame = useCallback(() => {
  // ... existing validation checks ...

  // Show game starting screen
  setIsGameStarting(true)

  setTimeout(() => {
    setIsGameStarting(false) // Hide loading screen
    // ... existing game start logic ...
  }, 1200) // Show loading for 1.2 seconds

  // ... rest of function ...
}, [])
```

### 4. Update Render:
```typescript
return (
  <>
    {/* Game Starting Screen */}
    {isGameStarting && <GameStartingScreen gameName="Game Name" />}
    <div className="min-h-screen...">
      {/* existing JSX */}
    </div>
  </>
)
```

## 🎮 Remaining Games to Update:
- Mines
- Limbo  
- Baccarat
- Wheel
- Teen Patti
- Plinko
- Aviator

## 📝 Notes:
- Each game should have a unique loading duration (1000-1500ms)
- Replace "Game Name" with actual game name
- The loading screen appears as an overlay when user clicks play
- Loading screen auto-disappears after timeout
