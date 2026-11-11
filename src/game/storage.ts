import { PlayerProgress, CarUpgrades } from '../types/game';
import { CARS } from './constants';

const STORAGE_KEY = 'highway_racer_save_v1';

const DEFAULT_UPGRADES: CarUpgrades = {
  engine: 1,
  handling: 1,
  armor: 1,
  nitro: 1,
  magnet: 1,
};

const getInitialCarUpgrades = (): Record<string, CarUpgrades> => {
  const map: Record<string, CarUpgrades> = {};
  CARS.forEach((car) => {
    map[car.id] = { ...DEFAULT_UPGRADES };
  });
  return map;
};

const DEFAULT_PROGRESS: PlayerProgress = {
  coins: 250, // Starting bonus so player can immediately test an upgrade or get near phantom
  highScore: 0,
  selectedCarId: 'blaze_cruiser',
  carColors: {
    blaze_cruiser: '#E11D48',
    phantom_gt: '#D97706',
    viper_gts: '#0284C7',
    cyber_neon: '#8B5CF6',
    titan_f1: '#10B981',
  },
  unlockedCars: ['blaze_cruiser'],
  carUpgrades: getInitialCarUpgrades(),
  completedLevels: [],
  levelStars: {},
  soundEnabled: true,
  musicEnabled: true,
  tiltControlsEnabled: false,
};

export const loadProgress = (): PlayerProgress => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      carUpgrades: {
        ...getInitialCarUpgrades(),
        ...(parsed.carUpgrades || {}),
      },
      carColors: {
        ...DEFAULT_PROGRESS.carColors,
        ...(parsed.carColors || {}),
      },
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
};

export const saveProgress = (progress: PlayerProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
};
