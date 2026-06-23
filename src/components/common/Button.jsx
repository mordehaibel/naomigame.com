import { motion } from 'framer-motion';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  icon: Icon,
  fullWidth = false,
}) {
  const variants = {
    primary: 'bg-gradient-to-l from-primary to-accent-purple text-white shadow-pink-300',
    secondary: 'bg-gradient-to-l from-secondary to-accent-yellow text-white shadow-teal-200',
    success: 'bg-gradient-to-l from-success-green to-secondary text-white shadow-green-200',
    ghost: 'bg-white/90 text-text-primary border-2 border-gray-200',
    danger: 'bg-gradient-to-l from-error-red to-accent-orange text-white shadow-red-200',
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={`
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        font-bold rounded-3xl shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        transition-shadow duration-300 hover:shadow-2xl
        ${className}
      `}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      <span>{children}</span>
    </motion.button>
  );
}
