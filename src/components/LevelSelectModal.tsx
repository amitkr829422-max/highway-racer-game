import React from 'react';
import { LevelConfig, PlayerProgress } from '../types/game';
import { LEVELS } from '../game/constants';
import { sound } from '../audio/soundManager';
import { ArrowLeft, Star, Lock, Flag, Sun, CloudRain, Sparkles, Snowflake, Compass } from 'lucide-react';

interface LevelSelectModalProps {
  progress: PlayerProgress;
  onClose: () => void;
  onSelectLevel: (level: LevelConfig) => void;
}

const BIOME_INFO = {
  COASTAL: { name: 'Coastal Sunshine', icon: Sun, color: 'text-amber-400', border: 'border-amber-500/30' },
  DESERT: { name: 'Red Rock Desert', icon: Compass, color: 'text-orange-400', border: 'border-orange-500/30' },
  RAIN_CITY: { name: 'Rainy Storm City', icon: CloudRain, color: 'text-sky-400', border: 'border-sky-500/30' },
  CYBERPUNK: { name: 'Cyberpunk Metropolis', icon: Sparkles, color: 'text-purple-400', border: 'border-purple-500/30' },
  ALPINE_SNOW: { name: 'Alpine Snow Pass', icon: Snowflake, color: 'text-cyan-300', border: 'border-cyan-500/30' },
};

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  progress,
  onClose,
  onSelectLevel,
}) => {
  // Check if a level is unlocked: Level 1 is always unlocked; Level N is unlocked if level N-1 is in completedLevels
  const isLevelUnlocked = (lvlNumber: number) => {
    if (lvlNumber === 1) return true;
    return progress.completedLevels.includes(lvlNumber - 1);
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/95 flex flex-col p-4 text-white overflow-y-auto no-scrollbar">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO MENU
        </button>

        <div className="text-center">
          <h2 className="font-racing text-2xl font-black italic tracking-wide uppercase">
            STAGE SELECTION
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl">
          <Flag className="w-4 h-4 text-emerald-400" />
          <span className="font-mono-numbers text-xs font-bold text-white">
            {progress.completedLevels.length}/20
          </span>
        </div>
      </div>

      {/* Levels Grid grouped by 4-level Biomes */}
      <div className="flex flex-col gap-5 py-4 max-w-md mx-auto w-full">
        {(['COASTAL', 'DESERT', 'RAIN_CITY', 'CYBERPUNK', 'ALPINE_SNOW'] as const).map((biomeKey) => {
          const info = BIOME_INFO[biomeKey];
          const BiomeIcon = info.icon;
          const biomeLevels = LEVELS.filter((l) => l.biome === biomeKey);

          return (
            <div key={biomeKey} className="flex flex-col gap-2">
              {/* Biome Section Header */}
              <div className="flex items-center gap-2 px-1">
                <BiomeIcon className={`w-4 h-4 ${info.color}`} />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {info.name}
                </span>
              </div>

              {/* 4 Levels Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {biomeLevels.map((lvl) => {
                  const unlocked = isLevelUnlocked(lvl.levelNumber);
                  const stars = progress.levelStars[lvl.levelNumber] || 0;
                  const isCompleted = progress.completedLevels.includes(lvl.levelNumber);

                  return (
                    <button
                      key={lvl.levelNumber}
                      disabled={!unlocked}
                      onClick={() => {
                        if (unlocked) {
                          sound.playClick();
                          onSelectLevel(lvl);
                        }
                      }}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all relative overflow-hidden ${
                        unlocked
                          ? isCompleted
                            ? 'bg-slate-900/90 border-slate-700 hover:border-emerald-500/80 active:scale-95 shadow-md'
                            : 'bg-slate-900/90 border-slate-700 hover:border-amber-500/80 active:scale-95 shadow-md'
                          : 'bg-slate-950/60 border-slate-900 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {/* Top Row: Stage # and Stars */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-racing text-lg font-black tracking-wide text-white">
                          STAGE {lvl.levelNumber}
                        </span>

                        {unlocked ? (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= stars
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </div>

                      {/* Name */}
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {lvl.name}
                      </span>

                      {/* Distance */}
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Goal</span>
                        <span className="font-mono-numbers font-bold text-slate-300">
                          {lvl.targetDistance}m
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
