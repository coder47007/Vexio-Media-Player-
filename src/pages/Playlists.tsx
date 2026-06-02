import { useAppStore } from '../store.ts';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Play, ListMusic, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';
import { Song } from '../types.ts';

export default function Playlists() {
  const playlists = useAppStore(state => state.playlists);
  const songs = useAppStore(state => state.songs);
  const playSong = useAppStore(state => state.playSong);
  const updatePlaylistOrder = useAppStore(state => state.updatePlaylistOrder);
  const createPlaylist = useAppStore(state => state.createPlaylist);

  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(playlists.length > 0 ? playlists[0].id : null);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const activePlaylist = playlists.find(p => p.id === activePlaylistId);
  const playlistSongs = activePlaylist
    ? activePlaylist.songs
        .map((id) => songs.find((s) => s.id === id))
        .filter((s): s is Song => Boolean(s))
    : [];

  const handleDragEnd = (result: any) => {
    if (!result.destination || !activePlaylist) return;

    const items = Array.from(activePlaylist.songs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updatePlaylistOrder(activePlaylist.id, items);
  };

  const handlePlayPlaylist = () => {
    if (playlistSongs.length === 0 || !activePlaylist) return;
    playSong(playlistSongs[0]!.id, activePlaylist.songs);
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName, []);
    setIsCreatingPlaylist(false);
    setNewPlaylistName('');
  };

  return (
    <div className="flex flex-col h-full bg-background md:flex-row relative">
      {/* Sidebar - Playlists List */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border p-4 overflow-x-auto md:overflow-y-auto shrink-0 flex flex-col gap-4 no-scrollbar">
         <div className="flex items-center justify-between px-2 shrink-0">
           <h3 className="font-bold text-foreground">Playlists</h3>
           <button 
             onClick={() => setIsCreatingPlaylist(true)} 
             className="p-1.5 bg-surface hover:bg-border rounded-full text-foreground transition-colors"
           >
             <Plus size={16} />
           </button>
         </div>
         <div className="flex md:flex-col gap-2 shrink-0">
         {playlists.length === 0 ? (
            <p className="text-foreground/50 text-sm p-2 text-center mt-4">No playlists yet.</p>
         ) : (
           playlists.map(p => (
             <button
               key={p.id}
               onClick={() => setActivePlaylistId(p.id)}
               className={clsx(
                 "flex items-center gap-3 p-3 rounded-xl transition-all text-left whitespace-nowrap min-w-[150px] md:min-w-0 flex-shrink-0 md:flex-shrink",
                 activePlaylistId === p.id ? "bg-primary/20 text-primary" : "text-foreground hover:bg-surface"
               )}
             >
               <ListMusic size={20} className={activePlaylistId === p.id ? "text-primary" : "text-foreground/60"} />
               <div className="truncate flex-1 font-medium">{p.name}</div>
               <div className="text-xs opacity-60">{p.songs.length}</div>
             </button>
           ))
         )}
         </div>
      </div>

      {/* Main Content - Active Playlist */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {activePlaylist ? (
          <>
            <div className="p-6 border-b border-border shrink-0">
              <h2 className="text-3xl font-bold mb-2 truncate text-foreground">{activePlaylist.name}</h2>
              <div className="flex items-center gap-4 text-sm text-foreground/60 mb-4">
                 <span>{playlistSongs.length} songs</span>
              </div>
              <button 
                onClick={handlePlayPlaylist}
                className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg hover:scale-105 transition-transform"
              >
                <Play size={24} className="fill-current ml-1" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-[170px]">
               {playlistSongs.length > 0 ? (
                 <DragDropContext onDragEnd={handleDragEnd}>
                   <Droppable droppableId="playlist-list">
                     {(provided) => (
                       <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                         {playlistSongs.map((song, index) => (
                           <Draggable key={`${song.id}-${index}`} draggableId={`${song.id}-${index}`} index={index}>
                             {(provided, snapshot) => (
               <div
                                 ref={provided.innerRef}
                                 {...provided.draggableProps}
                                 className={clsx(
                                   "flex items-center gap-4 p-3.5 rounded-2xl bg-card/30 backdrop-blur-sm border transition-all",
                                   snapshot.isDragging ? "shadow-2xl border-primary scale-102 z-50 bg-card/80" : "border-border/50 hover:bg-surface/80"
                                 )}
                               >
                                 <div {...provided.dragHandleProps} className="p-1 px-2 text-foreground/30 hover:text-foreground/80 cursor-grab active:cursor-grabbing">
                                    <GripVertical size={20} />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <p className="text-sm font-medium text-foreground truncate">{song.title}</p>
                                   <p className="text-xs text-foreground/60 truncate">{song.artist}</p>
                                 </div>
                                 <button onClick={() => playSong(song.id, activePlaylist.songs)} className="p-2 rounded-full hover:bg-surface text-foreground/60 hover:text-primary transition-colors">
                                    <Play size={18} />
                                 </button>
                               </div>
                             )}
                           </Draggable>
                         ))}
                         {provided.placeholder}
                       </div>
                     )}
                   </Droppable>
                 </DragDropContext>
               ) : (
                 <div className="h-full flex items-center justify-center text-foreground/40 pb-20">
                    Empty Playlist
                 </div>
               )}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-foreground/40 pb-20 p-6 text-center">
             Select a playlist or create one in the Library.
          </div>
        )}
      </div>

      {/* Playlist Creation Modal */}
      {isCreatingPlaylist && (
         <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card/90 backdrop-blur-xl w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-border/50">
               <h3 className="text-xl font-bold mb-4">New Playlist</h3>
               <p className="text-sm text-foreground/60 mb-4">Create an empty playlist.</p>
               <input 
                 type="text" 
                 placeholder="Playlist Name" 
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
                   Save
                 </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
