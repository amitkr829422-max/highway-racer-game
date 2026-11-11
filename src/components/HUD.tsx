import React from 'react';
import { GameLiveStats } from '../game/engine';
import { Pause, Zap, Shield, Magnet, Coins, Flame } from 'lucide-react';

interface HUDProps {
  stats: GameLiveStats;
  isEndless: boolean;
  levelNumber?: number;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({ stats, isEndless, levelNumber, onPause }) => {
  const distancePercent = stats.targetDistance > 0 
    ? Math.min(100, (stats.distance / stats.targetDistance) * 100) 
    : 0;

  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none z-20 p-3 flex flex-col gap-2">
      {/* Top Bar: Pause, Level/Endless label, Score & Coins */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onPause}
          className="pointer-events-auto p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-lg border border-slate-700/60 shadow-md backdrop-blur-sm transition-all active:scale-95"
          aria-label="Pause Game"
        >
          <Pause className="w-5 h-5 text-amber-400" />
        </button>

        <div className="flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/60 backdrop-blur-sm shadow-md">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              {isEndless ? 'Endless Mode' : `Stage ${levelNumber ?? 1}`}
            </span>
            <span className="font-mono-numbers text-sm font-bold text-white tracking-wide">
              {stats.distance.toLocaleString()} <span className="text-[10px] text-slate-400">M</span>
            </span>
          </div>

          <div className="w-[1px] h-6 bg-slate-700" />

          {/* Coins */}
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-mono-numbers text-sm font-bold text-amber-300">
              {stats.coins}
            </span>
          </div>

          <div className="w-[1px] h-6 bg-slate-700" />

          {/* Score */}
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Score
            </span>
            <span className="font-mono-numbers text-sm font-bold text-emerald-400">
              {stats.score.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Level Target Progress Bar (Only when playing a numbered level) */}
      {!isEndless && stats.targetDistance > 0 && (
        <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-full h-2 p-[1px] shadow-inner backdrop-blur-sm">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150"
            style={{ width: `${distancePercent}%` }}
          />
        </div>
      )}

      {/* Middle Floating Badges: Shield, Magnet, Near Misses */}
      <div className="flex items-center justify-between mt-1">
        {/* Active Power-up Status */}
        <div className="flex items-center gap-2">
          {stats.hasShield && (
            <div className="flex items-center gap-1 bg-cyan-950/80 border border-cyan-500/60 px-2 py-0.5 rounded text-[11px] font-bold text-cyan-300 animate-pulse">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>SHIELD</span>
            </div>
          )}
          {stats.hasMagnet && (
            <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-500/60 px-2 py-0.5 rounded text-[11px] font-bold text-rose-300 animate-pulse">
              <Magnet className="w-3.5 h-3.5 text-rose-400" />
              <span>MAGNET</span>
            </div>
          )}
        </div>

        {/* Near Miss Combo */}
        {stats.nearMisses > 0 && (
          <div className="bg-amber-950/80 border border-amber-500/60 px-2.5 py-0.5 rounded text-[11px] font-bold text-amber-300 shadow">
            NEAR MISS: <span className="font-mono-numbers text-white">{stats.nearMisses}</span>
          </div>
        )}
      </div>

      {/* Lower Cockpit HUD: Armor Pips & Speedometer Cluster & Nitro Bar */}
      <div className="mt-auto flex items-end justify-between pointer-events-none pt-4">
        {/* Armor Durability Pips */}
        <div className="bg-slate-900/85 border border-slate-800 p-2 rounded-lg backdrop-blur-sm flex flex-col gap-1 shadow-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            Armor
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: stats.armorMax }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-2 rounded-sm transition-colors ${
                  i < stats.armorCurrent
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Speedometer Center Display */}
        <div className="flex flex-col items-center bg-slate-950/90 border border-slate-700 px-4 py-1.5 rounded-xl backdrop-blur-md shadow-2xl">
          <div className="flex items-baseline gap-1">
            <span
              className={`font-racing text-3xl font-black italic tracking-tighter tabular-nums ${
                stats.speedKmh > 230
                  ? 'text-rose-400 animate-pulse'
                  : stats.speedKmh > 160
                  ? 'text-amber-300'
                  : 'text-white'
              }`}
            >
              {stats.speedKmh}
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              KM/H
            </span>
          </div>
          {/* Speed Indicator Arc Bar */}
          <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
            <div
              className={`h-full transition-all duration-75 ${
                stats.speedKmh > 230
                  ? 'bg-rose-500'
                  : stats.speedKmh > 160
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (stats.speedKmh / 320) * 100)}%` }}
            />
          </div>
        </div>

        {/* Nitro Gauge */}
        <div className="bg-slate-900/85 border border-slate-800 p-2 rounded-lg backdrop-blur-sm flex flex-col items-end gap-1 shadow-lg">
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-sky-400" />
            NOS {stats.isNitro && <Flame className="w-3 h-3 text-amber-400 animate-bounce" />}
          </span>
          <div className="w-16 bg-slate-800 h-2 rounded-sm overflow-hidden p-[1px]">
            <div
              className={`h-full rounded-sm transition-all duration-75 ${
                stats.isNitro
                  ? 'bg-gradient-to-r from-sky-400 to-amber-400 animate-pulse'
                  : 'bg-sky-400'
              }`}
              style={{ width: `${stats.nitroPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
