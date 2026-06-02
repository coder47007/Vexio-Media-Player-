import { useAppStore } from '../store.ts';
import { Settings2, Volume2, Waves, Zap, Activity, Headphones } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';

const FREQUENCIES = ['60Hz', '230Hz', '910Hz', '3kHz', '14kHz'];

const PRESETS = [
  { name: 'Flat', bands: [0, 0, 0, 0, 0], bassBoost: 0, icon: Waves },
  { name: 'Heavy Bass', bands: [10, 5, -2, 1, 2], bassBoost: 85, icon: Zap },
  { name: 'Deep Sub', bands: [12, 4, -4, 0, 1], bassBoost: 100, icon: Activity },
  { name: 'Punchy', bands: [5, 6, -1, 3, 4], bassBoost: 60, icon: Zap },
  { name: 'Electronic', bands: [6, 2, 0, 4, 6], bassBoost: 50, icon: Activity },
  { name: 'Acoustic', bands: [2, 1, 0, 3, 4], bassBoost: 10, icon: Headphones },
];

export default function EQ() {
  const eqBands = useAppStore(state => state.eqBands);
  const setEqBand = useAppStore(state => state.setEqBand);
  const bassBoost = useAppStore(state => state.bassBoost);
  const setBassBoost = useAppStore(state => state.setBassBoost);
  const setEqProfile = useAppStore(state => state.setEqProfile);

  return (
    <div className="p-6 max-w-3xl mx-auto h-full flex flex-col pt-10 overflow-y-auto pb-[170px]">
      <div className="flex items-center gap-3 mb-8">
        <Waves className="text-primary" size={32} />
        <h1 className="text-3xl font-bold text-foreground">Audio Engine</h1>
      </div>

      <div className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-xl flex-1 flex flex-col relative z-10">
        
        {/* Presets */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4 text-foreground font-medium">
            <Zap size={20} className="text-primary" />
            Presets
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none snap-x">
             {PRESETS.map((preset) => (
               <button
                 key={preset.name}
                 onClick={() => setEqProfile(preset.bands, preset.bassBoost)}
                 className="snap-start shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-foreground text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
               >
                 <preset.icon size={16} className="text-primary" />
                 {preset.name}
               </button>
             ))}
          </div>
        </div>

        {/* Bass Boost Dial/Slider */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 text-foreground font-medium">
               <Volume2 size={20} className="text-primary" />
               Bass Boost
             </div>
             <span className="font-mono text-primary font-bold">{bassBoost}%</span>
          </div>
          <div className="relative w-full h-8 flex items-center">
            <div className="absolute w-full h-3 bg-surface border border-primary/20 rounded-lg overflow-hidden">
               <div 
                 className="h-full bg-primary" 
                 style={{ width: `${bassBoost}%` }}
               />
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={bassBoost} 
              onChange={(e) => setBassBoost(Number(e.target.value))}
              className="absolute w-full h-full bg-transparent appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* Parametric EQ bars */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-8 text-foreground font-medium">
            <Settings2 size={20} className="text-primary" />
            Parametric EQ
          </div>
          
          <div className="flex justify-between items-end h-[250px] px-2 gap-4">
             {FREQUENCIES.map((freq, index) => (
               <div key={freq} className="flex flex-col items-center gap-4 flex-1 h-full">
                 <div className="text-xs font-mono text-primary font-bold shrink-0">{eqBands[index] > 0 ? `+${eqBands[index]}` : eqBands[index]}</div>
                 
                 <div className="relative flex-1 w-full flex justify-center py-4">
                   {/* Track Background */}
                   <div className="absolute top-0 bottom-0 w-8 bg-surface/40 rounded-full border border-primary/20 overflow-hidden">
                      {/* Zero line */}
                      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-primary/50 z-10" />
                      
                      {/* Fill */}
                      <div 
                        className="absolute left-0 right-0 bg-primary/40 rounded-t-sm rounded-b-sm"
                        style={{
                          top: eqBands[index] > 0 ? `${50 - (eqBands[index] / 15) * 50}%` : '50%',
                          height: `${Math.abs(eqBands[index] / 15) * 50}%`,
                        }}
                      />
                   </div>
                   
                   {/* Custom vertical slider approach using a standard input rotated, or custom div. We use standard input for ease of use */}
                   <input
                     type="range"
                     min="-15"
                     max="15"
                     value={eqBands[index]}
                     onChange={(e) => setEqBand(index, Number(e.target.value))}
                     className="absolute w-[200px] h-8 bg-transparent appearance-none cursor-pointer accent-primary"
                     style={{
                       transform: 'rotate(-90deg) translate(-100px, 0px)',
                       top: 'calc(50% - 16px)'
                     }}
                   />
                 </div>

                 <div className="text-xs font-medium text-foreground/80 shrink-0">{freq}</div>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}
