// Микро-анимации для CRM — import { useRipple } from './useAnimations'

import { useCallback } from 'react'

// Ripple-эффект на кнопках
export function useRipple() {
  const createRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    const circle = document.createElement('span')
    const rect = el.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    circle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      border-radius: 50%;
      background: rgba(255,255,255,0.4);
      transform: scale(0);
      animation: rippleAnim 0.6s ease-out;
      pointer-events: none;
    `

    el.style.position = 'relative'
    el.style.overflow = 'hidden'
    el.appendChild(circle)
    setTimeout(() => circle.remove(), 600)
  }, [])

  return createRipple
}
