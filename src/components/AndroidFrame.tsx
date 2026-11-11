import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  BatteryMedium, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Music, 
  Code2, 
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { sound } from '../audio/soundManager';

interface AndroidFrameProps {
  children: React.ReactNode;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onOpenCodeViewer: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
  onOpenCodeViewer,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hours = d.getHours();
      const mins = d.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      {/* Top Desktop Utility Bar */}
      <div className="w-full max-w-md flex items-center justify-between gap-2 mb-2 text-xs text-slate-400 px-1">
        <div className="flex items-center gap-1.5 font-bold tracking-wide text-slate-300">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Android 15 · Highway Racer</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Controls Help */}
          <button
            onClick={() => {
              sound.playClick();
              setShowHelp((prev) => !prev);
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 active:scale-95 transition-all"
            title="Controls & Instructions"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>

          {/* Android Kotlin Source Code */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenCodeViewer();
            }}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 active:scale-95 transition-all flex items-center gap-1 font-medium text-[11px]"
            title="View Jetpack Compose Kotlin Code"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compose Code</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg border transition-all active:scale-95 ${
              soundEnabled
                ? 'bg-slate-900 text-amber-400 border-slate-700'
                : 'bg-slate-950 text-slate-600 border-slate-800'
            }`}
            title="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Music Toggle */}
          <button
            onClick={onToggleMusic}
            className={`p-1.5 rounded-lg border transition-all active:scale-95 ${
              musicEnabled
                ? 'bg-slate-900 text-sky-400 border-slate-700'
                : 'bg-slate-950 text-slate-600 border-slate-800'
            }`}
            title="Toggle Synthwave Music"
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Fullscreen / Phone Frame Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setIsFullscreen((prev) => !prev);
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 active:scale-95 transition-all"
            title={isFullscreen ? 'Switch to Phone Mockup' : 'Expand to Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Game Phone Frame or Fullscreen Canvas Wrapper */}
      <div
        className={`relative overflow-hidden transition-all duration-300 flex flex-col ${
          isFullscreen
            ? 'w-full max-w-lg h-[92vh] rounded-2xl border-2 border-slate-800 shadow-2xl'
            : 'w-full max-w-[440px] h-[820px] rounded-[44px] border-[10px] border-slate-800 ring-1 ring-slate-700/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]'
        }`}
      >
        {/* Android Top Status Bar */}
        <div className="absolute top-0 inset-x-0 h-7 z-40 bg-slate-950/40 backdrop-blur-sm flex items-center justify-between px-6 text-[11px] text-white/90 font-medium pointer-events-none">
          <span className="font-mono-numbers">{currentTime}</span>

          {/* Camera Punch Hole Notch */}
          <div className="w-4 h-4 rounded-full bg-slate-950 border border-slate-800/80 shadow-inner flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          </div>

          <div className="flex items-center gap-1.5 text-white/80">
            <span className="text-[10px] font-bold">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Content Container (Game Canvas + Menus + HUD) */}
        <div className="relative flex-1 w-full h-full bg-slate-950 overflow-hidden">
          {children}
        </div>

        {/* Android Bottom Navigation Gesture Bar */}
        <div className="absolute bottom-1 inset-x-0 h-4 z-40 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-1 rounded-full bg-white/40 shadow" />
        </div>
      </div>

      {/* Controls Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 text-white shadow-2xl">
            <h3 className="font-racing text-2xl font-black italic tracking-wide uppercase text-amber-400 mb-3">
              HOW TO PLAY & CONTROLS
            </h3>

            <div className="flex flex-col gap-3 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-white block mb-1">🎮 Touch Controls (Mobile)</span>
                <p>• Left/Right buttons on bottom-left for steering.</p>
                <p>• Red pedal on bottom-right to Brake.</p>
                <p>• Green ribbed pedal to Accelerate.</p>
                <p>• Blue circular NOS button to trigger Nitro Boost!</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-white block mb-1">⌨️ Keyboard Controls (Desktop)</span>
                <p>• <span className="font-mono text-amber-300">A / D</span> or <span className="font-mono text-amber-300">← / →</span>: Steer Left & Right</p>
                <p>• <span className="font-mono text-amber-300">W</span> or <span className="font-mono text-amber-300">↑</span>: Accelerate</p>
                <p>• <span className="font-mono text-amber-300">S</span>, <span className="font-mono text-amber-300">↓</span> or <span className="font-mono text-amber-300">Space</span>: Brake</p>
                <p>• <span className="font-mono text-amber-300">Shift</span>: Nitro Boost</p>
                <p>• <span className="font-mono text-amber-300">P</span> or <span className="font-mono text-amber-300">Esc</span>: Pause Game</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-white block mb-1">⭐ Power-ups & Scoring</span>
                <p>• <span className="text-amber-400 font-bold">Gold Coins</span>: Upgrade cars in the Garage.</p>
                <p>• <span className="text-sky-400 font-bold">Nitro Refills</span>: Replenish your turbo boost.</p>
                <p>• <span className="text-cyan-400 font-bold">Shield</span>: Absorbs crash impact without taking damage.</p>
                <p>• <span className="text-rose-400 font-bold">Magnet</span>: Pulls nearby coins directly to your car.</p>
                <p>• <span className="text-yellow-400 font-bold">Near Miss</span>: Pass traffic closely at high speed for +300 bonus!</p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setShowHelp(false);
              }}
              className="w-full mt-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
            >
              GOT IT, LET'S RACE!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
