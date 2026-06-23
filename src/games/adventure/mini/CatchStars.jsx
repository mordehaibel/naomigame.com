import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../../../hooks/useSound';
import { useT } from '../../../hooks/useT';

// מיני-משחק: כוכבים נופלים מלמעלה - תפוס {target} מתוך הזמן הקצוב.
export default function CatchStars({ config, onComplete, accent, worldId = 0 }) {
  const { play } = useSound();
  const { t } = useT();
  const { target, time, badGuyChance } = config;
  const [items, setItems] = useState([]);
  const [collected, setCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(time);
  const [done, setDone] = useState(false);
  const [hitBomb, setHitBomb] = useState(false);
  const idCounter = useRef(0);
  const spawnTimerRef = useRef(null);
  const moveTimerRef = useRef(null);
  const gameTimerRef = useRef(null);
  const containerRef = useRef(null);

  const cleanup = useCallback(() => {
    clearInterval(spawnTimerRef.current);
    clearInterval(moveTimerRef.current);
    clearInterval(gameTimerRef.current);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  useEffect(() => {
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((tl) => (tl <= 1 ? 0 : tl - 1));
    }, 1000);

    spawnTimerRef.current = setInterval(() => {
      idCounter.current += 1;
      const isBad = Math.random() < badGuyChance;
      setItems((prev) => [
        ...prev,
        {
          id: idCounter.current,
          x: 5 + Math.random() * 85,
          top: -10,
          type: isBad ? 'bomb' : 'star',
          speed: 0.8 + Math.random() * 0.6,
        },
      ]);
    }, 700);

    moveTimerRef.current = setInterval(() => {
      setItems((prev) =>
        prev
          .map((it) => ({ ...it, top: it.top + it.speed }))
          .filter((it) => it.top < 110)
      );
    }, 50);
  }, [badGuyChance]);

  useEffect(() => {
    if (done) return;
    if (timeLeft === 0) {
      cleanup();
      setDone(true);
      const success = collected >= target;
      const score = collected * 10 + (success ? 30 : 0);
      setTimeout(() => onComplete(success, score), 600);
    }
    if (collected >= target && !done) {
      cleanup();
      setDone(true);
      play('success');
      const score = collected * 10 + 30 + timeLeft * 2;
      setTimeout(() => onComplete(true, score), 600);
    }
  }, [timeLeft, collected, target, done, cleanup, onComplete, play]);

  const handleTap = (id, type) => {
    if (done) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (type === 'star') {
      setCollected((c) => c + 1);
      play('point');
    } else {
      cleanup();
      setHitBomb(true);
      setDone(true);
      play('fail');
      setTimeout(() => onComplete(false, collected * 5), 800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-white/90 px-3 py-2 rounded-2xl text-sm font-bold">
          {t('games.adventure.catchCollected')}: {collected}/{target}
        </div>
        <div className="bg-white/90 px-3 py-2 rounded-2xl text-sm font-bold">
          ⏱️ {timeLeft}{t('gameUI.secAbbr')}
        </div>
      </div>

      {/* אזור משחק - רקע נושאי לפי המדינה */}
      <div
        ref={containerRef}
        className="relative w-full max-w-md aspect-[3/4] rounded-3xl shadow-2xl overflow-hidden"
        style={{ borderColor: accent, borderWidth: 3, borderStyle: 'solid' }}
      >
        {/* רקע מקומי לפי המדינה */}
        <CountryBackground worldId={worldId} />

        {/* פריטים נופלים - מעל הרקע */}
        <AnimatePresence>
          {items.map((it) => (
            <motion.button
              key={it.id}
              onClick={() => handleTap(it.id, it.type)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute text-4xl md:text-5xl"
              style={{
                left: `${it.x}%`,
                top: `${it.top}%`,
                transform: 'translateX(-50%)',
                zIndex: 10,
                filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.8))',
              }}
            >
              {it.type === 'star' ? '⭐' : '☄️'}
            </motion.button>
          ))}
        </AnimatePresence>

        {hitBomb && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 5, opacity: [0, 1, 0] }}
            className="absolute inset-0 flex items-center justify-center text-6xl z-20"
          >
            💥
          </motion.div>
        )}
      </div>

      <p className="text-center text-sm text-gray-700">
        {t('games.adventure.catchHowTo')}
      </p>
    </div>
  );
}

// בורר רקע לפי המדינה
function CountryBackground({ worldId }) {
  if (worldId === 0) return <USABg />;
  if (worldId === 1) return <JapanBg />;
  if (worldId === 2) return <FranceBg />;
  if (worldId === 3) return <EgyptBg />;
  if (worldId === 4) return <BrazilBg />;
  return null;
}

// 🇺🇸 USA - קו רקיע ניו-יורק עם פסל החירות, בשעת שקיעה
function USABg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #FF6B35 0%, #F7931E 25%, #FFC857 45%, #5680A8 75%, #1A2F4A 100%)',
        }}
      />
      <svg
        viewBox="0 0 400 500"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* פסל החירות - שמאל */}
        <g fill="#1A2F4A" opacity="0.92">
          <rect x="20" y="320" width="40" height="60" />
          <rect x="28" y="300" width="24" height="20" />
          <ellipse cx="40" cy="270" rx="18" ry="35" />
          <circle cx="40" cy="225" r="9" />
          {/* קוצים בכתר */}
          <polygon points="32,219 30,205 35,217" />
          <polygon points="40,217 40,200 44,217" />
          <polygon points="48,219 50,205 45,217" />
          {/* יד מורמת עם לפיד */}
          <line x1="42" y1="245" x2="55" y2="222" stroke="#1A2F4A" strokeWidth="4" />
        </g>
        {/* להבת הלפיד */}
        <circle cx="55" cy="219" r="5" fill="#FFD700" opacity="0.95" />
        <circle cx="55" cy="217" r="2.5" fill="#FFE57F" />

        {/* גורדי שחקים */}
        <g fill="#1A2F4A" opacity="0.95">
          <rect x="80" y="280" width="35" height="220" />
          {/* אמפייר סטייט סטייל */}
          <rect x="120" y="190" width="50" height="310" />
          <polygon points="135,190 145,160 155,190" />
          <line x1="145" y1="160" x2="145" y2="125" stroke="#1A2F4A" strokeWidth="3" />
          {/* בנין מעוגל בקצה */}
          <rect x="180" y="250" width="45" height="250" />
          <path d="M 180 250 Q 202 220 225 250" />
          <rect x="235" y="220" width="40" height="280" />
          <rect x="285" y="170" width="35" height="330" />
          <line x1="302" y1="170" x2="302" y2="145" stroke="#1A2F4A" strokeWidth="2" />
          <rect x="330" y="310" width="50" height="190" />
        </g>

        {/* חלונות מוארים */}
        <g fill="#FFE57F" opacity="0.7">
          {[
            [88, 300], [98, 300], [108, 300], [88, 320], [98, 320], [108, 320],
            [88, 350], [98, 350], [88, 380], [98, 380],
            [128, 240], [143, 240], [158, 240], [128, 270], [143, 270], [158, 270],
            [128, 300], [143, 300], [158, 300], [128, 350], [143, 350], [158, 350],
            [190, 280], [210, 280], [190, 320], [210, 320], [190, 360], [210, 360],
            [245, 250], [260, 250], [245, 290], [260, 290], [245, 330], [260, 330],
            [290, 210], [305, 210], [290, 250], [305, 250], [290, 300], [305, 300], [290, 350], [305, 350],
            [340, 340], [355, 340], [370, 340], [340, 380], [355, 380], [370, 380],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="5" height="6" />
          ))}
        </g>
      </svg>
    </div>
  );
}

// 🇯🇵 Japan - הר פוג'י, פגודה ופריחת דובדבן
function JapanBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #FFB6C1 0%, #FF8FA3 25%, #FFC7B0 55%, #FFE4B5 100%)',
        }}
      />
      <svg
        viewBox="0 0 400 500"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* שמש אדומה */}
        <circle cx="310" cy="110" r="42" fill="#E63946" opacity="0.7" />
        <circle cx="310" cy="110" r="32" fill="#FF6B6B" opacity="0.5" />

        {/* הר פוג'י - משולש כחול */}
        <polygon points="60,440 200,180 340,440" fill="#3F4A8C" opacity="0.92" />
        {/* פסגת השלג */}
        <polygon points="170,250 200,180 230,250 218,247 200,232 182,247" fill="#F0F4FF" />
        {/* קווי שלג בצדדים */}
        <path d="M 175 252 L 168 290" stroke="#F0F4FF" strokeWidth="3" fill="none" opacity="0.8" />
        <path d="M 195 254 L 188 295" stroke="#F0F4FF" strokeWidth="3" fill="none" opacity="0.8" />
        <path d="M 225 252 L 232 290" stroke="#F0F4FF" strokeWidth="3" fill="none" opacity="0.8" />
        <path d="M 205 254 L 212 295" stroke="#F0F4FF" strokeWidth="3" fill="none" opacity="0.8" />

        {/* פגודה - ימין */}
        <g fill="#5C3317" opacity="0.95">
          {/* בסיס */}
          <rect x="65" y="380" width="50" height="60" />
          <line x1="90" y1="395" x2="90" y2="440" stroke="#3D2817" strokeWidth="2" />
          {/* גג קומה 1 */}
          <polygon points="55,380 90,355 125,380" />
          {/* קומה 2 */}
          <rect x="73" y="335" width="34" height="22" />
          <polygon points="63,335 90,313 117,335" />
          {/* קומה 3 */}
          <rect x="78" y="295" width="24" height="18" />
          <polygon points="68,295 90,275 112,295" />
          {/* קומה 4 (העליונה) */}
          <rect x="83" y="262" width="14" height="13" />
          <polygon points="73,262 90,245 107,262" />
          {/* פסגה */}
          <line x1="90" y1="245" x2="90" y2="225" stroke="#5C3317" strokeWidth="3" />
          <circle cx="90" cy="222" r="4" />
        </g>

        {/* ענף פריחה למעלה */}
        <g>
          <path
            d="M 0 80 Q 60 100 130 85 Q 180 75 240 90"
            stroke="#5D2E0D"
            strokeWidth="3"
            fill="none"
          />
          {[[15, 90], [40, 100], [70, 96], [100, 88], [130, 85], [165, 80], [200, 86], [235, 92]].map(
            ([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="7" fill="#FFB6D9" opacity="0.95" />
                <circle cx={x} cy={y} r="3.5" fill="#FF69B4" opacity="0.85" />
                <circle cx={x - 1} cy={y - 2} r="1" fill="#fff" opacity="0.6" />
              </g>
            )
          )}
        </g>
      </svg>
    </div>
  );
}

// 🇫🇷 France - מגדל אייפל
function FranceBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #4A90E2 0%, #87CEEB 50%, #B0E0E6 100%)',
        }}
      />
      <svg
        viewBox="0 0 400 500"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* עננים */}
        <ellipse cx="80" cy="100" rx="40" ry="14" fill="#fff" opacity="0.75" />
        <ellipse cx="60" cy="92" rx="22" ry="10" fill="#fff" opacity="0.85" />
        <ellipse cx="320" cy="80" rx="35" ry="12" fill="#fff" opacity="0.7" />
        <ellipse cx="340" cy="74" rx="18" ry="9" fill="#fff" opacity="0.8" />

        {/* מגדל אייפל - מרכז */}
        <g fill="#3D2914" opacity="0.93">
          {/* רגליים תחתונות */}
          <polygon points="135,440 170,440 195,310 178,310" />
          <polygon points="265,440 230,440 205,310 222,310" />
          {/* קישוט תחתון בין הרגליים */}
          <rect x="170" y="380" width="60" height="6" />
          {/* קומה ראשונה */}
          <rect x="178" y="305" width="44" height="12" />
          {/* תווך אמצעי */}
          <polygon points="183,300 217,300 210,210 190,210" />
          {/* קומה שניה */}
          <rect x="187" y="200" width="26" height="12" />
          {/* תווך עליון */}
          <polygon points="190,196 210,196 205,135 195,135" />
          {/* פסגה */}
          <rect x="196" y="130" width="8" height="10" />
          <polygon points="198,130 202,130 200,105" />
          {/* אנטנה */}
          <line x1="200" y1="105" x2="200" y2="80" stroke="#3D2914" strokeWidth="2" />
          <circle cx="200" cy="78" r="2" />
        </g>

        {/* X בקומה הראשונה */}
        <g stroke="#3D2914" strokeWidth="1.5" opacity="0.7">
          <line x1="190" y1="220" x2="210" y2="290" />
          <line x1="210" y1="220" x2="190" y2="290" />
        </g>

        {/* הדשא של שאן דה מארס */}
        <rect x="0" y="440" width="400" height="60" fill="#7CB342" opacity="0.7" />
        {/* שיחים */}
        <ellipse cx="80" cy="438" rx="18" ry="10" fill="#558B2F" opacity="0.8" />
        <ellipse cx="320" cy="438" rx="18" ry="10" fill="#558B2F" opacity="0.8" />
      </svg>
    </div>
  );
}

// 🇪🇬 Egypt - פירמידות ושמש
function EgyptBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #FFC107 0%, #FF8F00 25%, #E65100 65%, #BF360C 100%)',
        }}
      />
      <svg
        viewBox="0 0 400 500"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* שמש גדולה */}
        <circle cx="320" cy="120" r="55" fill="#FFEB3B" opacity="0.95" />
        <circle cx="320" cy="120" r="40" fill="#FFC107" opacity="0.8" />
        <circle cx="320" cy="120" r="25" fill="#FF8F00" opacity="0.6" />

        {/* פירמידה אחורית גדולה - ימין */}
        <polygon points="180,440 290,200 400,440" fill="#A0723D" opacity="0.92" />
        <polygon points="290,200 400,440 340,200" fill="#5D4037" opacity="0.55" />
        {/* קווי בלוקים */}
        <line x1="290" y1="200" x2="290" y2="440" stroke="#5D4037" strokeWidth="1" opacity="0.4" />
        <line x1="220" y1="350" x2="370" y2="350" stroke="#5D4037" strokeWidth="1" opacity="0.3" />

        {/* פירמידה משמאל */}
        <polygon points="50,440 150,260 250,440" fill="#A0723D" opacity="0.95" />
        <polygon points="150,260 250,440 200,260" fill="#5D4037" opacity="0.6" />
        <line x1="150" y1="260" x2="150" y2="440" stroke="#5D4037" strokeWidth="1" opacity="0.4" />

        {/* פירמידה קטנה לפנים */}
        <polygon points="0,440 60,360 120,440" fill="#8B6F47" opacity="0.95" />
        <polygon points="60,360 120,440 90,360" fill="#5D4037" opacity="0.65" />

        {/* דיונות חול */}
        <path
          d="M 0 440 Q 80 425 160 435 Q 240 442 320 432 Q 380 426 400 430 L 400 500 L 0 500 Z"
          fill="#D4A574"
          opacity="0.88"
        />
        <path
          d="M 0 470 Q 100 458 200 465 Q 300 470 400 460 L 400 500 L 0 500 Z"
          fill="#C19660"
          opacity="0.7"
        />

        {/* גמל קטן */}
        <g fill="#5D4037" opacity="0.85">
          <ellipse cx="60" cy="455" rx="14" ry="6" />
          <circle cx="48" cy="448" r="4" />
          <line x1="55" y1="461" x2="55" y2="468" stroke="#5D4037" strokeWidth="1.5" />
          <line x1="60" y1="461" x2="60" y2="468" stroke="#5D4037" strokeWidth="1.5" />
          <line x1="65" y1="461" x2="65" y2="468" stroke="#5D4037" strokeWidth="1.5" />
          <line x1="70" y1="461" x2="70" y2="468" stroke="#5D4037" strokeWidth="1.5" />
          {/* גיבנת */}
          <ellipse cx="64" cy="450" rx="6" ry="3" />
        </g>
      </svg>
    </div>
  );
}

// 🇧🇷 Brazil - ג'ונגל, ישו הגואל ועצי דקל
function BrazilBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #87CEEB 0%, #98D982 35%, #228B22 75%, #1B5E20 100%)',
        }}
      />
      <svg
        viewBox="0 0 400 500"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* הר סוכר ברקע */}
        <ellipse cx="200" cy="320" rx="90" ry="120" fill="#5D7C3F" opacity="0.7" />
        <ellipse cx="200" cy="320" rx="60" ry="110" fill="#4A6831" opacity="0.5" />

        {/* ישו הגואל על הפסגה */}
        <g fill="#FAFAFA" opacity="0.92">
          <rect x="197" y="170" width="6" height="40" />
          <rect x="178" y="186" width="44" height="5" />
          <circle cx="200" cy="167" r="5" />
          {/* גלימה */}
          <polygon points="190,200 210,200 215,235 185,235" opacity="0.85" />
        </g>

        {/* עץ דקל - שמאל */}
        <g>
          <path d="M 42 460 Q 45 410 48 360" stroke="#3E2723" strokeWidth="9" fill="none" strokeLinecap="round" />
          {/* עלים */}
          <ellipse cx="48" cy="358" rx="30" ry="8" fill="#388E3C" transform="rotate(-25 48 358)" opacity="0.9" />
          <ellipse cx="48" cy="358" rx="30" ry="8" fill="#2E7D32" transform="rotate(25 48 358)" opacity="0.9" />
          <ellipse cx="48" cy="350" rx="28" ry="7" fill="#388E3C" transform="rotate(-65 48 350)" opacity="0.85" />
          <ellipse cx="48" cy="350" rx="28" ry="7" fill="#2E7D32" transform="rotate(65 48 350)" opacity="0.85" />
          <ellipse cx="48" cy="346" rx="22" ry="6" fill="#43A047" transform="rotate(-90 48 346)" opacity="0.8" />
          {/* קוקוסים */}
          <circle cx="44" cy="370" r="4" fill="#5D4037" />
          <circle cx="52" cy="372" r="4" fill="#5D4037" />
        </g>

        {/* עץ דקל - ימין */}
        <g>
          <path d="M 358 460 Q 355 410 352 370" stroke="#3E2723" strokeWidth="9" fill="none" strokeLinecap="round" />
          <ellipse cx="352" cy="368" rx="28" ry="7" fill="#388E3C" transform="rotate(-25 352 368)" opacity="0.9" />
          <ellipse cx="352" cy="368" rx="28" ry="7" fill="#2E7D32" transform="rotate(25 352 368)" opacity="0.9" />
          <ellipse cx="352" cy="360" rx="26" ry="6" fill="#388E3C" transform="rotate(-65 352 360)" opacity="0.85" />
          <ellipse cx="352" cy="360" rx="26" ry="6" fill="#2E7D32" transform="rotate(65 352 360)" opacity="0.85" />
          <circle cx="348" cy="380" r="4" fill="#5D4037" />
          <circle cx="356" cy="382" r="4" fill="#5D4037" />
        </g>

        {/* עלים בקדמה */}
        <g fill="#1B5E20" opacity="0.88">
          <path d="M 0 440 Q 50 408 100 440 Q 150 408 200 440 Q 250 408 300 440 Q 350 408 400 440 L 400 500 L 0 500 Z" />
        </g>

        {/* תוכי קטן */}
        <g transform="translate(280, 200)">
          <ellipse cx="0" cy="0" rx="12" ry="9" fill="#E91E63" opacity="0.9" />
          <circle cx="-8" cy="-3" r="6" fill="#FFC107" opacity="0.95" />
          <polygon points="-12,-3 -16,-1 -12,1" fill="#FF6F00" />
          <circle cx="-9" cy="-4" r="1" fill="#000" />
        </g>
      </svg>
    </div>
  );
}
