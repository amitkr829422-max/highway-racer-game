export type GameState = 
  | 'MENU' 
  | 'PLAYING' 
  | 'PAUSED' 
  | 'LEVEL_COMPLETE' 
  | 'GAME_OVER' 
  | 'GARAGE' 
  | 'LEVEL_SELECT'
  | 'CODE_VIEWER';

export type BiomeType = 'COASTAL' | 'DESERT' | 'RAIN_CITY' | 'CYBERPUNK' | 'ALPINE_SNOW';

export interface CarStats {
  topSpeed: number;     // max km/h (e.g. 180 - 320)
  acceleration: number; // rate of acceleration
  handling: number;     // lateral steering speed
  armor: number;        // max hits / shield health
  nitroDuration: number;// nitro tank capacity in seconds
  magnetRange: number;  // radius to pull coins
}

export interface CarDefinition {
  id: string;
  name: string;
  tagline: string;
  price: number;
  baseColor: string;
  accentColor: string;
  style: 'sedan' | 'muscle' | 'supercar' | 'hypercar' | 'f1';
  baseStats: CarStats;
  width: number;
  height: number;
}

export interface CarUpgrades {
  engine: number;   // 1 to 5
  handling: number; // 1 to 5
  armor: number;    // 1 to 5
  nitro: number;    // 1 to 5
  magnet: number;   // 1 to 5
}

export interface PlayerProgress {
  coins: number;
  highScore: number;
  selectedCarId: string;
  carColors: Record<string, string>; // carId -> custom color
  unlockedCars: string[];            // list of carIds
  carUpgrades: Record<string, CarUpgrades>; // carId -> CarUpgrades
  completedLevels: number[];        // list of level numbers completed (1-20)
  levelStars: Record<number, number>; // levelNumber -> stars (1-3)
  soundEnabled: boolean;
  musicEnabled: boolean;
  tiltControlsEnabled: boolean;
}

export interface LevelConfig {
  levelNumber: number;
  name: string;
  biome: BiomeType;
  targetDistance: number; // meters to finish
  trafficDensity: number; // spawn rate factor (1.0 = normal, 2.0 = heavy)
  trafficSpeedMin: number;
  trafficSpeedMax: number;
  coinTarget: number;     // for 2 stars
  nearMissTarget: number; // for 3 stars
  weather: 'sunny' | 'sunset' | 'rain' | 'night' | 'snow';
  description: string;
}

export interface TrafficCar {
  id: number;
  lane: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number; // km/h
  color: string;
  type: 'sedan' | 'truck' | 'sport' | 'taxi' | 'police';
  targetLane: number;
  isChangingLane: boolean;
  blinkerTimer: number;
  hasNearMissed: boolean;
}

export interface Collectible {
  id: number;
  type: 'coin' | 'nitro' | 'shield' | 'magnet';
  x: number;
  y: number;
  width: number;
  height: number;
  lane: number;
  collected: boolean;
  rotation: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type: 'smoke' | 'spark' | 'flame' | 'star' | 'rain' | 'snow' | 'debris';
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  alpha: number;
  color: string;
  scale: number;
}
