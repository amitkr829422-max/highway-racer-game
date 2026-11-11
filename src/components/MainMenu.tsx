import React from 'react';
import { CarDefinition, PlayerProgress } from '../types/game';
import { CARS } from '../game/constants';
import { 
  Play, 
  Infinity as InfinityIcon, 
  Wrench, 
  MapPin, 
  Volume2, 
  VolumeX, 
  Music, 
  Trophy, 
  Coins, 
  Code2, 
  Info,
  Smartphone
} from 'lucide-react';

interface MainMenuProps {
  progress: PlayerProgress;
  onStartCareer: () => void;
  onStartEndless: () => void;
  onOpenGarage: () => void;
  onOpenLevelSelect: () => void;
  onOpenCodeViewer: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  progress,
  onStartCareer,
  onStartEndless,
  onOpenGarage,
  onOpenLevelSelect,
  onOpenCodeViewer,
  onToggleSound,
  onToggleMusic,
}) => {
  const currentCar = CARS.find((c) => c.id === progress.selectedCarId) || CARS[0];
  const customColor = progress.carColors[currentCar.id] || currentCar.baseColor;
  const completedCount = progress.completedLevels.length;

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 bg-gradient-to-b from-slate-950/90 via-slate-900/95 to-slate-950 text-white overflow-y-auto no-scrollbar">
      {/* Top Header: Coins, Highscore, and Audio Toggles */}
      <div className="flex items-center justify-between gap-2 pt-2">
        {/* Progress Counters */}
        <div className="flex items-center gap-2">
          {/* Coins */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-amber-500/30 px-3 py-1.5 rounded-xl shadow">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-mono-numbers text-sm font-bold text-amber-300">
              {progress.coins.toLocaleString()}
            </span>
          </div>

          {/* High Score */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-emerald-500/30 px-3 py-1.5 rounded-xl shadow">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="font-mono-numbers text-sm font-bold text-emerald-300">
              {progress.highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Audio Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-all active:scale-95 ${
              progress.soundEnabled
                ? 'bg-slate-800 text-amber-400 border-slate-700'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
            title="Toggle Sound Effects"
          >
            {progress.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleMusic}
            className={`p-2 rounded-xl border transition-all active:scale-95 ${
              progress.musicEnabled
                ? 'bg-slate-800 text-sky-400 border-slate-700'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
            title="Toggle Music"
          >
            <Music className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Branding & Car Showcase */}
      <div className="flex flex-col items-center my-auto py-4">
        {/* Badge & Title */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[11px] font-bold text-rose-400 uppercase tracking-widest mb-1.5">
            2D Arcade Racing
          </div>
          <h1 className="font-racing text-5xl sm:text-6xl font-black italic tracking-tight uppercase bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow-lg">
            HIGHWAY RACER
          </h1>
          <p className="text-xs text-slate-400 tracking-wide mt-1">
            DODGE TRAFFIC · BOOST NITRO · CONQUER 20 STAGES
          </p>
        </div>

        {/* Car Card Showcase */}
        <div className="w-full max-w-xs bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden flex flex-col items-center">
          {/* Subtle glow circle matching car color */}
          <div
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-25 pointer-events-none"
            style={{ backgroundColor: customColor }}
          />

          {/* Car Graphic Representation */}
          <div className="w-28 h-40 flex items-center justify-center relative my-2">
            {/* Visual car top-down representation */}
            <div
              className="w-16 h-32 rounded-xl shadow-2xl relative flex flex-col items-center justify-between p-2 border border-white/20 transition-all duration-300 transform hover:scale-105"
              style={{ backgroundColor: customColor }}
            >
              {/* Windshield */}
              <div className="w-12 h-6 bg-slate-900 rounded-md border border-sky-400/30 mt-4" />
              {/* Roof */}
              <div className="w-10 h-7 bg-slate-950/70 rounded-md" />
              {/* Rear Window */}
              <div className="w-12 h-4 bg-slate-900 rounded-md border border-slate-700 mb-4" />

              {/* Headlights */}
              <div className="absolute top-1 left-1.5 w-2.5 h-1.5 bg-yellow-200 rounded-sm" />
              <div className="absolute top-1 right-1.5 w-2.5 h-1.5 bg-yellow-200 rounded-sm" />
              {/* Taillights */}
              <div className="absolute bottom-1 left-1.5 w-2.5 h-1.5 bg-rose-500 rounded-sm" />
              <div className="absolute bottom-1 right-1.5 w-2.5 h-1.5 bg-rose-500 rounded-sm" />
            </div>
          </div>

          <div className="text-center mt-2">
            <h3 className="font-racing text-xl font-bold tracking-wide text-white uppercase">
              {currentCar.name}
            </h3>
            <p className="text-[11px] text-slate-400 italic">
              {currentCar.tagline}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="w-full grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-800/80 text-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Max Speed</span>
              <span className="font-mono-numbers text-xs font-bold text-amber-300">
                {currentCar.baseStats.topSpeed} <span className="text-[9px]">KM/H</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Armor</span>
              <span className="font-mono-numbers text-xs font-bold text-emerald-400">
                {currentCar.baseStats.armor} HITS
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Handling</span>
              <span className="font-mono-numbers text-xs font-bold text-sky-400">
                {currentCar.baseStats.handling}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex flex-col gap-2.5 max-w-sm mx-auto w-full pb-2">
        {/* Career Mode (Start Game) */}
        <button
          onClick={onStartCareer}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-racing text-xl font-black italic tracking-wider uppercase shadow-lg shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-6 h-6 fill-slate-950" />
          START CAREER ({completedCount}/20 CLEARED)
        </button>

        {/* Endless Mode */}
        <button
          onClick={onStartEndless}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-racing text-lg font-black italic tracking-wider uppercase shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <InfinityIcon className="w-5 h-5 text-slate-950" />
          ENDLESS HIGHWAY
        </button>

        {/* Garage & Stage Select Row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenGarage}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs tracking-wide active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            GARAGE & TUNING
          </button>

          <button
            onClick={onOpenLevelSelect}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs tracking-wide active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4 text-rose-400" />
            20 LEVELS SELECT
          </button>
        </div>

        {/* Jetpack Compose Kotlin Code Export Button */}
        <button
          onClick={onOpenCodeViewer}
          className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 font-medium text-xs tracking-wide active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Code2 className="w-4 h-4 text-cyan-400" />
          VIEW NATIVE ANDROID KOTLIN (JETPACK COMPOSE) CODE
        </button>
      </div>
    </div>
  );
};
