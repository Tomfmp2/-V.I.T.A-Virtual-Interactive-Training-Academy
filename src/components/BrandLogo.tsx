export const BrandLogo = () => (
  <div className="brand-logo-svg">
    <svg width="300" height="80" viewBox="0 0 260 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vita-v2-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E676" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <g>
        <path d="M12 14L28 48L44 14H34L28 28L22 14H12Z" fill="#FFFFFF" />
        <path d="M28 26L38 14H28L22 26L28 38L34 26H28Z" fill="url(#vita-v2-gradient)" />
        <polygon points="25,21 33,26 25,31" fill="#FFFFFF" />
      </g>
      <text x="60" y="36" fill="#FFFFFF" fontFamily="sans-serif" fontWeight="900" fontSize="26" letterSpacing="2">
        VITA
      </text>
      <circle cx="138" cy="32" r="3.5" fill="#00E676" />
      <text x="61" y="48" fill="#475569" fontFamily="sans-serif" fontWeight="700" fontSize="9" letterSpacing="1.8">
        LEARNING HUB
      </text>
    </svg>
  </div>
);

export default BrandLogo;
