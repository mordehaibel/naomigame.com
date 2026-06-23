import React from 'react';
import { motion } from 'framer-motion';

const ShlomiCharacter = ({ pose = 'neutral', size = 'md', animate = true }) => {
  const sizes = {
    sm: 'w-16 h-20',
    md: 'w-24 h-32',
    lg: 'w-32 h-40',
    xl: 'w-48 h-64',
  };

  const breathing = {
    animate: {
      scale: [1, 1.03, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  return (
    <motion.div
      className={`${sizes[size]} flex items-center justify-center`}
      variants={animate ? breathing : {}}
      animate={animate ? 'animate' : ''}
    >
      <img
        src="/characters/shlomi.png"
        alt="שלומי"
        className="w-full h-full object-contain drop-shadow-lg"
      />
    </motion.div>
  );
};

export default ShlomiCharacter;
