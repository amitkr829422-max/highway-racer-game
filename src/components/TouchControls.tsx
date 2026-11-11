import React from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';

interface TouchControlsProps {
  onSteer: (dir: -1 | 0 | 1) => void;
  onAccelerate: (active: boolean) => void;
  onBrake: (active: boolean) => void;
  onNitro: (active: boolean) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onSteer,
  onAccelerate,
  onBrake,
  onNitro,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-4 pointer-events-none z-20 px-4 flex items-end justify-between select-none">
      {/* Left Hand: Steering Buttons */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Steer Left */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onSteer(-1);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onSteer(0);
          }}
          onPointerLeave={() => onSteer(0)}
          className="w-16 h-16 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 shadow-xl flex items-center justify-center text-white active:bg-slate-700 active:scale-95 transition-transform backdrop-blur-sm touch-none"
          aria-label="Steer Left"
        >
          <ChevronLeft className="w-8 h-8 text-slate-200" />
        </button>

        {/* Steer Right */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onSteer(1);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onSteer(0);
          }}
          onPointerLeave={() => onSteer(0)}
          className="w-16 h-16 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 shadow-xl flex items-center justify-center text-white active:bg-slate-700 active:scale-95 transition-transform backdrop-blur-sm touch-none"
          aria-label="Steer Right"
        >
          <ChevronRight className="w-8 h-8 text-slate-200" />
        </button>
      </div>

      {/* Right Hand: Brake, Nitro & Gas Pedal Cluster */}
      <div className="flex items-end gap-3 pointer-events-auto">
        {/* Brake Pedal */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onBrake(true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onBrake(false);
          }}
          onPointerLeave={() => onBrake(false)}
          className="w-14 h-16 rounded-xl bg-gradient-to-b from-rose-950 to-rose-900 border border-rose-600/60 shadow-lg flex flex-col items-center justify-center text-white active:bg-rose-800 active:scale-95 transition-transform backdrop-blur-sm touch-none"
          aria-label="Brake"
        >
          <div className="w-8 h-1 bg-rose-400/40 rounded-full mb-1" />
          <span className="font-racing text-xs font-black tracking-wider text-rose-300">
            BRAKE
          </span>
          <div className="w-8 h-1 bg-rose-400/40 rounded-full mt-1" />
        </button>

        {/* Nitro NOS Button */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onNitro(true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onNitro(false);
          }}
          onPointerLeave={() => onNitro(false)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-400 border-2 border-white/80 shadow-lg shadow-cyan-500/30 flex flex-col items-center justify-center text-white active:scale-95 transition-transform touch-none"
          aria-label="Nitro Boost"
        >
          <Flame className="w-5 h-5 text-amber-200 animate-pulse" />
          <span className="text-[9px] font-black tracking-widest text-white leading-none">
            NOS
          </span>
        </button>

        {/* Gas / Accelerate Pedal */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onAccelerate(true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onAccelerate(false);
          }}
          onPointerLeave={() => onAccelerate(false)}
          className="w-14 h-22 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 border border-slate-600 shadow-2xl flex flex-col items-center justify-center text-white active:bg-slate-600 active:scale-95 transition-transform backdrop-blur-sm touch-none"
          aria-label="Accelerate"
        >
          <div className="flex flex-col gap-1.5 my-auto">
            <div className="w-8 h-1 bg-emerald-400/80 rounded-full" />
            <div className="w-8 h-1 bg-emerald-400/80 rounded-full" />
            <div className="w-8 h-1 bg-emerald-400/80 rounded-full" />
            <div className="w-8 h-1 bg-emerald-400/80 rounded-full" />
          </div>
          <span className="font-racing text-xs font-black tracking-wider text-emerald-300 pb-2">
            GAS
          </span>
        </button>
      </div>
    </div>
  );
};
