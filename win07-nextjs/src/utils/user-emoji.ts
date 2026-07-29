// 50 unique emoji faces inspired by animals, birds, and other creative things
export const USER_EMOJI_FACES = [
  // Animals
  '🦁', '🐯', '🐻', '🐼', '🐨', '🐸', '🐵', '🦊', '🐺', '🐱',
  '🐶', '🐰', '🦔', '🐭', '🐹', '🐷', '🐸', '🦄', '🐴', '🐮',
  
  // Birds
  '🦅', '🦆', '🐧', '🦉', '🦚', '🐣', '🐥', '🦜', '🕊️', '🦢',
  
  // Sea creatures
  '🐙', '🦑', '🐠', '🐡', '🦈', '🐳', '🐬', '🦭', '🐢', '🦀',
  
  // Fantasy & Fun
  '👽', '🤖', '👻', '🎭', '🤡', '🥸', '😎', '🤠', '👸', '🤴'
]

// Generate a consistent emoji for a user based on their ID
export const getUserEmoji = (userId: string): string => {
  if (!userId) return '😊' // Default fallback
  
  // Create a hash from the user ID to ensure consistency
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get index
  const index = Math.abs(hash) % USER_EMOJI_FACES.length
  return USER_EMOJI_FACES[index]
}

// Generate emoji for leaderboard entries (using name + rank for consistency)
export const getLeaderboardEmoji = (name: string, rank: number): string => {
  const seed = `${name}-${rank}`
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  const index = Math.abs(hash) % USER_EMOJI_FACES.length
  return USER_EMOJI_FACES[index]
}

// Get random emoji (for generating new leaderboard data)
export const getRandomEmoji = (): string => {
  const index = Math.floor(Math.random() * USER_EMOJI_FACES.length)
  return USER_EMOJI_FACES[index]
}

// Get emoji category name for display (optional)
export const getEmojiCategory = (emoji: string): string => {
  const animalEmojis = ['🦁', '🐯', '🐻', '🐼', '🐨', '🐸', '🐵', '🦊', '🐺', '🐱', '🐶', '🐰', '🦔', '🐭', '🐹', '🐷', '🐸', '🦄', '🐴', '🐮']
  const birdEmojis = ['🦅', '🦆', '🐧', '🦉', '🦚', '🐣', '🐥', '🦜', '🕊️', '🦢']
  const seaEmojis = ['🐙', '🦑', '🐠', '🐡', '🦈', '🐳', '🐬', '🦭', '🐢', '🦀']
  const fantasyEmojis = ['👽', '🤖', '👻', '🎭', '🤡', '🥸', '😎', '🤠', '👸', '🤴']
  
  if (animalEmojis.includes(emoji)) return 'Animal'
  if (birdEmojis.includes(emoji)) return 'Bird'
  if (seaEmojis.includes(emoji)) return 'Sea Creature'
  if (fantasyEmojis.includes(emoji)) return 'Fantasy'
  return 'Special'
}
