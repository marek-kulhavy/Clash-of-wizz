import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

/**
 * HomePage component - The main landing page of the application
 * Features:
 * - Ambient background music with volume controls
 * - Animated title and start button
 * - Navigation to character selection screen
 */
export default function HomePage() {
  // Navigation hook for routing
  const navigate = useNavigate();
  
  // Audio control states
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  
  // Reference for ambient audio element
  const ambientAudio = useRef<HTMLAudioElement | null>(null);

  /**
   * Effect hook for audio initialization and management:
   * - Scrolls to top of page on mount
   * - Creates and manages ambient audio
   * - Handles autoplay restrictions with click fallback
   * - Cleans up on component unmount
   */
  useEffect(() => {
    // Ensure page starts at top
    window.scrollTo(0, 0);
    
    // Initialize audio
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

    // Cleanup function
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

  return (
    <div className="relative min-h-screen bg-[url('/backgrounds/background-1.png')] bg-cover bg-center flex items-center justify-center text-#000 text-center px-4">
      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* Audio Controls with fade-in animation */}
      <motion.div 
        className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-black/70 rounded-full px-3 py-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
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
      </motion.div>

      {/* Main content container */}
      <div className="z-10 flex flex-col items-center">
        {/* Animated title with special font and shadow effects */}
        <motion.h1
          className="text-6xl font-cinzel mb-32 drop-shadow-[0_0_5px_white] shadow-red-800"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{
            textShadow: "2px 2px 0 #0008, 0 0 10px white, 0 0 10px white",
          }}
        >
          Clash of Wizards
        </motion.h1>

        {/* Animated start button with hover/tap effects */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          onClick={() => navigate("/select")}
          className="bg-[#f3bc77] text-black text-xl font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-[#ffd46f] transition"
        >
          Spustit hru
        </motion.button>
      </div>
    </div>
  );
}