import { useLocation, useNavigate } from "react-router-dom";
import Battle from "../components/Battle";
import type { Character } from "../types";
import { useEffect } from "react";

/**
 * Wrapper component for the Battle screen that handles route protection
 * and validates required props before rendering the actual Battle component.
 * 
 * This component ensures that:
 * - The player has come from the character selection screen with valid data
 * - Required battle parameters (player character and difficulty) are present
 * - Redirects back to selection if any data is missing
 */
function BattleWrapper() {
  // React Router hooks for navigation and accessing route state
  const location = useLocation();
  const navigate = useNavigate();

  // Extract and type the route state containing player and difficulty
  const state = location.state as { 
    player?: Character; 
    difficulty?: "easy" | "medium" | "hard" 
  } | undefined;

  // Destructure the required battle parameters
  const player = state?.player;
  const difficulty = state?.difficulty;

  /**
   * Effect hook that checks for required battle parameters
   * Redirects to character selection if any data is missing
   */
  useEffect(() => {
    if (!player || !difficulty) {
      navigate("/select"); // Redirect to selection screen
    }
  }, [player, difficulty, navigate]);

  // Don't render anything if data is missing (will redirect)
  if (!player || !difficulty) {
    return null;
  }

  // Render the actual Battle component with validated props
  return <Battle player={player} difficulty={difficulty} />;
}

export default BattleWrapper;