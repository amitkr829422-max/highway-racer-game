import React, { useState } from 'react';
import { CarDefinition, CarUpgrades, PlayerProgress } from '../types/game';
import { CARS, UPGRADE_PRICES } from '../game/constants';
import { sound } from '../audio/soundManager';
import { 
  ChevronLeft, 
  ChevronRight, 
  Coins, 
  Lock, 
  Check, 
  Zap, 
  Gauge, 
  Shield, 
  Disc, 
  Magnet, 
  Palette,
  ArrowLeft
} from 'lucide-react';

interface GarageModalProps {
  progress: PlayerProgress;
  onClose: () => void;
  onSelectCar: (carId: string) => void;
  onBuyCar: (carId: string, price: number) => void;
  onUpgradeStat: (carId: string, stat: keyof CarUpgrades, price: number) => void;
  onSetCarColor: (carId: string, color: string) => void;
}

const COLOR_PALETTE = [
  { name: 'Crimson Red', hex: '#E11D48' },
  { name: 'Cobalt Blue', hex: '#0284C7' },
  { name: 'Sunset Amber', hex: '#D97706' },
  { name: 'Toxic Emerald', hex: '#10B981' },
  { name: 'Cyber Violet', hex: '#8B5CF6' },
  { name: 'Stealth Black', hex: '#1E293B' },
  { name: 'Solar Orange', hex: '#EA580C' },
];

export const GarageModal: React.FC<GarageModalProps> = ({
  progress,
  onClose,
  onSelectCar,
  onBuyCar,
  onUpgradeStat,
  onSetCarColor,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(() => {
    const idx = CARS.findIndex((c) => c.id === progress.selectedCarId);
    return idx >= 0 ? idx : 0;
  });

  const car = CARS[selectedIdx];
  const isUnlocked = progress.unlockedCars.includes(car.id);
  const isEquipped = progress.selectedCarId === car.id;
  const currentColor = progress.carColors[car.id] || car.baseColor;
  const upgrades = progress.carUpgrades[car.id] || { engine: 1, handling: 1, armor: 1, nitro: 1, magnet: 1 };

  const handlePrev = () => {
    sound.playClick();
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : CARS.length - 1));
  };

  const handleNext = () => {
    sound.playClick();
    setSelectedIdx((prev) => (prev < CARS.length - 1 ? prev + 1 : 0));
  };

  const handleUpgrade = (stat: keyof CarUpgrades) => {
    const currentTier = upgrades[stat];
    if (currentTier >= 5) return;
    const price = UPGRADE_PRICES[stat][currentTier];
    if (progress.coins >= price) {
      sound.playPowerup();
      onUpgradeStat(car.id, stat, price);
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/95 flex flex-col p-4 text-white overflow-y-auto no-scrollbar">
      {/* Header Bar */}
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
            GARAGE & TUNING
          </h2>
        </div>

        {/* Coins indicator */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/30 px-3 py-1.5 rounded-xl shadow">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="font-mono-numbers text-sm font-bold text-amber-300">
            {progress.coins.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Showcase Section */}
      <div className="flex flex-col items-center my-3">
        {/* Car Switcher Navigation */}
        <div className="w-full max-w-sm flex items-center justify-between gap-2 mb-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 active:scale-95 transition-transform"
            aria-label="Previous Car"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              CAR {selectedIdx + 1} OF {CARS.length}
            </span>
            <h3 className="font-racing text-2xl font-black tracking-wide uppercase text-white">
              {car.name}
            </h3>
            <span className="text-[11px] text-slate-400 italic block">{car.tagline}</span>
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 active:scale-95 transition-transform"
            aria-label="Next Car"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Top-down Car Visual Turntable */}
        <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col items-center shadow-2xl">
          {/* Ambient Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: currentColor }}
          />

          {/* Car Graphic */}
          <div className="w-28 h-44 flex items-center justify-center relative my-2">
            <div
              className="w-18 h-36 rounded-xl shadow-2xl relative flex flex-col items-center justify-between p-2.5 border border-white/20 transition-all duration-300"
              style={{ backgroundColor: currentColor }}
            >
              {/* Windshield */}
              <div className="w-13 h-7 bg-slate-900 rounded-md border border-sky-400/40 mt-3" />
              {/* Roof */}
              <div className="w-11 h-9 bg-slate-950/70 rounded-md" />
              {/* Rear Window */}
              <div className="w-13 h-5 bg-slate-900 rounded-md border border-slate-700 mb-3" />

              {/* Headlights */}
              <div className="absolute top-1.5 left-2 w-3 h-2 bg-yellow-200 rounded-sm" />
              <div className="absolute top-1.5 right-2 w-3 h-2 bg-yellow-200 rounded-sm" />
              {/* Taillights */}
              <div className="absolute bottom-1.5 left-2 w-3 h-2 bg-rose-500 rounded-sm" />
              <div className="absolute bottom-1.5 right-2 w-3 h-2 bg-rose-500 rounded-sm" />
            </div>
          </div>

          {/* Equip or Buy Button */}
          <div className="w-full mt-3">
            {!isUnlocked ? (
              <button
                onClick={() => onBuyCar(car.id, car.price)}
                disabled={progress.coins < car.price}
                className={`w-full py-2.5 px-4 rounded-xl font-racing text-lg font-black italic uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${
                  progress.coins >= car.price
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Lock className="w-5 h-5" />
                UNLOCK FOR {car.price.toLocaleString()} COINS
              </button>
            ) : isEquipped ? (
              <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-racing text-lg font-black italic uppercase tracking-wider flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                CURRENTLY EQUIPPED
              </div>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  onSelectCar(car.id);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-racing text-lg font-black italic uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-98 transition-all"
              >
                SELECT THIS CAR
              </button>
            )}
          </div>
        </div>

        {/* Color Customizer (Only available once unlocked) */}
        {isUnlocked && (
          <div className="w-full max-w-sm mt-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              Custom Body Paint
            </span>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {COLOR_PALETTE.map((col) => (
                <button
                  key={col.hex}
                  onClick={() => {
                    sound.playClick();
                    onSetCarColor(car.id, col.hex);
                  }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform active:scale-90 ${
                    currentColor === col.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Upgrades Section */}
        <div className="w-full max-w-sm mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Performance Tuning & Upgrades
            </span>
            <span className="text-[11px] text-slate-400">Tiers 1 - 5</span>
          </div>

          {/* Engine / Speed */}
          <UpgradeRow
            label="Engine (Top Speed)"
            icon={<Gauge className="w-4 h-4 text-amber-400" />}
            tier={upgrades.engine}
            price={UPGRADE_PRICES.engine[upgrades.engine]}
            playerCoins={progress.coins}
            isUnlocked={isUnlocked}
            onUpgrade={() => handleUpgrade('engine')}
          />

          {/* Tires / Handling */}
          <UpgradeRow
            label="Tires (Handling & Grip)"
            icon={<Disc className="w-4 h-4 text-sky-400" />}
            tier={upgrades.handling}
            price={UPGRADE_PRICES.handling[upgrades.handling]}
            playerCoins={progress.coins}
            isUnlocked={isUnlocked}
            onUpgrade={() => handleUpgrade('handling')}
          />

          {/* Armor / Durability */}
          <UpgradeRow
            label="Chassis Armor"
            icon={<Shield className="w-4 h-4 text-emerald-400" />}
            tier={upgrades.armor}
            price={UPGRADE_PRICES.armor[upgrades.armor]}
            playerCoins={progress.coins}
            isUnlocked={isUnlocked}
            onUpgrade={() => handleUpgrade('armor')}
          />

          {/* Nitro Tank */}
          <UpgradeRow
            label="Nitro Booster"
            icon={<Zap className="w-4 h-4 text-yellow-400" />}
            tier={upgrades.nitro}
            price={UPGRADE_PRICES.nitro[upgrades.nitro]}
            playerCoins={progress.coins}
            isUnlocked={isUnlocked}
            onUpgrade={() => handleUpgrade('nitro')}
          />

          {/* Magnet Power */}
          <UpgradeRow
            label="Coin Magnet Reach"
            icon={<Magnet className="w-4 h-4 text-rose-400" />}
            tier={upgrades.magnet}
            price={UPGRADE_PRICES.magnet[upgrades.magnet]}
            playerCoins={progress.coins}
            isUnlocked={isUnlocked}
            onUpgrade={() => handleUpgrade('magnet')}
          />
        </div>
      </div>
    </div>
  );
};

interface UpgradeRowProps {
  label: string;
  icon: React.ReactNode;
  tier: number;
  price?: number;
  playerCoins: number;
  isUnlocked: boolean;
  onUpgrade: () => void;
}

const UpgradeRow: React.FC<UpgradeRowProps> = ({
  label,
  icon,
  tier,
  price,
  playerCoins,
  isUnlocked,
  onUpgrade,
}) => {
  const isMax = tier >= 5;
  const canAfford = price !== undefined && playerCoins >= price;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <span className="text-xs font-semibold text-slate-200 block">{label}</span>
          {/* 5 Pip indicators */}
          <div className="flex items-center gap-1 mt-0.5">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                className={`w-3.5 h-1.5 rounded-sm ${
                  lvl <= tier ? 'bg-amber-400 shadow-sm shadow-amber-400/50' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        {isMax ? (
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/30">
            MAX
          </span>
        ) : (
          <button
            onClick={onUpgrade}
            disabled={!isUnlocked || !canAfford}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1 ${
              isUnlocked && canAfford
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Coins className="w-3 h-3" />
            {price}
          </button>
        )}
      </div>
    </div>
  );
};
