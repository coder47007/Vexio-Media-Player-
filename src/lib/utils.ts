import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate some mock songs
export const MOCK_SONGS = [
  { id: '1', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', duration: 372, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', addedAt: Date.now() - 100000 },
  { id: '2', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 425, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', addedAt: Date.now() - 200000 },
  { id: '3', title: 'Harder, Better, Faster, Stronger', artist: 'Daft Punk', album: 'Discovery', duration: 354, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', addedAt: Date.now() - 300000 },
  { id: '4', title: 'Starboy', artist: 'The Weeknd', album: 'Starboy', duration: 302, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', addedAt: Date.now() - 400000 },
  { id: '5', title: 'Lose Yourself to Dance', artist: 'Daft Punk', album: 'Random Access Memories', duration: 353, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', addedAt: Date.now() - 50000 },
  { id: '6', title: 'Nightcall', artist: 'Kavinsky', album: 'OutRun', duration: 259, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', addedAt: Date.now() - 60000 },
  { id: '7', title: 'Resonance', artist: 'HOME', album: 'Odyssey', duration: 212, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', addedAt: Date.now() - 70000 },
  { id: '8', title: 'Instant Crush', artist: 'Daft Punk', album: 'Random Access Memories', duration: 338, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', addedAt: Date.now() - 80000 },
  { id: '9', title: 'Feel Good Inc.', artist: 'Gorillaz', album: 'Demon Days', duration: 221, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', addedAt: Date.now() - 90000 },
  { id: '10', title: 'Kids', artist: 'MGMT', album: 'Oracular Spectacular', duration: 302, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', addedAt: Date.now() - 10000 },
];

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
