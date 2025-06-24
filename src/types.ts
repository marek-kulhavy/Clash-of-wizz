export interface Ability {
  name: string;
  description: string;
  type: "attack" | "heal" | "shield" | "buff";
  power: number;
  cooldown: number;
  currentCooldown: number;
}

export interface Character {
  id: string;
  name: string;
  maxHP: number;
  currentHP: number;
  shield: number;
  currentShield?: number; 
  image: string;
  quote: string;
  statusEffects: any[]; 
  abilities: Ability[];
}

export type Enemy = {
  id: string;
  name: string;
  maxHP: number;
  currentHP: number;
  shield: number;
  image: string;
  statusEffects: any[];
  abilities: Ability[];
  quote: string;
};
