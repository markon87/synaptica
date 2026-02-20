interface LogoProps {
  width?: number
  height?: number
  showText?: boolean
  className?: string
}

export default function Logo({ 
  width = 160, 
  height = 40, 
  showText = true, 
  className = "" 
}: LogoProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 320 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="synGradient" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6"/>
          <stop offset="1" stopColor="#EC4899"/>
        </linearGradient>
      </defs>

      {/* Icon */}
      <g transform="translate(0,8)">
        {/* Outer circle */}
        <circle cx="32" cy="32" r="28" stroke="url(#synGradient)" strokeWidth="2" fill="none"/>
        
        {/* Neural lines */}
        <line x1="18" y1="32" x2="46" y2="18" stroke="url(#synGradient)" strokeWidth="2"/>
        <line x1="18" y1="32" x2="46" y2="46" stroke="url(#synGradient)" strokeWidth="2"/>
        
        {/* Nodes */}
        <circle cx="18" cy="32" r="4" fill="url(#synGradient)"/>
        <circle cx="46" cy="18" r="4" fill="url(#synGradient)"/>
        <circle cx="46" cy="46" r="4" fill="url(#synGradient)"/>
      </g>

      {/* Wordmark */}
      {showText && (
        <text 
          x="80" 
          y="48" 
          fontFamily="Inter, sans-serif" 
          fontSize="36" 
          fontWeight="600" 
          fill="#1E293B"
        >
          Synaptica
        </text>
      )}
    </svg>
  )
}

// Icon-only version for smaller spaces
export function LogoIcon({ width = 64, height = 64, className = "" }: Omit<LogoProps, 'showText'>) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="synGradientIcon" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6"/>
          <stop offset="1" stopColor="#EC4899"/>
        </linearGradient>
      </defs>

      {/* Outer circle */}
      <circle cx="32" cy="32" r="28" stroke="url(#synGradientIcon)" strokeWidth="2" fill="none"/>
      
      {/* Neural lines */}
      <line x1="18" y1="32" x2="46" y2="18" stroke="url(#synGradientIcon)" strokeWidth="2"/>
      <line x1="18" y1="32" x2="46" y2="46" stroke="url(#synGradientIcon)" strokeWidth="2"/>
      
      {/* Nodes */}
      <circle cx="18" cy="32" r="4" fill="url(#synGradientIcon)"/>
      <circle cx="46" cy="18" r="4" fill="url(#synGradientIcon)"/>
      <circle cx="46" cy="46" r="4" fill="url(#synGradientIcon)"/>
    </svg>
  )
}