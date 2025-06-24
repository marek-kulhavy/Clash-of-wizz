import { useState, useEffect } from "react";
import type { Ability, Character } from "./types";

/**
 * Interface defining the structure of battle state
 * Tracks all necessary information about the ongoing battle
 */
interface BattleState {
  player: Character;              
  enemy: Character;                
  turn: number;                   
  log: string[];                  
  lastAttacker: "player" | "enemy" | null; 
  lastEffect?: {                  
    type: "damage" | "heal" | "shield";
    target: "player" | "enemy";
    value: number;
  };
  gameOver: boolean;              
}

/**
 * Custom hook that manages the battle logic and state
 * @param player - Initial player character data
 * @param enemy - Initial enemy character data
 * @returns Object containing battle state and ability usage function
 */
export function useBattleEngine(player: Character, enemy: Character) {
  const [state, setState] = useState<BattleState | null>(null);

  /**
   * Initialize battle state when player or enemy data changes
   * Resets all temporary battle properties (shields, status effects)
   */
  useEffect(() => {
    setState({
      player: { ...player, shield: 0, statusEffects: [] },
      enemy: { ...enemy, shield: 0, statusEffects: [] },
      turn: 0,  // Turn 0 means player goes first
      log: ["Souboj začal!"],  // Initial battle log entry
      lastAttacker: null,
      gameOver: false,
    });
  }, [player, enemy]);

  /**
   * Ends the current turn and progresses battle state
   * @param nextState - The state to transition to
   */
  const endTurn = (nextState: BattleState) => {
    const gameOver =
      nextState.player.currentHP <= 0 || nextState.enemy.currentHP <= 0;

    setState({
      ...nextState,
      turn: nextState.turn + 1,  
      gameOver, 
    });
  };

  /**
   * Applies an ability's effects to the battle
   * @param source - The character using the ability
   * @param target - The character receiving the ability's effects
   * @param ability - The ability being used
   * @param isPlayer - Whether the source is the player
   * @returns Object containing updated characters, effect info, and log entry
   */
  const applyAbility = (
    source: Character,
    target: Character,
    ability: Ability,
    isPlayer: boolean
  ): {
    updatedSource: Character;
    updatedTarget: Character;
    effect?: BattleState["lastEffect"];
    logEntry: string;
  } => {
    // Create copies to avoid direct state mutation
    const sourceCopy = { ...source };
    const targetCopy = { ...target };
    let effect: BattleState["lastEffect"] | undefined;
    let logText = `${source.name} použil ${ability.name}`;

    // Handle different ability types
    if (ability.type === "attack") {
      let damage = ability.power;

      // Apply shield absorption if target has shield
      if (targetCopy.shield && targetCopy.shield > 0) {
        const absorb = Math.min(damage, targetCopy.shield);
        targetCopy.shield -= absorb;
        damage -= absorb;
      }

      // Apply remaining damage
      targetCopy.currentHP = Math.max(targetCopy.currentHP - damage, 0);
      effect = {
        type: "damage",
        target: isPlayer ? "enemy" : "player",
        value: damage,
      };
      logText += ` a způsobil ${damage} poškození.`;
    } 
    else if (ability.type === "heal") {
      // Calculate healing amount without exceeding max HP
      const healed = Math.min(ability.power, sourceCopy.maxHP - sourceCopy.currentHP);
      sourceCopy.currentHP += healed;
      effect = {
        type: "heal",
        target: isPlayer ? "player" : "enemy",
        value: healed,
      };
      logText += ` a vyléčil se o ${healed} HP.`;
    } 
    else if (ability.type === "shield") {
      // Add to existing shield or create new one
      sourceCopy.shield = (sourceCopy.shield || 0) + ability.power;
      effect = {
        type: "shield",
        target: isPlayer ? "player" : "enemy",
        value: ability.power,
      };
      logText += ` a získal štít o síle ${ability.power}.`;
    }

    // Update ability cooldowns
    const updatedAbilities = sourceCopy.abilities.map((a) =>
      a.name === ability.name
        ? { ...a, currentCooldown: a.cooldown }  
        : a.currentCooldown > 0
        ? { ...a, currentCooldown: a.currentCooldown - 1 }  
        : a
    );

    sourceCopy.abilities = updatedAbilities;

    return {
      updatedSource: sourceCopy,
      updatedTarget: targetCopy,
      effect,
      logEntry: logText,
    };
  };

  /**
   * Handles player ability usage
   * @param ability - The ability the player is using
   */
  const useAbility = (ability: Ability) => {
    // Validate can use ability
    if (!state || state.turn % 2 !== 0 || ability.currentCooldown > 0 || state.gameOver)
      return;

    // Apply ability effects
    const { updatedSource, updatedTarget, effect, logEntry } = applyAbility(
      state.player,
      state.enemy,
      ability,
      true
    );

    // Prepare next state
    const nextState: BattleState = {
      ...state,
      player: updatedSource,
      enemy: updatedTarget,
      log: [...state.log, logEntry],  
      lastAttacker: "player",
      lastEffect: effect,
      gameOver: updatedTarget.currentHP <= 0,  
      turn: state.turn, 
    };

    endTurn(nextState);
  };

  /**
   * Handles enemy's turn logic
   */
  const enemyTurn = () => {
    if (!state) return;

    // Validate it's actually enemy's turn
    if (state.turn % 2 !== 1 || state.gameOver) return;

    const enemy = state.enemy;
    const player = state.player;

    // Get available abilities (not on cooldown)
    const available = enemy.abilities.filter((a) => a.currentCooldown === 0);
    if (available.length === 0) return;

    // Randomly select an ability to use
    const ability = available[Math.floor(Math.random() * available.length)];

    // Apply ability effects
    const { updatedSource, updatedTarget, effect, logEntry } = applyAbility(
      enemy,
      player,
      ability,
      false
    );

    // Prepare next state
    const nextState: BattleState = {
      ...state,
      player: updatedTarget,
      enemy: updatedSource,
      log: [...state.log, logEntry],
      lastAttacker: "enemy",
      lastEffect: effect,
      gameOver: updatedTarget.currentHP <= 0, 
      turn: state.turn, 
    };

    endTurn(nextState);
  };

  /**
   * Effect hook that triggers enemy turns automatically
   * Waits 1 second before executing enemy turn for better UX
   */
  useEffect(() => {
    if (!state) return;
    if (state.gameOver) return;

    // Only trigger on enemy turns (odd turn numbers)
    if (state.turn % 2 === 1) {
      const timeout = setTimeout(() => {
        enemyTurn();
      }, 2000);  // 2 second delay for player to see what happened

      return () => clearTimeout(timeout);  
    }
  }, [state?.turn, state?.gameOver]);

  return { state, useAbility };
}