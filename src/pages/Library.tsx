import React, { useState, MouseEvent as ReactMouseEvent } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '../store.ts';
import { formatTime } from '../lib/utils.ts';
import { Play, Plus, Clock, MoreVertical, Trash2, ListPlus, PlaySquare, Bell, Image as ImageIcon } from 'lucide-react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import Ringtone from '../lib/ringtone.ts';
import { ID3Writer } from 'browser-id3-writer';
import { clsx } from 'clsx';
import { importAudioFiles } from '../lib/musicImporter.ts';

export default function Library() {
  const songs = useAppStore(state => state.songs);
  const playSong = useAppStore(state => state.playSong);
  const createPlaylist = useAppStore(state => state.createPlaylist);
  const addSongs = useAppStore(state => state.addSongs);
  
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const deleteSong = useAppStore(state => state.deleteSong);
  const playNext = useAppStore(state => state.playNext);
  const addSongToPlaylist = useAppStore(state => state.addSongToPlaylist);
  const addSongsToPlaylist = useAppStore(state => state.addSongsToPlaylist);
  
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const [songForCoverChange, setSongForCoverChange] = useState<string | null>(null);
  const importInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const close = () => setMenuOpenFor(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const handleDelete = async (song: any) => {
    try {
      if (song.path) {
        await Filesystem.deleteFile({ path: song.path }).catch(() => {});
      }
      deleteSong(song.id);
    } catch(e) { console.error(e) }
  };

  const handleSetRingtone = async (song: any) => {
    if (!song.path) return toast.error("Can't set non-native file as ringtone");
    try {
       await Ringtone.setRingtone({ path: song.path });
       toast.success("Ringtone set successfully!");
    } catch(e) {
       toast.error("Could not set ringtone. Have you granted the permission?");
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !songForCoverChange) return;
    const file = e.target.files[0];
    const targetSong = songs.find(s => s.id === songForCoverChange);
    
    if (!targetSong?.path) return toast.error("Cannot change cover for non-native files");
    
    try {
       const imgBuffer = await file.arrayBuffer();
       const mp3File = await Filesystem.readFile({ path: targetSong.path });
       
       const binaryString = window.atob(mp3File.data as string);
       const bytes = new Uint8Array(binaryString.length);
       for (let i = 0; i < binaryString.length; i++) {
           bytes[i] = binaryString.charCodeAt(i);
       }
       
       const writer = new ID3Writer(bytes.buffer);
       writer.setFrame('APIC', {
           type: 3,
           data: imgBuffer,
           description: 'Cover'
       });
       const taggedBuffer = writer.addTag();
       const blob = new Blob([taggedBuffer]);
       const reader = new FileReader();
       reader.readAsDataURL(blob);
       reader.onloadend = async () => {
          const b64 = (reader.result as string).split(',')[1];
          await Filesystem.writeFile({ path: targetSong.path!, data: b64 });
          toast.success("Cover updated! Refresh to see changes.");
       }
    } catch(err) {
       console.error(err);
       toast.error("Error changing cover");
    }
  };

  const handleImportFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      const importedSongs = await importAudioFiles(files);
      if (importedSongs.length === 0) {
         toast.error("No audio files found in selection.");
         return;
      }
      
      const existingPaths = new Set(songs.map(s => s.path));
      const newSongs = importedSongs.filter(s => !existingPaths.has(s.path));
      
      if (newSongs.length > 0) {
         addSongs(newSongs);
         toast.success(`Imported ${newSongs.length} new songs!`);
      } else {
         toast.info("All selected songs are already in the library.");
      }
    } catch(err) {
      console.error("Import error", err);
      toast.error("Failed to import: " + (err as Error).message);
    }
    
    // Clear input so we can import the same folder again if needed
    if (importInputRef.current) importInputRef.current.value = '';
  };

  const toggleSelect = (id: string, e: ReactMouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedSongs);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedSongs(newSet);
  };

  const clearSelection = () => setSelectedSongs(new Set());

  const handlePlay = (id: string) => {
    if (selectedSongs.size > 0) return; // Prevent play if in selection mode
    playSong(id, songs.map(s => s.id));
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim() || selectedSongs.size === 0) return;
    createPlaylist(newPlaylistName, Array.from(selectedSongs));
    setIsCreatingPlaylist(false);
    setNewPlaylistName('');
    clearSelection();
  };

  const isSelectionMode = selectedSongs.size > 0;
  const [activeTab, setActiveTab] = useState<'Songs' | 'Recently Added' | 'Albums' | 'Artists' | 'Genres' | 'Playlists'>('Songs');
  const playlists = useAppStore(state => state.playlists);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto flex flex-col h-full">
      <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={handleCoverChange} />
      <input type="file" accept="audio/*,.mp3,.m4a,.flac,.wav,.ogg,.aac,.opus" multiple ref={importInputRef} className="hidden" onChange={handleImportFiles} />
      <div className="flex items-center justify-between mb-4 pt-4">
        <h1 className="text-3xl font-bold text-foreground">Library</h1>
        <div className="flex gap-2">
           {!isSelectionMode && (
               <button 
                 onClick={() => importInputRef.current?.click()}
                 className="px-3 py-1.5 rounded-full bg-surface text-foreground font-medium flex items-center gap-1 hover:bg-border transition-colors cursor-pointer text-sm"
               >
                 <Plus size={16} /> Import Music Files
               </button>
           )}
          {isSelectionMode && (
            <div className="flex gap-2 text-sm">
               <button onClick={clearSelection} className="px-3 py-1.5 rounded-full bg-surface text-foreground hover:bg-border transition-colors">
                 Cancel
               </button>
               <button onClick={() => setIsCreatingPlaylist(true)} className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-1 hover:opacity-90">
                 <Plus size={16} /> Add to Playlist ({selectedSongs.size})
               </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 pb-1 -mx-2 px-2">
        {['Songs', 'Recently Added', 'Albums', 'Artists', 'Genres', 'Playlists'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={clsx(
              "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === tab ? "bg-primary text-primary-foreground" : "bg-surface text-foreground/70 hover:text-foreground hover:bg-border"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="space-y-3 pb-[170px] px-2">
          {(activeTab === 'Songs' || activeTab === 'Recently Added') && 
            [...songs]
              .sort((a, b) => activeTab === 'Recently Added' ? (b.addedAt || 0) - (a.addedAt || 0) : a.title.localeCompare(b.title))
              .map(song => (
            <div 
              key={song.id}
              onClick={() => handlePlay(song.id)}
              className={clsx(
                "flex items-center gap-4 p-3.5 rounded-2xl transition-colors cursor-pointer group hover:bg-surface/80 border border-border/50 bg-card/30 backdrop-blur-sm relative",
                selectedSongs.has(song.id) && "bg-surface/80 border-primary/50",
                menuOpenFor === song.id ? "z-50" : "z-10"
              )}
            >
              <div 
                className="w-12 h-12 bg-gradient-to-br from-surface to-background rounded-xl flex-shrink-0 flex items-center justify-center relative overflow-hidden border border-border"
              >
                {/* Checkbox overlay or normal icon */}
                <div onClick={(e) => toggleSelect(song.id, e)} className="absolute inset-0 flex items-center justify-center bg-background/50 cursor-pointer z-10 transition-opacity">
                   <div className={clsx(
                     "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                     selectedSongs.has(song.id) ? "border-primary bg-primary" : "border-foreground/30 hover:border-foreground/60"
                   )}>
                      {selectedSongs.has(song.id) && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                   </div>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{song.title}</p>
                <p className="text-xs text-foreground/60 truncate">{song.artist}</p>
              </div>
              
              <div className="flex items-center gap-3 text-foreground/40 text-xs font-mono">
                 {formatTime(song.duration)}
              </div>
              
              <div className="relative">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setMenuOpenFor(menuOpenFor === song.id ? null : song.id); 
                  }}
                  className={clsx(
                    "p-2 rounded-full transition-colors",
                    menuOpenFor === song.id 
                      ? "bg-primary text-primary-foreground" 
                      : "text-foreground/40 hover:text-foreground hover:bg-surface"
                  )}
                >
                  <MoreVertical size={18} />
                </button>
                
                {menuOpenFor === song.id && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-background border-2 border-border/80 rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <button 
                      onClick={(e) => { e.stopPropagation(); playNext(song.id); setMenuOpenFor(null); }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-surface/80 transition-colors"
                    >
                      <PlaySquare size={16} /> Play Next
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedSongs(new Set([song.id])); setIsCreatingPlaylist(true); setMenuOpenFor(null); }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-surface/80 transition-colors"
                    >
                      <ListPlus size={16} /> Add to Playlist
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleSetRingtone(song); setMenuOpenFor(null); }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-surface/80 transition-colors"
                    >
                      <Bell size={16} /> Set as Ringtone
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setSongForCoverChange(song.id);
                        coverInputRef.current?.click();
                        setMenuOpenFor(null); 
                      }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-surface/80 transition-colors"
                    >
                      <ImageIcon size={16} /> Change Cover
                    </button>
                    <div className="h-px bg-border/50 my-1 w-full" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(song); setMenuOpenFor(null); }}
                      className="w-full px-4 py-2 text-left text-sm text-red-500 hover:text-red-400 flex items-center gap-3 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={16} /> Delete from Device
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {activeTab === 'Albums' && Array.from(new Set(songs.map(s => s.album))).map(album => (
            <div key={album} className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
              <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-foreground/40 font-bold">
                {album.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{album}</p>
                <p className="text-xs text-foreground/60">{songs.filter(s => s.album === album).length} songs</p>
              </div>
            </div>
          ))}

          {activeTab === 'Artists' && Array.from(new Set(songs.map(s => s.artist))).map(artist => (
            <div key={artist} className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
              <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center text-foreground/40 font-bold">
                {artist.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{artist}</p>
                <p className="text-xs text-foreground/60">{songs.filter(s => s.artist === artist).length} songs</p>
              </div>
            </div>
          ))}

          {activeTab === 'Genres' && Array.from(new Set(songs.map(s => s.genre || 'Unknown'))).map(genre => (
            <div key={genre} className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
              <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-foreground/40 font-bold">
                #
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{genre}</p>
                <p className="text-xs text-foreground/60">{songs.filter(s => (s.genre || 'Unknown') === genre).length} songs</p>
              </div>
            </div>
          ))}

          {activeTab === 'Playlists' && playlists.map(playlist => (
            <div key={playlist.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
              <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-primary/60 font-bold">
                <Play size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{playlist.name}</p>
                <p className="text-xs text-foreground/60">{playlist.songs.length} songs</p>
              </div>
            </div>
          ))}
          
          {activeTab === 'Playlists' && playlists.length === 0 && (
            <p className="text-center text-foreground/50 py-8">No playlists found. Create one by selecting songs.</p>
          )}
        </div>
      </div>

      {/* Playlist Creation Modal */}
      {isCreatingPlaylist && (
         <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card/90 backdrop-blur-xl w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-border/50 flex flex-col max-h-[80vh]">
               <h3 className="text-xl font-bold mb-4 shrink-0">Add to Playlist</h3>
               <p className="text-sm text-foreground/60 mb-4 shrink-0">Adding {selectedSongs.size} tracks.</p>

               {playlists.length > 0 && (
                 <div className="overflow-y-auto mb-6 flex-1 min-h-0 border border-border/10 rounded-xl bg-surface/30">
                   {playlists.map(p => (
                     <button 
                       key={p.id}
                       onClick={() => {
                         addSongsToPlaylist(p.id, Array.from(selectedSongs));
                         setIsCreatingPlaylist(false);
                         clearSelection();
                         toast.success(`Added to ${p.name}`);
                       }}
                       className="w-full text-left px-4 py-3 border-b border-border/50 hover:bg-surface transition-colors flex items-center justify-between last:border-b-0"
                     >
                       <span className="font-medium truncate pr-4">{p.name}</span>
                       <span className="text-xs text-foreground/50 shrink-0">{p.songs.length} songs</span>
                     </button>
                   ))}
                 </div>
               )}
               
               <div className="shrink-0">
                 {playlists.length > 0 && <p className="text-sm font-semibold mb-2">Or create new:</p>}
                 <input 
                   type="text" 
                   placeholder="New Playlist Name" 
                   autoFocus
                   className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground mb-6 focus:outline-none focus:border-primary"
                   value={newPlaylistName}
                   onChange={(e) => setNewPlaylistName(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') handleCreatePlaylist();
                     if (e.key === 'Escape') setIsCreatingPlaylist(false);
                   }}
                 />
                 <div className="flex justify-end gap-3">
                   <button onClick={() => setIsCreatingPlaylist(false)} className="px-4 py-2 rounded-lg hover:bg-surface text-foreground font-medium transition-colors">
                     Cancel
                   </button>
                   <button onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim()} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50">
                     {playlists.length > 0 ? "Create" : "Save"}
                   </button>
                 </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
