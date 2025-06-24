import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { characters } from "../data/characters";
import { enemiesByDifficulty } from "../data/enemies";
import type { Character } from "../types";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Character selection screen component that allows players to:
 * - Choose their character from available options
 * - Select game difficulty level
 * - Configure audio settings
 * - Start the battle with selected configuration
 */
export default function CharacterSelectPage() {
  // State for selected character (null when none selected)
  const [selected, setSelected] = useState<Character | null>(null);
  
  // State for game difficulty with default "medium"
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  
  // Audio control states
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  
  // Reference for ambient audio element
  const ambientAudio = useRef<HTMLAudioElement | null>(null);
  
  // Navigation hook for routing
  const navigate = useNavigate();

  /**
   * Effect hook for audio initialization and management:
   * - Creates audio element with ambient music
   * - Handles autoplay restrictions with click fallback
   * - Cleans up on component unmount
   */
  useEffect(() => {
    ambientAudio.current = new Audio("/sounds/ambient.mp3");
    ambientAudio.current.loop = true;
    ambientAudio.current.volume = isMuted ? 0 : volume;

    const playAudio = async () => {
      try {
        await ambientAudio.current?.play();
      } catch (err) {
        console.warn("Autoplay was prevented:", err);
        // Fallback - allow user to start audio with a click
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

  /**
   * Effect hook to update audio volume when:
   * - Volume level changes
   * - Mute state changes
   */
  useEffect(() => {
    if (ambientAudio.current) {
      ambientAudio.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  /**
   * Toggles mute state for the audio
   */
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  /**
   * Handles volume slider changes
   * @param e - Change event from volume input
   */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    // Automatically unmute if volume is increased from 0
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  /**
   * Starts the battle with selected character and difficulty
   * Navigates to battle screen with state parameters
   */
  const startBattle = () => {
    if (!selected) return;
    navigate("/battle", {
      state: {
        player: selected,
        difficulty,
      },
    });
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white flex flex-col items-center p-8"
      style={{
        backgroundImage: "url('/backgrounds/background-2.png')",
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(0,0,0,0.6)",
      }}
    >
      {/* Audio Controls - positioned absolutely in top-right corner */}
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

      {/* Page title */}
      <h2 className="text-4xl font-bold mb-10" style={{ color: "#E6D2A2" }}>
        Příprava na souboj
      </h2>

      {/* Main content container with character and difficulty selection */}
      <div className="flex w-full max-w-6xl gap-12">
        {/* Character selection panel */}
        <div className="flex-1">
          <h3 className="text-2xl font-semibold mb-4 text-center" style={{ color: "#E6D2A2" }}>
            Vyber svou postavu
          </h3>
          <div className="flex flex-col gap-4">
            {characters.map((char) => (
              <button
                key={char.name}
                className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 ${
                  selected?.name === char.name ? "border-green-500" : "border-transparent"
                } bg-gray-700 hover:bg-gray-600 transition`}
                onClick={() => setSelected(char)}
              >
                <img
                  src={char.image}
                  alt={char.name}
                  className="w-16 h-16 object-contain rounded"
                />
                <div>
                  <h4 className="text-xl font-bold">{char.name}</h4>
                  <p>HP: {char.maxHP}</p>
                  <p className="italic text-sm text-yellow-300 mt-1">{char.quote}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty selection panel */}
        <div className="flex-1">
          <h3 className="text-2xl font-semibold mb-4 text-center" style={{ color: "#E6D2A2" }}>
            Vyber obtížnost
          </h3>
          <div className="flex flex-col gap-4">
            {(Object.keys(enemiesByDifficulty) as Array<"easy" | "medium" | "hard">).map((level) => {
              const enemy = enemiesByDifficulty[level];
              return (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`
                    w-full p-4 rounded-xl text-left flex items-center gap-4
                    bg-gray-800/80 hover:bg-gray-700
                    transition
                    relative
                    ${difficulty === level ? "border-2 border-red-600 bg-gray-800" : "border-transparent"}
                  `}
                >
                  <img
                    src={enemy.image}
                    alt={enemy.name}
                    className="w-16 h-16 object-contain rounded"
                  />
                  <div>
                    <h4 className="text-xl font-bold">{level.toUpperCase()}</h4>
                    <p>Soupeř: {enemy.name}</p>
                    <p className="italic text-sm text-yellow-300 mt-1">{enemy.quote}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Start battle button - disabled until character is selected */}
      <button
        disabled={!selected}
        onClick={startBattle}
        className="mt-12 bg-[#f3bc77] text-black text-xl font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-[#ffd46f] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Začít boj
      </button>
    </div>
  );
}