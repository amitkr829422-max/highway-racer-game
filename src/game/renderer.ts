import { 
  BiomeType, 
  CarDefinition, 
  CarUpgrades, 
  Collectible, 
  FloatingText, 
  Particle, 
  TrafficCar 
} from '../types/game';
import { 
  CANVAS_HEIGHT, 
  CANVAS_WIDTH, 
  LANES_COUNT, 
  LANE_WIDTH, 
  ROAD_LEFT, 
  ROAD_RIGHT, 
  ROAD_WIDTH 
} from './constants';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private animTimer: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setContext(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(
    dt: number,
    biome: BiomeType,
    roadScrollY: number,
    playerX: number,
    playerY: number,
    playerCar: CarDefinition,
    playerColor: string,
    playerUpgrades: CarUpgrades,
    speedKmh: number,
    isBraking: boolean,
    isNitro: boolean,
    isSteering: number, // -1 left, 1 right, 0 straight
    hasShield: boolean,
    hasMagnet: boolean,
    traffic: TrafficCar[],
    collectibles: Collectible[],
    particles: Particle[],
    floatingTexts: FloatingText[],
    cameraShake: { x: number; y: number }
  ) {
    this.animTimer += dt;
    const ctx = this.ctx;

    ctx.save();
    // Apply camera shake if any
    ctx.translate(cameraShake.x, cameraShake.y);

    // 1. Draw Environment & Road Shoulders
    this.drawEnvironment(biome, roadScrollY);

    // 2. Draw Asphalt Road, Markings, and Rumble strips
    this.drawRoad(biome, roadScrollY);

    // 3. Draw Collectibles
    this.drawCollectibles(collectibles);

    // 4. Draw Traffic Cars
    this.drawTraffic(traffic, biome);

    // 5. Draw Player Car
    this.drawPlayerCar(
      playerX,
      playerY,
      playerCar,
      playerColor,
      speedKmh,
      isBraking,
      isNitro,
      isSteering,
      hasShield,
      hasMagnet
    );

    // 6. Draw Particles (Smoke, sparks, nitro fire, rain, snow)
    this.drawParticles(particles);

    // 7. Draw Atmospheric Weather & Speed Lines
    this.drawWeatherEffects(biome, speedKmh);

    // 8. Draw Floating Popups (+100 Near Miss, Coins)
    this.drawFloatingTexts(floatingTexts);

    ctx.restore();
  }

  private drawEnvironment(biome: BiomeType, scrollY: number) {
    const ctx = this.ctx;

    switch (biome) {
      case 'COASTAL': {
        // Left: Lush green coastline / palm trees; Right: Ocean water
        // Left grass
        ctx.fillStyle = '#15803D';
        ctx.fillRect(0, 0, ROAD_LEFT, CANVAS_HEIGHT);
        // Right ocean
        const oceanGrad = ctx.createLinearGradient(ROAD_RIGHT, 0, CANVAS_WIDTH, 0);
        oceanGrad.addColorStop(0, '#0284C7');
        oceanGrad.addColorStop(1, '#0369A1');
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(ROAD_RIGHT, 0, CANVAS_WIDTH - ROAD_RIGHT, CANVAS_HEIGHT);

        // Animated ocean waves
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let y = -60; y < CANVAS_HEIGHT + 60; y += 40) {
          const waveY = (y + (scrollY * 0.4) % 40 + CANVAS_HEIGHT) % CANVAS_HEIGHT;
          ctx.beginPath();
          ctx.ellipse(ROAD_RIGHT + 25, waveY, 18, 4, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Left palm trees
        for (let y = -80; y < CANVAS_HEIGHT + 80; y += 120) {
          const treeY = (y + (scrollY * 0.8) % 120 + CANVAS_HEIGHT) % CANVAS_HEIGHT;
          ctx.fillStyle = '#78350F';
          ctx.fillRect(18, treeY, 6, 24);
          ctx.fillStyle = '#166534';
          ctx.beginPath();
          ctx.arc(21, treeY - 6, 16, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'DESERT': {
        // Red rock & desert sands
        const sandGrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, 0);
        sandGrad.addColorStop(0, '#9A3412');
        sandGrad.addColorStop(0.5, '#C2410C');
        sandGrad.addColorStop(1, '#9A3412');
        ctx.fillStyle = sandGrad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Cacti and rock formations on roadside
        for (let y = -100; y < CANVAS_HEIGHT + 100; y += 160) {
          const cactusY = (y + (scrollY * 0.7) % 160 + CANVAS_HEIGHT) % CANVAS_HEIGHT;
          // Left Cactus
          ctx.fillStyle = '#15803D';
          ctx.fillRect(18, cactusY, 6, 28);
          ctx.fillRect(12, cactusY + 8, 18, 4);
          ctx.fillRect(12, cactusY + 2, 4, 8);
          ctx.fillRect(26, cactusY + 4, 4, 8);

          // Right desert rock
          ctx.fillStyle = '#7C2D12';
          ctx.beginPath();
          ctx.ellipse(ROAD_RIGHT + 26, (cactusY + 80) % CANVAS_HEIGHT, 16, 10, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'RAIN_CITY': {
        // Dark wet urban concrete & street drains
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // City sidewalk curb lines
        ctx.fillStyle = '#334155';
        ctx.fillRect(ROAD_LEFT - 12, 0, 12, CANVAS_HEIGHT);
        ctx.fillRect(ROAD_RIGHT, 0, 12, CANVAS_HEIGHT);

        // Streetlamps with warm sodium reflection
        for (let y = -150; y < CANVAS_HEIGHT + 150; y += 220) {
          const lampY = (y + (scrollY * 0.9) % 220 + CANVAS_HEIGHT) % CANVAS_HEIGHT;
          // Lamp pole
          ctx.fillStyle = '#64748B';
          ctx.fillRect(10, lampY, 5, 20);
          ctx.fillRect(CANVAS_WIDTH - 15, lampY, 5, 20);
          // Glow
          const lampGlow = ctx.createRadialGradient(12, lampY, 2, 12, lampY, 35);
          lampGlow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
          lampGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
          ctx.fillStyle = lampGlow;
          ctx.beginPath();
          ctx.arc(12, lampY, 35, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'CYBERPUNK': {
        // Futuristic neon grid borders
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Neon side rails
        const neonGlowL = ctx.createLinearGradient(0, 0, ROAD_LEFT, 0);
        neonGlowL.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
        neonGlowL.addColorStop(1, 'rgba(6, 182, 212, 0.8)');
        ctx.fillStyle = neonGlowL;
        ctx.fillRect(ROAD_LEFT - 10, 0, 10, CANVAS_HEIGHT);

        const neonGlowR = ctx.createLinearGradient(ROAD_RIGHT, 0, CANVAS_WIDTH, 0);
        neonGlowR.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
        neonGlowR.addColorStop(1, 'rgba(236, 72, 153, 0.4)');
        ctx.fillStyle = neonGlowR;
        ctx.fillRect(ROAD_RIGHT, 0, 10, CANVAS_HEIGHT);

        // Digital holographic markers
        for (let y = -100; y < CANVAS_HEIGHT + 100; y += 140) {
          const pY = (y + (scrollY * 0.9) % 140 + CANVAS_HEIGHT) % CANVAS_HEIGHT;
          ctx.fillStyle = '#06B6D4';
          ctx.fillRect(15, pY, 15, 2);
          ctx.fillStyle = '#EC4899';
          ctx.fillRect(CANVAS_WIDTH - 30, pY, 15, 2);
        }
        break;
      }
      case 'ALPINE_SNOW': {
        // Deep snowbanks & pine trees
        ctx.fillStyle = '#E2E8F0';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Frozen curbs
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(ROAD_LEFT - 10, 0, 10, CANVAS_HEIGHT);
        ctx.fillRect(ROAD_RIGHT, 0, 10, CANVAS_HEIGHT);

        // Pine trees in snow
        for (let y = -120; y < CANVAS_HEIGHT + 120; y += 160) {
          const treeY = (y + (scrollY * 0.7) % 160 + CANVAS_HEIGHT) % CANVAS_HEIGHT;
          // Left Pine
          ctx.fillStyle = '#064E3B';
          ctx.beginPath();
          ctx.moveTo(20, treeY - 18);
          ctx.lineTo(8, treeY + 12);
          ctx.lineTo(32, treeY + 12);
          ctx.closePath();
          ctx.fill();
          // Right Pine
          ctx.beginPath();
          ctx.moveTo(CANVAS_WIDTH - 20, (treeY + 80) % CANVAS_HEIGHT - 18);
          ctx.lineTo(CANVAS_WIDTH - 32, (treeY + 80) % CANVAS_HEIGHT + 12);
          ctx.lineTo(CANVAS_WIDTH - 8, (treeY + 80) % CANVAS_HEIGHT + 12);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }
    }
  }

  private drawRoad(biome: BiomeType, scrollY: number) {
    const ctx = this.ctx;

    // Asphalt Base
    let roadColor = '#1E293B';
    if (biome === 'RAIN_CITY') roadColor = '#090D16';
    if (biome === 'CYBERPUNK') roadColor = '#0F0E1E';
    if (biome === 'DESERT') roadColor = '#292524';
    if (biome === 'ALPINE_SNOW') roadColor = '#1E293B';

    ctx.fillStyle = roadColor;
    ctx.fillRect(ROAD_LEFT, 0, ROAD_WIDTH, CANVAS_HEIGHT);

    // Rumble Strips / Curbs on road edges (red & white alternating)
    const curbSegmentH = 30;
    const curbOffset = (scrollY % (curbSegmentH * 2) + curbSegmentH * 2) % (curbSegmentH * 2);

    for (let y = -curbSegmentH * 2; y < CANVAS_HEIGHT + curbSegmentH * 2; y += curbSegmentH) {
      const segY = y + curbOffset;
      const isRed = Math.floor(segY / curbSegmentH) % 2 === 0;

      let c1 = isRed ? '#EF4444' : '#F8FAFC';
      if (biome === 'CYBERPUNK') c1 = isRed ? '#F43F5E' : '#06B6D4';
      if (biome === 'DESERT') c1 = isRed ? '#EA580C' : '#FEF08A';

      ctx.fillStyle = c1;
      ctx.fillRect(ROAD_LEFT - 6, segY, 6, curbSegmentH);
      ctx.fillRect(ROAD_RIGHT, segY, 6, curbSegmentH);
    }

    // Outer Solid White Road Lines
    ctx.fillStyle = biome === 'CYBERPUNK' ? '#06B6D4' : '#F8FAFC';
    ctx.fillRect(ROAD_LEFT + 2, 0, 4, CANVAS_HEIGHT);
    ctx.fillRect(ROAD_RIGHT - 6, 0, 4, CANVAS_HEIGHT);

    // Dashed Lane Dividers (3 dividers for 4 lanes)
    const dashLength = 40;
    const dashGap = 35;
    const totalDashH = dashLength + dashGap;
    const dashOffset = (scrollY % totalDashH + totalDashH) % totalDashH;

    let dashColor = '#CBD5E1';
    if (biome === 'CYBERPUNK') dashColor = 'rgba(6, 182, 212, 0.7)';
    if (biome === 'DESERT') dashColor = '#FDE047';
    if (biome === 'RAIN_CITY') dashColor = 'rgba(255, 255, 255, 0.5)';

    ctx.fillStyle = dashColor;
    for (let lane = 1; lane < LANES_COUNT; lane++) {
      const laneX = ROAD_LEFT + lane * LANE_WIDTH - 2;

      for (let y = -totalDashH; y < CANVAS_HEIGHT + totalDashH; y += totalDashH) {
        ctx.fillRect(laneX, y + dashOffset, 4, dashLength);
      }
    }
  }

  private drawCollectibles(collectibles: Collectible[]) {
    const ctx = this.ctx;

    collectibles.forEach((c) => {
      if (c.collected) return;
      ctx.save();
      ctx.translate(c.x, c.y);

      if (c.type === 'coin') {
        // Rotating 3D gold coin
        const scaleX = Math.abs(Math.sin(this.animTimer * 4 + c.id));
        ctx.scale(Math.max(scaleX, 0.2), 1);

        // Coin outer rim
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        // Inner gold face
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        // Star / center shine
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glint
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-2, -8, 4, 3);
      } else if (c.type === 'nitro') {
        // Nitro canister
        ctx.fillStyle = '#0284C7';
        ctx.beginPath();
        ctx.roundRect(-10, -15, 20, 30, 4);
        ctx.fill();

        // Valve cap
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(-5, -19, 10, 4);

        // Label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px Barlow Condensed';
        ctx.textAlign = 'center';
        ctx.fillText('NOS', 0, 3);
      } else if (c.type === 'shield') {
        // Shield bubble
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#22D3EE';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Shield crest
        ctx.fillStyle = '#22D3EE';
        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(8, -4);
        ctx.lineTo(6, 6);
        ctx.lineTo(0, 10);
        ctx.lineTo(-6, 6);
        ctx.lineTo(-8, -4);
        ctx.closePath();
        ctx.fill();
      } else if (c.type === 'magnet') {
        // Horseshoe magnet
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(0, -2, 10, Math.PI, 0, false);
        ctx.stroke();

        // Silver tips
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(-13, -2, 6, 8);
        ctx.fillRect(7, -2, 6, 8);
      }

      ctx.restore();
    });
  }

  private drawTraffic(traffic: TrafficCar[], biome: BiomeType) {
    const ctx = this.ctx;

    traffic.forEach((car) => {
      ctx.save();
      ctx.translate(car.x, car.y);

      const w = car.width;
      const h = car.height;

      // Shadow under vehicle
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 3, -h / 2 + 5, w, h, 6);
      ctx.fill();

      // Car body
      if (car.type === 'truck') {
        // Large cargo container truck
        ctx.fillStyle = car.color;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h - 22, 4); // Container
        ctx.fill();

        // Truck cab
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.roundRect(-w / 2 + 2, h / 2 - 20, w - 4, 18, 3);
        ctx.fill();

        // Windshield
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(-w / 2 + 5, h / 2 - 17, w - 10, 6);
      } else {
        // Sedan, Sport, Taxi, Police
        ctx.fillStyle = car.color;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, 8);
        ctx.fill();

        // Roof / Cabin
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.roundRect(-w / 2 + 4, -h / 2 + 16, w - 8, h - 34, 4);
        ctx.fill();

        // Front Windshield
        ctx.fillStyle = '#64748B';
        ctx.beginPath();
        ctx.roundRect(-w / 2 + 6, h / 2 - 22, w - 12, 8, 2);
        ctx.fill();

        // Rear Window
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.roundRect(-w / 2 + 6, -h / 2 + 14, w - 12, 6, 2);
        ctx.fill();

        // Taxi roof beacon
        if (car.type === 'taxi') {
          ctx.fillStyle = '#F59E0B';
          ctx.fillRect(-6, -4, 12, 8);
          ctx.fillStyle = '#000000';
          ctx.fillRect(-4, -1, 8, 2);
        }

        // Police flashing lightbar
        if (car.type === 'police') {
          const isRed = Math.floor(this.animTimer * 10) % 2 === 0;
          ctx.fillStyle = isRed ? '#EF4444' : '#3B82F6';
          ctx.fillRect(-8, -4, 7, 7);
          ctx.fillStyle = isRed ? '#3B82F6' : '#EF4444';
          ctx.fillRect(1, -4, 7, 7);
        }
      }

      // Wheels
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-w / 2 - 2, -h / 2 + 12, 4, 16);
      ctx.fillRect(w / 2 - 2, -h / 2 + 12, 4, 16);
      ctx.fillRect(-w / 2 - 2, h / 2 - 24, 4, 16);
      ctx.fillRect(w / 2 - 2, h / 2 - 24, 4, 16);

      // Headlights (Facing downward in traffic view)
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(-w / 2 + 4, h / 2 - 3, 6, 3);
      ctx.fillRect(w / 2 - 10, h / 2 - 3, 6, 3);

      // Taillights (Red on back edge)
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(-w / 2 + 4, -h / 2, 6, 3);
      ctx.fillRect(w / 2 - 10, -h / 2, 6, 3);

      // Turn signal indicator if changing lanes
      if (car.isChangingLane) {
        const blink = Math.floor(this.animTimer * 6) % 2 === 0;
        if (blink) {
          ctx.fillStyle = '#F59E0B';
          if (car.targetLane < car.lane) {
            // Left signal
            ctx.fillRect(-w / 2 + 2, -h / 2 - 1, 6, 4);
          } else {
            // Right signal
            ctx.fillRect(w / 2 - 8, -h / 2 - 1, 6, 4);
          }
        }
      }

      ctx.restore();
    });
  }

  private drawPlayerCar(
    x: number,
    y: number,
    car: CarDefinition,
    customColor: string,
    speedKmh: number,
    isBraking: boolean,
    isNitro: boolean,
    isSteering: number,
    hasShield: boolean,
    hasMagnet: boolean
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Subtle steering tilt rotation
    const tiltAngle = (isSteering * 0.08);
    ctx.rotate(tiltAngle);

    const w = car.width;
    const h = car.height;

    // Headlight Beam Projections (Shooting upward)
    const beamGrad = ctx.createLinearGradient(0, -h / 2, 0, -h / 2 - 180);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = beamGrad;
    // Left beam
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 6, -h / 2);
    ctx.lineTo(-w / 2 - 25, -h / 2 - 180);
    ctx.lineTo(-w / 2 + 25, -h / 2 - 180);
    ctx.closePath();
    ctx.fill();
    // Right beam
    ctx.beginPath();
    ctx.moveTo(w / 2 - 6, -h / 2);
    ctx.lineTo(w / 2 - 25, -h / 2 - 180);
    ctx.lineTo(w / 2 + 25, -h / 2 - 180);
    ctx.closePath();
    ctx.fill();

    // Car Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 2, -h / 2 + 6, w, h, 8);
    ctx.fill();

    // Wheels / Tires
    ctx.fillStyle = '#020617';
    ctx.fillRect(-w / 2 - 3, -h / 2 + 14, 5, 18);
    ctx.fillRect(w / 2 - 2, -h / 2 + 14, 5, 18);
    ctx.fillRect(-w / 2 - 3, h / 2 - 26, 5, 18);
    ctx.fillRect(w / 2 - 2, h / 2 - 26, 5, 18);

    // Silver Wheel Rims
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(-w / 2 - 1, -h / 2 + 19, 2, 8);
    ctx.fillRect(w / 2 - 1, -h / 2 + 19, 2, 8);
    ctx.fillRect(-w / 2 - 1, h / 2 - 21, 2, 8);
    ctx.fillRect(w / 2 - 1, h / 2 - 21, 2, 8);

    // Car Body Render by Style
    if (car.style === 'f1') {
      // Open-wheel F1 Body
      ctx.fillStyle = customColor;
      // Front wing
      ctx.fillRect(-w / 2, -h / 2, w, 8);
      // Nose cone
      ctx.beginPath();
      ctx.moveTo(-8, -h / 2 + 8);
      ctx.lineTo(8, -h / 2 + 8);
      ctx.lineTo(12, h / 2 - 12);
      ctx.lineTo(-12, h / 2 - 12);
      ctx.closePath();
      ctx.fill();
      // Sidepods
      ctx.fillRect(-w / 2 + 2, -h / 2 + 35, w - 4, 30);
      // Rear wing
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-w / 2, h / 2 - 8, w, 8);
      // Cockpit & Driver Helmet
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F59E0B'; // Helmet
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Sedan, Muscle, Supercar, Hypercar
      // Main Chassis
      const chassisGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
      chassisGrad.addColorStop(0, customColor);
      chassisGrad.addColorStop(0.5, '#FFFFFF'); // Highlight
      chassisGrad.addColorStop(1, customColor);

      ctx.fillStyle = customColor;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, car.style === 'muscle' ? 4 : 10);
      ctx.fill();

      // Center Hood Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(-w / 4, -h / 2 + 6, w / 2, 22);

      // Cabin Roof
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 4, -h / 2 + 24, w - 8, h - 42, 6);
      ctx.fill();

      // Front Windshield (curved glass)
      const glassGrad = ctx.createLinearGradient(0, -h / 2 + 22, 0, -h / 2 + 35);
      glassGrad.addColorStop(0, '#38BDF8');
      glassGrad.addColorStop(1, '#0284C7');
      ctx.fillStyle = glassGrad;
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 6, -h / 2 + 24, w - 12, 10, 3);
      ctx.fill();

      // Rear Window
      ctx.fillStyle = '#0369A1';
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 6, h / 2 - 24, w - 12, 7, 2);
      ctx.fill();

      // Sunroof / Roof details
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(-6, -2, 12, 14);

      // Rear Spoiler for Supercars / Hypercars
      if (car.style === 'supercar' || car.style === 'hypercar') {
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(-w / 2 + 2, h / 2 - 4, w - 4, 5);
        ctx.fillStyle = car.accentColor;
        ctx.fillRect(-w / 2, h / 2 - 4, 3, 5);
        ctx.fillRect(w / 2 - 3, h / 2 - 4, 3, 5);
      }
    }

    // Front Headlights
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(-w / 2 + 4, -h / 2, 7, 3);
    ctx.fillRect(w / 2 - 11, -h / 2, 7, 3);

    // Rear Taillights
    const brakeGlow = isBraking ? 1.0 : 0.4;
    ctx.fillStyle = `rgba(239, 68, 68, ${brakeGlow})`;
    ctx.fillRect(-w / 2 + 4, h / 2 - 3, 7, 3);
    ctx.fillRect(w / 2 - 11, h / 2 - 3, 7, 3);

    if (isBraking) {
      // Extra brake flare
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath();
      ctx.arc(-w / 2 + 7, h / 2 - 1, 10, 0, Math.PI * 2);
      ctx.arc(w / 2 - 7, h / 2 - 1, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nitro Jet Flames
    if (isNitro) {
      const flameH = 25 + Math.random() * 15;
      const flameGrad = ctx.createLinearGradient(0, h / 2, 0, h / 2 + flameH);
      flameGrad.addColorStop(0, '#FFFFFF');
      flameGrad.addColorStop(0.3, '#38BDF8');
      flameGrad.addColorStop(0.7, '#0284C7');
      flameGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

      ctx.fillStyle = flameGrad;
      // Left exhaust flame
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 6, h / 2);
      ctx.lineTo(-w / 2 + 10, h / 2);
      ctx.lineTo(-w / 2 + 8, h / 2 + flameH);
      ctx.closePath();
      ctx.fill();

      // Right exhaust flame
      ctx.beginPath();
      ctx.moveTo(w / 2 - 10, h / 2);
      ctx.lineTo(w / 2 - 6, h / 2);
      ctx.lineTo(w / 2 - 8, h / 2 + flameH);
      ctx.closePath();
      ctx.fill();
    }

    // Shield Aura
    if (hasShield) {
      const shieldRadius = Math.max(w, h) * 0.7;
      const pulse = Math.sin(this.animTimer * 8) * 3;
      ctx.strokeStyle = '#22D3EE';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(34, 211, 238, 0.15)';
      ctx.fill();
    }

    // Magnet Effect
    if (hasMagnet) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1.5;
      const waveRadius = ((this.animTimer * 120) % 90) + 20;
      ctx.beginPath();
      ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawParticles(particles: Particle[]) {
    const ctx = this.ctx;

    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.type === 'smoke') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'flame' || p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'debris') {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else if (p.type === 'rain') {
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 2, p.y + p.size);
        ctx.stroke();
      } else if (p.type === 'snow') {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  private drawWeatherEffects(biome: BiomeType, speedKmh: number) {
    const ctx = this.ctx;

    // High Speed Wind Streaks (>200 km/h)
    if (speedKmh > 200) {
      const intensity = Math.min((speedKmh - 200) / 100, 1.0);
      ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.35})`;
      ctx.lineWidth = 1.5;

      for (let i = 0; i < 8; i++) {
        const x = ROAD_LEFT + (Math.sin(i * 99 + this.animTimer * 20) * 0.5 + 0.5) * ROAD_WIDTH;
        const y = ((i * 110 + this.animTimer * 800) % CANVAS_HEIGHT);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 40 + intensity * 30);
        ctx.stroke();
      }
    }

    // Rain Storm Screen Droplets
    if (biome === 'RAIN_CITY') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // Darkness vignette
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Distant lightning flash every now and then
      if (Math.sin(this.animTimer * 0.3) > 0.98) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
    }
  }

  private drawFloatingTexts(floatingTexts: FloatingText[]) {
    const ctx = this.ctx;

    floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);

      ctx.font = '900 16px "Barlow Condensed", sans-serif';
      ctx.textAlign = 'center';

      // Text stroke outline for high readability
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, 0, 0);

      // Text fill
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);

      ctx.restore();
    });
  }
}
