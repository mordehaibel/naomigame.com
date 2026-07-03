import { useState, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LogOut,
  User,
  Volume2,
  VolumeX,
  UserPlus,
  Gamepad2,
  Heart,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useT } from '../../hooks/useT';

const BANNER_GRADIENT = `
  linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 40%, transparent 60%, rgba(0,0,0,0.08) 100%),
  linear-gradient(90deg,
    #4A148C 0%,
    #1A237E 12%,
    #1976D2 25%,
    #4FC3F7 38%,
    #FFB6D9 52%,
    #FF69B4 65%,
    #FF8C42 80%,
    #FFD700 92%,
    #FFEB3B 100%
  )
`;

// באנר גלובלי - רספונסיבי, ניתן לקיפול כדי לפנות מקום למשחק.
// defaultCollapsed=true → נטען מקופל (עמודי משחק) כדי לתת מקסימום מסך למשחק.
export default function Banner({ defaultCollapsed = false }) {
  const { currentUser, logout } = useAuth();
  const { enabled: soundEnabled, toggle: toggleSound } = useSound();
  const { t, lang } = useT();
  const navigate = useNavigate();
  const isHebrew = lang === 'he';

  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const headerRef = useRef(null);

  // מודדים את גובה הבאנר בפועל (רספונסיבי + מצב קיפול) ומזרימים ל-CSS var
  // כדי שריפוד התוכן (body) תמיד יתאים - בלי ערך קבוע שמבזבז מסך במובייל.
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const setVar = () => {
      document.documentElement.style.setProperty(
        '--banner-h',
        `${Math.round(el.offsetHeight) + 8}px`
      );
    };
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    window.addEventListener('resize', setVar);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setVar);
    };
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const homeLink = currentUser ? '/games' : '/';

  const actionRow = (
    <div className="flex items-center gap-1 sm:gap-1.5" dir="ltr">
      <LanguageSwitcher />
      <NavCircle
        to="/register"
        tooltip={t('nav.tooltipRegister')}
        ariaLabel={t('nav.tooltipRegister')}
        icon={UserPlus}
      />
      <NavCircle
        to="/games"
        tooltip={t('nav.tooltipGames')}
        ariaLabel={t('nav.tooltipGames')}
        icon={Gamepad2}
      />
      <NavCircle
        to="/discover"
        tooltip={t('nav.tooltipDiscover')}
        ariaLabel={t('nav.tooltipDiscover')}
        icon={Heart}
      />
      {currentUser && (
        <>
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-full bg-white/95 shadow hover:bg-white transition"
            aria-label={soundEnabled ? t('nav.soundOff') : t('nav.soundOn')}
            title={soundEnabled ? t('nav.soundOff') : t('nav.soundOn')}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <Link
            to="/profile"
            className="p-1.5 rounded-full bg-white/95 shadow hover:bg-white transition"
            aria-label={t('nav.profile')}
            title={t('nav.profile')}
          >
            <User size={14} />
          </Link>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-full bg-white/95 shadow hover:bg-red-50 transition"
            aria-label={t('nav.logout')}
            title={t('nav.logout')}
          >
            <LogOut size={14} />
          </button>
        </>
      )}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="p-1.5 rounded-full bg-white/95 shadow hover:bg-white transition"
        aria-label={collapsed ? t('nav.expandBanner') : t('nav.collapseBanner')}
        title={collapsed ? t('nav.expandBanner') : t('nav.collapseBanner')}
        aria-expanded={!collapsed}
      >
        {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
    </div>
  );

  // ---- מצב מקופל: פס דק שמפנה מקסימום מסך למשחק ----
  if (collapsed) {
    return (
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 shadow-lg z-50 border-b-2 border-pink-300/80"
        style={{ background: BANNER_GRADIENT }}
      >
        <div
          className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 flex items-center justify-between gap-2"
          dir="ltr"
        >
          <Link
            to={homeLink}
            className="flex items-center gap-2 min-w-0 hover:opacity-90 transition-opacity"
          >
            <span className="shrink-0 rounded-full overflow-hidden border-2 border-white shadow w-9 h-9 sm:w-10 sm:h-10">
              <img
                src="/characters/shlomi.png"
                alt=""
                className="w-full h-full object-cover"
                aria-hidden="true"
              />
            </span>
            <span
              className="truncate font-black text-white text-sm sm:text-base"
              style={{
                fontFamily: '"Heebo", "Rubik", sans-serif',
                textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
              }}
            >
              {t('common.appName')}
            </span>
          </Link>
          {actionRow}
        </div>
      </header>
    );
  }

  // ---- מצב מלא (רספונסיבי) ----
  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 shadow-xl z-50 border-b-4 border-pink-300/80"
      style={{
        background: BANNER_GRADIENT,
        boxShadow:
          'inset 0 -4px 8px rgba(0,0,0,0.15), inset 0 2px 3px rgba(255,255,255,0.55), 0 8px 18px rgba(0,0,0,0.18)',
      }}
    >
      {/* כוכבים בחלק השמאלי-כהה (ללא שינוי) */}
      <BannerStars />

      {/* תבנית לבבות בחלק הצהוב הימני */}
      <HeartPattern />

      {/* לבבות עפים מאחורי הילדה (z-index נמוך מהתמונה) */}
      <FlyingHearts />

      {/* בס"ד - לבד בפינה הימנית-עליונה */}
      <span
        className="absolute top-1 right-3 text-base md:text-xl font-black text-black select-none z-20"
        style={{
          direction: 'rtl',
          fontFamily: '"Heebo", "Rubik", sans-serif',
          textShadow: '0 1px 2px rgba(255,255,255,0.5)',
        }}
        aria-hidden="true"
      >
        בס״ד
      </span>

      {/* שורה ראשית - dir=ltr קבוע */}
      <div
        className="min-h-[120px] sm:min-h-[150px] md:min-h-[180px] max-w-7xl mx-auto px-3 sm:px-4 md:px-8 flex items-center justify-between gap-2 sm:gap-4 relative z-10"
        dir="ltr"
      >
        {/* שמאל - שלומי בעיגול גדול */}
        <Link
          to={homeLink}
          className="hover:scale-110 transition-transform shrink-0 relative rounded-full overflow-hidden border-4 border-white shadow-xl w-16 h-16 sm:w-24 sm:h-24 md:w-[140px] md:h-[140px]"
          style={{ background: 'linear-gradient(135deg, #FFE5F1 0%, #CFE9FF 100%)' }}
        >
          <img
            src="/characters/shlomi.png"
            alt="Chlomi"
            className="w-full h-full object-cover"
          />
          <span
            className="absolute bottom-0 left-0 right-0 text-center text-white font-black py-0.5 text-[10px] sm:text-xs md:text-sm"
            style={{
              background: 'rgba(0,0,0,0.55)',
              fontFamily: '"Copperplate Gothic Bold", "Copperplate Gothic", "Optima", "Heebo", "Rubik", serif',
              letterSpacing: '0.05em',
            }}
          >
            {t('header.boyName')}
          </span>
        </Link>

        {/* מרכז - לוגו */}
        <Link
          to={homeLink}
          className="text-center flex-1 min-w-0 hover:opacity-90 transition-opacity overflow-visible flex flex-col justify-center"
        >
          <div className="text-xl sm:text-2xl md:text-3xl leading-none mb-1" aria-hidden="true">🏰</div>

          <h1
            className={`leading-tight inline-block text-center ${
              isHebrew
                ? 'text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-7xl'
                : 'text-xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl'
            }`}
            style={{
              fontFamily:
                '"Copperplate Gothic Bold", "Copperplate Gothic", "Copperplate", "Optima", "Heebo", "Rubik", serif',
              fontWeight: 700,
              letterSpacing: isHebrew ? '0.06em' : '0.18em',
              transform: isHebrew ? 'scaleX(1.06)' : 'scaleX(1.22)',
              transformOrigin: 'center',
              background:
                'linear-gradient(160deg, #6E7C8A 0%, #A8B5BF 18%, #D8DEE3 35%, #FFFFFF 50%, #D8DEE3 65%, #A8B5BF 82%, #4A5568 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextStroke: isHebrew ? '4px #000' : '5px #000',
              filter:
                'drop-shadow(2px 3px 1px rgba(0,0,0,0.55)) drop-shadow(0 0 6px rgba(255,255,255,0.4))',
              textAlign: 'center',
            }}
          >
            <div>{t('common.appNamePart1')}</div>
            <div>{t('common.appNamePart2')}</div>
          </h1>

          <div
            className="text-[10px] sm:text-xs md:text-sm font-bold leading-tight mt-1"
            style={{
              fontFamily:
                '"Copperplate Gothic Bold", "Copperplate Gothic", "Optima", "Heebo", "Rubik", serif',
              color: '#fff',
              letterSpacing: '0.04em',
              textShadow: '1px 1px 0 rgba(0,0,0,0.5), 0 0 6px rgba(255,255,255,0.4)',
            }}
          >
            {t('common.appSubtitle')}
          </div>
          {currentUser && (
            <div
              className="text-[10px] md:text-xs leading-tight truncate font-bold mt-0.5 inline-block px-2 py-0.5 rounded-full bg-white/85"
              style={{
                fontFamily: '"Heebo", "Rubik", sans-serif',
                color: '#5b21b6',
              }}
            >
              <span>{currentUser.name}</span>
              <span className="mx-1">·</span>
              <span className="text-orange-700">⭐ {currentUser.points}</span>
              <span className="mx-1 hidden sm:inline">·</span>
              <span className="text-purple-700 hidden sm:inline">
                {t('common.level')} {currentUser.level}
              </span>
            </div>
          )}
        </Link>

        {/* ימין - נעמי בעיגול גדול */}
        <Link
          to={homeLink}
          className="hover:scale-110 transition-transform shrink-0 relative rounded-full overflow-hidden border-4 border-white shadow-xl z-20 w-16 h-16 sm:w-24 sm:h-24 md:w-[140px] md:h-[140px]"
          style={{ background: 'linear-gradient(135deg, #FFE5F1 0%, #FFC1E3 100%)' }}
        >
          <img
            src="/PetiteFilleFondBlanc.jpeg"
            alt="Naomie"
            className="w-full h-full object-cover"
          />
          <span
            className="absolute bottom-0 left-0 right-0 text-center text-white font-black py-0.5 text-[10px] sm:text-xs md:text-sm"
            style={{
              background: 'rgba(0,0,0,0.55)',
              fontFamily: '"Copperplate Gothic Bold", "Copperplate Gothic", "Optima", "Heebo", "Rubik", serif',
              letterSpacing: '0.05em',
            }}
          >
            {t('header.girlName')}
          </span>
        </Link>
      </div>

      {/* שורת פעולות - בתחתית הבאנר, מקובעת לפינה הימנית */}
      <div className="absolute bottom-1.5 right-2 z-30">{actionRow}</div>
    </header>
  );
}

// כפתור-עיגול עם tooltip מותאם CSS (מופיע ב-hover)
function NavCircle({ to, tooltip, ariaLabel, icon: Icon }) {
  return (
    <Link
      to={to}
      className="group relative p-1.5 rounded-full bg-white/95 shadow hover:bg-white hover:scale-110 transition"
      aria-label={ariaLabel}
    >
      <Icon size={14} />
      {/* Tooltip - מופיע ב-hover, מתחת לעיגול */}
      <span
        className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-black/90 text-white text-[11px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-lg z-50"
        style={{ fontFamily: '"Heebo", "Rubik", sans-serif' }}
      >
        {tooltip}
      </span>
    </Link>
  );
}

// כוכבים נוצצים + נופלים בחלק השמאלי-כהה (ללא שינוי - שמירה על האפקט הקיים)
function BannerStars() {
  const stars = [
    { left: '4%', top: '20%', size: 4, delay: '0s' },
    { left: '12%', top: '50%', size: 3, delay: '0.6s' },
    { left: '8%', top: '78%', size: 5, delay: '1.2s' },
    { left: '20%', top: '15%', size: 3, delay: '1.8s' },
    { left: '24%', top: '65%', size: 4, delay: '0.3s' },
    { left: '32%', top: '40%', size: 3, delay: '0.9s' },
  ];

  return (
    <>
      <style>{`
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes shooting-star-1 {
          0%   { transform: translate(0, 0); opacity: 0; }
          5%   { opacity: 1; }
          70%  { opacity: 1; }
          100% { transform: translate(180px, 90px); opacity: 0; }
        }
        @keyframes shooting-star-2 {
          0%   { transform: translate(0, 0); opacity: 0; }
          10%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translate(220px, 120px); opacity: 0; }
        }
        .b-star {
          position: absolute;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 6px #fff, 0 0 12px rgba(255,255,255,0.6);
          animation: star-twinkle 2.5s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
        }
        .b-shooting {
          position: absolute;
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #fff 60%, #fff);
          border-radius: 999px;
          box-shadow: 0 0 8px #fff, 0 0 14px rgba(255,255,255,0.7);
          transform-origin: 0 0;
          pointer-events: none;
          z-index: 1;
        }
      `}</style>
      {stars.map((s, i) => (
        <span
          key={i}
          className="b-star"
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: s.delay,
          }}
        />
      ))}
      <span
        className="b-shooting"
        style={{
          left: '5%',
          top: '12%',
          transform: 'rotate(28deg)',
          animation: 'shooting-star-1 4.5s ease-in 1.5s infinite',
        }}
      />
      <span
        className="b-shooting"
        style={{
          left: '2%',
          top: '55%',
          width: '50px',
          transform: 'rotate(35deg)',
          animation: 'shooting-star-2 5.2s ease-in 3s infinite',
        }}
      />
    </>
  );
}

// תבנית לבבות בחלק הימני-צהוב של הבאנר
function HeartPattern() {
  // SVG דפוס של לבב קטן בצבע זהב-בהיר על שקוף, נצבע מעל החלק הצהוב
  const heartSvg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'>
       <path d='M14 22 C14 22, 4 16, 4 10 C4 6, 7 4, 10 4 C12 4, 13.5 5, 14 6.5 C14.5 5, 16 4, 18 4 C21 4, 24 6, 24 10 C24 16, 14 22, 14 22 Z'
             fill='%23FFF59D' opacity='0.12'/>
       <path d='M14 22 C14 22, 4 16, 4 10 C4 6, 7 4, 10 4 C12 4, 13.5 5, 14 6.5 C14.5 5, 16 4, 18 4 C21 4, 24 6, 24 10 C24 16, 14 22, 14 22 Z'
             fill='none' stroke='%23E0A800' stroke-width='0.4' opacity='0.10'/>
     </svg>`
  );

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        // ממוקם רק על החלק הימני-צהוב של הבאנר (~75-100% רוחב)
        background: `url("data:image/svg+xml,${heartSvg}") repeat`,
        backgroundSize: '28px 28px',
        // מסכת גרדיאנט: שקוף לחלוטין משמאל, אטום מימין → התבנית מופיעה רק על החלק הצהוב
        WebkitMaskImage:
          'linear-gradient(90deg, transparent 0%, transparent 70%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,0.95) 100%)',
        maskImage:
          'linear-gradient(90deg, transparent 0%, transparent 70%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,0.95) 100%)',
        zIndex: 1,
      }}
      aria-hidden="true"
    />
  );
}

// לבבות עפים מאחורי הילדה (z-index 5 = מתחת לתמונה z-20)
function FlyingHearts() {
  return (
    <>
      <style>{`
        @keyframes flying-heart-1 {
          0%   { transform: translate(0, 0) rotate(-10deg) scale(0.6); opacity: 0; }
          10%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translate(-260px, -40px) rotate(-25deg) scale(1.1); opacity: 0; }
        }
        @keyframes flying-heart-2 {
          0%   { transform: translate(0, 0) rotate(8deg) scale(0.5); opacity: 0; }
          10%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translate(-300px, 30px) rotate(20deg) scale(1.0); opacity: 0; }
        }
        @keyframes flying-heart-3 {
          0%   { transform: translate(0, 0) rotate(-5deg) scale(0.7); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translate(-220px, -20px) rotate(-15deg) scale(1.0); opacity: 0; }
        }
        .b-heart {
          position: absolute;
          font-size: 16px;
          line-height: 1;
          pointer-events: none;
          filter: drop-shadow(0 0 4px rgba(255,255,255,0.6));
          z-index: 5;
        }
      `}</style>

      {/* לב 1 - מהפינה הימנית-עליונה אלכסונית שמאלה */}
      <span
        className="b-heart"
        style={{
          right: '3%',
          top: '25%',
          color: '#FF1493',
          animation: 'flying-heart-1 5s ease-in 0s infinite',
        }}
      >
        💗
      </span>

      {/* לב 2 - מסלול שונה */}
      <span
        className="b-heart"
        style={{
          right: '8%',
          top: '55%',
          color: '#FFD700',
          animation: 'flying-heart-2 6s ease-in 1.8s infinite',
          fontSize: '14px',
        }}
      >
        💛
      </span>

      {/* לב 3 - לבן/ורוד */}
      <span
        className="b-heart"
        style={{
          right: '5%',
          top: '70%',
          color: '#fff',
          animation: 'flying-heart-3 5.5s ease-in 3.5s infinite',
          fontSize: '15px',
        }}
      >
        🤍
      </span>

      {/* לב 4 - ורוד נוסף, איטי יותר */}
      <span
        className="b-heart"
        style={{
          right: '6%',
          top: '40%',
          color: '#FF69B4',
          animation: 'flying-heart-1 7s ease-in 2.5s infinite',
          fontSize: '13px',
        }}
      >
        💖
      </span>
    </>
  );
}
