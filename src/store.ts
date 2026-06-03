import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme, Song, Playlist } from './types.ts';
import { MOCK_SONGS } from './lib/utils.ts';

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  songs: Song[];
  addSongs: (songs: Song[]) => void;
  deleteSong: (id: string) => void;
  playlists: Playlist[];
  createPlaylist: (name: string, songIds: string[]) => void;
  deletePlaylist: (id: string) => void;
  updatePlaylistOrder: (playlistId: string, newSongIds: string[]) => void;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  addSongsToPlaylist: (playlistId: string, songIds: string[]) => void;
  
  currentSongId: string | null;
  isPlaying: boolean;
  queue: string[];
  playSong: (songId: string, queue?: string[]) => void;
  playNext: (songId: string) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  nextSong: () => void;
  prevSong: () => void;
  
  eqBands: number[]; // 5 bands: 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz
  setEqBand: (index: number, value: number) => void;
  bassBoost: number;
  setBassBoost: (value: number) => void;
  setEqProfile: (bands: number[], bassBoost: number) => void;
  
  isShuffle: boolean;
  toggleShuffle: () => void;
  isRepeat: boolean;
  toggleRepeat: () => void;
  isPlayWindowOpen: boolean;
  setPlayWindowOpen: (open: boolean) => void;
  
  progress: number;
  duration: number;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'solar',
      setTheme: (theme) => set({ theme }),
      
      songs: MOCK_SONGS,
      addSongs: (newSongs) => set((state) => ({ songs: [...state.songs, ...newSongs] })),
      deleteSong: (id) => set((state) => ({ 
        songs: state.songs.filter(s => s.id !== id),
        queue: state.queue.filter(sId => sId !== id),
        playlists: state.playlists.map(p => ({...p, songs: p.songs.filter(sId => sId !== id)})),
        currentSongId: state.currentSongId === id ? null : state.currentSongId
      })),
      playlists: [],
      createPlaylist: (name, songIds) => set((state) => ({
        playlists: [...state.playlists, { id: Date.now().toString(), name, songs: songIds }]
      })),
      deletePlaylist: (id) => set((state) => ({
        playlists: state.playlists.filter(p => p.id !== id)
      })),
      updatePlaylistOrder: (playlistId, newSongIds) => set((state) => ({
        playlists: state.playlists.map(p => p.id === playlistId ? { ...p, songs: newSongIds } : p)
      })),
      addSongToPlaylist: (playlistId, songId) => set((state) => ({
        playlists: state.playlists.map(p => p.id === playlistId && !p.songs.includes(songId) ? { ...p, songs: [...p.songs, songId] } : p)
      })),
      addSongsToPlaylist: (playlistId, songIds) => set((state) => ({
        playlists: state.playlists.map(p => {
           if (p.id !== playlistId) return p;
           const newSongs = [...p.songs];
           for (const id of songIds) {
              if (!newSongs.includes(id)) newSongs.push(id);
           }
           return { ...p, songs: newSongs };
        })
      })),
      
      currentSongId: null,
      isPlaying: false,
      queue: [],
      playSong: (songId, queue) => set((state) => ({ 
        currentSongId: songId, 
        isPlaying: true,
        queue: queue || state.queue,
      })),
      playNext: (songId) => set((state) => {
         const currentIdx = state.currentSongId ? state.queue.indexOf(state.currentSongId) : -1;
         const newQueue = [...state.queue];
         if (currentIdx !== -1) {
           newQueue.splice(currentIdx + 1, 0, songId);
         } else {
           newQueue.push(songId);
         }
         return { queue: newQueue };
      }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying && !!state.currentSongId })),
      setPlaying: (playing) => set({ isPlaying: playing }),
      nextSong: () => set((state) => {
        if (!state.currentSongId || state.queue.length === 0) return {};
        const currentIndex = state.queue.indexOf(state.currentSongId);
        if (currentIndex < state.queue.length - 1) {
          return { currentSongId: state.queue[currentIndex + 1], isPlaying: true };
        }
        return { currentSongId: state.queue[0], isPlaying: true }; // Wrap around
      }),
      prevSong: () => set((state) => {
         if (!state.currentSongId || state.queue.length === 0) return {};
         const currentIndex = state.queue.indexOf(state.currentSongId);
         if (currentIndex > 0) {
           return { currentSongId: state.queue[currentIndex - 1], isPlaying: true };
         }
         return { currentSongId: state.queue[state.queue.length - 1], isPlaying: true }; // Wrap around backwards
      }),
      
      eqBands: [0, 0, 0, 0, 0, 0], // 6 bands
      setEqBand: (index, value) => set((state) => {
        const newBands = [...state.eqBands];
        newBands[index] = value;
        return { eqBands: newBands };
      }),
      bassBoost: 0,
      setBassBoost: (value) => set({ bassBoost: value }),
      setEqProfile: (bands, bassBoost) => set({ eqBands: bands, bassBoost }),
      
      isShuffle: false,
      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      isRepeat: false,
      toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),
      
      isPlayWindowOpen: false,
      setPlayWindowOpen: (open) => set({ isPlayWindowOpen: open }),

      progress: 0,
      duration: 0,
      setProgress: (progress) => set({ progress }),
      setDuration: (duration) => set({ duration }),
    }),
    {
      name: 'neonamp-storage',
      partialize: (state) => ({ songs: state.songs.filter(s => !MOCK_SONGS.find(ms => ms.id === s.id)), playlists: state.playlists, theme: state.theme, eqBands: state.eqBands, bassBoost: state.bassBoost, isShuffle: state.isShuffle, isRepeat: state.isRepeat }),
    }
  )
);
