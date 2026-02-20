export default function FaviconSVG() {
  return (
    <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="faviconGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6"/>
          <stop offset="1" stopColor="#EC4899"/>
        </linearGradient>
      </defs>
      
      {/* Background circle */}
      <circle cx="32" cy="32" r="32" fill="white"/>
      
      {/* Outer circle */}
      <circle cx="32" cy="32" r="24" stroke="url(#faviconGradient)" strokeWidth="2" fill="none"/>
      
      {/* Neural lines */}
      <line x1="20" y1="32" x2="44" y2="20" stroke="url(#faviconGradient)" strokeWidth="2"/>
      <line x1="20" y1="32" x2="44" y2="44" stroke="url(#faviconGradient)" strokeWidth="2"/>
      
      {/* Nodes */}
      <circle cx="20" cy="32" r="3" fill="url(#faviconGradient)"/>
      <circle cx="44" cy="20" r="3" fill="url(#faviconGradient)"/>
      <circle cx="44" cy="44" r="3" fill="url(#faviconGradient)"/>
    </svg>
  )
}