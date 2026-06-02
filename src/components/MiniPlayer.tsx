import { useAppStore } from '../store.ts';
import { Play, Pause, SkipForward, SkipBack, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function MiniPlayer() {
  const currentSongId = useAppStore(state => state.currentSongId);
  const songs = useAppStore(state => state.songs);
  const isPlaying = useAppStore(state => state.isPlaying);
  const togglePlay = useAppStore(state => state.togglePlay);
  const nextSong = useAppStore(state => state.nextSong);
  const setPlayWindowOpen = useAppStore(state => state.setPlayWindowOpen);

  if (!currentSongId) return null;

  const currentSong = songs.find(s => s.id === currentSongId);
  if (!currentSong) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-card/80 backdrop-blur-xl w-full shadow-2xl border border-border rounded-2xl p-2.5 flex items-center gap-3 overflow-hidden"
        onClick={() => setPlayWindowOpen(true)}
      >
        <div className="w-12 h-12 bg-surface rounded-xl flex-shrink-0 flex items-center justify-center border border-border/50">
          <MusicIcon className="w-6 h-6 text-foreground/40" />
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-sm font-semibold truncate text-foreground">{currentSong.title}</p>
          <p className="text-xs text-foreground/60 truncate">{currentSong.artist}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={togglePlay} className="p-2 rounded-full hover:bg-surface text-foreground transition-colors">
            {isPlaying ? <Pause size={20} className="fill-foreground" /> : <Play size={20} className="fill-foreground ml-0.5" />}
          </button>
          <button onClick={nextSong} className="p-2 rounded-full hover:bg-surface text-foreground transition-colors mr-1">
            <SkipForward size={20} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Simple fallback icon
function MusicIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M19.36 2.766a.75.75 0 0 1 .465.73v11a4.5 4.5 0 1 1-2.032-3.754l-.468-.117a2.25 2.25 0 0 0-2.76 1.832v2.793a4.5 4.5 0 1 1-1.5-3.75V5.502a1.5 1.5 0 0 1 1.137-1.455l6.452-1.613a.75.75 0 0 1 .706.332Zm-4.86 15.734a3 3 0 1 0-6 0 3 3 0 0 0 6 0Zm6-3a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" clipRule="evenodd" />
    </svg>
  );
}
