import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Envelope = ({ onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    setTimeout(() => {
      onOpen();
    }, 1500); // Wait for animation before revealing message
  };

  return (
    <div className="relative w-64 h-48 cursor-pointer" onClick={handleOpen}>
      <motion.div
        className="absolute inset-0 z-10 bg-red-800 rounded-lg shadow-2xl origin-bottom"
        initial={{ rotateX: 0 }}
        animate={{ rotateX: isOpen ? 180 : 0, zIndex: isOpen ? 0 : 20 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{ clipPath: 'polygon(0 0, 50% 50%, 100% 0, 100% 100%, 0 100%)' }}
      >
        <div className="absolute inset-0 border-2 border-white/10 rounded-lg"></div>
      </motion.div>
      
      {/* Envelope Flap */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-red-700 origin-top shadow-md"
        initial={{ rotateX: 0, zIndex: 30 }}
        animate={{ rotateX: isOpen ? -180 : 0, zIndex: isOpen ? 10 : 30 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ clipPath: 'polygon(0 0, 50% 50%, 100% 0)' }}
      />
      
      {/* Letter inside */}
      <motion.div
        className="absolute bottom-2 left-2 right-2 h-44 bg-white/90 rounded border border-gray-200 z-10"
        initial={{ y: 0 }}
        animate={{ y: isOpen ? -100 : 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
      >
        <div className="w-full h-full flex flex-col p-4 opacity-50 space-y-2">
          <div className="h-2 w-3/4 bg-gray-300 rounded"></div>
          <div className="h-2 w-full bg-gray-300 rounded"></div>
          <div className="h-2 w-5/6 bg-gray-300 rounded"></div>
        </div>
      </motion.div>
      
      {/* Envelope Base */}
      <div className="absolute inset-0 bg-red-900 rounded-lg z-0" />
      
      {!isOpen && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="bg-yellow-500 rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-yellow-300">
            <span className="text-red-900 font-bold text-xl">♥</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Envelope;
