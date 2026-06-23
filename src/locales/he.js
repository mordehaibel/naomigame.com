// תרגום עברית - מילון מרכזי לכל הטקסטים באתר.
// תמיכה במגדר: ערכים יכולים להיות פונקציה (gender) => string או מחרוזת רגילה.

const he = {
  // משותפים
  common: {
    appName: 'ממלכת המשחקים',
    appNamePart1: 'ממלכת',
    appNamePart2: 'המשחקים',
    appSubtitle: 'של שלומי ונעמי',
    back: 'חזרה',
    backToHome: 'חזרה לדף הבית',
    backToGames: 'חזרה למשחקים',
    next: 'הלאה',
    cancel: 'ביטול',
    save: 'שמור',
    play: 'שחקו!',
    playAgain: 'שחק שוב',
    start: 'התחילו!',
    pause: 'השהה',
    resume: 'המשך',
    restart: 'התחל מחדש',
    yes: 'כן',
    no: 'לא',
    loading: 'טוען...',
    score: 'ניקוד',
    points: 'נקודות',
    level: 'רמה',
    soon: 'בקרוב',
    soonLong: 'בקרוב מאוד!',
    record: 'שיא',
    time: 'זמן',
    seconds: 'ש׳',
    moves: 'מהלכים',
    bestScore: 'שיא',
    pickLanguage: 'בחר שפה',
  },

  // ניווט
  nav: {
    home: 'בית',
    profile: 'פרופיל',
    logout: 'התנתק',
    games: 'משחקים',
    soundOn: 'הפעל סאונד',
    soundOff: 'השתק',
    tooltipRegister: 'הרשמה',
    tooltipGames: 'המשחקים',
    tooltipDiscover: 'החיים של שלומי ונעמי',
  },

  // דף הבית
  landing: {
    welcome: 'ברוכים הבאים',
    tagline: '16 משחקים מהנים | בטוח להורים | מתאים לגילאי 5-20',
    register: 'הצטרפות חדשה',
    login: 'כניסה לחשבון',
    whyChooseUs: '🌟 למה לבחור בנו? 🌟',
    feature1Title: '16 משחקים מטורפים',
    feature1Desc: 'משחקים שונים לכל גיל - מ-Snake קלאסי ועד הרפתקאות מיוחדות!',
    feature2Title: 'אסוף נקודות וכוכבים',
    feature2Desc: 'התקדם ברמות, השג הישגים ושבור שיאים אישיים',
    feature3Title: 'בטוח ומותאם להורים',
    feature3Desc: 'אין פרסומות, אין צ׳אטים, אין קישורים חיצוניים. רק כיף!',
    parentsTitle: 'להורים יקרים 👨‍👩‍👧‍👦',
    parentsText:
      'ממלכת המשחקים נבנתה עם מחשבה על ילדיכם - בטיחות, חינוך והנאה. ללא פרסומות · ללא קניות בתוך האפליקציה · ללא צ׳אטים · ללא קישורים חיצוניים',
    footer: '© 2026 ממלכת המשחקים של שלומי ונעמי · נעשה באהבה ❤️',
  },

  // הרשמה
  register: {
    title: 'בואו נתחיל! ✨',
    subtitle: 'מספר פרטים קטנים והעולם שלכם נפתח',
    name: 'שם פרטי',
    namePlaceholder: 'לדוגמה: דניאל',
    age: 'גיל',
    chooseChar: 'איזו דמות תייצג אותך? 🎭',
    boy: 'שלומי 👦',
    girl: 'נעמי 👧',
    boyLabel: 'בן',
    girlLabel: 'בת',
    email: 'אימייל',
    password: 'סיסמה',
    passwordPlaceholder: 'לפחות 6 תווים',
    confirmPassword: 'אישור סיסמה',
    confirmPasswordPlaceholder: 'חזרו על הסיסמה',
    submit: 'הצטרפות',
    registering: 'רגע...',
    haveAccount: 'יש לכם כבר חשבון?',
    loginHere: 'היכנסו כאן',
    successBoy: (name) => `ברוך הבא ${name}! 🎉`,
    successGirl: (name) => `ברוכה הבאה ${name}! 🎉`,
    welcomeNote: 'עוד רגע אנחנו עוברים למשחקים...',
    errors: {
      noName: 'צריך להזין שם פרטי',
      noGender: 'נא לבחור בין שלומי לנעמי 🎭',
      badEmail: 'נא להזין אימייל תקין',
      shortPassword: 'הסיסמה צריכה להיות באורך של לפחות 6 תווים',
      mismatch: 'הסיסמאות לא תואמות',
      emailExists: 'האימייל הזה כבר רשום במערכת',
    },
  },

  // התחברות
  login: {
    title: 'ברוכים השבים! 👋',
    subtitle: 'התגעגענו אליכם, בואו נמשיך לשחק!',
    submit: 'כניסה',
    loggingIn: 'מתחבר...',
    noAccount: 'עדיין לא הצטרפתם?',
    registerHere: 'הירשמו כאן',
    errors: {
      empty: 'נא למלא את כל השדות',
      notFound: 'המשתמש לא נמצא. נסו להירשם תחילה',
      wrongPassword: 'הסיסמה לא נכונה',
    },
  },

  // ברכת זמן
  greetings: {
    morning: (name) => `בוקר טוב, ${name}! ☀️`,
    afternoon: (name) => `צהריים טובים, ${name}! 🌤️`,
    evening: (name) => `ערב טוב, ${name}! 🌙`,
    night: (name) => `לילה טוב, ${name}! 🌙`,
  },

  // ניצחון/הפסד - מותאם מגדר (true=male, false=female)
  results: {
    win: (name, isMale) =>
      isMale
        ? `כל הכבוד, ${name}! אתה אלוף! 🏆`
        : `כל הכבוד, ${name}! את אלופה! 🏆`,
    loss: (name, isMale) =>
      isMale
        ? `כמעט, ${name}! נסה שוב, אתה תצליח! 💪`
        : `כמעט, ${name}! נסי שוב, את תצליחי! 💪`,
    newRecord: (name, isMale) =>
      isMale
        ? `🎊 שיא חדש, ${name}! אתה אגדה!`
        : `🎊 שיא חדש, ${name}! את אגדה!`,
    yourScore: 'הניקוד שלך',
    newRecordBonus: '🎊 שיא חדש! +50 בונוס',
    newAchievements: '🏆 הישגים חדשים:',
    forAllGames: 'לכל המשחקים',
  },

  // מד ההתקדמות בכותרת
  header: {
    levelUp: (level) => `רמה ${level}`,
    pointsToNext: (n) => `עוד ${n} נקודות לרמה הבאה!`,
    boyName: 'שלומי',
    girlName: 'נעמי',
  },

  // GamesHub
  gamesHub: {
    selectGame: 'איזה משחק תרצו לשחק היום? 🎮',
    randomTipBoy: (name) => `${name}, נסה את המשחק החדש! 🎮`,
    randomTipGirl: (name) => `${name}, נסי את המשחק החדש! 🎮`,
    noemieWithYou: 'נעמי איתך!',
    castleQuestion: 'איזה ארמון תרצו לבקר?',
    topFriendsTitle: '🏆 שלושת המובילים של החברים בממלכה',
    noScoresYet: 'אין עדיין שיאים - היה הראשון לשחק!',
    inGame: 'במשחק',
  },

  // קטגוריות
  categories: {
    retro: { title: 'משחקי GameBoy', desc: 'קלאסיקות שכולנו אוהבים' },
    speed: { title: 'משחקי לחץ זמן', desc: 'תגובות מהירות = ניצחון' },
    thinking: { title: 'חשיבה ומתמטיקה', desc: 'אתגרים לראש' },
    special: { title: 'המשחק הייחודי שלנו', desc: 'הרפתקה עם שלומי ונעמי!' },
    puzzle: { title: 'פאזלים וזיכרון', desc: 'תרגיל לזיכרון' },
    runner: { title: 'משחקי ריצה ופעולה', desc: 'אקשן! קושי הולך וגדל' },
  },

  // פרופיל
  profile: {
    achievements: '🏆 הישגים שלי',
    myRecords: '📊 השיאים שלי',
    statsPlayed: 'משחקים שיחק',
    statsAchievements: 'הישגים',
    statsStreak: 'ימים ברצף',
    statsLevel: 'רמה',
    playedTimes: (n) => `שוחק ${n} פעמים`,
    age: 'גיל',
    boy: 'בן',
    girl: 'בת',
  },

  // הישגים
  achievementsDef: {
    'first-game': { name: 'משחק ראשון', description: 'שיחקת את המשחק הראשון שלך!' },
    'fast-runner': { name: 'רץ מהיר', description: 'שיחקת 5 פעמים במשחקי לחץ זמן' },
    'math-genius': { name: 'גאון במתמטיקה', description: 'הצלחת בכל משחקי המתמטיקה' },
    'retro-gamer': { name: 'גיימר רטרו', description: 'שיחקת בכל משחקי הרטרו' },
    'memory-master': { name: 'מאסטר זיכרון', description: 'סיימת משחק זיכרון מלא' },
    'rising-star': { name: 'כוכב עולה', description: 'הגעת לרמה 3' },
    'legend': { name: 'אגדה', description: 'הגעת לרמה 5!' },
    'streak-7': { name: 'רצף 7 ימים', description: 'שיחקת 7 ימים ברצף' },
    'high-scorer': { name: 'גבוה למעלה', description: 'שברת שיא אישי' },
  },

  // רמות
  levels: {
    1: 'מתחיל/ה',
    2: (isMale) => (isMale ? 'שחקן צעיר' : 'שחקנית צעירה'),
    3: (isMale) => (isMale ? 'שחקן מתקדם' : 'שחקנית מתקדמת'),
    4: (isMale) => (isMale ? 'אלוף' : 'אלופה'),
    5: 'אגדה 🏆',
  },

  // משחק לא נמצא
  gameNotFound: 'המשחק לא נמצא 🤔',

  discover: {
    btnAria: 'הכירו את נעמי ושלומי',
    pageTitle: 'רוצים להכיר את נעמי ושלומי טוב יותר?',
    pageSubtitle: 'בקרו בחדרי הארמון!',
    rooms: {
      'naomi-room': 'החדר של נעמי',
      'living-room': 'הסלון',
      'kitchen': 'המטבח',
      'play-room': 'חדר המשחקים',
      'parents-room': 'חדר ההורים',
      'grandparents-room': 'חדר הסבא והסבתא',
      'gardens': 'גני הארמון',
    },
    visitRoom: 'בקר בתלת-מימד',
    comingSoon: '🚧 ביקור בתלת-מימד יהיה זמין בקרוב! 🚧',
    bioComing: 'בקרוב: הביוגרפיה והזכרונות של נעמי ושלומי בחדר זה',
    backToDiscover: 'חזרה לחדרים',
  },

  // GamePlaceholder
  placeholder: {
    soonHere: 'בקרוב מאוד!',
    descBoy: (name) => `המשחק הזה עוד בפיתוח, ${name}! בינתיים תוכל לנסות את המשחקים האחרים שלנו 🎮`,
    descGirl: (name) => `המשחק הזה עוד בפיתוח, ${name}! בינתיים תוכלי לנסות את המשחקים האחרים שלנו 🎮`,
    building: 'בונים בשבילכם משהו מיוחד!',
  },

  // בורר רמת קושי
  difficulty: {
    title: 'בחר רמת קושי',
    pick: 'בחר רמה ולחץ על "התחל":',
    forAge: (age) => `המלצה לגיל ${age}:`,
    easy: 'קל',
    medium: 'בינוני',
    hard: 'קשה',
    startWithLevel: (level) => `התחילו! - רמה ${level}`,
    changeLevel: 'שנה רמה',
  },

  // תוויות UI משותפות בכל המשחקים
  gameUI: {
    score: 'ניקוד',
    record: 'שיא',
    time: 'זמן',
    moves: 'מהלכים',
    matches: 'התאמות',
    lives: 'חיים',
    round: 'סבב',
    level: 'רמה',
    streak: 'רצף',
    you: 'אתה',
    ai: 'AI',
    paused: '⏸ מושהה',
    reset: 'מחדש',
    pause: 'השהה',
    resume: 'המשך',
    start: 'התחל',
    again: 'שוב',
    check: 'בדוק!',
    clear: 'נקה',
    newPuzzle: 'חידה חדשה',
    shuffle: 'ערבב',
    correct: '✓ נכון!',
    wrong: 'טעות',
    answer: 'התשובה',
    next: 'הבא',
    pointsLabel: 'נקודות',
    secAbbr: 'ש׳',
    msAbbr: 'מ"ש',
  },

  // טקסטים פנימיים של כל משחק
  games: {
    snake: {
      name: 'הנחש',
      title: 'משחק הנחש',
      apple: '🍎 ניקוד',
      instructions: 'השתמשו בחיצים או WASD לכיוון. אכלו תפוחים, אל תחבטו בקיר!',
      descEasy: 'לוח 15×15, איטי',
      descMedium: 'לוח 20×20, בינוני',
      descHard: 'לוח 25×25, מהיר',
    },
    memory: {
      name: 'זוגות זיכרון',
      title: 'זוגות זיכרון',
      descEasy: '8 קלפים, נינוח',
      descMedium: '16 קלפים, מתון',
      descHard: '24 קלפים, מאתגר',
    },
    math: {
      name: 'חשבון מהיר',
      titleWithTier: (tier) => `חשבון מהיר · ${tier}`,
      tierAge58: 'גיל 5-8',
      tierAge912: 'גיל 9-12',
      tierAge1316: 'גיל 13-16',
      tierAge1720: 'גיל 17-20',
      ageNote: (age) => `התרגילים מותאמים לגיל שלך (${age || '?'})`,
      tier1: { easy: 'חיבור עד 5+5', medium: 'חיבור/חיסור עד 10', hard: 'מעורבב עד 10' },
      tier2: { easy: 'חיבור/חיסור עד 20', medium: 'כפל פשוט', hard: 'מעורבב' },
      tier3: { easy: 'כפל בסיסי', medium: 'חילוק', hard: 'כפל עד 12×12' },
      tier4: { easy: 'חילוק גדול', medium: 'כפל דו-ספרתי', hard: 'חילוק עם עשרוניות' },
    },
    'reaction-time': {
      name: 'זמן תגובה',
      title: 'משחק זמן תגובה',
      intro: 'לחץ על "התחל" ואז חכה לאות הירוק',
      waitTitle: 'חכה...',
      waitDesc: 'אל תלחץ עד שהמסך יהפוך לירוק!',
      goTitle: 'עכשיו!',
      goDesc: 'לחץ מיד!',
      tooEarly: 'מוקדם מדי!',
      tooEarlyDesc: 'חכה לירוק',
      betweenDesc: (round, total) => `סבב ${round} מתוך ${total}`,
      doneTitle: 'סוף!',
      avg: 'ממוצע',
      descEasy: 'קל (2-5 שניות)',
      descMedium: 'בינוני (1-3.5 שניות)',
      descHard: 'קשה (0.5-2 שניות)',
    },
    'whack-a-mole': {
      name: 'פגע בחפרפרת',
      hits: '🎯 פגעת',
      misses: '❌ פספוסים',
      descEasy: 'קל (1.4ש׳ מופע)',
      descMedium: 'בינוני (1ש׳ מופע)',
      descHard: 'קשה (0.6ש׳ מופע)',
    },
    'sliding-puzzle': {
      name: 'פאזל ה-15',
      instructions: (n) => `סדר את האריחים מ-1 עד ${n} בלחיצה על אריח שכן לחור הריק 🧩`,
      descEasy: 'קל (3×3)',
      descMedium: 'בינוני (4×4)',
      descHard: 'קשה (5×5)',
    },
    adventure: {
      name: 'המסע של שלומי ונעמי',
      title: '🌟 המסע של שלומי ונעמי 🌟',
      tagline: '5 עולמות, 15 רמות, אתגר אמיתי. בוא נתחיל!',
      progress: '🗺️ ההתקדמות שלך במסע',
      progressLabel: (cur, total) => `${cur}/${total} רמות`,
      worldsOf: 'רמות',
      done: 'הושלם!',
      play: '▶ שחק',
      backToMap: 'חזרה למפת העולמות',
      worldLabel: (w) => `עולם ${w}`,
      levelLabel: (l) => `רמה ${l}`,
      worldLevel: (w, l) => `עולם ${w} · רמה ${l}`,
      go: 'קדימה!',
      retry: 'נסה שוב',
      continueJourney: 'המשך במסע!',
      backToLevels: 'חזור לרמות',
      youAreLegend: '🏆 אתה אגדה! 🏆',
      finishedAll: 'סיימת את כל ה-15 רמות במסע! שלומי ונעמי גאים בך!',
      backToMapBtn: 'חזור למפה',
      worldComplete: (name) => `סיימת את ${name}!`,
      // Mini-game labels
      catchCollected: '⭐ נאספו',
      catchHowTo: 'לחץ על ⭐ כדי לאסוף · ☄️ זה אויב, אל תלחץ!',
      memoryMatches: '🃏 התאמות',
      simonRound: '📊 רמה',
      simonListen: '🎵 הקשב לסדר...',
      simonRepeat: (idx, len) => `👆 חזור על הסדר (${idx}/${len})`,
      simonSuccess: '🎉 הצלחת!',
      simonFail: '❌ טעות!',
      simonHowTo: 'חכה שייגמר הסדר, ואז לחץ על הכפתורים באותו הסדר!',
    },
    'number-hunt': {
      name: 'ציד מספרים',
      title: 'ציד מספרים',
      instructions: 'חפש את המספר במהירות וצבור נקודות!',
      findIt: 'מצא את:',
      descEasy: 'קל (16 מספרים)',
      descMedium: 'בינוני (24 מספרים)',
      descHard: 'קשה (36 מספרים)',
    },
    'shape-match': {
      name: 'התאמת צורות',
      title: 'התאמת צורות',
      instructions: 'מצא את הצורה והצבע הנכונים מהר ככל האפשר!',
      findShape: 'מצא את הצורה הזו:',
      descEasy: 'קל (3 אפשרויות)',
      descMedium: 'בינוני (4 אפשרויות)',
      descHard: 'קשה (6 אפשרויות)',
    },
    'memory-flash': {
      name: 'מהר ואמיץ',
      title: 'מהר ואמיץ',
      instructions: 'צפה בסדר התאי הצהובים ולחץ עליהם באותו הסדר!',
      listen: '🎵 הקשב לסדר...',
      repeat: (cur, total) => `👆 חזור! (${cur}/${total})`,
      success: '🎉 כל הכבוד!',
      descEasy: 'קל (התחלה: 3)',
      descMedium: 'בינוני (התחלה: 4)',
      descHard: 'קשה (התחלה: 5)',
    },
    'number-sequence': {
      name: 'רצף החכמים',
      title: 'רצף החכמים',
      instructions: 'חזה את המספר הבא בסדרה!',
      seqType: (type) => `סדרה ${type} - מהו הבא?`,
      typeArith: 'חשבונית',
      typeGeo: 'הנדסית',
      typeFib: 'פיבונאצ׳י',
      typeSquare: 'ריבועים',
      descEasy: 'קל (חשבונית)',
      descMedium: 'בינוני (חשבונית + הנדסית)',
      descHard: 'קשה (כולל פיבונאצ׳י)',
    },
    'equation-builder': {
      name: 'בנה משוואה',
      title: 'בנה משוואה',
      instructions: 'בנה משוואה מהמספרים והפעולות כדי להגיע ליעד!',
      target: 'בנה משוואה שמגיעה ל:',
      pickHelp: 'לחץ על מספרים ופעולות...',
      gotResult: (n) => `וואי, יצא ${n}`,
      solved: '✓ פתרת',
      descEasy: 'קל (3 מספרים)',
      descMedium: 'בינוני (4 מספרים)',
      descHard: 'קשה (5 מספרים)',
    },
    pong: {
      name: 'פונג',
      title: 'משחק פונג',
      instructions: (winScore) => `הזז את העכבר כדי לשלוט במחבט. ראשון ל-${winScore} ניצח!`,
      descEasy: 'קל',
      descMedium: 'בינוני',
      descHard: 'קשה',
    },
    breakout: {
      name: 'שובר לבנים',
      title: 'שובר לבנים',
      instructions: 'הזז את המחבט עם העכבר. שבור את כל הלבנים כדי לנצח!',
      descEasy: 'קל',
      descMedium: 'בינוני',
      descHard: 'קשה',
    },
    tetris: {
      name: 'טטריס',
      next: 'הבא',
      lines: '📏 שורות',
      keyHelp: 'חיצים = הזז · חץ למעלה / רווח = סיבוב · חץ למטה = הפלה',
      descEasy: 'איטי',
      descMedium: 'בינוני',
      descHard: 'מהיר',
    },
    pacman: {
      name: 'פקפק',
      title: 'פקפק',
      pellets: '🍒',
      instructions: 'חיצים/WASD · אכול את כל הפלטים, הימנע מהרוחות!',
      descEasy: 'קל (1 רוח)',
      descMedium: 'בינוני (2 רוחות)',
      descHard: 'קשה (3 רוחות)',
    },
    'train-run': {
      name: 'רץ על פסי הרכבת',
      title: 'רץ על פסי הרכבת',
      instructions: 'הימנע מהרכבות הבאות לעברך!',
    },
    'winding-path': {
      name: 'דרך מתפתלת',
      title: 'דרך מתפתלת',
      instructions: 'הימנע מעצים וסלעים בדרך!',
    },
    'roof-jumper': {
      name: 'קופץ על גגות',
      title: 'קופץ על גגות',
      instructions: 'קפוץ מעל החורים (↑/רווח)!',
    },
    'dark-run': {
      name: 'ריצה באפלה',
      title: 'ריצה באפלה',
      instructions: 'רוץ באפילה, הימנע מהרוחות!',
    },
    'jungle-run': {
      name: 'ריצה בג׳ונגל',
      title: 'ריצה בג׳ונגל',
      instructions: 'הימנע מעצים, נמרים ונחשים!',
    },
    'snow-run': {
      name: 'רץ בשלג',
      title: 'רץ בשלג',
      instructions: 'גלוש על השלג, הימנע מהמכשולים!',
    },
    'city-run': {
      name: 'ריצה בעיר',
      title: 'ריצה בעיר',
      instructions: 'הימנע ממכוניות וקטנועים בכביש!',
    },
    'brick-jumper': {
      name: 'קופץ על לבנים',
      title: 'קופץ על לבנים',
      instructions: 'קפוץ מעל הלבנים הנופלות (↑/רווח)!',
    },
    underwater: {
      name: 'ריצה בים',
      title: 'שחייה בים',
      instructions: 'הימנע מכרישים, תמנונים ואלמוגים!',
    },
    'space-run': {
      name: 'ריצה בחלל',
      title: 'ריצה בחלל',
      instructions: 'הימנע ממטאוריטים וחללית בחלל!',
    },
  },

  // עולמות ה-Adventure
  worlds: {
    0: {
      name: 'ארצות הברית 🇺🇸',
      intro: 'שלומי ונעמי יוצאים למערב הפרוע לחפש את אוצר הבוקרים!',
      completion: 'כל הכבוד! אוצר הבוקרים שלכם 🤠💰',
    },
    1: {
      name: 'יפן 🇯🇵',
      intro: 'יוצאים ליפן של הדובדבנים - חרב הסמוראי מחכה לכם!',
      completion: 'נפלא! מצאתם את חרב הסמוראי! ⚔️🌸',
    },
    2: {
      name: 'צרפת 🇫🇷',
      intro: 'יוצאים לפריז! הכתר מראש מגדל אייפל מסתתר אי שם...',
      completion: 'מדהים! הכתר המלכותי בידיכם! 👑🗼',
    },
    3: {
      name: 'מצרים 🇪🇬',
      intro: 'תחת השמש המצרית, הפירמידות מסתירות אוצר פרעוני...',
      completion: 'אוצר הפרעונים שייך לכם! ⚱️🐪',
    },
    4: {
      name: 'ברזיל 🇧🇷',
      intro: 'בלב יערות האמזונס מסתתרת אלדורדו, עיר הזהב!',
      completion: 'אגדה! גיליתם את אלדורדו! 🌳🦜',
    },
  },

  // סוגי מיני-משחקים ב-Adventure
  miniTypes: {
    catch: 'אסוף כוכבים',
    memory: 'התאם זוגות',
    simon: 'חזור על הסדר',
  },

  // מבוא לרמות ה-Adventure (אינדקס יחסי בעולם)
  levelIntros: {
    catch: {
      usa: 'אסוף 4 כוכבים זהובים מהמערב הפרוע לפני השודדים!',
      japan: 'תפוס 6 פרחי דובדבן באוויר!',
      france: 'אסוף 7 כוכבי זהב מראש מגדל אייפל!',
      egypt: 'תפוס 8 אבני חן, היזהר מהחיפושיות!',
      brazil: 'אסוף 10 נוצות קסם מהאמזונס!',
    },
    memory: {
      usa: 'מצא 3 זוגות סמלים של המערב הפרוע!',
      japan: 'התאם 4 זוגות פריטים יפניים מסורתיים!',
      france: 'מצא 5 זוגות מבני פריז!',
      egypt: 'גלה 6 זוגות הירוגליפים!',
      brazil: 'מצא 6 זוגות חיות הג\'ונגל!',
    },
    simon: {
      usa: 'חזור על המנגינה של הסלון!',
      japan: 'חקה את שיר המקדשים!',
      france: 'פענח את הצלצול של האופרה!',
      egypt: 'עקוב אחרי הקצב של תוף הפרעונים!',
      brazil: 'חזור על שיר ציפורי האמזונס!',
    },
  },
};

export default he;
