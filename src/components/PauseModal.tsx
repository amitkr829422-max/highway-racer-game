import React from 'react';
import { sound } from '../audio/soundManager';
import { Play, RotateCcw, Wrench, Home, Volume2, VolumeX, Music } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenGarage: () => void;
  onQuitToMenu: () => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenGarage,
  onQuitToMenu,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-2xl flex flex-col items-center gap-4 text-white animate-in fade-in zoom-in-95 duration-150">
        <div className="text-center">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-widest block mb-1">
            Break in Action
          </span>
          <h2 className="font-racing text-3xl font-black italic tracking-wide uppercase text-white">
            GAME PAUSED
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          {/* Resume */}
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-racing text-lg font-black italic uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            RESUME RACE
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            RESTART LEVEL
          </button>

          {/* Garage */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenGarage();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Wrench className="w-4 h-4 text-sky-400" />
            GARAGE / TUNING
          </button>

          {/* Main Menu */}
          <button
            onClick={() => {
              sound.playClick();
              onQuitToMenu();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-rose-400" />
            MAIN MENU
          </button>
        </div>

        {/* Audio Toggles in Pause */}
        <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-800 w-full">
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              soundEnabled
                ? 'bg-slate-800 text-amber-400 border-slate-700'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            SFX
          </button>

          <button
            onClick={onToggleMusic}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              musicEnabled
                ? 'bg-slate-800 text-sky-400 border-slate-700'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            <Music className="w-4 h-4" />
            BGM
          </button>
        </div>
      </div>
    </div>
  );
};
