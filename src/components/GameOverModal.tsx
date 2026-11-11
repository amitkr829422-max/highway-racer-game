import React from 'react';
import { GameOverSummary } from '../game/engine';
import { sound } from '../audio/soundManager';
import { RotateCcw, Wrench, Home, Trophy, Coins, Zap, Skull } from 'lucide-react';

interface GameOverModalProps {
  summary: GameOverSummary;
  onRestart: () => void;
  onOpenGarage: () => void;
  onQuitToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  summary,
  onRestart,
  onOpenGarage,
  onQuitToMenu,
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-slate-900 border border-rose-500/40 rounded-2xl p-5 shadow-2xl flex flex-col items-center gap-4 text-white animate-in zoom-in-95 duration-200">
        {/* Header with Skull / Wrecked icon */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center mb-2">
            <Skull className="w-6 h-6 text-rose-400" />
          </div>
          <span className="text-[10px] uppercase font-bold text-rose-400 tracking-widest block">
            Collision Detected
          </span>
          <h2 className="font-racing text-3xl font-black italic tracking-wide uppercase text-white">
            WRECKED!
          </h2>
        </div>

        {/* New Record Banner if applicable */}
        {summary.isNewHighScore && (
          <div className="w-full py-1.5 px-3 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-pulse">
            <Trophy className="w-4 h-4 text-emerald-400" />
            NEW ALL-TIME BEST SCORE!
          </div>
        )}

        {/* Stats Grid */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 grid grid-cols-2 gap-2 text-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Distance</span>
            <span className="font-mono-numbers text-base font-bold text-white">
              {summary.distance.toLocaleString()} <span className="text-xs text-slate-500">M</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Coins Banked</span>
            <span className="font-mono-numbers text-base font-bold text-amber-300 flex items-center justify-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              +{summary.coinsCollected}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Near Misses</span>
            <span className="font-mono-numbers text-base font-bold text-sky-400">
              {summary.nearMisses}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Final Score</span>
            <span className="font-mono-numbers text-base font-bold text-emerald-400">
              {summary.finalScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2">
          {/* Retry Button */}
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-racing text-lg font-black italic uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5 text-slate-950" />
            TRY AGAIN
          </button>

          {/* Garage Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenGarage();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            GARAGE (UPGRADE ARMOR & SPEED)
          </button>

          {/* Main Menu Button */}
          <button
            onClick={() => {
              sound.playClick();
              onQuitToMenu();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-slate-400" />
            BACK TO MENU
          </button>
        </div>
      </div>
    </div>
  );
};
