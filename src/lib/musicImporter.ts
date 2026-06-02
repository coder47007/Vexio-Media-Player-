import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface SongData {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  path: string;
  url: string;
  addedAt: number;
}

// Parse metadata from filename: "Artist - Title.mp3" or just "Title.mp3"
function parseFilename(filename: string): { title: string; artist: string } {
  const name = filename.replace(/\.[^/.]+$/, ''); // strip extension
  const parts = name.split(' - ');
  if (parts.length >= 2) {
    return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() };
  }
  return { artist: 'Unknown Artist', title: name.trim() };
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    
    const timeoutId = setTimeout(() => {
      URL.revokeObjectURL(url);
      resolve(0);
    }, 2000);

    audio.onloadedmetadata = () => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(url);
      resolve(isFinite(audio.duration) ? audio.duration : 0);
    };
    audio.onerror = () => { 
      clearTimeout(timeoutId);
      URL.revokeObjectURL(url); 
      resolve(0); 
    };
    audio.src = url;
  });
}

export async function importAudioFiles(files: FileList | File[]): Promise<SongData[]> {
  const audioTypes = ['audio/mpeg', 'audio/mp4', 'audio/flac', 'audio/wav', 
                      'audio/ogg', 'audio/aac', 'audio/x-m4a', 'audio/webm'];
  const audioExts  = ['.mp3', '.m4a', '.flac', '.wav', '.ogg', '.aac', '.opus', '.webm'];

  const audioFiles = Array.from(files).filter(f => 
    audioTypes.includes(f.type) || audioExts.some(ext => f.name.toLowerCase().endsWith(ext))
  );

  const songs: SongData[] = [];
  
  for (const file of audioFiles) {
    try {
      const { title, artist } = parseFilename(file.name);
      const duration = await getAudioDuration(file);
      const id = generateId();
      
      let finalPath = file.name;
      let finalUrl = URL.createObjectURL(file); // Default to blob for Web

      // On native devices, we must physically copy the file to local storage 
      // so it survives app restarts. Blob URLs expire immediately when the app closes.
      if (Capacitor.isNativePlatform()) {
        try {
          // Convert file to base64 for writing
          const base64 = await new Promise<string>((resolve, reject) => {
             const reader = new FileReader();
             reader.onload = () => resolve((reader.result as string).split(',')[1]);
             reader.onerror = reject;
             reader.readAsDataURL(file);
          });
          
          const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const savedFileName = `${id}_${safeName}`;
          
          await Filesystem.writeFile({
            path: savedFileName,
            data: base64,
            directory: Directory.Data
          });
          
          const uriResult = await Filesystem.getUri({
            path: savedFileName,
            directory: Directory.Data
          });
          
          finalPath = savedFileName;
          finalUrl = Capacitor.convertFileSrc(uriResult.uri);
        } catch (err) {
          console.error("Failed to copy file to filesystem:", err);
          // Fallback to blob if write fails
        }
      }

      songs.push({
        id,
        title,
        artist,
        album: 'Unknown Album',
        duration,
        path: finalPath,
        url: finalUrl,
        addedAt: Date.now(),
      });
    } catch (err) {
      console.warn("Failed to parse file:", file.name, err);
    }
  }

  return songs;
}
