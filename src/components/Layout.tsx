import { Outlet, useLocation, useNavigate } from 'react-router';
import { useState } from 'react';
import { Music2, ListMusic, Settings, SlidersHorizontal } from 'lucide-react';
import { useAppStore } from '../store.ts';
import PlayWindow from './PlayWindow.tsx';
import MiniPlayer from './MiniPlayer.tsx';
import AudioEngine from './AudioEngine.tsx';
import FirstLaunchImporter from './FirstLaunchImporter.tsx';

const HAS_LAUNCHED_KEY = 'app_has_launched';

export default function Layout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const isPlayWindowOpen = useAppStore(state => state.isPlayWindowOpen);

  // Show importer only on very first launch
  const [showImporter, setShowImporter] = useState(
    () => !localStorage.getItem(HAS_LAUNCHED_KEY)
  );

  const handleImportDone = () => {
    localStorage.setItem(HAS_LAUNCHED_KEY, 'true');
    setShowImporter(false);
  };

  const navItems = [
    { id: '/',          icon: Music2,            label: 'Library'   },
    { id: '/playlists', icon: ListMusic,          label: 'Playlists' },
    { id: '/eq',        icon: SlidersHorizontal,  label: 'EQ'        },
    { id: '/settings',  icon: Settings,           label: 'Settings'  },
  ];

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* First-launch import screen */}
      {showImporter && <FirstLaunchImporter onDone={handleImportDone} />}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative z-0">
        <Outlet />
      </div>

      <AudioEngine />

      {/* Mini Player */}
      <div className={`absolute bottom-[80px] left-0 right-0 z-10 px-4 pb-2 max-w-4xl mx-auto w-full pointer-events-none transition-opacity duration-300 ${isPlayWindowOpen ? 'opacity-0' : 'opacity-100'}`}>
        <div className="pointer-events-auto">
          <MiniPlayer />
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="h-[72px] bg-card/60 backdrop-blur-xl border-t border-border flex items-center justify-around z-20 shrink-0 px-2 pb-safe">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 hover:bg-surface/30 rounded-xl transition-all ${
              location.pathname === item.id ? 'text-primary' : 'text-foreground/60'
            }`}
          >
            <item.icon size={24} strokeWidth={location.pathname === item.id ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      <PlayWindow />
    </div>
  );
}
