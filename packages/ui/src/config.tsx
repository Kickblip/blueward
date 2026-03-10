export const SEASON_END_DATE = "2026-08-21T23:59:59-06:00" as const

export const SOCIAL_LINK_CONFIG = {
  discord: "https://discord.com/invite/s7W7Rg7AcW",
  instagram: "https://www.instagram.com/longhorn_lol",
  twitch: "https://www.twitch.tv/longhorn_lol",
  wyattwebsite: "https://www.wyatthansen.dev",
  pixels: "https://pixels.longhornlol.com",
  docs: "https://docs.longhornlol.com",
  changelog: "https://docs.longhornlol.com",
  repo: "https://github.com/Kickblip/blueward",
  clubsite: "https://www.longhornlol.com",
} as const

/**
 * common
 * rare
 * epic
 * legendary
 * ultimate
 */

export const BANNER_CONFIG = {
  // ================= DEFAULT =================
  0: { name: "New Horizons", description: "", rarity: "common" },
  1: { name: "Fine Print", description: "", rarity: "common" },
  2: { name: "Infernal Dragons", description: "", rarity: "common" },
  3: { name: "Stacked Deck", description: "", rarity: "common" },

  // ================= LAUNCH EVENT =================
  5: { name: "Beta Tester", description: "Submit feedback or a bug report during the beta period", rarity: "epic" },
  6: { name: "Souls Collide", description: "Participate in the Blueward launch event", rarity: "epic" },
  13: {
    name: "Should Have Bought Anti-heal",
    description: "",
    rarity: "legendary",
  },

  // ================= SET 1 ROLLABLE =================

  34: { name: "Soft Avalanche", description: "", rarity: "ultimate" },

  56: { name: "A Grand Agendum", description: "", rarity: "legendary" },
  105: { name: "Lux Illuminated", description: "", rarity: "legendary" },
  60: { name: "Nine-tailed Fox", description: "", rarity: "legendary" },

  117: { name: "Experiment Gone Awry", description: "", rarity: "epic" },
  24: { name: "Welcome Back", description: "", rarity: "epic" },
  94: { name: "Planning Ahead", description: "", rarity: "epic" },
  84: { name: "Minefield Deployed", description: "", rarity: "epic" },

  8: { name: "The Wandering Caretaker", description: "", rarity: "rare" },
  44: { name: "Crowd Favorite", description: "", rarity: "rare" },
  48: { name: "Troublesome Troupe", description: "", rarity: "rare" },
  89: { name: "Joyful Day Off", description: "", rarity: "rare" },
  91: { name: "Bubbly Buddies", description: "", rarity: "rare" },
  46: { name: "Valuable Sidekick", description: "", rarity: "rare" },

  11: { name: "Spritelings", description: "", rarity: "common" },
  14: { name: "Aerial Assault", description: "", rarity: "common" },
  15: { name: "Faceless Knight", description: "", rarity: "common" },
  18: { name: "Too Easy", description: "", rarity: "common" },
  106: { name: "Poro Parade", description: "", rarity: "common" },
  62: { name: "Big Grin", description: "", rarity: "common" },
  65: { name: "Sorry About That", description: "", rarity: "common" },
  69: { name: "Floral Surprise", description: "", rarity: "common" },
  80: { name: "The Climb", description: "", rarity: "common" },
  113: { name: "Next Challenger", description: "", rarity: "common" },
  20: { name: "Stalwart Poro", description: "", rarity: "common" },

  // ================= SET 1 PURCHASEABLE =================
  39: { name: "The Order of Shadows", description: "", rarity: "legendary" },
  16: { name: "Lux Discovery", description: "", rarity: "epic" },
  23: { name: "Braum is Here", description: "", rarity: "epic" },
  40: { name: "Wanderer", description: "", rarity: "epic" },
  61: { name: "Together Forever", description: "", rarity: "epic" },

  /**
   *
   * ===============================================
   * ================= COMING SOON =================
   * ===============================================
   *
   *
   * */

  // 7: { name: "Deliverance", description: "", rarity: "ultimate" },
  // 12: { name: "Shadow", description: "", rarity: "rare" },

  // 17: { name: "Final Spark", description: "", rarity: "common" },
  // 19: { name: "No Competition", description: "", rarity: "common" },
  // 21: { name: "Drunken Alarm", description: "", rarity: "common" },
  // 22: { name: "My Mountain", description: "", rarity: "common" },
  // 25: { name: "Most Comfortable Slumber", description: "", rarity: "common" },
  // 26: { name: "Freljord Hound", description: "", rarity: "common" },
  // 27: { name: "Poro Shepherd", description: "", rarity: "common" },
  // 28: { name: "Sunrise", description: "", rarity: "common" },
  // 29: { name: "Peculiar Stranger", description: "", rarity: "common" },
  // 30: { name: "Wynnstones", description: "", rarity: "common" },
  // 31: { name: "Stepping Stones", description: "", rarity: "common" },
  // 32: { name: "Alliance", description: "", rarity: "common" },
  // 33: { name: "Undying Rage", description: "", rarity: "common" },
  // 35: { name: "The Wolf and the Hare", description: "", rarity: "common" },
  // 36: { name: "Poro Hero", description: "", rarity: "common" },
  // 37: { name: "Unlikely Warrior", description: "", rarity: "common" },
  // 38: { name: "The Master of Shadows", description: "", rarity: "epic" },
  // 41: { name: "Empyrean", description: "", rarity: "common" },
  // 42: { name: "Focused Blade", description: "", rarity: "common" },
  // 43: { name: "The Enlightened", description: "", rarity: "common" },
  // 45: { name: "The Humble One", description: "", rarity: "common" },
  // 47: { name: "The Sinister Blade", description: "", rarity: "common" },
  // 49: { name: "Adorable Prankster", description: "", rarity: "common" },
  // 50: { name: "Mission Success", description: "", rarity: "common" },
  // 51: { name: "Escape Plan", description: "", rarity: "common" },
  // 52: { name: "Laying Down the Gauntlet", description: "", rarity: "common" },
  // 53: { name: "Woke up in Paradise", description: "", rarity: "common" },
  // 54: { name: "Fashionable Arrival", description: "", rarity: "common" },
  // 55: { name: "Toadstool Thief", description: "", rarity: "common" },
  // 57: { name: "Come Out", description: "", rarity: "common" },
  // 58: { name: "Frightly Friends", description: "", rarity: "common" },
  // 59: { name: "Master of the Sea", description: "", rarity: "common" },
  // 63: { name: "Sea Warden", description: "", rarity: "rare" },
  // 64: { name: "The Grand General", description: "", rarity: "common" },
  // 67: { name: "All You Can Eat", description: "", rarity: "common" },
  // 70: { name: "Mischevious Fun", description: "", rarity: "common" },
  // 71: { name: "Drums of War", description: "", rarity: "common" },
  // 72: { name: "Get Up", description: "", rarity: "common" },
  // 73: { name: "Risen Up", description: "", rarity: "common" },
  // 74: { name: "The Star Forger", description: "", rarity: "common" },
  // 75: { name: "Bejeweled", description: "", rarity: "common" },
  // 76: { name: "Exemplar of Demacia", description: "", rarity: "common" },
  // 77: { name: "Blade Dancer", description: "", rarity: "common" },
  // 78: { name: "Dancing Droplet", description: "", rarity: "common" },
  // 79: { name: "Unstoppable Smash", description: "", rarity: "common" },
  // 81: { name: "Voluntary Participant", description: "", rarity: "common" },
  // 82: { name: "Breaking Out", description: "", rarity: "common" },
  // 83: { name: "Immeasurable Greed", description: "", rarity: "common" },
  // 85: { name: "Eye of the Storm", description: "", rarity: "legendary" },
  // 86: { name: "Encore", description: "", rarity: "common" },
  // 87: { name: "Unfathomable Evil", description: "", rarity: "common" },
  // 88: { name: "Reluctant Soldier", description: "", rarity: "common" },
  // 92: { name: "Ahri Discovery", description: "", rarity: "common" },
  // 93: { name: "Unwelcomed Entrance", description: "", rarity: "common" },
  // 96: { name: "A New Weapon", description: "", rarity: "common" },
  // 97: { name: "Thunderous Applause", description: "", rarity: "common" },
  // 98: { name: "Icathian Mage", description: "", rarity: "common" },
  // 99: { name: "Poro King", description: "", rarity: "common" },
  // 100: { name: "Frolicking Friends", description: "", rarity: "common" },
  // 101: { name: "Fallen Angel", description: "", rarity: "common" },
  // 102: { name: "Elder Dragon", description: "", rarity: "common" },
  // 104: { name: "False Friend", description: "", rarity: "common" },
  // 107: { name: "Bathtime for Poros", description: "", rarity: "common" },
  // 108: { name: "Collateral Damage", description: "", rarity: "common" },
  // 109: { name: "Forged in Flame", description: "", rarity: "common" },
  // 110: { name: "The Fire Below the Mountain", description: "", rarity: "common" },
  // 111: { name: "Call of the Forge God", description: "", rarity: "common" },
  // 112: { name: "Last Caress", description: "", rarity: "common" },
  // 114: { name: "Immortal Enemies", description: "", rarity: "common" },
  // 115: { name: "Daughter of the Void", description: "", rarity: "common" },
  // 116: { name: "The Boss", description: "", rarity: "common" },
  // 118: { name: "Fluffiest Mattress", description: "", rarity: "common" },
} as const
