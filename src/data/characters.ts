import type { Character } from "../types";

export const characters: Character[] = [
  {
    id: "valdrin",
    name: "Valdrin Embercloak",
    maxHP: 100,
    currentHP: 100,
    shield: 0,
    image: "/characters/player-3.png",
    statusEffects: [],
    quote: "Má moc nevychází z krve, ale z vůle.",
    abilities: [
      { name: "Flame Lash", 
        description: "Způsobí 20 poškození.", 
        type: "attack", 
        power: 20, 
        cooldown: 0, 
        currentCooldown: 0 
      },
      { name: "Aegis Ward", 
        description: "Vytvoří štít o síle 35.", 
        type: "shield", 
        power: 35, 
        cooldown: 2, 
        currentCooldown: 0 
      },
      { name: "Vital Surge", 
        description: "Vyléčí 25 HP.", 
        type: "heal", 
        power: 25, 
        cooldown: 3, 
        currentCooldown: 0 
      },
      { name: "Ember Vortex", 
        description: "Způsobí 35 poškození.", 
        type: "attack", 
        power: 35, 
        cooldown: 4, 
        currentCooldown: 0 
      },
      { name: "Molten Shell", 
        description: "Vytvoří štít o síle 35.", 
        type: "shield", 
        power: 35, 
        cooldown: 4, 
        currentCooldown: 0 
      },
      { name: "Infernal Blast", 
        description: "Způsobí 45 poškození.", 
        type: "attack", 
        power: 45, 
        cooldown: 5, 
        currentCooldown: 0 
      },
    ],
  },
  {
    id: "elyndra",
    name: "Elyndra Moonshade",
    maxHP: 90,
    currentHP: 90,
    shield: 0,
    image: "/characters/player-2.png",
    statusEffects: [],
    quote: "Věř v osud, protože i hvězdy se klaní vědění.",
    abilities: [
      { name: "Flame Lash", 
        description: "Způsobí 20 poškození.", 
        type: "attack", 
        power: 20, 
        cooldown: 0, 
        currentCooldown: 0 
      },
      { name: "Aegis Ward",
        description: "Vytvoří štít o síle 35.", 
        type: "shield", 
        power: 35, 
        cooldown: 2, 
        currentCooldown: 0 
      },
      { name: "Vital Surge", 
        description: "Vyléčí 25 HP.", 
        type: "heal", 
        power: 25, 
        cooldown: 3, 
        currentCooldown: 0 
      },
      { name: "Whispering Veil", 
        description: "Vyléčí 40 HP.", 
        type: "heal", 
        power: 40, 
        cooldown: 3, 
        currentCooldown: 0 
      },
      { name: "Chrono Rift", 
        description: "Způsobí 30 poškození.", 
        type: "attack", 
        power: 30, 
        cooldown: 4, 
        currentCooldown: 0 
      },
      { name: "Arcane Trap", 
        description: "Způsobí 25 poškození.", 
        type: "attack", 
        power: 25, 
        cooldown: 4, 
        currentCooldown: 0 
      },
    ],
  },
  {
    id: "thornak",
    name: "Thornak Ironsoul",
    maxHP: 110,
    currentHP: 110,
    shield: 0,
    image: "/characters/player-1.png",
    statusEffects: [],
    quote: "Nebojím se bolesti. Jen ztráty víry.",
    abilities: [
      { name: "Flame Lash", 
        description: "Způsobí 20 poškození.", 
        type: "attack", 
        power: 20, 
        cooldown: 0, 
        currentCooldown: 0 

      },
      { name: "Aegis Ward", description: "Vytvoří štít o síle 35.", 
        type: "shield", 
        power: 35, 
        cooldown: 2, 
        currentCooldown: 0 

      },
      { name: "Vital Surge", 
        description: "Vyléčí 25 HP.", 
        type: "heal", 
        power: 25, 
        cooldown: 3, 
        currentCooldown: 0 

      },
      { name: "Phantom Strike", 
        description: "Způsobí 35 poškození.", 
        type: "attack", 
        power: 35, 
        cooldown: 3, 
        currentCooldown: 0 

      },
      { name: "Steelbound Barrier", 
        description: "Vytvoří štít o síle 40.", 
        type: "shield", 
        power: 40, 
        cooldown: 5, 
        currentCooldown: 0 

      },
      { name: "Chaos Bomb", 
        description: "Způsobí 40 poškození.", 
        type: "attack", 
        power: 40, 
        cooldown: 4, 
        currentCooldown: 0 

      },
    ],
  },
];
