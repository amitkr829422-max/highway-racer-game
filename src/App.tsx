import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  CarUpgrades, 
  GameState, 
  LevelConfig, 
  PlayerProgress 
} from './types/game';
import { CARS, LEVELS } from './game/constants';
import { loadProgress, saveProgress } from './game/storage';
import { GameEngine, GameLiveStats, GameOverSummary, LevelCompleteSummary } from './game/engine';
import { GameRenderer } from './game/renderer';
import { sound } from './audio/soundManager';

import { AndroidFrame } from './components/AndroidFrame';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { MainMenu } from './components/MainMenu';
import { GarageModal } from './components/GarageModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { AndroidCodeModal } from './components/AndroidCodeModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Persistence State
  const [progress, setProgress] = useState<PlayerProgress>(loadProgress);

  // Game UI State
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(null);
  const [isEndless, setIsEndless] = useState(false);

  // Live Stats for HUD
  const [liveStats, setLiveStats] = useState<GameLiveStats>({
    speedKmh: 0,
    distance: 0,
    targetDistance: 0,
    score: 0,
    coins: 0,
    nitroPercent: 100,
    armorCurrent: 2,
    armorMax: 2,
    nearMisses: 0,
    isNitro: false,
    hasShield: false,
    hasMagnet: false,
  });

  // Modal Summaries
  const [gameOverSummary, setGameOverSummary] = useState<GameOverSummary | null>(null);
  const [levelCompleteSummary, setLevelCompleteSummary] = useState<LevelCompleteSummary | null>(null);

  // Sync progress changes to localStorage
  const updateProgress = useCallback((updater: (prev: PlayerProgress) => PlayerProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  // Initialize Sound Manager with user saved preferences
  useEffect(() => {
    sound.setSoundEnabled(progress.soundEnabled);
    sound.setMusicEnabled(progress.musicEnabled);
  }, [progress.soundEnabled, progress.musicEnabled]);

  // Initialize GameEngine & Renderer once canvas is mounted
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Attach GameRenderer to window for zero-allocation rendering in loop
    const renderer = new GameRenderer(ctx);
    (window as unknown as { __gameRenderer: GameRenderer }).__gameRenderer = renderer;

    const currentCar = CARS.find((c) => c.id === progress.selectedCarId) || CARS[0];
    const customColor = progress.carColors[currentCar.id] || currentCar.baseColor;
    const upgrades = progress.carUpgrades[currentCar.id] || {
      engine: 1,
      handling: 1,
      armor: 1,
      nitro: 1,
      magnet: 1,
    };

    const engine = new GameEngine(canvas, currentCar, customColor, upgrades, {
      onStateChange: (state) => setGameState(state),
      onStatsUpdate: (stats) => setLiveStats(stats),
      onGameOver: (summary) => {
        setGameState('GAME_OVER');
        let isNewHigh = false;
        updateProgress((prev) => {
          if (summary.finalScore > prev.highScore) {
            isNewHigh = true;
          }
          return {
            ...prev,
            coins: prev.coins + summary.coinsCollected,
            highScore: Math.max(prev.highScore, summary.finalScore),
          };
        });
        setGameOverSummary({
          ...summary,
          isNewHighScore: isNewHigh,
        });
      },
      onLevelComplete: (summary) => {
        setGameState('LEVEL_COMPLETE');
        updateProgress((prev) => {
          const completed = prev.completedLevels.includes(summary.levelNumber)
            ? prev.completedLevels
            : [...prev.completedLevels, summary.levelNumber];

          const existingStars = prev.levelStars[summary.levelNumber] || 0;
          const newStars = Math.max(existingStars, summary.starsEarned);

          return {
            ...prev,
            coins: prev.coins + summary.coinsCollected + 50, // 50 coin victory bonus!
            highScore: Math.max(prev.highScore, summary.finalScore),
            completedLevels: completed,
            levelStars: {
              ...prev.levelStars,
              [summary.levelNumber]: newStars,
            },
          };
        });
        setLevelCompleteSummary(summary);
      },
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
    };
  }, [updateProgress]); // runs on mount

  // Sync car & upgrades to engine when changed in garage
  useEffect(() => {
    if (!engineRef.current) return;
    const currentCar = CARS.find((c) => c.id === progress.selectedCarId) || CARS[0];
    const customColor = progress.carColors[currentCar.id] || currentCar.baseColor;
    const upgrades = progress.carUpgrades[currentCar.id] || {
      engine: 1,
      handling: 1,
      armor: 1,
      nitro: 1,
      magnet: 1,
    };
    engineRef.current.setPlayerConfig(currentCar, customColor, upgrades);
  }, [progress.selectedCarId, progress.carColors, progress.carUpgrades]);

  // Global Keyboard Controls (WASD, Arrow keys, Space, Shift, P/Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engineRef.current.setSteer(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engineRef.current.setSteer(1);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        engineRef.current.setAccelerate(true);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === ' ') {
        engineRef.current.setBrake(true);
      } else if (e.key === 'Shift') {
        engineRef.current.setNitro(true);
      } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'PLAYING') {
          engineRef.current.pause();
        } else if (gameState === 'PAUSED') {
          engineRef.current.resume();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engineRef.current.setSteer(0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engineRef.current.setSteer(0);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        engineRef.current.setAccelerate(false);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === ' ') {
        engineRef.current.setBrake(false);
      } else if (e.key === 'Shift') {
        engineRef.current.setNitro(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Start Career: Starts the first unfinished level or level 1
  const handleStartCareer = () => {
    sound.playClick();
    const nextLvlNum = LEVELS.find((l) => !progress.completedLevels.includes(l.levelNumber))?.levelNumber || 1;
    const levelToPlay = LEVELS.find((l) => l.levelNumber === nextLvlNum) || LEVELS[0];
    setCurrentLevel(levelToPlay);
    setIsEndless(false);
    engineRef.current?.start(levelToPlay, false);
  };

  // Start Endless: Infinite road with dynamic weather
  const handleStartEndless = () => {
    sound.playClick();
    setCurrentLevel(null);
    setIsEndless(true);
    engineRef.current?.start(null, true);
  };

  // Start Specific Level
  const handleSelectLevel = (level: LevelConfig) => {
    sound.playClick();
    setCurrentLevel(level);
    setIsEndless(false);
    engineRef.current?.start(level, false);
  };

  // Restart current level
  const handleRestart = () => {
    sound.playClick();
    engineRef.current?.start(currentLevel, isEndless);
  };

  // Next level in career mode
  const handleNextLevel = () => {
    sound.playClick();
    if (!currentLevel) return;
    const nextLvl = LEVELS.find((l) => l.levelNumber === currentLevel.levelNumber + 1);
    if (nextLvl) {
      setCurrentLevel(nextLvl);
      setIsEndless(false);
      engineRef.current?.start(nextLvl, false);
    } else {
      setGameState('MENU');
    }
  };

  // Garage Handlers
  const handleBuyCar = (carId: string, price: number) => {
    if (progress.coins >= price) {
      updateProgress((prev) => ({
        ...prev,
        coins: prev.coins - price,
        unlockedCars: [...prev.unlockedCars, carId],
        selectedCarId: carId,
      }));
    }
  };

  const handleSelectCar = (carId: string) => {
    updateProgress((prev) => ({
      ...prev,
      selectedCarId: carId,
    }));
  };

  const handleUpgradeStat = (carId: string, stat: keyof CarUpgrades, price: number) => {
    if (progress.coins >= price) {
      updateProgress((prev) => {
        const currentCarUpgrades = prev.carUpgrades[carId] || {
          engine: 1,
          handling: 1,
          armor: 1,
          nitro: 1,
          magnet: 1,
        };
        return {
          ...prev,
          coins: prev.coins - price,
          carUpgrades: {
            ...prev.carUpgrades,
            [carId]: {
              ...currentCarUpgrades,
              [stat]: Math.min(5, currentCarUpgrades[stat] + 1),
            },
          },
        };
      });
    }
  };

  const handleSetCarColor = (carId: string, color: string) => {
    updateProgress((prev) => ({
      ...prev,
      carColors: {
        ...prev.carColors,
        [carId]: color,
      },
    }));
  };

  // Audio Toggles
  const handleToggleSound = () => {
    sound.playClick();
    updateProgress((prev) => {
      const next = !prev.soundEnabled;
      sound.setSoundEnabled(next);
      return { ...prev, soundEnabled: next };
    });
  };

  const handleToggleMusic = () => {
    sound.playClick();
    updateProgress((prev) => {
      const next = !prev.musicEnabled;
      sound.setMusicEnabled(next);
      return { ...prev, musicEnabled: next };
    });
  };

  return (
    <AndroidFrame
      soundEnabled={progress.soundEnabled}
      musicEnabled={progress.musicEnabled}
      onToggleSound={handleToggleSound}
      onToggleMusic={handleToggleMusic}
      onOpenCodeViewer={() => setGameState('CODE_VIEWER')}
    >
      {/* 2D Hardware-Accelerated Canvas */}
      <canvas
        ref={canvasRef}
        width={480}
        height={800}
        className="w-full h-full object-cover block bg-slate-950"
      />

      {/* In-Game Racing HUD Overlay */}
      {gameState === 'PLAYING' && (
        <>
          <HUD
            stats={liveStats}
            isEndless={isEndless}
            levelNumber={currentLevel?.levelNumber}
            onPause={() => engineRef.current?.pause()}
          />
          <TouchControls
            onSteer={(dir) => engineRef.current?.setSteer(dir)}
            onAccelerate={(active) => engineRef.current?.setAccelerate(active)}
            onBrake={(active) => engineRef.current?.setBrake(active)}
            onNitro={(active) => engineRef.current?.setNitro(active)}
          />
        </>
      )}

      {/* Main Menu Screen */}
      {gameState === 'MENU' && (
        <MainMenu
          progress={progress}
          onStartCareer={handleStartCareer}
          onStartEndless={handleStartEndless}
          onOpenGarage={() => setGameState('GARAGE')}
          onOpenLevelSelect={() => setGameState('LEVEL_SELECT')}
          onOpenCodeViewer={() => setGameState('CODE_VIEWER')}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {/* Garage Screen */}
      {gameState === 'GARAGE' && (
        <GarageModal
          progress={progress}
          onClose={() => setGameState('MENU')}
          onSelectCar={handleSelectCar}
          onBuyCar={handleBuyCar}
          onUpgradeStat={handleUpgradeStat}
          onSetCarColor={handleSetCarColor}
        />
      )}

      {/* Level Selection Screen */}
      {gameState === 'LEVEL_SELECT' && (
        <LevelSelectModal
          progress={progress}
          onClose={() => setGameState('MENU')}
          onSelectLevel={handleSelectLevel}
        />
      )}

      {/* Mid-Race Pause Screen */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={() => engineRef.current?.resume()}
          onRestart={handleRestart}
          onOpenGarage={() => setGameState('GARAGE')}
          onQuitToMenu={() => {
            sound.stopAll();
            setGameState('MENU');
          }}
          soundEnabled={progress.soundEnabled}
          musicEnabled={progress.musicEnabled}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {/* Game Over Screen */}
      {gameState === 'GAME_OVER' && gameOverSummary && (
        <GameOverModal
          summary={gameOverSummary}
          onRestart={handleRestart}
          onOpenGarage={() => setGameState('GARAGE')}
          onQuitToMenu={() => setGameState('MENU')}
        />
      )}

      {/* Level Completed Screen */}
      {gameState === 'LEVEL_COMPLETE' && levelCompleteSummary && (
        <LevelCompleteModal
          summary={levelCompleteSummary}
          hasNextLevel={levelCompleteSummary.levelNumber < 20}
          onNextLevel={handleNextLevel}
          onRestart={handleRestart}
          onOpenGarage={() => setGameState('GARAGE')}
          onQuitToMenu={() => setGameState('MENU')}
        />
      )}

      {/* Jetpack Compose Kotlin Code Viewer */}
      {gameState === 'CODE_VIEWER' && (
        <AndroidCodeModal onClose={() => setGameState('MENU')} />
      )}
    </AndroidFrame>
  );
}
