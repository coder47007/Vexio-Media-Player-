import { useEffect, useRef } from 'react';
import { useAppStore } from '../store.ts';
import { MediaSession } from '@capgo/capacitor-media-session';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

// Frequencies corresponding to our EQ bands
const FREQS = [60, 230, 910, 3000, 14000];

export default function AudioEngine() {
  const currentSongId = useAppStore(state => state.currentSongId);
  const songs = useAppStore(state => state.songs);
  const isPlaying = useAppStore(state => state.isPlaying);
  const eqBands = useAppStore(state => state.eqBands);
  const bassBoost = useAppStore(state => state.bassBoost);
  
  const setProgress = useAppStore(state => state.setProgress);
  const setDuration = useAppStore(state => state.setDuration);
  const nextSong = useAppStore(state => state.nextSong);
  const prevSong = useAppStore(state => state.prevSong);
  const setPlaying = useAppStore(state => state.setPlaying);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const bassBoostFilterRef = useRef<BiquadFilterNode | null>(null);

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;

      // Event listeners for progress
      audio.addEventListener('timeupdate', () => {
        setProgress(audio.currentTime);
        // Dispatch custom event for visualizer syncing if needed
        window.dispatchEvent(new CustomEvent('audio-data', { detail: { value: Math.random() } })); // Dummy data for visualizer sync
        
        // Only update Web position state. Native handles automatic progression via playbackRate.
        if (!Capacitor.isNativePlatform() && 'mediaSession' in navigator && navigator.mediaSession.setPositionState && !isNaN(audio.duration) && audio.duration > 0 && isFinite(audio.duration)) {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate,
            position: audio.currentTime
          });
        }
      });
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      audio.addEventListener('play', () => {
        useAppStore.getState().setPlaying(true);
      });
      audio.addEventListener('pause', () => {
        useAppStore.getState().setPlaying(false);
      });
      audio.addEventListener('ended', () => {
        // IMPORTANT: On mobile browsers, JS execution is paused in the background.
        // We must synchronously set the next source and call play() inside this event 
        // listener to guarantee continuous playback when the screen is off.
        const state = useAppStore.getState();
        const currentIdx = state.queue.indexOf(state.currentSongId || '');
        if (currentIdx !== -1 && currentIdx < state.queue.length - 1) {
            const nextId = state.queue[currentIdx + 1];
            const nextSongObj = state.songs.find(s => s.id === nextId);
            if (nextSongObj && nextSongObj.url) {
                audio.src = nextSongObj.url;
                audio.play().catch(e => console.warn('Background autoplay blocked:', e));
                
                if (ctxRef.current?.state === 'suspended') {
                    ctxRef.current.resume();
                }
            }
        }
        nextSong();
      });

      // Handle seeking from UI
      const handleSeek = (e: Event) => {
        const customEvent = e as CustomEvent;
        audio.currentTime = customEvent.detail;
      };
      window.addEventListener('player-seek', handleSeek);

      return () => {
        window.removeEventListener('player-seek', handleSeek);
        if (ctxRef.current?.state !== 'closed') {
          ctxRef.current?.close();
        }
      };
    }
  }, []);

  // Update Media Source and Metadata when song changes
  useEffect(() => {
    const song = songs.find(s => s.id === currentSongId);
    if (!song || !audioRef.current) return;

    // Load new song dynamically
    const loadAudioSource = async () => {
      let finalSrc = song.url || '';

      if (song.path && !finalSrc) {
         if (Capacitor.isNativePlatform()) {
             try {
                if (song.path.startsWith('/')) {
                   finalSrc = Capacitor.convertFileSrc(song.path);
                } else {
                   const uriResult = await Filesystem.getUri({ path: song.path, directory: Directory.Documents });
                   finalSrc = Capacitor.convertFileSrc(uriResult.uri);
                }
             } catch(e) { console.error("Native path error", e); }
         } else {
             try {
                if (!song.path.startsWith('/')) {
                   const file = await Filesystem.readFile({ path: song.path, directory: Directory.Documents });
                   finalSrc = `data:audio/mp3;base64,${file.data}`;
                }
             } catch(e) { console.error("Web path error", e); }
         }
      }

      // Check if we actually need to change the source
      // Browser might normalize URLs (e.g. adding trailing slashes), so we only update if it's genuinely different
      const currentSrc = audioRef.current.src;
      if (finalSrc && (!currentSrc.includes(finalSrc) && currentSrc !== finalSrc)) {
        audioRef.current.src = finalSrc;
        audioRef.current.load();
        
        if (useAppStore.getState().isPlaying) {
           audioRef.current.play().catch(e => console.warn('Autoplay blocked:', e));
        }
      }
    };
    
    loadAudioSource();
    
    // Media Session API for background playing and notification
    const setupMediaSession = async () => {
      const isNative = Capacitor.isNativePlatform();
      const artworkUrl = song.cover;
      const defaultArt = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=512&h=512&fit=crop';
      const finalArt = artworkUrl && !artworkUrl.startsWith('data:') ? artworkUrl : defaultArt;

      if (isNative) {
        try {
          await MediaSession.setMetadata({
            title: song.title,
            artist: song.artist,
            album: song.album,
            artwork: [{ src: finalArt }]
          });
        } catch(e) { console.warn("Failed to set MediaSession metadata:", e); }
        
        try {
          MediaSession.setActionHandler({ action: 'play' }, async () => {
            if (ctxRef.current?.state === 'suspended') await ctxRef.current.resume();
            if (audioRef.current) {
              await audioRef.current.play().catch(console.warn);
              await MediaSession.setPlaybackState({ playbackState: 'playing' });
            }
            useAppStore.getState().setPlaying(true);
          });
          
          MediaSession.setActionHandler({ action: 'pause' }, async () => {
            if (audioRef.current) {
              audioRef.current.pause();
              await MediaSession.setPlaybackState({ playbackState: 'paused' });
            }
            useAppStore.getState().setPlaying(false);
          });
          
          MediaSession.setActionHandler({ action: 'previoustrack' }, async () => {
            if (ctxRef.current?.state === 'suspended') await ctxRef.current.resume();
            const state = useAppStore.getState();
            state.prevSong();
            setTimeout(() => {
               const newState = useAppStore.getState();
               if (newState.isPlaying && audioRef.current) {
                 audioRef.current.play().catch(console.warn);
               }
            }, 100);
          });
          
          MediaSession.setActionHandler({ action: 'nexttrack' }, async () => {
            if (ctxRef.current?.state === 'suspended') await ctxRef.current.resume();
            const state = useAppStore.getState();
            state.nextSong();
            setTimeout(() => {
               const newState = useAppStore.getState();
               if (newState.isPlaying && audioRef.current) {
                 audioRef.current.play().catch(console.warn);
               }
            }, 100);
          });
          
          MediaSession.setActionHandler({ action: 'seekto' }, async (details) => {
            const seekTime = details.seekTime;
            if (typeof seekTime === 'number' && audioRef.current) {
               audioRef.current.currentTime = seekTime;
               setProgress(seekTime);
               await MediaSession.setPositionState({
                 position: seekTime,
                 duration: audioRef.current.duration || 0,
                 playbackRate: 1
               });
            }
          });
        } catch(e) { console.warn("Failed to set MediaSession handlers:", e); }
      } else if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: song.title,
          artist: song.artist,
          album: song.album,
          artwork: [
            { src: finalArt, sizes: '96x96', type: 'image/png' },
            { src: finalArt, sizes: '512x512', type: 'image/png' }
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => {
          if (ctxRef.current?.state === 'suspended') ctxRef.current.resume();
          if (audioRef.current) audioRef.current.play().catch(console.warn);
          navigator.mediaSession.playbackState = 'playing';
          useAppStore.getState().setPlaying(true);
        });
        
        navigator.mediaSession.setActionHandler('pause', () => {
          if (audioRef.current) audioRef.current.pause();
          navigator.mediaSession.playbackState = 'paused';
          useAppStore.getState().setPlaying(false);
        });
        
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          if (ctxRef.current?.state === 'suspended') ctxRef.current.resume();
          useAppStore.getState().prevSong();
          setTimeout(() => {
             const newState = useAppStore.getState();
             if (newState.isPlaying && audioRef.current) {
               audioRef.current.play().catch(console.warn);
             }
          }, 100);
        });
        
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          if (ctxRef.current?.state === 'suspended') ctxRef.current.resume();
          useAppStore.getState().nextSong();
          setTimeout(() => {
             const newState = useAppStore.getState();
             if (newState.isPlaying && audioRef.current) {
               audioRef.current.play().catch(console.warn);
             }
          }, 100);
        });
        
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          const seekTime = details.seekTime;
          if (typeof seekTime === 'number' && audioRef.current) {
             audioRef.current.currentTime = seekTime;
             setProgress(seekTime);
          }
        });
        
        // Sync playback state immediately
        navigator.mediaSession.playbackState = useAppStore.getState().isPlaying ? 'playing' : 'paused';
      }
    };
    
    setupMediaSession();
  }, [currentSongId, songs]);

  // Handle Play/Pause toggle separately
  useEffect(() => {
    if (!audioRef.current) return;

    // HACK: Silent audio tag to keep WebView JS engine alive in the background
    // Since our main audio is routed through AudioContext, Android Chromium will suspend
    // the WebView when the app is in the background. A silent, unrouted <audio> element prevents this.
    const silentPlayer = document.getElementById('silent-audio-player') as HTMLAudioElement;
    if (silentPlayer) {
       if (isPlaying) silentPlayer.play().catch(() => {});
       else silentPlayer.pause();
    }

    if (isPlaying) {
      if (Capacitor.isNativePlatform()) {
         MediaSession.setPlaybackState({ playbackState: 'playing' }).catch(() => {});
      } else if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
      
      if (ctxRef.current?.state === 'suspended') {
        ctxRef.current.resume();
      }

      audioRef.current.play().catch(e => {
        console.warn('Autoplay blocked on resume:', e);
        setPlaying(false);
      });
    } else {
      if (Capacitor.isNativePlatform()) {
         MediaSession.setPlaybackState({ playbackState: 'paused' });
      } else if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
      
      audioRef.current.pause();
    }
  }, [isPlaying, currentSongId]);

  // Apply EQ settings dynamically
  useEffect(() => {
    // If EQ or BassBoost is activated but ctx isn't created, create it
    const requiresEQ = bassBoost > 0 || eqBands.some(v => v !== 0);
    if (requiresEQ && !ctxRef.current && audioRef.current) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        ctxRef.current = ctx;
        
        const source = ctx.createMediaElementSource(audioRef.current);
        sourceRef.current = source;
        
        let prevNode: AudioNode = source;
        const newFilters = FREQS.map((freq) => {
          const filter = ctx.createBiquadFilter();
          filter.type = 'peaking';
          filter.frequency.value = freq;
          filter.Q.value = 1;
          filter.gain.value = 0;
          prevNode.connect(filter);
          prevNode = filter;
          return filter;
        });
        filtersRef.current = newFilters;
        
        const bassFilter = ctx.createBiquadFilter();
        bassFilter.type = 'lowshelf';
        bassFilter.frequency.value = 80;
        bassFilter.gain.value = 0;
        prevNode.connect(bassFilter);
        bassBoostFilterRef.current = bassFilter;
        
        bassFilter.connect(ctx.destination);
        
        // If we created the audio context while a song is already playing,
        // it starts in a suspended state. We must resume it immediately or it will mute the audio!
        if (isPlaying && ctx.state === 'suspended') {
           ctx.resume();
        }
    }

    if (!filtersRef.current.length || !bassBoostFilterRef.current) return;
    
    // Update Parametric EQ bands
    eqBands.forEach((gain, index) => {
      if (filtersRef.current[index]) {
        filtersRef.current[index].gain.value = gain; // Range usually -15 to 15
      }
    });

    // Update Bass Boost (custom range mapping: 0 to 100 -> 0 to 20dB)
    const normalizedBass = (bassBoost / 100) * 20; 
    bassBoostFilterRef.current.gain.value = normalizedBass;
    
  }, [eqBands, bassBoost]);

  return (
    <audio 
       id="silent-audio-player" 
       loop 
       src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA" 
       style={{ display: 'none' }}
    />
  );
}
