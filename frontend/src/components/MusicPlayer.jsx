import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

const MusicPlayer = ({ songUrl, defaultVolume = 0.5, autoPlay = true, startTime = 0, endTime = 0 }) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const hasInitializedTime = useRef(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = defaultVolume;
      if (autoPlay) {
        audioRef.current.play().catch(e => console.log('Autoplay prevented by browser', e));
      }
    }
  }, [autoPlay, defaultVolume]);

  const togglePlay = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    
    let current = audioRef.current.currentTime;
    const duration = audioRef.current.duration;
    
    // Initialize start time on first tick if not done yet
    if (!hasInitializedTime.current && startTime > 0 && current < startTime) {
      audioRef.current.currentTime = startTime;
      hasInitializedTime.current = true;
      current = startTime;
    }
    
    // Check if we hit the end time
    if (endTime > 0 && current >= endTime) {
      audioRef.current.currentTime = startTime > 0 ? startTime : 0;
      current = audioRef.current.currentTime;
      // Because 'loop' is true on audio element, we just reset it manually here
    }

    if (duration) {
      // Calculate progress relative to start and end times if specified
      let effectiveStart = startTime > 0 ? startTime : 0;
      let effectiveEnd = endTime > 0 ? endTime : duration;
      let effectiveDuration = effectiveEnd - effectiveStart;
      let effectiveCurrent = current - effectiveStart;
      
      let p = (effectiveCurrent / effectiveDuration) * 100;
      setProgress(Math.max(0, Math.min(100, p)));
    }
  };

  if (!songUrl) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full py-2 px-4 shadow-2xl"
    >
      <audio 
        ref={audioRef} 
        src={songUrl} 
        loop 
        onTimeUpdate={handleTimeUpdate}
      />
      
      <button onClick={togglePlay} className="text-white/80 hover:text-white transition">
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden relative">
        <div 
          className="absolute top-0 left-0 h-full bg-white/80" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <button onClick={toggleMute} className="text-white/80 hover:text-white transition">
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </motion.div>
  );
};

export default MusicPlayer;
