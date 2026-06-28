import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import confetti from 'canvas-confetti';
import Envelope from '../../components/Envelope';
import MusicPlayer from '../../components/MusicPlayer';

// Theme map
const THEME_CLASSES = {
  'Midnight Aurora': 'from-indigo-950 via-purple-950 to-black',
  'Purple Galaxy':   'from-fuchsia-950 via-purple-950 to-black',
  'Sunset Glow':     'from-orange-950 via-red-950 to-black',
  'Ocean Blue':      'from-cyan-950 via-blue-950 to-black',
  'Emerald Forest':  'from-emerald-950 via-green-950 to-black',
  'Rose Gold':       'from-rose-950 via-pink-950 to-black',
  'Minimal Dark':    'from-black via-neutral-950 to-black',
};

const PhaseText = ({ children }) => (
  <motion.p
    key={children}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    className="text-white/70 text-lg md:text-2xl font-light tracking-wide"
  >
    {children}
  </motion.p>
);

const MessageReveal = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  const [person, setPerson] = useState(null);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(false);
  const [phase, setPhase] = useState('loading'); // loading | searching | preparing | envelope | open | revealed

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [personRes, settingsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/people/slug/${slug}`),
          axios.get('http://localhost:5000/api/settings')
        ]);
        setPerson(personRes.data);
        setSettings(settingsRes.data);

        setTimeout(() => setPhase('searching'), 1800);
        setTimeout(() => setPhase('preparing'), 3600);
        setTimeout(() => setPhase('envelope'), 5400);
      } catch {
        setError(true);
      }
    };
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (phase === 'open' && !isPreview && person?._id) {
      axios.post('http://localhost:5000/api/analytics/open', {
        personId: person._id,
        browser: navigator.userAgent,
        os: navigator.platform,
      }).catch(console.error);
    }

    if (phase === 'revealed' && settings?.enableConfetti !== false) {
      setTimeout(() => {
        confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 }, colors: ['#ec4899', '#a855f7', '#ffffff'] });
      }, 400);
    }
  }, [phase, isPreview, person, settings]);

  const themeClass = person ? (THEME_CLASSES[person.theme] || THEME_CLASSES['Midnight Aurora']) : 'from-black to-black';

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 rounded-2xl text-center max-w-sm">
          <p className="text-2xl mb-2">😔</p>
          <h2 className="text-xl font-semibold">Message not found</h2>
          <p className="text-white/50 text-sm mt-2">This link may be incorrect or the message is not yet published.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br transition-all duration-1000 ${themeClass}`}>

      {/* Preview badge */}
      {isPreview && (
        <div className="absolute top-4 left-4 z-50 bg-amber-500/20 text-amber-300 px-4 py-1.5 rounded-full border border-amber-500/40 backdrop-blur-sm text-xs font-semibold tracking-wide">
          Preview Mode
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Loading / transition phases */}
        {(phase === 'loading' || phase === 'searching' || phase === 'preparing') && (
          <motion.div key="phases" className="flex flex-col items-center gap-6">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
            <AnimatePresence mode="wait">
              {phase === 'loading' && <PhaseText key="l">Loading...</PhaseText>}
              {phase === 'searching' && <PhaseText key="s">Searching memories...</PhaseText>}
              {phase === 'preparing' && <PhaseText key="p">Preparing your surprise...</PhaseText>}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Envelope phase */}
        {phase === 'envelope' && (
          <motion.div
            key="envelope"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col items-center gap-6 px-4"
          >
            <Envelope onOpen={() => {
              setPhase('open');
              setTimeout(() => setPhase('revealed'), 1200);
            }} />
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-white/50 text-sm tracking-widest uppercase"
            >
              Tap to open ✉️
            </motion.p>
          </motion.div>
        )}

        {/* Message revealed */}
        {(phase === 'open' || phase === 'revealed') && person && (
          <motion.div
            key="revealed"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 22, stiffness: 60 }}
            className="w-full max-w-2xl mx-4 md:mx-8 z-20"
          >
            <div className="glass-card rounded-3xl p-6 md:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
              {/* Shimmer top line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              {/* Message content */}
              <motion.div
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: phase === 'revealed' ? 1 : 0, filter: 'blur(0px)' }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="prose prose-invert max-w-none prose-p:text-white/85 prose-p:leading-relaxed prose-p:text-base md:prose-p:text-lg"
                dangerouslySetInnerHTML={{ __html: person.message }}
              />

              {/* Signature */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === 'revealed' ? 1 : 0 }}
                transition={{ duration: 1, delay: 2.5 }}
                className="mt-10 text-right"
              >
                <p className="text-lg md:text-xl font-serif italic text-white/50">
                  — {settings?.signature || 'Forever Yours'}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music Player */}
      {(phase === 'open' || phase === 'revealed') && person?.songUrl && settings?.enableBackgroundMusic !== false && (
        <MusicPlayer
          songUrl={person.songUrl}
          defaultVolume={settings?.defaultMusicVolume ?? 0.5}
          autoPlay={true}
          startTime={person.songStartTime}
          endTime={person.songEndTime}
        />
      )}
    </div>
  );
};

export default MessageReveal;
