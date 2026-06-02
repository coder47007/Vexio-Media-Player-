import { useState, useRef } from 'react';
import { Music2, FolderOpen, CheckCircle2, Loader2 } from 'lucide-react';
import { importAudioFiles, SongData } from '../lib/musicImporter.ts';
import { useAppStore } from '../store.ts';

interface Props {
  onDone: () => void;
}

export default function FirstLaunchImporter({ onDone }: Props) {
  const addSongs = useAppStore(state => state.addSongs);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [count, setCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setStatus('loading');

    const songs = await importAudioFiles(files);
    if (songs.length > 0) addSongs(songs);

    setCount(songs.length);
    setStatus('done');

    // Auto-close after showing success
    setTimeout(onDone, 1800);
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-8 text-center">
      {/* Hidden file input — "multiple" + directory allows folder selection */}
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.mp3,.m4a,.flac,.wav,.ogg,.aac,.opus"
        multiple
        // webkitdirectory removed to allow standard file selection on all OSes
        className="hidden"
        onChange={e => handleImport(e.target.files)}
      />

      <AnimatedIcon status={status} />

      <div className="mt-6 space-y-2">
        {status === 'idle' && (
          <>
            <h1 className="text-2xl font-bold text-foreground">Welcome</h1>
            <p className="text-foreground/60 text-sm max-w-xs">
              Tap below to import your music from device storage.
              You'll only need to do this once.
            </p>
          </>
        )}
        {status === 'loading' && (
          <p className="text-foreground/70 text-sm">Importing your music...</p>
        )}
        {status === 'done' && (
          <>
            <h2 className="text-xl font-bold text-foreground">All set!</h2>
            <p className="text-foreground/60 text-sm">{count} song{count !== 1 ? 's' : ''} imported</p>
          </>
        )}
      </div>

      {status === 'idle' && (
        <div className="mt-10 flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={openPicker}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/30"
          >
            <FolderOpen size={20} />
            Choose Music Files
          </button>
          <button
            onClick={onDone}
            className="w-full py-3 rounded-2xl text-foreground/40 text-sm"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
}

function AnimatedIcon({ status }: { status: 'idle' | 'loading' | 'done' }) {
  return (
    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
      {status === 'idle'    && <Music2 size={40} className="text-primary" />}
      {status === 'loading' && <Loader2 size={40} className="text-primary animate-spin" />}
      {status === 'done'    && <CheckCircle2 size={40} className="text-green-500" />}
    </div>
  );
}
