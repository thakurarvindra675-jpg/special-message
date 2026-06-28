import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animated glowing orb blobs
const AuroraBackground = () => (
  <div className="fixed inset-0 z-0 bg-black overflow-hidden pointer-events-none">
    <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full bg-purple-900/40 blur-[120px] animate-pulse" />
    <div className="absolute top-1/3 -right-1/4 w-2/3 h-2/3 rounded-full bg-blue-900/30 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
    <div className="absolute -bottom-1/4 left-1/4 w-2/3 h-2/3 rounded-full bg-pink-900/30 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
  </div>
);

const LandingPage = () => {
  const [query, setQuery] = useState('');
  const [settings, setSettings] = useState(null);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/settings').then(res => setSettings(res.data)).catch(console.error);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError(false);
    
    try {
      const res = await axios.get(`http://localhost:5000/api/people/search?q=${encodeURIComponent(query.trim())}`);
      
      // If we got a successful response with a single person match
      if (res.data && res.data.slug) {
        navigate(`/message/${res.data.slug}`);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-12 text-white">
      <AuroraBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="w-full max-w-xl text-center space-y-6 md:space-y-8 z-10"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
        >
          <Heart className="w-7 h-7 md:w-8 md:h-8 text-pink-500" fill="currentColor" />
        </motion.div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
            {settings?.heroHeading || 'Someone has left a special message for you ❤️'}
          </h1>
          <p className="text-base md:text-lg text-white/50 max-w-sm mx-auto">
            {settings?.heroSubtitle || 'Type your name below to reveal it.'}
          </p>
        </div>

        {/* Search Box Form */}
        <form onSubmit={handleSearch} className="relative max-w-md mx-auto w-full">
          <div className={`relative group transition-all duration-300 ${focused ? 'scale-[1.01]' : ''}`}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className={`h-5 w-5 transition-colors ${focused ? 'text-purple-400' : 'text-white/30'}`} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (error) setError(false);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={`w-full bg-white/5 border ${error ? 'border-red-500/50 focus:ring-red-500/40' : 'border-white/10 focus:ring-purple-500/40'} rounded-2xl py-4 pl-12 pr-14 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:border-white/20 backdrop-blur-xl transition-all text-base md:text-lg shadow-2xl`}
              placeholder="Enter your exact name..."
              autoComplete="off"
            />
            
            {/* Submit Button inside input */}
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button 
                type="submit"
                disabled={loading || !query.trim()}
                className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 flex items-center justify-center transition-colors shadow-lg"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight size={18} />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-2xl z-50 text-center shadow-2xl"
              >
                <p className="text-red-400 text-sm">Sorry, we couldn't find a message for that name. Please check your spelling and try again.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-5 left-0 right-0 text-center text-white/20 text-xs tracking-wider"
      >
        {settings?.footerText || 'Made with ❤️'}
      </motion.div>
    </div>
  );
};

export default LandingPage;
