import { useAppStore } from '../store.ts';
import { Play, Pause, SkipForward, SkipBack, ChevronDown, Shuffle, Repeat, Heart, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatTime } from '../lib/utils.ts';
import { useEffect, useState, useRef } from 'react';
import { clsx } from 'clsx';

export default function PlayWindow() {
  const currentSongId = useAppStore(state => state.currentSongId);
  const songs = useAppStore(state => state.songs);
  const isPlaying = useAppStore(state => state.isPlaying);
  const togglePlay = useAppStore(state => state.togglePlay);
  const nextSong = useAppStore(state => state.nextSong);
  const prevSong = useAppStore(state => state.prevSong);

  const isShuffle = useAppStore(state => state.isShuffle);
  const toggleShuffle = useAppStore(state => state.toggleShuffle);
  const isRepeat = useAppStore(state => state.isRepeat);
  const toggleRepeat = useAppStore(state => state.toggleRepeat);

  const isPlayWindowOpen = useAppStore(state => state.isPlayWindowOpen);
  const setPlayWindowOpen = useAppStore(state => state.setPlayWindowOpen);

  const progress = useAppStore(state => state.progress);
  const setProgress = useAppStore(state => state.setProgress);
  const duration = useAppStore(state => state.duration);

  const [isLiked, setIsLiked] = useState(false);

  // Reset liked state when song changes
  useEffect(() => {
    setIsLiked(false);
  }, [currentSongId]);

  if (!currentSongId) return null;
  const currentSong = songs.find(s => s.id === currentSongId);
  if (!currentSong) return null;

  return (
    <AnimatePresence>
      {isPlayWindowOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-3xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-8 shrink-0">
            <button
              onClick={() => setPlayWindowOpen(false)}
              className="p-2 rounded-full hover:bg-surface text-foreground transition-colors"
            >
              <ChevronDown size={28} />
            </button>
            <div className="flex flex-col items-center">
              <p className="text-xs uppercase tracking-widest text-foreground/40 font-bold mb-1">Playing from playlist</p>
              <p className="text-sm font-medium text-foreground">{currentSong.album}</p>
            </div>
            <button className="p-2 rounded-full hover:bg-surface text-foreground transition-colors">
              <MoreHorizontal size={24} />
            </button>
          </div>

          <div className="flex-1 min-h-0 px-6 pb-6 flex flex-col max-w-2xl mx-auto w-full relative">
            {/* Visualizer & Album Art Area */}
            <div className="flex-1 min-h-0 flex items-center justify-center relative my-4">
              {/* Dancing Circular Visualizer */}
              {isPlaying && <AudioVisualizer />}

              <motion.div
                animate={{
                  scale: isPlaying ? 1 : 0.95,
                  rotate: isPlaying ? 360 : 0
                }}
                transition={{
                  scale: { type: 'spring', bounce: 0.5 },
                  rotate: { repeat: Infinity, duration: 12, ease: 'linear' }
                }}
                className="w-auto h-auto max-w-full max-h-full aspect-square bg-[#0a0a0a] rounded-full shadow-[0_0_40px_-5px_rgba(var(--primary-color),0.6)] flex items-center justify-center overflow-hidden z-10 border-2 border-primary/40 relative"
                style={{ maxHeight: '100%', maxWidth: '100%', minWidth: '200px', minHeight: '200px' }}
              >
                {/* Vinyl Grooves Background */}
                <div className="absolute inset-0 rounded-full" style={{
                  backgroundImage: 'repeating-radial-gradient(circle, #1a1a1a 0px, #1a1a1a 1px, #0a0a0a 1px, #0a0a0a 4px)',
                  opacity: 0.8
                }} />

                {/* Lighting Reflection */}
                <div className="absolute inset-0 rounded-full" style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.08) 15%, transparent 30%, transparent 50%, rgba(255,255,255,0.08) 65%, transparent 80%)'
                }} />

                {/* Album label in the center */}
                <div className="w-[45%] h-[45%] rounded-full relative flex items-center justify-center overflow-hidden border-2 border-primary/50 shadow-[0_0_20px_rgba(var(--primary-color),0.8)] bg-surface text-center">
                  {/* Ring details on label */}
                  <div className="absolute inset-1 rounded-full border border-foreground/10" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 opacity-50 px-2 overflow-hidden">
                    <span className="font-mono text-[9px] sm:text-[11px] font-bold text-primary uppercase tracking-widest truncate max-w-full">{currentSong.title}</span>
                    <span className="font-mono text-[7px] sm:text-[9px] truncate max-w-full mt-1 uppercase tracking-wider">{currentSong.artist}</span>
                  </div>

                  {/* Inner spindle ring */}
                  <div className="w-5 h-5 bg-[#e0e0e0] rounded-full flex flex-col items-center justify-center border border-black/30 shadow-inner z-10">
                    {/* Spindle hole */}
                    <div className="w-1.5 h-1.5 rounded-full bg-[#050505] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Song Info & Secondary Actions */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex flex-col min-w-0 pr-4">
                <h2 className="text-3xl font-bold text-foreground mb-1 truncate">{currentSong.title}</h2>
                <p className="text-lg text-primary/80 truncate font-medium">{currentSong.artist}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={clsx("p-2 rounded-full transition-colors focus:outline-none", isLiked ? "text-rose-500" : "text-foreground/60 hover:text-foreground")}
                >
                  <Heart size={28} className={isLiked ? "fill-current" : ""} />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <ProgressBar
              currentSong={currentSong}
              duration={duration}
              progress={progress}
              setProgress={setProgress}
            />

            {/* Main Controls */}
            <div className="flex items-center justify-between shrink-0 mb-4 w-full px-2">
              <button
                onClick={toggleShuffle}
                className={clsx("p-3 rounded-full transition-colors", isShuffle ? "text-primary bg-primary/10" : "text-foreground/40 hover:text-foreground")}
              >
                <Shuffle size={24} />
              </button>

              <div className="flex items-center gap-4 sm:gap-6">
                <button onClick={prevSong} className="p-3 rounded-full text-foreground hover:bg-surface transition-colors">
                  <SkipBack size={36} className="fill-current text-foreground/90" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/50 text-primary-foreground transform active:scale-95 transition-all hover:scale-105"
                >
                  {isPlaying ? <Pause size={40} className="fill-current" /> : <Play size={40} className="fill-current ml-2" />}
                </button>

                <button onClick={nextSong} className="p-3 rounded-full text-foreground hover:bg-surface transition-colors">
                  <SkipForward size={36} className="fill-current text-foreground/90" />
                </button>
              </div>

              <button
                onClick={toggleRepeat}
                className={clsx("p-3 rounded-full transition-colors", isRepeat ? "text-primary bg-primary/10" : "text-foreground/40 hover:text-foreground")}
              >
                <Repeat size={24} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AudioVisualizer() {
  const BARS = 60;
  const radius = 150;

  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none z-0">
      <div className="relative w-full h-full flex items-center justify-center">
        {Array.from({ length: BARS }).map((_, i) => {
          const angle = (i / BARS) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const rotation = (angle * 180) / Math.PI + 90;

          return (
            <motion.div
              key={i}
              className="absolute bottom-1/2 left-1/2 w-1.5 bg-primary rounded-full origin-bottom"
              style={{
                x: x,
                y: y,
                rotate: `${rotation}deg`,
                translateY: '0%',
                translateX: '-50%'
              }}
              animate={{
                height: [10, Math.random() * 50 + 20, 10, Math.random() * 90 + 30, 10],
                opacity: [0.3, 0.8, 0.3, 1, 0.3]
              }}
              transition={{
                repeat: Infinity,
                duration: 0.8 + Math.random() * 0.5,
                ease: "easeInOut",
                delay: i * 0.02,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function ProgressBar({ currentSong, duration, progress, setProgress }: any) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localProgress, setLocalProgress] = useState(progress || 0);

  const safeDuration = (duration && duration !== Infinity && !isNaN(duration))
    ? duration
    : (currentSong?.duration > 0 ? currentSong.duration : 300);

  // Keep localProgress in sync with external playback tick when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(progress || 0);
    }
  }, [progress, isDragging]);

  const displayProgress = isDragging ? localProgress : (progress || 0);
  const percentage = Math.min(100, Math.max(0, (displayProgress / safeDuration) * 100));

  const pctFromPointerX = (clientX: number) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const newTime = (pctFromPointerX(e.clientX) / 100) * safeDuration;
    setLocalProgress(newTime);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newTime = (pctFromPointerX(e.clientX) / 100) * safeDuration;
    setLocalProgress(newTime);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    const finalTime = (pctFromPointerX(e.clientX) / 100) * safeDuration;
    setProgress(finalTime);
    window.dispatchEvent(new CustomEvent('player-seek', { detail: finalTime }));
  };

  return (
    <div className="w-full shrink-0 mb-6 relative z-50" style={{ touchAction: 'none' }}>
      <div
        ref={progressBarRef}
        className={clsx(
          "w-full h-10 flex items-center cursor-pointer group relative outline-none",
          isDragging && "dragging"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        tabIndex={0}
        role="slider"
        aria-label="Playback position"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percentage)}
        style={{ touchAction: 'none' }}
        onKeyDown={(e) => {
          const step = safeDuration * 0.02;
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            const t = Math.min(safeDuration, displayProgress + step);
            setProgress(t);
            window.dispatchEvent(new CustomEvent('player-seek', { detail: t }));
          }
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            const t = Math.max(0, displayProgress - step);
            setProgress(t);
            window.dispatchEvent(new CustomEvent('player-seek', { detail: t }));
          }
        }}
      >
        {/* Track */}
        <div className="w-full h-2 rounded-full bg-surface relative overflow-visible pointer-events-none group-focus-visible:ring-2 ring-primary ring-offset-2 ring-offset-background">
          {/* Fill */}
          <div
            className="absolute top-0 left-0 bottom-0 bg-primary rounded-full pointer-events-none"
            style={{ width: `${percentage}%` }}
          />
          {/* Thumb */}
          <div
            className={clsx(
              "w-4 h-4 rounded-full bg-primary absolute top-1/2 -translate-y-1/2 -translate-x-1/2 shadow-[0_0_0_3px_rgba(255,255,255,0.1),0_0_0_4px_var(--primary-color)] pointer-events-none transition-opacity duration-150",
              isDragging ? "opacity-100 scale-110" : "opacity-0 group-hover:opacity-100"
            )}
            style={{ left: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Time labels */}
      <div className="flex justify-between text-xs text-foreground/60 mt-2 font-mono font-medium tracking-wide">
        <span>{formatTime(displayProgress)}</span>
        <span>{formatTime(safeDuration)}</span>
      </div>
    </div>
  );
}