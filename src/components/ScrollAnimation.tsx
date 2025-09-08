import React, { useEffect, useRef, useState } from 'react'

interface ScrollAnimationProps {
  children: React.ReactNode
  animation?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'slideInTop'
  delay?: number
  threshold?: number
  className?: string
}

const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  animation = 'fadeInUp',
  delay = 0,
  threshold = 0.1,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold])

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0'
    
    const baseClasses = {
      fadeInUp: 'animate-fade-in-up',
      fadeInLeft: 'animate-fade-in-left',
      fadeInRight: 'animate-fade-in-right',
      scaleIn: 'animate-scale-in',
      slideInTop: 'animate-slide-in-top'
    }
    
    return baseClasses[animation] || baseClasses.fadeInUp
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${getAnimationClass()} ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}

export default ScrollAnimation
