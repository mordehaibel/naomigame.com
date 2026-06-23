// טאופה - SVG חמודה בצבעי חום, משותפת בין WhackAMoleGame ל-CastleCard
export default function MoleIcon({ className = 'w-3/4 h-3/4', shadow = true }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={shadow ? { filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.4))' } : undefined}
    >
      <defs>
        <radialGradient id="mole-body-grad" cx="50%" cy="35%">
          <stop offset="0%" stopColor="#A0723D" />
          <stop offset="100%" stopColor="#5D4037" />
        </radialGradient>
        <radialGradient id="mole-head-grad" cx="50%" cy="30%">
          <stop offset="0%" stopColor="#A87447" />
          <stop offset="100%" stopColor="#6B4423" />
        </radialGradient>
      </defs>

      {/* גוף */}
      <ellipse cx="50" cy="78" rx="38" ry="22" fill="url(#mole-body-grad)" />

      {/* ראש */}
      <ellipse cx="50" cy="50" rx="30" ry="26" fill="url(#mole-head-grad)" />

      {/* אוזניים */}
      <ellipse cx="28" cy="32" rx="5" ry="6" fill="#4A3424" />
      <ellipse cx="72" cy="32" rx="5" ry="6" fill="#4A3424" />
      <ellipse cx="28" cy="33" rx="2.5" ry="3.5" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="72" cy="33" rx="2.5" ry="3.5" fill="#FFB6C1" opacity="0.6" />

      {/* חוטם */}
      <ellipse cx="50" cy="58" rx="14" ry="10" fill="#E8B89A" />
      <ellipse cx="50" cy="62" rx="11" ry="7" fill="#D4A487" />

      {/* אף */}
      <ellipse cx="50" cy="55" rx="4" ry="3" fill="#1a1a1a" />
      <ellipse cx="48" cy="54" rx="1.5" ry="1" fill="#fff" opacity="0.6" />

      {/* עיניים */}
      <path d="M 32 46 Q 38 49 42 46" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 58 46 Q 64 49 68 46" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* שפם */}
      <line x1="38" y1="63" x2="28" y2="62" stroke="#3D2817" strokeWidth="1" strokeLinecap="round" />
      <line x1="38" y1="66" x2="28" y2="68" stroke="#3D2817" strokeWidth="1" strokeLinecap="round" />
      <line x1="62" y1="63" x2="72" y2="62" stroke="#3D2817" strokeWidth="1" strokeLinecap="round" />
      <line x1="62" y1="66" x2="72" y2="68" stroke="#3D2817" strokeWidth="1" strokeLinecap="round" />

      {/* כפות */}
      <ellipse cx="30" cy="82" rx="7" ry="5" fill="#D4A487" />
      <ellipse cx="70" cy="82" rx="7" ry="5" fill="#D4A487" />
      <line x1="26" y1="86" x2="25" y2="89" stroke="#3D2817" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="29" y1="87" x2="29" y2="90" stroke="#3D2817" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="32" y1="86" x2="33" y2="89" stroke="#3D2817" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="67" y1="86" x2="66" y2="89" stroke="#3D2817" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="70" y1="87" x2="70" y2="90" stroke="#3D2817" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="73" y1="86" x2="74" y2="89" stroke="#3D2817" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
