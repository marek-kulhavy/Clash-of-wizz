import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useMemo, useState } from "react";
import type { Character } from "../types";
import { useBattleEngine } from "../useBattleEngine";
import { Shield, Heart, Swords, ChevronUp, ChevronDown, Volume2, VolumeX } from "lucide-react";
import { enemiesByDifficulty } from "../data/enemies";

interface BattleProps {
  player: Character;
  difficulty: "easy" | "medium" | "hard";
}

function Battle({ player, difficulty }: BattleProps) {
  // State for managing UI and audio
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const ambientAudio = useRef<HTMLAudioElement | null>(null);

  // Memoized player with initial battle state
  const memoPlayer = useMemo(() => ({
    ...player,
    currentHP: player.maxHP,       // Reset HP to max
    shield: 0,                     // Start with no shield
    statusEffects: [],             // No status effects initially
    abilities: player.abilities.map((a) => ({
      ...a,
      currentCooldown: 0,          // Reset ability cooldowns
    })),
  }), [player]);

  // Memoized enemy based on difficulty
  const enemy = useMemo(() => {
    const enemyTemplate = enemiesByDifficulty[difficulty];
    return {
      ...enemyTemplate,
      currentHP: enemyTemplate.maxHP,
      shield: 0,
      statusEffects: [],
      abilities: enemyTemplate.abilities.map((ability) => ({
        ...ability,
        currentCooldown: 0,
      })),
    };
  }, [difficulty]);

  // Battle engine hook that manages game state
  const { state, useAbility } = useBattleEngine(memoPlayer, enemy);
  const logRef = useRef<HTMLDivElement>(null);

  // Helper function to play sound effects
  const playSound = (filename: string) => {
    const audio = new Audio(`/sounds/${filename}`);
    audio.volume = 0.5;
    audio.play();
  };

  // Initialize and manage ambient audio
  useEffect(() => {
    ambientAudio.current = new Audio("/sounds/ambient.mp3");
    ambientAudio.current.loop = true;
    ambientAudio.current.volume = isMuted ? 0 : volume;

    const playAudio = async () => {
      try {
        await ambientAudio.current?.play();
      } catch (err) {
        console.warn("Autoplay was prevented:", err);
        // Fallback for browsers that block autoplay
        document.addEventListener('click', () => {
          ambientAudio.current?.play().catch(e => console.warn("Play failed:", e));
        }, { once: true });
      }
    };

    playAudio();

    return () => {
      if (ambientAudio.current) {
        ambientAudio.current.pause();
        ambientAudio.current = null;
      }
    };
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (ambientAudio.current) {
      ambientAudio.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Play sound effects based on battle events
  useEffect(() => {
    if (!state?.lastEffect) return;

    const { type } = state.lastEffect;
    if (type === "damage") playSound("attack.mp3");
    else if (type === "heal") playSound("heal.mp3");
    else if (type === "shield") playSound("shield.mp3");
  }, [state?.lastEffect]);

  // Play victory/defeat sound when game ends
  useEffect(() => {
    if (!state?.gameOver) return;
    const won = state.player.currentHP > 0;
    playSound(won ? "victory.mp3" : "defeat.mp3");
  }, [state?.gameOver]);

  // Auto-scroll battle log to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [state?.log]);

  // Audio control functions
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  if (!state) return <div>Načítání...</div>;

  /**
   * Renders HP and shield bars for a character
   * @param unit The character to render bars for
   * @returns JSX with health and shield visualization
   */
  const renderBars = (unit: Character) => {
    const hpRatio = unit.currentHP / unit.maxHP;
    const shieldRatio = unit.shield ? Math.min(unit.shield / unit.maxHP, 1) : 0;

    // Dynamic HP bar color based on remaining health
    let hpColor = "bg-green-500";
    if (hpRatio < 0.3) hpColor = "bg-red-500";
    else if (hpRatio < 0.6) hpColor = "bg-yellow-500";

    return (
      <div className="w-3/4 mx-auto space-y-1 mb-1 relative">
        <div className="relative h-4 bg-gray-300 rounded overflow-hidden">
          <div
            className={`${hpColor} h-full transition-all duration-300`}
            style={{ width: `${hpRatio * 100}%` }}
          />
          {shieldRatio > 0 && (
            <div
              className="absolute left-0 top-0 h-full bg-blue-400/60 transition-all duration-300"
              style={{ width: `${shieldRatio * 100}%` }}
            />
          )}
          <div className="absolute inset-0 text-xs text-black font-bold flex items-center justify-center pointer-events-none select-none">
            {unit.currentHP} / {unit.maxHP}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Gets appropriate icon for ability type
   * @param type The ability type
   * @returns JSX with corresponding icon
   */
  const getAbilityIcon = (type: string) => {
    switch (type) {
      case "attack":
        return <Swords className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-1" />;
      case "heal":
        return <Heart className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-1" />;
      case "shield":
      case "buff":
        return <Shield className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-1" />;
      default:
        return null;
    }
  };

  /**
   * Renders animation effects for damage/heal/shield actions
   * @param target "player" or "enemy" to determine positioning
   * @returns JSX with animated effect
   */
  const renderEffect = (target: "player" | "enemy") => {
    if (!state.lastEffect || state.lastEffect.target !== target) return null;

    const { type, value } = state.lastEffect;

    const color =
      type === "damage"
        ? "text-red-500"
        : type === "heal"
        ? "text-green-400"
        : "text-blue-400";

    const icon = type === "damage" ? "🗡️" : type === "heal" ? "🧪" : "🛡️";

    const isPlayer = target === "player";

    const positionStyle = {
      position: "absolute" as const,
      top: "50%",
      [isPlayer ? "left" : "right"]: "100%",
      transform: `translate(${isPlayer ? "8px" : "-8px"}, -50%) scale(1.2)`,
    };

    return (
      <AnimatePresence>
        <motion.div
          key={`${value}-${state.turn}-${target}`}
          initial={{ opacity: 0, x: 0, scale: 1 }}
          animate={{ opacity: 1, x: isPlayer ? 12 : -12, scale: 1.4 }}
          exit={{ opacity: 0, x: isPlayer ? 20 : -20, scale: 1 }}
          transition={{ duration: 0.8 }}
          className={`pointer-events-none px-2 sm:px-3 py-1 rounded-lg bg-black/70 text-lg sm:text-xl font-bold ${color}`}
          style={positionStyle}
        >
          {icon} {type === "damage" ? `-${value} HP` : `+${value}`}
        </motion.div>
      </AnimatePresence>
    );
  };

  // Background images for different difficulty levels
  const backgrounds: Record<"easy" | "medium" | "hard", string> = {
    easy: "/backgrounds/background-easy.png",
    medium: "/backgrounds/background-medium.png",
    hard: "/backgrounds/background-hard.png",
  };

  return (
    <div
      className="min-h-screen overflow-hidden bg-center relative flex flex-col items-center justify-between"
      style={{
        backgroundImage: `url(${backgrounds[difficulty]})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Audio Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-black/70 rounded-full px-3 py-1">
        <button 
          onClick={toggleMute} 
          className="text-[#f3bc77] hover:text-white transition-colors"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-20 accent-[#f3bc77]"
          aria-label="Volume control"
        />
      </div>

      {/* Main Battle Container */}
      <div
        className="relative z-10 w-full max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4 flex flex-col"
        style={{ height: "100vh", overflow: "hidden" }}
      >
        {/* Game Over Banner */}
        {state.gameOver && (
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[120px] sm:-translate-y-[160px] bg-black/90 px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg z-50 text-xl sm:text-2xl font-bold ${
              state.player.currentHP > 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            {state.player.currentHP > 0 ? "Vyhrál jsi!" : "Prohrál jsi!"}
          </div>
        )}

        {/* Character Display Area */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 flex justify-between items-end w-full pb-2 sm:pb-4">
            {/* Player Character */}
            <div className="w-1/3 text-center relative h-full flex flex-col justify-end z-20">
              <div className="bg-black/90 text-[#f3bc77] rounded-xl px-3 sm:px-4 py-1 sm:py-2 mb-2 mx-auto w-[120px] sm:w-[180px] md:w-[220px] lg:w-[250px]">
                <h2 className="font-semibold text-xs sm:text-sm md:text-base mb-1">{state.player.name}</h2>
                {renderBars(state.player)}
              </div>
              <div className="relative flex-1 flex flex-col justify-end">
                <motion.img
                  src={state.player.image}
                  alt={state.player.name}
                  className="h-[120px] sm:h-[180px] md:h-[250px] lg:h-[350px] xl:h-[500px] mx-auto object-contain drop-shadow-[0_0_12px_rgba(243,188,119,0.75)] saturate-150"
                  animate={
                    state.lastAttacker === "player"
                      ? { scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }
                      : {}
                  }
                  transition={{ duration: 0.3 }}
                />
                {renderEffect("player")}
              </div>
            </div>

            <div className="w-1/3" />

            {/* Enemy Character */}
            <div className="w-1/3 text-center relative h-full flex flex-col justify-end z-10">
              <div className="bg-black/90 text-[#f3bc77] rounded-xl px-3 sm:px-4 py-1 sm:py-2 mb-2 mx-auto w-[120px] sm:w-[180px] md:w-[220px] lg:w-[250px]">
                <h2 className="font-semibold text-xs sm:text-sm md:text-base mb-1">{state.enemy.name}</h2>
                {renderBars(state.enemy)}
              </div>
              <div className="relative flex-1 flex flex-col justify-end">
                <motion.img
                  src={state.enemy.image}
                  alt={state.enemy.name}
                  className="h-[120px] sm:h-[180px] md:h-[250px] lg:h-[350px] xl:h-[500px] mx-auto object-contain drop-shadow-[0_0_12px_rgba(255,80,80,0.65)] saturate-150"
                  animate={
                    state.lastAttacker === "enemy"
                      ? { scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }
                      : {}
                  }
                  transition={{ duration: 0.3 }}
                />
                {renderEffect("enemy")}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel - Player Abilities + Battle Log */}
        <div className="w-full mt-auto z-30">
          <div className="flex flex-col lg:flex-row justify-center items-center gap-2 sm:gap-4 w-full">
            {/* Abilities Grid */}
            <div className="flex-1 max-w-full lg:max-w-[520px]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2 md:gap-3 mx-auto">
                {state.player.abilities.map((ability, index) => {
                  const disabled =
                    ability.currentCooldown > 0 || state.turn % 2 !== 0 || state.gameOver;

                  return (
                    <div
                      key={index}
                      className="relative group border border-black rounded-lg p-0.5 sm:p-1 bg-[#a75265]"
                    >
                      <button
                        className={`w-full h-[50px] sm:h-[60px] md:h-[72px] px-1 sm:px-2 py-1 sm:py-2 rounded-md shadow-md text-[10px] xs:text-xs sm:text-sm leading-tight active:scale-95
                          ${
                            disabled
                              ? "bg-[#a75265] text-black cursor-not-allowed"
                              : "hover:bg-[#a75265] text-black cursor-pointer"
                          }`}
                        onClick={() => useAbility(ability)}
                        disabled={disabled}
                      >
                        {getAbilityIcon(ability.type)}
                        <span className="block truncate">{ability.name}</span>
                        {ability.currentCooldown > 0 && (
                          <span className="absolute top-0.5 right-0.5 text-[8px] sm:text-[10px] font-bold text-gray-300">
                            {ability.currentCooldown}
                          </span>
                        )}
                      </button>
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 rounded bg-black/80 p-1 sm:p-2 text-[10px] sm:text-xs opacity-0 group-hover:opacity-100 transition-opacity w-[120px] sm:w-[160px] md:w-[180px] z-10 text-white">
                        {ability.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Battle Log */}
            <div className={`flex-1 max-w-full lg:max-w-[300px] ${isLogOpen ? 'h-[150px] sm:h-[175px]' : 'h-[36px]'} lg:h-[175px] rounded-lg border border-black bg-[#402a23] text-[#f3bc77] font-mono text-[10px] sm:text-xs transition-all duration-300 overflow-hidden`}>
              <button 
                onClick={() => setIsLogOpen(!isLogOpen)}
                className="w-full p-1 sm:p-2 border-b border-[#f3bc77] font-bold text-[#f3bc77] text-center flex items-center justify-center gap-1 lg:hidden text-xs sm:text-sm"
              >
                Battle log
                {isLogOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
              <div className="hidden lg:block p-2 border-b border-[#f3bc77] font-bold text-[#f3bc77] text-center text-sm">
                Battle log
              </div>
              <div
                className={`h-[120px] sm:h-[135px] overflow-y-scroll p-1 sm:p-2 whitespace-pre-line scrollbar-thin scrollbar-thumb-[#f3bc77]/50 scrollbar-track-transparent ${!isLogOpen ? 'hidden lg:block' : ''}`}
                ref={logRef}
              >
                {state.log.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Battle;