import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../hooks/useT';
import ShlomiCharacter from '../components/characters/ShlomiCharacter';
import NaomiCharacter from '../components/characters/NaomiCharacter';
import Banner from '../components/common/Banner';
import Button from '../components/common/Button';
import BackgroundParticles from '../components/common/BackgroundParticles';

export default function Login() {
  const { login } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError(t('login.errors.empty'));
    setSubmitting(true);
    try {
      await login(form);
      navigate('/games');
    } catch (err) {
      const msg = err.message;
      if (msg.includes('לא נמצא')) setError(t('login.errors.notFound'));
      else if (msg.includes('סיסמה')) setError(t('login.errors.wrongPassword'));
      else setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <div className="flex-1 flex items-center justify-center px-4 relative">
        <BackgroundParticles count={10} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-fun w-full max-w-md"
        >
          <div className="flex justify-center gap-2 mb-4">
            <ShlomiCharacter pose="waving" size="md" />
            <NaomiCharacter pose="waving" size="md" />
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-center mb-2">{t('login.title')}</h1>
          <p className="text-center text-gray-600 mb-6">{t('login.subtitle')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <label className="block font-bold mb-2">
                <Lock size={16} className="inline ml-1" /> {t('register.password')}
              </label>
              <input
                type="password"
                className="input-fun"
                placeholder={t('register.password')}
                value={form.password}
                onChange={update('password')}
              />
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={submitting}
              icon={LogIn}
            >
              {submitting ? t('login.loggingIn') : t('login.submit')}
            </Button>

            <Link to="/" className="block">
              <Button variant="ghost" size="md" fullWidth icon={ArrowRight}>
                {t('common.backToHome')}
              </Button>
            </Link>

            <div className="text-center text-sm text-gray-600">
              {t('login.noAccount')}{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                {t('login.registerHere')}
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
