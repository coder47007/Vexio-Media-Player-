import { useAppStore } from '../store.ts';
import { Theme } from '../types.ts';
import { Palette, FileVideo, Download, HelpCircle, FileText, Shield, Star, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';const SOLID_THEMES: { id: string; name: string; colors: string[] }[] = [
  { id: 'midnight', name: 'Midnight', colors: ['bg-[#020617]', 'bg-[#6366f1]'] },
  { id: 'ocean', name: 'Deep Ocean', colors: ['bg-[#082f49]', 'bg-[#0ea5e9]'] },
  { id: 'cyberpunk', name: 'Cyberpunk', colors: ['bg-[#1a0b2e]', 'bg-[#d946ef]'] },
  { id: 'sunset', name: 'Sunset Drive', colors: ['bg-[#450a0a]', 'bg-[#f97316]'] },
  { id: 'forest', name: 'Dark Forest', colors: ['bg-[#052e16]', 'bg-[#22c55e]'] },
  { id: 'solar', name: 'Solar Warm', colors: ['bg-[#1a0f0a]', 'bg-[#ea580c]'] },
  { id: 'crimson', name: 'Crimson Red', colors: ['bg-[#1a0505]', 'bg-[#dc2626]'] },
  { id: 'violet', name: 'Violet Night', colors: ['bg-[#110524]', 'bg-[#8b5cf6]'] },
  { id: 'slate', name: 'Slate Gray', colors: ['bg-[#0f172a]', 'bg-[#3b82f6]'] },
  { id: 'coffee', name: 'Coffee Roast', colors: ['bg-[#1c1512]', 'bg-[#d97706]'] },
  { id: 'dracula', name: 'Dracula', colors: ['bg-[#282a36]', 'bg-[#bd93f9]'] },
  { id: 'nord', name: 'Nord', colors: ['bg-[#2e3440]', 'bg-[#88c0d0]'] },
  { id: 'monokai', name: 'Monokai', colors: ['bg-[#272822]', 'bg-[#a6e22e]'] },
  { id: 'obsidian', name: 'Obsidian', colors: ['bg-[#0b0c10]', 'bg-[#66fcf1]'] },
  { id: 'ruby', name: 'Ruby', colors: ['bg-[#1a0f14]', 'bg-[#e0115f]'] },
  { id: 'emerald-dark', name: 'Emerald', colors: ['bg-[#021a14]', 'bg-[#10b981]'] },
  { id: 'sapphire-dark', name: 'Sapphire', colors: ['bg-[#07122a]', 'bg-[#2563eb]'] },
  { id: 'copper', name: 'Copper', colors: ['bg-[#1a110b]', 'bg-[#b87333]'] },
  { id: 'plum', name: 'Plum', colors: ['bg-[#1c0f1c]', 'bg-[#dda0dd]'] },
  { id: 'matcha', name: 'Matcha', colors: ['bg-[#121a14]', 'bg-[#8da399]'] },
];

const IMAGE_THEMES: { id: string; name: string; preview: string }[] = [
  { id: 'rain-city', name: 'Rain City', preview: 'https://images.unsplash.com/photo-1515266598076-2e865f128e6c?w=100&q=80' },
  { id: 'deep-space', name: 'Deep Space', preview: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=100&q=80' },
  { id: 'synthwave', name: 'Synthwave', preview: 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=100&q=80' },
  { id: 'mountain-peaks', name: 'Mountains', preview: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=100&q=80' },
  { id: 'neon-night', name: 'Neon Night', preview: 'https://images.unsplash.com/photo-1555679427-1f6f9c18ae41?w=100&q=80' },
  { id: 'forest-path', name: 'Forest Path', preview: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=100&q=80' },
  { id: 'ocean-waves', name: 'Ocean Waves', preview: 'https://images.unsplash.com/photo-1439405326854-014607f694d7?w=100&q=80' },
  { id: 'desert-dunes', name: 'Desert Dunes', preview: 'https://images.unsplash.com/photo-1542401886-65d6c61de115?w=100&q=80' },
  { id: 'aurora', name: 'Aurora Sky', preview: 'https://images.unsplash.com/photo-1531366936337-775928d00920?w=100&q=80' },
  { id: 'abstract-dark', name: 'Abstract Dark', preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80' },
  { id: 'cyber-city', name: 'Cyber City', preview: 'https://images.unsplash.com/photo-1542360211-1d54bdc828e8?w=100&q=80' },
  { id: 'lofi-room', name: 'Lofi Room', preview: 'https://images.unsplash.com/photo-1510372803698-17a4128c70cd?w=100&q=80' },
  { id: 'misty-forest', name: 'Misty Forest', preview: 'https://images.unsplash.com/photo-1447013898555-d143c7bfe9e6?w=100&q=80' },
  { id: 'galaxy', name: 'Galaxy', preview: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=100&q=80' },
  { id: 'sunset-beach', name: 'Sunset Beach', preview: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&q=80' },
  { id: 'neon-signs', name: 'Neon Signs', preview: 'https://images.unsplash.com/photo-1554189097-ffe88e998a2b?w=100&q=80' },
  { id: 'autumn-leaves', name: 'Autumn Leaves', preview: 'https://images.unsplash.com/photo-1506744012022-4a0b27b95254?w=100&q=80' },
  { id: 'snowy-mountains', name: 'Snow Mountains', preview: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=100&q=80' },
  { id: 'tokyo-street', name: 'Tokyo Street', preview: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=100&q=80' },
  { id: 'retro-grid', name: 'Retro Grid', preview: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=100&q=80' },
];

export default function Settings() {
  const currentTheme = useAppStore(state => state.theme);
  const setTheme = useAppStore(state => state.setTheme);
  
  const [activeTab, setActiveTab] = useState<'appearance' | 'converter' | 'faq' | 'terms' | 'policy' | 'rate'>('appearance');
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [outputName, setOutputName] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');

  const ffmpegRef = useRef(new FFmpeg());
  
  const handleConvert = async () => {
    if (!videoFile || !outputName) return;
    setIsConverting(true);
    setCompleted(false);
    setDownloadUrl(null);
    setProgressMsg('Loading Converter Engine...');
    
    try {
      const ffmpeg = ffmpegRef.current;
      
      // Load FFmpeg if not already loaded
      if (!ffmpeg.loaded) {
        const baseURL = '/ffmpeg';
        
        ffmpeg.on('progress', ({ progress }) => {
          if (progress >= 0 && progress <= 1) {
            setProgressMsg(`Converting Engine Active... ${Math.round(progress * 100)}%`);
          }
        });

        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
      }

      setProgressMsg('Extracting Audio...');
      const inputFilename = `input_${videoFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      await ffmpeg.writeFile(inputFilename, await fetchFile(videoFile));
      
      const outputFilename = `${outputName.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
      
      // Run ffmpeg command: extract audio as mp3
      await ffmpeg.exec(['-i', inputFilename, '-vn', '-c:a', 'libmp3lame', '-q:a', '2', outputFilename]);
      
      setProgressMsg('Saving to device...');
      const fileData = await ffmpeg.readFile(outputFilename);
      if (typeof fileData === 'string') {
        throw new Error('FFmpeg returned text output for audio file content.');
      }
      const stableData = new Uint8Array(fileData.buffer as ArrayBuffer, fileData.byteOffset, fileData.byteLength);
      const blob = new Blob([stableData], { type: 'audio/mpeg' });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
         try {
            const base64data = (reader.result as string).split(',')[1];
            const { Filesystem, Directory } = await import('@capacitor/filesystem');
            
            const savedFile = await Filesystem.writeFile({
              path: `Music/${outputFilename}`,
              data: base64data,
              directory: Directory.Documents,
              recursive: true
            });
            
            const { Capacitor } = await import('@capacitor/core');
            const localUrl = Capacitor.convertFileSrc(savedFile.uri);
            
            useAppStore.getState().addSongs([{
               id: 'local-' + Date.now(),
               title: outputName,
               artist: 'Converted Audio',
               album: 'NeonAmp Converter',
               url: localUrl,
               duration: 0,
               addedAt: Date.now(),
               path: savedFile.uri
            }]);
            
            setDownloadUrl(localUrl);
            setDownloadFilename(outputFilename);
            setIsConverting(false);
            setCompleted(true);
            setProgressMsg('Saved to your library!');
            setVideoFile(null);
            setOutputName('');
         } catch(err) {
            console.error('File save error', err);
            setProgressMsg('Error: Failed to save to device.');
            setIsConverting(false);
         }
      };
    } catch (e) {
      console.error(e);
      setIsConverting(false);
      setProgressMsg('Error: Failed to convert. Ensure it is a valid video/audio file.');
    }
  };

  return (
    <div className="w-full h-full p-0 md:p-6 flex flex-col md:flex-row gap-0 md:gap-6 overflow-hidden relative">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between z-20 px-4 py-3 shrink-0 bg-background/80 backdrop-blur-md border-b border-border/50">
        <h1 className="text-2xl font-bold">Settings</h1>
        <button 
          onClick={() => setIsNavOpen(true)}
          className="p-2 bg-surface/50 rounded-xl border border-border/50 text-foreground hover:bg-surface transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isNavOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsNavOpen(false)}
        />
      )}

      {/* Left Navigation Menu (Drawer on Mobile, Sidebar on Desktop) */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-[280px] bg-background border-r border-border/50 p-6 flex flex-col gap-4 transform transition-transform duration-300 ease-in-out md:relative md:w-64 md:translate-x-0 md:bg-transparent md:border-r-0 md:p-0 shrink-0",
        isNavOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-4 md:mb-2">
          <h1 className="text-3xl font-bold hidden md:block px-2">Settings</h1>
          <h1 className="text-2xl font-bold md:hidden px-2">Menu</h1>
          <button 
            onClick={() => setIsNavOpen(false)}
            className="md:hidden p-2 bg-surface/50 rounded-full hover:bg-surface text-foreground"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex flex-col gap-2 overflow-y-auto no-scrollbar pb-20 md:pb-0">
          <button
            onClick={() => { setActiveTab('appearance'); setIsNavOpen(false); }}
            className={clsx(
              "flex items-center justify-start gap-4 p-3 md:px-4 md:py-3 rounded-2xl font-medium transition-all group",
              activeTab === 'appearance' 
                ? "bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-lg shadow-primary/30" 
                : "hover:bg-surface/80 text-foreground/70 hover:text-foreground"
            )}
          >
            <Palette size={22} className={clsx(activeTab === 'appearance' ? "" : "group-hover:scale-110 transition-transform")} />
            <span>Appearance</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('converter'); setIsNavOpen(false); }}
            className={clsx(
              "flex items-center justify-start gap-4 p-3 md:px-4 md:py-3 rounded-2xl font-medium transition-all group",
              activeTab === 'converter' 
                ? "bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-lg shadow-primary/30" 
                : "hover:bg-surface/80 text-foreground/70 hover:text-foreground"
            )}
          >
            <FileVideo size={22} className={clsx(activeTab === 'converter' ? "" : "group-hover:scale-110 transition-transform")} />
            <span>Audio Converter</span>
          </button>
          
          <div className="h-px bg-border/50 my-2 w-full" />
          
          <button
            onClick={() => { setActiveTab('faq'); setIsNavOpen(false); }}
            className={clsx(
              "flex items-center justify-start gap-4 p-3 md:px-4 md:py-3 rounded-2xl font-medium transition-all group",
              activeTab === 'faq' 
                ? "bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-lg shadow-primary/30" 
                : "hover:bg-surface/80 text-foreground/70 hover:text-foreground"
            )}
          >
            <HelpCircle size={22} className={clsx(activeTab === 'faq' ? "" : "group-hover:scale-110 transition-transform")} />
            <span>FAQs</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('terms'); setIsNavOpen(false); }}
            className={clsx(
              "flex items-center justify-start gap-4 p-3 md:px-4 md:py-3 rounded-2xl font-medium transition-all group",
              activeTab === 'terms' 
                ? "bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-lg shadow-primary/30" 
                : "hover:bg-surface/80 text-foreground/70 hover:text-foreground"
            )}
          >
            <FileText size={22} className={clsx(activeTab === 'terms' ? "" : "group-hover:scale-110 transition-transform")} />
            <span>Terms of Services</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('policy'); setIsNavOpen(false); }}
            className={clsx(
              "flex items-center justify-start gap-4 p-3 md:px-4 md:py-3 rounded-2xl font-medium transition-all group",
              activeTab === 'policy' 
                ? "bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-lg shadow-primary/30" 
                : "hover:bg-surface/80 text-foreground/70 hover:text-foreground"
            )}
          >
            <Shield size={22} className={clsx(activeTab === 'policy' ? "" : "group-hover:scale-110 transition-transform")} />
            <span>Privacy Policy</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('rate'); setIsNavOpen(false); }}
            className={clsx(
              "flex items-center justify-start gap-4 p-3 md:px-4 md:py-3 rounded-2xl font-medium transition-all group",
              activeTab === 'rate' 
                ? "bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-lg shadow-primary/30" 
                : "hover:bg-surface/80 text-foreground/70 hover:text-foreground"
            )}
          >
            <Star size={22} className={clsx(activeTab === 'rate' ? "" : "group-hover:scale-110 transition-transform")} />
            <span>Rate Us</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full h-full overflow-y-auto relative z-10 rounded-none md:rounded-3xl bg-background md:bg-card/40 backdrop-blur-none md:backdrop-blur-3xl border-0 md:border border-border/40 shadow-none md:shadow-2xl">
        <div className="p-4 md:p-8 pb-[100px] md:pb-[140px] min-h-full">
          
          {activeTab === 'appearance' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl font-bold mb-2">Appearance</h2>
                <p className="text-foreground/60">Customize the colors and background of your player.</p>
              </div>

              {/* Solid Colors */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" /> Solid Themes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SOLID_THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setTheme(theme.id as Theme)}
                      className={clsx(
                        "p-3 rounded-xl border flex items-center gap-3 transition-all hover:bg-surface/50 text-left",
                        currentTheme === theme.id ? "border-primary bg-primary/10 shadow-[0_0_15px_-3px_rgba(var(--primary-color),0.4)]" : "border-border/40 bg-surface/30"
                      )}
                    >
                      <div className="flex -space-x-2 shrink-0">
                         <div className={clsx("w-6 h-6 rounded-full border border-background shadow-sm", theme.colors[0])} />
                         <div className={clsx("w-6 h-6 rounded-full border border-background shadow-sm", theme.colors[1])} />
                      </div>
                      <div className="font-medium text-sm flex-1 text-foreground truncate">{theme.name}</div>
                      {currentTheme === theme.id && <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border/50 w-full" />

              {/* Image Themes */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" /> Image Backgrounds
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {IMAGE_THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setTheme(theme.id as Theme)}
                      className={clsx(
                        "group relative aspect-video rounded-xl overflow-hidden border-2 transition-all text-left",
                        currentTheme === theme.id ? "border-primary shadow-[0_0_20px_-3px_rgba(var(--primary-color),0.5)]" : "border-transparent hover:border-foreground/20"
                      )}
                    >
                      <img src={theme.preview} alt={theme.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <div className="font-medium text-white text-sm drop-shadow-md truncate">{theme.name}</div>
                      </div>
                      {currentTheme === theme.id && (
                        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary shadow-lg border border-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'converter' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
              <div>
                <h2 className="text-2xl font-bold mb-2">Video to MP3 Converter</h2>
                <p className="text-foreground/60">Extract high-quality audio directly on your device.</p>
              </div>

              <div className="bg-surface/30 border border-border/50 rounded-2xl p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">Source File</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 min-w-0 bg-background/50 backdrop-blur-sm border border-border rounded-xl px-4 py-3 text-foreground/60 truncate flex items-center shadow-inner">
                      {videoFile ? videoFile.name : 'No file selected'}
                    </div>
                    <input 
                      type="file" 
                      id="source-video-file" 
                      className="hidden" 
                      accept="video/*,audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setVideoFile(file);
                        }
                      }}
                    />
                    <label 
                      htmlFor="source-video-file"
                      className="px-5 py-3 shrink-0 rounded-xl bg-surface border border-border flex items-center justify-center hover:bg-border transition-colors cursor-pointer text-sm font-medium whitespace-nowrap shadow-sm"
                    >
                      Browse Device
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">Output File Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. My Awesome Song"
                      className="w-full bg-background/50 backdrop-blur-sm shadow-inner border border-border rounded-xl px-4 py-3 pr-16 text-foreground focus:border-primary outline-none transition-colors"
                      value={outputName}
                      onChange={e => setOutputName(e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-mono text-foreground/40 font-bold pointer-events-none">.mp3</div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleConvert}
                    disabled={isConverting || !videoFile || !outputName}
                    className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg hover:shadow-primary/25 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                     {isConverting ? (
                       <>
                         <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                         {progressMsg || 'Converting Engine Active...'}
                       </>
                     ) : (
                       'Convert to MP3'
                     )}
                  </button>

                  {completed && downloadUrl && (
                    <div className="mt-4 flex flex-col items-center p-5 bg-primary/10 border border-primary/30 rounded-2xl space-y-4 shadow-inner">
                      <div className="w-full">
                        <h3 className="font-semibold text-foreground mb-2 text-center text-sm md:text-base px-2">Ready: {downloadFilename}</h3>
                        <audio controls src={downloadUrl} className="w-full outline-none" />
                      </div>
                      
                      <p className="text-foreground/70 text-sm text-center px-4 font-medium">
                        Audio successfully converted and saved to your device! You can now play it offline from your Library.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
              <div>
                <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
                <p className="text-foreground/60">Common questions about using the app.</p>
              </div>
              <div className="space-y-4">
                {[
                  { q: 'How do I add music to my library?', a: 'You can add music by navigating to the Settings page and using the Audio Converter to extract MP3s from local video files.' },
                  { q: 'Is there a limit to how many songs I can have?', a: 'There is no hard limit on the number of songs, but it depends on your device storage capacity.' },
                  { q: 'Does the audio converter need an internet connection?', a: 'No, the conversion happens entirely locally on your device via WebAssembly.' },
                  { q: 'How do I create a playlist?', a: 'Go to the Playlists tab and click the "Create new playlist" button.' }
                ].map((faq, i) => (
                  <div key={i} className="bg-surface/30 border border-border/50 rounded-2xl p-5">
                    <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                    <p className="text-foreground/70">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
              <div>
                <h2 className="text-2xl font-bold mb-2">Terms of Service</h2>
                <p className="text-foreground/60">Please read these terms carefully before using our application.</p>
              </div>
              <div className="bg-surface/30 border border-border/50 rounded-2xl p-6 text-foreground/80 space-y-4 text-sm leading-relaxed">
                <h3 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h3>
                <p>By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.</p>
                <h3 className="text-lg font-semibold text-foreground mt-4">2. Use License</h3>
                <p>Permission is granted to temporarily download one copy of the materials (information or software) on this application for personal, non-commercial transitory viewing only.</p>
                <h3 className="text-lg font-semibold text-foreground mt-4">3. Disclaimer</h3>
                <p>The materials on this application are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                <h3 className="text-lg font-semibold text-foreground mt-4">4. Limitations</h3>
                <p>In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this application.</p>
              </div>
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
              <div>
                <h2 className="text-2xl font-bold mb-2">Privacy Policy</h2>
                <p className="text-foreground/60">How we handle your data and respect your privacy.</p>
              </div>
              <div className="bg-surface/30 border border-border/50 rounded-2xl p-6 text-foreground/80 space-y-4 text-sm leading-relaxed">
                <h3 className="text-lg font-semibold text-foreground">Local First Architecture</h3>
                <p>We believe your data belongs to you. This application is designed with a "Local First" architecture. This means all of your library data, playlists, converted files, and settings are stored locally on your device.</p>
                <h3 className="text-lg font-semibold text-foreground mt-4">Data Collection</h3>
                <p>We do not collect, transmit, or store any of your personal music files, listening history, or usage data on external servers. The file conversion process happens entirely within your device's browser using WebAssembly.</p>
                <h3 className="text-lg font-semibold text-foreground mt-4">Third-Party Services</h3>
                <p>The application may fetch external resources (like background images for themes) from third-party services like Unsplash. These services may collect standard web logs such as IP addresses. Please review their respective privacy policies for more information.</p>
              </div>
            </div>
          )}

          {activeTab === 'rate' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
              <div>
                <h2 className="text-2xl font-bold mb-2">Rate Us</h2>
                <p className="text-foreground/60">Enjoying the app? Let us know what you think!</p>
              </div>
              <div className="bg-surface/30 border border-border/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-6">
                <div className="flex gap-2 text-primary">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={40} className="hover:scale-110 transition-transform cursor-pointer fill-current" />
                  ))}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Love the experience?</h3>
                  <p className="text-foreground/70">Your feedback helps us improve and add new features. Leave a review on your respective app store.</p>
                </div>
                <button className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all w-full sm:w-auto">
                  Submit Review
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
