import { 
  BiomeType, 
  CarDefinition, 
  CarUpgrades, 
  Collectible, 
  FloatingText, 
  GameState, 
  LevelConfig, 
  Particle, 
  TrafficCar 
} from '../types/game';
import { 
  CANVAS_HEIGHT, 
  CANVAS_WIDTH, 
  LANE_CENTERS, 
  LANE_WIDTH, 
  LANES_COUNT, 
  ROAD_LEFT, 
  ROAD_RIGHT, 
  ROAD_WIDTH 
} from './constants';
import { sound } from '../audio/soundManager';

export interface GameEngineCallbacks {
  onStateChange: (state: GameState) => void;
  onStatsUpdate: (stats: GameLiveStats) => void;
  onGameOver: (summary: GameOverSummary) => void;
  onLevelComplete: (summary: LevelCompleteSummary) => void;
}

export interface GameLiveStats {
  speedKmh: number;
  distance: number;
  targetDistance: number;
  score: number;
  coins: number;
  nitroPercent: number;
  armorCurrent: number;
  armorMax: number;
  nearMisses: number;
  isNitro: boolean;
  hasShield: boolean;
  hasMagnet: boolean;
}

export interface GameOverSummary {
  distance: number;
  coinsCollected: number;
  nearMisses: number;
  finalScore: number;
  isNewHighScore: boolean;
}

export interface LevelCompleteSummary {
  levelNumber: number;
  distance: number;
  coinsCollected: number;
  nearMisses: number;
  finalScore: number;
  starsEarned: number;
  coinTargetMet: boolean;
  nearMissTargetMet: boolean;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;

  // Game Loop
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private state: GameState = 'MENU';

  // Game Configuration
  private level: LevelConfig | null = null;
  private isEndless: boolean = false;
  private currentBiome: BiomeType = 'COASTAL';

  // Player state
  private playerCar: CarDefinition;
  private playerColor: string;
  private playerUpgrades: CarUpgrades;
  private playerX: number = CANVAS_WIDTH / 2;
  private playerY: number = CANVAS_HEIGHT - 160;
  private speedKmh: number = 0;
  private distanceMeters: number = 0;
  private score: number = 0;
  private coinsSession: number = 0;
  private nearMissesSession: number = 0;
  private armorCurrent: number = 2;
  private armorMax: number = 2;
  private nitroTank: number = 100; // 0 to 100%
  private isNitroActive: boolean = false;
  private shieldTimer: number = 0;
  private magnetTimer: number = 0;

  // Controls Input State
  private inputLeft: boolean = false;
  private inputRight: boolean = false;
  private inputAccelerate: boolean = false;
  private inputBrake: boolean = false;
  private inputNitro: boolean = false;

  // Environment & World
  private roadScrollY: number = 0;
  private traffic: TrafficCar[] = [];
  private collectibles: Collectible[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private cameraShake: { x: number; y: number; trauma: number } = { x: 0, y: 0, trauma: 0 };

  // Spawning Timers
  private trafficSpawnTimer: number = 0;
  private collectibleSpawnTimer: number = 0;
  private weatherSpawnTimer: number = 0;
  private idCounter: number = 1;

  constructor(
    canvas: HTMLCanvasElement,
    car: CarDefinition,
    color: string,
    upgrades: CarUpgrades,
    callbacks: GameEngineCallbacks
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot get 2d context');
    this.ctx = context;
    this.playerCar = car;
    this.playerColor = color;
    this.playerUpgrades = upgrades;
    this.callbacks = callbacks;

    this.recalculateCarStats();
  }

  public setPlayerConfig(car: CarDefinition, color: string, upgrades: CarUpgrades) {
    this.playerCar = car;
    this.playerColor = color;
    this.playerUpgrades = upgrades;
    this.recalculateCarStats();
  }

  private recalculateCarStats() {
    const up = this.playerUpgrades;
    // Upgrade 1-5 modifiers:
    // Engine: +10 km/h per tier
    // Armor: +1 hit point per tier
    this.armorMax = this.playerCar.baseStats.armor + (up.armor - 1);
    this.armorCurrent = this.armorMax;
  }

  private getEffectiveStats() {
    const up = this.playerUpgrades;
    const base = this.playerCar.baseStats;

    return {
      topSpeed: base.topSpeed + (up.engine - 1) * 18,
      acceleration: base.acceleration + (up.engine - 1) * 4,
      handling: base.handling + (up.handling - 1) * 35,
      nitroDuration: base.nitroDuration + (up.nitro - 1) * 0.8,
      magnetRange: base.magnetRange + (up.magnet - 1) * 30,
    };
  }

  /**
   * Start a specific level or endless mode
   */
  public start(level: LevelConfig | null, isEndless: boolean = false) {
    this.level = level;
    this.isEndless = isEndless;
    this.currentBiome = level ? level.biome : 'COASTAL';

    // Reset gameplay vars
    this.playerX = CANVAS_WIDTH / 2;
    this.playerY = CANVAS_HEIGHT - 160;
    this.speedKmh = 40; // start with slight roll
    this.distanceMeters = 0;
    this.score = 0;
    this.coinsSession = 0;
    this.nearMissesSession = 0;
    this.nitroTank = 100;
    this.isNitroActive = false;
    this.shieldTimer = 0;
    this.magnetTimer = 0;
    this.recalculateCarStats();

    this.traffic = [];
    this.collectibles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.trafficSpawnTimer = 0.5;
    this.collectibleSpawnTimer = 1.0;

    this.state = 'PLAYING';
    this.callbacks.onStateChange('PLAYING');

    sound.startEngine();
    sound.startMusic();

    this.lastTime = performance.now();
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public pause() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    this.callbacks.onStateChange('PAUSED');
    sound.stopEngine();
    sound.stopMusic();
  }

  public resume() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    this.callbacks.onStateChange('PLAYING');
    sound.startEngine();
    sound.startMusic();
    this.lastTime = performance.now();
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    sound.stopAll();
  }

  // Input Handlers
  public setSteer(direction: -1 | 0 | 1) {
    this.inputLeft = direction === -1;
    this.inputRight = direction === 1;
  }

  public setAccelerate(active: boolean) {
    this.inputAccelerate = active;
  }

  public setBrake(active: boolean) {
    this.inputBrake = active;
  }

  public setNitro(active: boolean) {
    this.inputNitro = active;
  }

  private loop = (currentTime: number) => {
    if (this.state !== 'PLAYING') return;

    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Clamp dt to avoid huge physics jumps on tab switch
    if (dt > 0.1) dt = 0.1;

    this.update(dt);
    this.renderGame(dt);

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    const stats = this.getEffectiveStats();

    // 1. Acceleration, Braking & Nitro
    this.updateSpeed(dt, stats);

    // 2. Lateral Steering Movement
    this.updateSteering(dt, stats);

    // 3. Distance & Score
    const speedMs = (this.speedKmh * 1000) / 3600;
    const distanceDelta = speedMs * dt;
    this.distanceMeters += distanceDelta;
    this.score += Math.round(distanceDelta * (this.speedKmh / 60));

    // Road scroll
    this.roadScrollY += speedMs * dt * 2.2;

    // 4. Power-up timers
    if (this.shieldTimer > 0) this.shieldTimer -= dt;
    if (this.magnetTimer > 0) this.magnetTimer -= dt;

    // 5. Update Traffic AI
    this.updateTraffic(dt);

    // 6. Update Collectibles & Magnet Attraction
    this.updateCollectibles(dt, stats.magnetRange);

    // 7. Check Collisions & Near Misses
    this.checkCollisions();

    // 8. Particles & Weather
    this.updateParticles(dt);
    this.updateWeatherParticles(dt);

    // 9. Floating text popups
    this.updateFloatingTexts(dt);

    // 10. Camera Shake decay
    if (this.cameraShake.trauma > 0) {
      this.cameraShake.trauma = Math.max(0, this.cameraShake.trauma - dt * 2.5);
      const shakeAmount = this.cameraShake.trauma * this.cameraShake.trauma * 16;
      this.cameraShake.x = (Math.random() * 2 - 1) * shakeAmount;
      this.cameraShake.y = (Math.random() * 2 - 1) * shakeAmount;
    } else {
      this.cameraShake.x = 0;
      this.cameraShake.y = 0;
    }

    // 11. Check Level Target Completion (if not endless)
    if (!this.isEndless && this.level && this.distanceMeters >= this.level.targetDistance) {
      this.handleLevelComplete();
      return;
    }

    // Dynamic Endless Mode Biome transition every 3000m
    if (this.isEndless) {
      const biomes: BiomeType[] = ['COASTAL', 'DESERT', 'RAIN_CITY', 'CYBERPUNK', 'ALPINE_SNOW'];
      const biomeIndex = Math.floor(this.distanceMeters / 3000) % biomes.length;
      this.currentBiome = biomes[biomeIndex];
    }

    // 12. Dispatch Live Stats
    this.callbacks.onStatsUpdate({
      speedKmh: Math.round(this.speedKmh),
      distance: Math.round(this.distanceMeters),
      targetDistance: this.level ? this.level.targetDistance : 0,
      score: this.score,
      coins: this.coinsSession,
      nitroPercent: Math.round(this.nitroTank),
      armorCurrent: this.armorCurrent,
      armorMax: this.armorMax,
      nearMisses: this.nearMissesSession,
      isNitro: this.isNitroActive,
      hasShield: this.shieldTimer > 0,
      hasMagnet: this.magnetTimer > 0,
    });
  }

  private updateSpeed(dt: number, stats: ReturnType<typeof this.getEffectiveStats>) {
    // Nitro handling
    if (this.inputNitro && this.nitroTank > 5 && this.speedKmh > 60) {
      if (!this.isNitroActive) {
        sound.playNitro();
        this.addCameraTrauma(0.35);
      }
      this.isNitroActive = true;
      // Deplete nitro
      this.nitroTank = Math.max(0, this.nitroTank - (100 / stats.nitroDuration) * dt);
    } else {
      this.isNitroActive = false;
      // Slowly recharge nitro
      this.nitroTank = Math.min(100, this.nitroTank + 8 * dt);
    }

    const maxSpeed = stats.topSpeed + (this.isNitroActive ? 45 : 0);
    const accelRate = stats.acceleration * (this.isNitroActive ? 1.8 : 1.0);

    if (this.inputBrake) {
      // Braking
      this.speedKmh = Math.max(30, this.speedKmh - 120 * dt);
      sound.updateEngine(this.speedKmh, false);

      // Emit brake smoke particles occasionally
      if (Math.random() < 0.3) {
        sound.playScreech();
        this.particles.push({
          x: this.playerX + (Math.random() * 20 - 10),
          y: this.playerY + this.playerCar.height / 2,
          vx: Math.random() * 20 - 10,
          vy: 60 + Math.random() * 40,
          size: 4 + Math.random() * 4,
          color: 'rgba(203, 213, 225, 0.7)',
          alpha: 0.8,
          decay: 1.8,
          type: 'smoke',
        });
      }
    } else if (this.inputAccelerate || this.isNitroActive) {
      // Accelerating
      if (this.speedKmh < maxSpeed) {
        this.speedKmh = Math.min(maxSpeed, this.speedKmh + accelRate * dt);
      }
    } else {
      // Natural rolling drag / cruise speed (~120 km/h)
      if (this.speedKmh > 120) {
        this.speedKmh = Math.max(120, this.speedKmh - 30 * dt);
      } else if (this.speedKmh < 100) {
        this.speedKmh = Math.min(100, this.speedKmh + 20 * dt);
      }
    }

    sound.updateEngine(this.speedKmh, this.isNitroActive);

    // Emit nitro flame sparks
    if (this.isNitroActive) {
      for (let i = 0; i < 2; i++) {
        this.particles.push({
          x: this.playerX + (Math.random() * 16 - 8),
          y: this.playerY + this.playerCar.height / 2 + 5,
          vx: Math.random() * 30 - 15,
          vy: 120 + Math.random() * 80,
          size: 3 + Math.random() * 3,
          color: Math.random() > 0.5 ? '#38BDF8' : '#F59E0B',
          alpha: 1.0,
          decay: 2.5,
          type: 'flame',
        });
      }
    }
  }

  private updateSteering(dt: number, stats: ReturnType<typeof this.getEffectiveStats>) {
    // Steer speed depends on car handling
    let moveDir = 0;
    if (this.inputLeft) moveDir -= 1;
    if (this.inputRight) moveDir += 1;

    if (moveDir !== 0) {
      const speedFactor = Math.min(1.2, Math.max(0.6, this.speedKmh / 150));
      this.playerX += moveDir * stats.handling * speedFactor * dt;

      // Keep within road bounds
      const halfW = this.playerCar.width / 2;
      const minX = ROAD_LEFT + halfW + 6;
      const maxX = ROAD_RIGHT - halfW - 6;

      if (this.playerX < minX) {
        this.playerX = minX;
        this.addCameraTrauma(0.1);
      } else if (this.playerX > maxX) {
        this.playerX = maxX;
        this.addCameraTrauma(0.1);
      }
    }
  }

  private updateTraffic(dt: number) {
    const density = this.level ? this.level.trafficDensity : 1.2;
    const speedMin = this.level ? this.level.trafficSpeedMin : 80;
    const speedMax = this.level ? this.level.trafficSpeedMax : 130;

    // Spawn new traffic
    this.trafficSpawnTimer -= dt;
    if (this.trafficSpawnTimer <= 0) {
      this.trafficSpawnTimer = (1.4 / density) + Math.random() * (0.8 / density);
      this.spawnTrafficCar(speedMin, speedMax);
    }

    // Move existing traffic relative to player speed
    const playerSpeedMs = (this.speedKmh * 1000) / 3600;

    for (let i = this.traffic.length - 1; i >= 0; i--) {
      const car = this.traffic[i];
      const carSpeedMs = (car.speed * 1000) / 3600;
      // Relative movement: if player is faster, traffic moves down the screen
      const relativeSpeedY = (playerSpeedMs - carSpeedMs) * 2.2;
      car.y += relativeSpeedY * dt;

      // Traffic AI: Lane change logic
      car.blinkerTimer -= dt;
      if (!car.isChangingLane && car.blinkerTimer <= 0 && Math.random() < 0.15) {
        // Decide to change lane
        const canLeft = car.lane > 0;
        const canRight = car.lane < LANES_COUNT - 1;
        if (canLeft || canRight) {
          const delta = canLeft && canRight ? (Math.random() > 0.5 ? 1 : -1) : (canLeft ? -1 : 1);
          car.targetLane = car.lane + delta;
          car.isChangingLane = true;
          car.blinkerTimer = 1.2; // blinker flashes before / during lane move
        }
      }

      if (car.isChangingLane) {
        const targetX = LANE_CENTERS[car.targetLane];
        const step = 60 * dt;
        if (Math.abs(car.x - targetX) < step) {
          car.x = targetX;
          car.lane = car.targetLane;
          car.isChangingLane = false;
          car.blinkerTimer = 4.0 + Math.random() * 5;
        } else {
          car.x += car.x < targetX ? step : -step;
        }
      }

      // Despawn offscreen traffic
      if (car.y > CANVAS_HEIGHT + 200 || car.y < -300) {
        this.traffic.splice(i, 1);
      }
    }
  }

  private spawnTrafficCar(speedMin: number, speedMax: number) {
    // Pick random lane that doesn't have a car right at top
    const lane = Math.floor(Math.random() * LANES_COUNT);
    const hasNearby = this.traffic.some((c) => c.lane === lane && c.y < 50);
    if (hasNearby) return;

    const types: TrafficCar['type'][] = ['sedan', 'truck', 'sport', 'taxi', 'police'];
    const typeWeights = [0.4, 0.2, 0.2, 0.1, 0.1];
    let rand = Math.random();
    let chosenType: TrafficCar['type'] = 'sedan';
    for (let i = 0; i < types.length; i++) {
      if (rand < typeWeights[i]) {
        chosenType = types[i];
        break;
      }
      rand -= typeWeights[i];
    }

    const colors = ['#3B82F6', '#10B981', '#64748B', '#F59E0B', '#8B5CF6', '#EC4899', '#F97316'];
    const color = chosenType === 'taxi' ? '#FACC15' : colors[Math.floor(Math.random() * colors.length)];

    let width = 42;
    let height = 80;
    if (chosenType === 'truck') {
      width = 46;
      height = 135;
    } else if (chosenType === 'sport') {
      width = 44;
      height = 82;
    }

    const speed = speedMin + Math.random() * (speedMax - speedMin);

    this.traffic.push({
      id: this.idCounter++,
      lane,
      x: LANE_CENTERS[lane],
      y: -150,
      width,
      height,
      speed,
      color,
      type: chosenType,
      targetLane: lane,
      isChangingLane: false,
      blinkerTimer: 2.0 + Math.random() * 4,
      hasNearMissed: false,
    });
  }

  private updateCollectibles(dt: number, magnetRange: number) {
    this.collectibleSpawnTimer -= dt;
    if (this.collectibleSpawnTimer <= 0) {
      this.collectibleSpawnTimer = 1.2 + Math.random() * 1.5;
      this.spawnCollectible();
    }

    const playerSpeedMs = (this.speedKmh * 1000) / 3600;
    const isMagnetActive = this.magnetTimer > 0;
    const effectiveMagnetReach = isMagnetActive ? magnetRange * 1.8 : 0;

    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const item = this.collectibles[i];
      if (item.collected) {
        this.collectibles.splice(i, 1);
        continue;
      }

      // Move down with road
      item.y += playerSpeedMs * 2.2 * dt;

      // Magnet pull towards player
      if (effectiveMagnetReach > 0 && item.type === 'coin') {
        const dx = this.playerX - item.x;
        const dy = this.playerY - item.y;
        const dist = Math.hypot(dx, dy);

        if (dist < effectiveMagnetReach) {
          const pullSpeed = 420 * dt;
          item.x += (dx / dist) * pullSpeed;
          item.y += (dy / dist) * pullSpeed;
        }
      }

      // Check pickup collision with player
      const pW = this.playerCar.width;
      const pH = this.playerCar.height;

      if (
        Math.abs(item.x - this.playerX) < (item.width + pW) / 2 &&
        Math.abs(item.y - this.playerY) < (item.height + pH) / 2
      ) {
        this.collectItem(item);
      }

      // Despawn offscreen
      if (item.y > CANVAS_HEIGHT + 100) {
        this.collectibles.splice(i, 1);
      }
    }
  }

  private spawnCollectible() {
    const lane = Math.floor(Math.random() * LANES_COUNT);
    const rand = Math.random();

    let type: Collectible['type'] = 'coin';
    if (rand < 0.65) {
      type = 'coin';
    } else if (rand < 0.8) {
      type = 'nitro';
    } else if (rand < 0.9) {
      type = 'shield';
    } else {
      type = 'magnet';
    }

    this.collectibles.push({
      id: this.idCounter++,
      type,
      x: LANE_CENTERS[lane],
      y: -60,
      width: 24,
      height: 24,
      lane,
      collected: false,
      rotation: 0,
    });
  }

  private collectItem(item: Collectible) {
    item.collected = true;

    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }

    if (item.type === 'coin') {
      sound.playCoin();
      this.coinsSession += 10;
      this.score += 150;
      this.spawnFloatingText('+10 COINS', item.x, item.y, '#FBBF24');
      // Sparkle burst
      for (let i = 0; i < 6; i++) {
        this.particles.push({
          x: item.x,
          y: item.y,
          vx: (Math.random() * 2 - 1) * 80,
          vy: (Math.random() * 2 - 1) * 80,
          size: 3 + Math.random() * 2,
          color: '#FDE047',
          alpha: 1.0,
          decay: 2.0,
          type: 'spark',
        });
      }
    } else if (item.type === 'nitro') {
      sound.playPowerup();
      this.nitroTank = Math.min(100, this.nitroTank + 40);
      this.spawnFloatingText('NOS REFILL!', item.x, item.y, '#38BDF8');
    } else if (item.type === 'shield') {
      sound.playPowerup();
      this.shieldTimer = 10; // 10s forcefield
      this.armorCurrent = Math.min(this.armorMax, this.armorCurrent + 1);
      this.spawnFloatingText('SHIELD ACTIVE!', item.x, item.y, '#22D3EE');
    } else if (item.type === 'magnet') {
      sound.playPowerup();
      this.magnetTimer = 12; // 12s coin magnet
      this.spawnFloatingText('COIN MAGNET!', item.x, item.y, '#EF4444');
    }
  }

  private checkCollisions() {
    const pW = this.playerCar.width - 8; // inner hitbox for forgiving arcade feel
    const pH = this.playerCar.height - 8;

    for (let i = 0; i < this.traffic.length; i++) {
      const car = this.traffic[i];
      const tW = car.width - 6;
      const tH = car.height - 6;

      const dx = Math.abs(this.playerX - car.x);
      const dy = Math.abs(this.playerY - car.y);

      // 1. Direct Hitbox Collision
      if (dx < (pW + tW) / 2 && dy < (pH + tH) / 2) {
        this.handleCrash(car);
        return;
      }

      // 2. Near Miss Detection
      // If passing very close (dx < 48) with vertical overlap at speed > 110 km/h
      if (
        !car.hasNearMissed &&
        dx < (pW + tW) / 2 + 18 &&
        dy < (pH + tH) / 2 &&
        this.speedKmh > 110
      ) {
        car.hasNearMissed = true;
        this.nearMissesSession++;
        this.score += 300;
        sound.playNearMiss();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(40);
        }
        this.spawnFloatingText('NEAR MISS! +300', this.playerX, this.playerY - 40, '#F59E0B');
      }
    }
  }

  private handleCrash(car: TrafficCar) {
    // If shield powerup is active, absorb collision completely
    if (this.shieldTimer > 0) {
      this.shieldTimer = 0;
      sound.playCrash();
      this.addCameraTrauma(0.6);
      this.spawnFloatingText('SHIELD ABSORBED IMPACT!', this.playerX, this.playerY, '#22D3EE');
      // Push traffic car away
      car.y -= 120;
      return;
    }

    // If car has armor remaining, take damage and survive
    if (this.armorCurrent > 1) {
      this.armorCurrent--;
      sound.playCrash();
      this.addCameraTrauma(0.7);
      this.speedKmh = Math.max(50, this.speedKmh * 0.5); // heavy deceleration
      this.spawnFloatingText(`ARMOR HIT! (${this.armorCurrent}/${this.armorMax})`, this.playerX, this.playerY, '#EF4444');
      // Push enemy car away
      car.y -= 100;

      // Spawn collision sparks
      for (let i = 0; i < 15; i++) {
        this.particles.push({
          x: this.playerX,
          y: this.playerY,
          vx: (Math.random() * 2 - 1) * 140,
          vy: (Math.random() * 2 - 1) * 140,
          size: 4 + Math.random() * 3,
          color: Math.random() > 0.5 ? '#EF4444' : '#F59E0B',
          alpha: 1.0,
          decay: 2.0,
          type: 'spark',
        });
      }
      return;
    }

    // Fatal Crash - Game Over!
    this.armorCurrent = 0;
    this.state = 'GAME_OVER';
    sound.playCrash();
    sound.stopEngine();
    sound.stopMusic();

    this.addCameraTrauma(1.0);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 200]);
    }

    // Explosion debris & fireball particles
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: this.playerX + (Math.random() * 30 - 15),
        y: this.playerY + (Math.random() * 30 - 15),
        vx: (Math.random() * 2 - 1) * 180,
        vy: (Math.random() * 2 - 1) * 180,
        size: 5 + Math.random() * 8,
        color: ['#EF4444', '#F97316', '#FBBF24', '#334155'][Math.floor(Math.random() * 4)],
        alpha: 1.0,
        decay: 1.2,
        type: Math.random() > 0.4 ? 'flame' : 'debris',
      });
    }

    // Delay showing game over modal slightly for explosion impact
    setTimeout(() => {
      this.callbacks.onGameOver({
        distance: Math.round(this.distanceMeters),
        coinsCollected: this.coinsSession,
        nearMisses: this.nearMissesSession,
        finalScore: this.score,
        isNewHighScore: false, // will be verified by App component with storage
      });
    }, 700);
  }

  private handleLevelComplete() {
    this.state = 'LEVEL_COMPLETE';
    sound.playVictory();
    sound.stopEngine();

    const coinTargetMet = !this.level || this.coinsSession >= this.level.coinTarget;
    const nearMissTargetMet = !this.level || this.nearMissesSession >= this.level.nearMissTarget;

    let stars = 1; // 1 star for reaching distance
    if (coinTargetMet) stars++;
    if (nearMissTargetMet) stars++;

    // Big victory score bonus
    this.score += 2000 * (this.level ? this.level.levelNumber : 1);

    setTimeout(() => {
      this.callbacks.onLevelComplete({
        levelNumber: this.level ? this.level.levelNumber : 1,
        distance: Math.round(this.distanceMeters),
        coinsCollected: this.coinsSession,
        nearMisses: this.nearMissesSession,
        finalScore: this.score,
        starsEarned: stars,
        coinTargetMet,
        nearMissTargetMet,
      });
    }, 800);
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateWeatherParticles(dt: number) {
    this.weatherSpawnTimer -= dt;
    if (this.weatherSpawnTimer <= 0) {
      this.weatherSpawnTimer = 0.05;

      if (this.currentBiome === 'RAIN_CITY') {
        for (let i = 0; i < 4; i++) {
          this.particles.push({
            x: Math.random() * CANVAS_WIDTH,
            y: -20,
            vx: -30,
            vy: 650 + Math.random() * 200,
            size: 14 + Math.random() * 8,
            color: 'rgba(148, 163, 184, 0.7)',
            alpha: 0.9,
            decay: 0.8,
            type: 'rain',
          });
        }
      } else if (this.currentBiome === 'ALPINE_SNOW') {
        for (let i = 0; i < 2; i++) {
          this.particles.push({
            x: Math.random() * CANVAS_WIDTH,
            y: -10,
            vx: (Math.random() * 2 - 1) * 30,
            vy: 120 + Math.random() * 80,
            size: 2 + Math.random() * 3,
            color: '#FFFFFF',
            alpha: 0.8,
            decay: 0.4,
            type: 'snow',
          });
        }
      }
    }
  }

  private spawnFloatingText(text: string, x: number, y: number, color: string) {
    this.floatingTexts.push({
      id: this.idCounter++,
      text,
      x,
      y,
      alpha: 1.0,
      color,
      scale: 1.3,
    });
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 45 * dt;
      ft.alpha -= 1.1 * dt;
      ft.scale = Math.max(1.0, ft.scale - dt);

      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private addCameraTrauma(amount: number) {
    this.cameraShake.trauma = Math.min(1.0, this.cameraShake.trauma + amount);
  }

  private renderGame(dt: number) {
    const isSteering = this.inputLeft ? -1 : this.inputRight ? 1 : 0;
    const renderer = (window as unknown as { __gameRenderer: { render: (...args: unknown[]) => void } }).__gameRenderer;

    if (renderer) {
      renderer.render(
        dt,
        this.currentBiome,
        this.roadScrollY,
        this.playerX,
        this.playerY,
        this.playerCar,
        this.playerColor,
        this.playerUpgrades,
        this.speedKmh,
        this.inputBrake,
        this.isNitroActive,
        isSteering,
        this.shieldTimer > 0,
        this.magnetTimer > 0,
        this.traffic,
        this.collectibles,
        this.particles,
        this.floatingTexts,
        this.cameraShake
      );
    }
  }
}
