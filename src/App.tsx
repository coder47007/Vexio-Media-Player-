import { RouterProvider, createMemoryRouter } from 'react-router';
import { useAppStore } from './store.ts';
import Layout from './components/Layout.tsx';
import Library from './pages/Library.tsx';
import Playlists from './pages/Playlists.tsx';
import EQ from './pages/EQ.tsx';
import Settings from './pages/Settings.tsx';
import { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Toaster } from 'sonner';

const router = createMemoryRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Library />,
      },
      {
        path: '/playlists',
        element: <Playlists />,
      },
      {
        path: '/eq',
        element: <EQ />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
    ],
  },
]);

export default function App() {
  const theme = useAppStore(state => state.theme);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    const handleBackButton = ({ canGoBack }: any) => {
      if (!canGoBack || window.location.pathname === '/') {
        CapApp.minimizeApp();
      } else {
        window.history.back();
      }
    };
    CapApp.addListener('backButton', handleBackButton);
    return () => {
      CapApp.removeAllListeners();
    };
  }, []);

  // A full height container, using theme based CSS vars.
  return (
    <div className="h-[100dvh] w-full text-foreground bg-background overflow-hidden antialiased relative">
       {/* Support for Image background themes */}
       <div 
         className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700" 
         style={{ backgroundImage: 'var(--bg-image, none)' }} 
       />

       {/* Background Atmosphere */}
       <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]"></div>
       </div>

       <RouterProvider router={router} />
       <Toaster position="top-center" theme={theme === 'dark_aesthetic' ? 'dark' : theme as any} />
    </div>
  );
}

