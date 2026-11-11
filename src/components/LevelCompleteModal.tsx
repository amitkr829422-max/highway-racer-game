import React from 'react';
import { LevelCompleteSummary } from '../game/engine';
import { sound } from '../audio/soundManager';
import { Star, Play, RotateCcw, Wrench, Home, Coins, Check, Trophy } from 'lucide-react';

interface LevelCompleteModalProps {
  summary: LevelCompleteSummary;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRestart: () => void;
  onOpenGarage: () => void;
  onQuitToMenu: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  summary,
  hasNextLevel,
  onNextLevel,
  onRestart,
  onOpenGarage,
  onQuitToMenu,
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl flex flex-col items-center gap-4 text-white animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mb-1">
            <Trophy className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest block">
            Objective Accomplished
          </span>
          <h2 className="font-racing text-3xl font-black italic tracking-wide uppercase text-white">
            STAGE {summary.levelNumber} CLEARED!
          </h2>
        </div>

        {/* 3 Stars Award */}
        <div className="flex items-center justify-center gap-2 py-1">
          {[1, 2, 3].map((starIdx) => {
            const hasStar = starIdx <= summary.starsEarned;
            return (
              <div
                key={starIdx}
                className={`p-2 rounded-xl border transition-all ${
                  hasStar
                    ? 'bg-amber-500/20 border-amber-500/60 scale-110 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <Star
                  className={`w-7 h-7 ${
                    hasStar
                      ? 'text-amber-400 fill-amber-400 animate-in zoom-in'
                      : 'text-slate-700'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Objectives Checklist */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              Finish Distance ({summary.distance}m)
            </span>
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <Check
                className={`w-4 h-4 ${
                  summary.coinTargetMet ? 'text-emerald-400' : 'text-slate-600'
                }`}
              />
              Coin Objective ({summary.coinsCollected} collected)
            </span>
            <Star
              className={`w-3.5 h-3.5 ${
                summary.coinTargetMet
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-700'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <Check
                className={`w-4 h-4 ${
                  summary.nearMissTargetMet ? 'text-emerald-400' : 'text-slate-600'
                }`}
              />
              Near Miss Goal ({summary.nearMisses} passes)
            </span>
            <Star
              className={`w-3.5 h-3.5 ${
                summary.nearMissTargetMet
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-700'
              }`}
            />
          </div>
        </div>

        {/* Stats summary */}
        <div className="w-full grid grid-cols-2 gap-2 text-center bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Coins Earned</span>
            <span className="font-mono-numbers text-sm font-bold text-amber-300 flex items-center justify-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              +{summary.coinsCollected + 50}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Score</span>
            <span className="font-mono-numbers text-sm font-bold text-emerald-400">
              {summary.finalScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          {hasNextLevel && (
            <button
              onClick={() => {
                sound.playClick();
                onNextLevel();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-racing text-lg font-black italic uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              CONTINUE TO STAGE {summary.levelNumber + 1}
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            REPLAY STAGE
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenGarage();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Wrench className="w-4 h-4 text-sky-400" />
            GARAGE (UPGRADE CAR)
          </button>

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
