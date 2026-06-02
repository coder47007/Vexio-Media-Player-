export type Theme = string;

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover?: string;
  url: string;
  duration: number; // in seconds
  genre?: string;
  addedAt: number; // timestamp
  path?: string; // native filesystem path
}

export interface Playlist {
  id: string;
  name: string;
  songs: string[]; // array of song IDs
}

export interface EqPreset {
  name: string;
  bands: number[]; // e.g. 6 bands: 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz
  bassBoost: number;
}
