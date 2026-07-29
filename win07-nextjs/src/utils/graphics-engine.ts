/**
 * Enhanced Graphics Engine for WIN07 Games
 * Provides high-quality, realistic graphics rendering
 */

export interface GraphicsConfig {
  canvas: HTMLCanvasElement
  width: number
  height: number
  pixelRatio?: number
  antialiasing?: boolean
}

export class GraphicsEngine {
  private ctx: CanvasRenderingContext2D
  private canvas: HTMLCanvasElement
  private pixelRatio: number
  private animationFrame: number = 0

  constructor(config: GraphicsConfig) {
    this.canvas = config.canvas
    this.pixelRatio = config.pixelRatio || window.devicePixelRatio || 1
    
    // Set up high-DPI canvas
    this.canvas.width = config.width * this.pixelRatio
    this.canvas.height = config.height * this.pixelRatio
    this.canvas.style.width = `${config.width}px`
    this.canvas.style.height = `${config.height}px`

    const ctx = this.canvas.getContext('2d', {
      alpha: true,
      antialias: config.antialiasing ?? true,
      desynchronized: true // Better performance
    })

    if (!ctx) throw new Error('Could not get 2D context')
    
    this.ctx = ctx
    this.ctx.scale(this.pixelRatio, this.pixelRatio)
    
    // Enable high-quality rendering
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'
  }

  // Clear canvas with optional background
  clear(backgroundColor?: string) {
    if (backgroundColor) {
      this.ctx.fillStyle = backgroundColor
      this.ctx.fillRect(0, 0, this.canvas.width / this.pixelRatio, this.canvas.height / this.pixelRatio)
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width / this.pixelRatio, this.canvas.height / this.pixelRatio)
    }
  }

  // Enhanced gradient backgrounds
  drawGradientBackground(colors: string[], direction: 'vertical' | 'horizontal' | 'radial' = 'vertical') {
    const width = this.canvas.width / this.pixelRatio
    const height = this.canvas.height / this.pixelRatio
    
    let gradient: CanvasGradient

    switch (direction) {
      case 'horizontal':
        gradient = this.ctx.createLinearGradient(0, 0, width, 0)
        break
      case 'radial':
        gradient = this.ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2)
        break
      default: // vertical
        gradient = this.ctx.createLinearGradient(0, 0, 0, height)
    }

    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color)
    })

    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, width, height)
  }

  // Enhanced particle system
  drawParticles(particles: Particle[]) {
    particles.forEach(particle => {
      this.ctx.save()
      
      // Apply particle transformations
      this.ctx.globalAlpha = particle.opacity
      this.ctx.translate(particle.x, particle.y)
      this.ctx.rotate(particle.rotation)
      this.ctx.scale(particle.scale, particle.scale)

      // Draw particle with glow effect
      if (particle.glow) {
        this.ctx.shadowColor = particle.color
        this.ctx.shadowBlur = particle.glow
      }

      this.ctx.fillStyle = particle.color
      this.ctx.beginPath()
      
      switch (particle.shape) {
        case 'circle':
          this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
          break
        case 'square':
          this.ctx.rect(-particle.size/2, -particle.size/2, particle.size, particle.size)
          break
        case 'triangle':
          this.ctx.moveTo(0, -particle.size)
          this.ctx.lineTo(-particle.size, particle.size)
          this.ctx.lineTo(particle.size, particle.size)
          this.ctx.closePath()
          break
      }
      
      this.ctx.fill()
      this.ctx.restore()
    })
  }

  // Enhanced 3D-like effects
  draw3DButton(x: number, y: number, width: number, height: number, color: string, pressed = false) {
    const depth = pressed ? 2 : 6
    const offset = pressed ? 2 : 0

    // Shadow
    this.ctx.fillStyle = '#000000'
    this.ctx.globalAlpha = 0.3
    this.ctx.fillRect(x + 4, y + 4, width, height)
    this.ctx.globalAlpha = 1

    // Button depth
    this.ctx.fillStyle = this.darkenColor(color, 0.3)
    this.ctx.fillRect(x + offset, y + depth + offset, width, height)

    // Button face
    const gradient = this.ctx.createLinearGradient(x, y, x, y + height)
    gradient.addColorStop(0, this.lightenColor(color, 0.2))
    gradient.addColorStop(1, color)
    
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(x + offset, y + offset, width, height)

    // Button highlight
    this.ctx.fillStyle = this.lightenColor(color, 0.4)
    this.ctx.fillRect(x + offset, y + offset, width, 2)
    this.ctx.fillRect(x + offset, y + offset, 2, height)
  }

  // Realistic coin animation
  drawCoin(x: number, y: number, radius: number, rotation: number, value: string) {
    this.ctx.save()
    this.ctx.translate(x, y)
    this.ctx.rotate(rotation)

    // Coin shadow
    this.ctx.fillStyle = '#000000'
    this.ctx.globalAlpha = 0.3
    this.ctx.beginPath()
    this.ctx.ellipse(2, 2, radius, radius * 0.3, 0, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.globalAlpha = 1

    // Coin edge
    const edgeGradient = this.ctx.createRadialGradient(0, 0, radius * 0.8, 0, 0, radius)
    edgeGradient.addColorStop(0, '#FFD700')
    edgeGradient.addColorStop(0.8, '#FFA500')
    edgeGradient.addColorStop(1, '#FF8C00')
    
    this.ctx.fillStyle = edgeGradient
    this.ctx.beginPath()
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2)
    this.ctx.fill()

    // Coin face
    const faceGradient = this.ctx.createRadialGradient(-radius/3, -radius/3, 0, 0, 0, radius * 0.8)
    faceGradient.addColorStop(0, '#FFFF99')
    faceGradient.addColorStop(0.5, '#FFD700')
    faceGradient.addColorStop(1, '#FFA500')
    
    this.ctx.fillStyle = faceGradient
    this.ctx.beginPath()
    this.ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2)
    this.ctx.fill()

    // Coin text
    this.ctx.fillStyle = '#8B4513'
    this.ctx.font = `bold ${radius/2}px Arial`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(value, 0, 0)

    this.ctx.restore()
  }

  // Advanced text rendering with effects
  drawTextWithEffects(text: string, x: number, y: number, options: TextEffectsOptions) {
    this.ctx.save()
    
    this.ctx.font = `${options.weight || 'normal'} ${options.size || 16}px ${options.family || 'Arial'}`
    this.ctx.textAlign = options.align || 'left'
    this.ctx.textBaseline = options.baseline || 'top'

    // Text shadow
    if (options.shadow) {
      this.ctx.fillStyle = options.shadow.color || '#000000'
      this.ctx.globalAlpha = options.shadow.opacity || 0.5
      this.ctx.fillText(text, x + (options.shadow.x || 2), y + (options.shadow.y || 2))
      this.ctx.globalAlpha = 1
    }

    // Text outline
    if (options.outline) {
      this.ctx.strokeStyle = options.outline.color || '#000000'
      this.ctx.lineWidth = options.outline.width || 2
      this.ctx.strokeText(text, x, y)
    }

    // Text fill
    if (options.gradient) {
      const gradient = this.ctx.createLinearGradient(x, y, x, y + (options.size || 16))
      options.gradient.forEach((stop, index) => {
        gradient.addColorStop(index / (options.gradient!.length - 1), stop)
      })
      this.ctx.fillStyle = gradient
    } else {
      this.ctx.fillStyle = options.color || '#000000'
    }
    
    this.ctx.fillText(text, x, y)
    this.ctx.restore()
  }

  // Utility methods
  private lightenColor(color: string, amount: number): string {
    const hex = color.replace('#', '')
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.round(255 * amount))
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.round(255 * amount))
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.round(255 * amount))
    return `rgb(${r}, ${g}, ${b})`
  }

  private darkenColor(color: string, amount: number): string {
    const hex = color.replace('#', '')
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.round(255 * amount))
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.round(255 * amount))
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.round(255 * amount))
    return `rgb(${r}, ${g}, ${b})`
  }

  // Animation frame management
  startAnimationLoop(callback: (deltaTime: number) => void) {
    let lastTime = 0
    
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime
      
      callback(deltaTime)
      this.animationFrame = requestAnimationFrame(animate)
    }
    
    this.animationFrame = requestAnimationFrame(animate)
  }

  stopAnimationLoop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
  }
}

// Interfaces
export interface Particle {
  x: number
  y: number
  size: number
  color: string
  opacity: number
  rotation: number
  scale: number
  shape: 'circle' | 'square' | 'triangle'
  glow?: number
}

export interface TextEffectsOptions {
  color?: string
  size?: number
  family?: string
  weight?: string
  align?: CanvasTextAlign
  baseline?: CanvasTextBaseline
  shadow?: {
    x?: number
    y?: number
    color?: string
    opacity?: number
  }
  outline?: {
    color?: string
    width?: number
  }
  gradient?: string[]
}

// Particle system manager
export class ParticleSystem {
  private particles: Particle[] = []

  addParticle(particle: Particle) {
    this.particles.push(particle)
  }

  addExplosion(x: number, y: number, count = 20, colors = ['#FFD700', '#FFA500', '#FF4500']) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count
      const speed = Math.random() * 5 + 2
      const size = Math.random() * 8 + 4
      
      this.addParticle({
        x: x + Math.cos(angle) * speed * 10,
        y: y + Math.sin(angle) * speed * 10,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        rotation: Math.random() * Math.PI * 2,
        scale: 1,
        shape: Math.random() > 0.5 ? 'circle' : 'square',
        glow: 10
      })
    }
  }

  update(deltaTime: number) {
    this.particles = this.particles.filter(particle => {
      particle.y += 2 // Gravity
      particle.opacity -= deltaTime * 0.001
      particle.rotation += deltaTime * 0.01
      particle.scale *= 0.995
      
      return particle.opacity > 0 && particle.scale > 0.1
    })
  }

  getParticles(): Particle[] {
    return this.particles
  }

  clear() {
    this.particles = []
  }
}
