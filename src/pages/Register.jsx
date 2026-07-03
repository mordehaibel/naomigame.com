import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, ArrowRight, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../hooks/useT';
import Banner from '../components/common/Banner';
import Button from '../components/common/Button';
import Confetti from '../components/common/Confetti';
import BackgroundParticles from '../components/common/BackgroundParticles';

export default function Register() {
  const { register } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    age: 10,
    gender: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target ? e.target.value : e }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError(t('register.errors.noName'));
    if (!form.gender) return setError(t('register.errors.noGender'));
    if (!form.email.includes('@')) return setError(t('register.errors.badEmail'));
    if (form.password.length < 6) return setError(t('register.errors.shortPassword'));
    if (form.password !== form.confirmPassword) return setError(t('register.errors.mismatch'));

    setSubmitting(true);
    try {
      await register({
        name: form.name,
        age: form.age,
        gender: form.gender,
        email: form.email,
        password: form.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/games'), 2200);
    } catch (err) {
      // הודעות שרת בעברית מ-AuthContext - תרגם אותן אם אפשר
      const msg = err.message;
      if (msg.includes('כבר רשום')) setError(t('register.errors.emailExists'));
      else setError(msg);
      setSubmitting(false);
    }
  };

  if (success) {
    const isMale = form.gender === 'male';
    return (
      <div className="min-h-screen flex flex-col">
        <Banner />
        <div className="flex-1 flex items-center justify-center px-4 relative">
          <Confetti active count={100} />
          <BackgroundParticles count={15} />
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card-fun text-center max-w-lg"
          >
            <div className="flex justify-center gap-4 mb-6">
              <img
                src="/PortraitGarcon10ans.jpeg"
                alt="Chlomi"
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl"
              />
              <img
                src="/PortraitFille10ans.png"
                alt="Naomie"
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-3 text-shadow-fun bg-gradient-to-l from-primary to-accent-purple bg-clip-text text-transparent">
              {isMale ? t('register.successBoy', form.name) : t('register.successGirl', form.name)}
            </h1>
            <p className="text-xl text-gray-700">{t('register.welcomeNote')}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative">
        <BackgroundParticles count={10} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-fun w-full max-w-7xl"
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-black mb-2">{t('register.title')}</h1>
            <p className="text-gray-600">{t('register.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-bold mb-2">
                <UserIcon size={16} className="inline ml-1" /> {t('register.name')}
              </label>
              <input
                type="text"
                className="input-fun"
                placeholder={t('register.namePlaceholder')}
                value={form.name}
                onChange={update('name')}
                maxLength={20}
              />
            </div>

            <div>
              <label className="block font-bold mb-2">
                {t('register.age')}: <span className="text-primary">{form.age}</span>
              </label>
              <input
                type="range"
                min={5}
                max={20}
                value={form.age}
                onChange={update('age')}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>5</span>
                <span>20</span>
              </div>
            </div>

            <div>
              <label className="block font-bold mb-3">{t('register.chooseChar')}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center justify-items-stretch">
                <GenderButton
                  src="/PortraitGarcon10ans.jpeg"
                  alt="Chlomi"
                  selected={form.gender === 'male'}
                  label={t('register.boy')}
                  sublabel={t('register.boyLabel')}
                  onClick={() => update('gender')('male')}
                />
                <GenderButton
                  src="/FillePortrait10ansLeBon.png"
                  alt="Naomie"
                  selected={form.gender === 'female'}
                  label={t('register.girl')}
                  sublabel={t('register.girlLabel')}
                  onClick={() => update('gender')('female')}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-2">
                <Mail size={16} className="inline ml-1" /> {t('register.email')}
              </label>
              <input
                type="email"
                className="input-fun"
                placeholder="example@gmail.com"
                value={form.email}
                onChange={update('email')}
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-2">
                  <Lock size={16} className="inline ml-1" /> {t('register.password')}
                </label>
                <input
                  type="password"
                  className="input-fun"
                  placeholder={t('register.passwordPlaceholder')}
                  value={form.password}
                  onChange={update('password')}
                />
              </div>
              <div>
                <label className="block font-bold mb-2">{t('register.confirmPassword')}</label>
                <input
                  type="password"
                  className="input-fun"
                  placeholder={t('register.confirmPasswordPlaceholder')}
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-50 border-2 border-error-red text-error-red p-3 rounded-2xl text-center font-semibold"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={submitting}
                icon={UserPlus}
              >
                {submitting ? t('register.registering') : t('register.submit')}
              </Button>
              <Link to="/" className="flex-1">
                <Button variant="ghost" size="lg" fullWidth icon={ArrowRight}>
                  {t('common.backToHome')}
                </Button>
              </Link>
            </div>

            <div className="text-center text-sm text-gray-600">
              {t('register.haveAccount')}{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                {t('register.loginHere')}
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

// כפתור בחירת מגדר - הבוטון = העיגול עצמו, התווית בתוך התמונה למטה.
// הצורה ריבועית מושלמת (aspect-square) → התמונה ממורכזת אנכית ואופקית באופן טבעי.
function GenderButton({ src, alt, selected, label, sublabel, onClick }) {
  // Wrapper carré qui contient le cercle parfaitement centré.
  // Les 2 boutons ont strictement les mêmes dimensions (jamais de scale ni de border-width changé)
  // → highlight de sélection uniquement via ring (outline-style, n'affecte pas le layout)
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative aspect-square w-full flex items-center justify-center bg-white rounded-3xl p-2"
    >
      {/* Le cercle - dimensions identiques quel que soit l'état (épaisseur de border constante) */}
      <div
        className={`relative w-full h-full rounded-full overflow-hidden border-4 shadow-2xl transition-all ${
          selected
            ? 'border-primary ring-4 ring-primary/50 ring-offset-2 ring-offset-white'
            : 'border-pink-100'
        }`}
      >
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* תוויות overlay בתחתית התמונה */}
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-2 text-center"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.65))',
          }}
        >
          <div
            className="font-black text-white text-base md:text-2xl lg:text-3xl"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}
          >
            {label}
          </div>
          <div
            className="text-xs md:text-base text-white/95"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}
          >
            {sublabel}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
