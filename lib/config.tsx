import { TransactionType } from "./schema"

export const CLIMB_CHALLENGE_START_DATE = "2026-08-31T16:59:00-05:00" as const
export const CLIMB_CHALLENGE_END_DATE = "2026-09-15T00:00:01-05:00" as const

export const BLUEWARD_VERSION = "2.0" as const

export const SOCIAL_LINK_CONFIG = {
  discord: "https://discord.com/invite/s7W7Rg7AcW",
  instagram: "https://www.instagram.com/longhorn_lol",
  twitch: "https://www.twitch.tv/longhorn_lol",
  wyattwebsite: "https://github.com/Kickblip",
  docs: "https://docs.longhornlol.com",
  changelog: "https://github.com/Kickblip/blueward/releases",
  repo: "https://github.com/Kickblip/blueward",
  clubsite: "https://www.longhornlol.com",
} as const

export const MAX_CLUB_LOGO_SIZE_BYTES = 2 * 1024 * 1024
export const MAX_CLUB_BANNER_SIZE_BYTES = 5 * 1024 * 1024
export const IMAGE_UPLOAD_EXPIRES_SECONDS = 5 * 60
export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const
export const FILE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const satisfies Record<(typeof IMAGE_MIME_TYPES)[number], string>

export const MAX_NOTE_LENGTH = 75 as const

export const SUPPORT_PAYOUT_MULTIPLIER = 1.2 as const

export const FAVORED_ROLE_MMR_DEBUFF = 0.9 as const

export const MMR_LEADERBOARD_GAME_WINDOW = 10 as const

export const MINUTES_MARKET_IS_OPEN_BEFORE_LOCK = 10 as const

export const MIN_PREDICTION_PAYOUT_MULTIPLIER = 1.1

export const BASE_LEVEL_XP = 15
export const LEVEL_GROWTH = 1.0001

export const DRAFT_ORDER = [0, 1, 1, 0, 0, 1, 1, 0] as const

export const TRANSACTION_TYPES = {
  MATCH_EARN: "Match Earnings",
  ADMIN_ADJUST: "Admin Adjustment",
  SPEND: "Spent",
  MARKET_STAKE: "Wager Stake",
  MARKET_PAYOUT: "Wager Payout",
  MARKET_REFUND: "Wager Refund",
  DAILY_REWARD: "Daily Reward",
  PROMO_CODE: "Promo Code",
} as const satisfies Record<TransactionType, string>

export function getProjectedPredictionMultiplier(popularity: number) {
  const marketMultiplier = 1 / Math.max(popularity, 0.01)
  return Math.max(marketMultiplier, MIN_PREDICTION_PAYOUT_MULTIPLIER)
}

export const levelBadges = [
  [500, "/badges/player/6.webp"],
  [250, "/badges/player/5.webp"],
  [120, "/badges/player/4.webp"],
  [70, "/badges/player/3.webp"],
  [30, "/badges/player/2.png"],
  [10, "/badges/player/1.png"],
] as const

export const DAILY_REWARD = 15000 as const

export const ROLL_PRICE = 15000 as const

export type Rarity = "common" | "rare" | "epic" | "legendary" | "ultimate"

export const RARITY_COLORS = {
  common: "#22c55e",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f75555",
  ultimate: "#f5f10b",
} as const

export const RARITY_PRICES = {
  common: 10000,
  rare: 20000,
  epic: 35000,
  legendary: 75000,
  ultimate: 500000,
} as const

export const RARITY_RATES = {
  common: 0.56,
  rare: 0.3,
  epic: 0.11,
  legendary: 0.025,
  ultimate: 0.005,
} as const

export const EVENT_RARITY_RATES = {
  common: 0.48,
  rare: 0.3,
  epic: 0.13,
  legendary: 0.08,
  ultimate: 0.01,
} as const

export const OWNERSHIP_RAKEBACK = {
  common: 0.3,
  rare: 0.4,
  epic: 0.5,
  legendary: 0.8,
  ultimate: 1.0,
} as const

export const BANNER_SETS = {
  default: {
    name: "Horizons",
    href: "/shop",
    image: "/horizons.webp",
    rates: RARITY_RATES,
    rateUp: false,
    buttonClassName: "",
    accentClassName: "",
    featuredClassName:
      "border-yellow-300 shadow-[0_0_60px_rgba(245,241,11,0.35),0_24px_60px_rgba(0,0,0,0.55)]",
    featured: 119,
    buyable: [39, 16, 23, 40, 61, 81],
    ultimate: [119],
    legendary: [34, 56, 105, 60, 85, 112],
    epic: [117, 111, 24, 118, 116, 94, 84],
    rare: [8, 44, 48, 91, 46, 37, 89],
    common: [62, 65, 69, 80, 113, 20, 11, 14, 15, 18, 106],
  },
  halloween: {
    name: "Dark Harvest",
    href: "/shop/limited",
    image: "/dark-harvest.webp",
    rates: EVENT_RARITY_RATES,
    rateUp: true,
    buttonClassName: "bg-orange-600 hover:bg-orange-700",
    accentClassName:
      "text-orange-600 hover:text-orange-600 dark:text-orange-300 dark:hover:text-orange-300",
    featuredClassName:
      "border-red-300 shadow-[0_0_60px_rgba(239,68,68,0.35),0_24px_60px_rgba(0,0,0,0.55)]",
    featured: 121,
    buyable: [96, 87, 67],
    ultimate: [121],
    legendary: [63],
    epic: [58, 55],
    rare: [57, 29],
    common: [21],
  },
} as const

export type BannerSetId = keyof typeof BANNER_SETS

export const BANNER_CONFIG = {
  // ================= DEFAULT =================
  0: { name: "New Horizons", description: "", rarity: "common", mediaPosition: "center 40%" },
  1: { name: "Fine Print", description: "", rarity: "common", mediaPosition: "center 20%" },
  2: { name: "Infernal Dragons", description: "", rarity: "common", mediaPosition: "center 80%" },
  3: { name: "Stacked Deck", description: "", rarity: "common", mediaPosition: "center 10%"},

  // ================= PROMOS =================

  120: {
    name: "Climbed",
    description: "Placed top 3 in the 2026 Fall Climb Challenge",
    rarity: "ultimate",
    video: "/banners/video/120.webm",
    mediaPosition: "center 50%",
  },

  // ================= LAUNCH EVENT =================
  5: {
    name: "Beta Tester",
    description: "Submit feedback or a bug report during the beta period",
    rarity: "epic",
    mediaPosition: "center 50%",
  },
  6: {
    name: "Souls Collide",
    description: "Participate in the Blueward launch event",
    rarity: "epic",
    mediaPosition: "center 20%",
  },
  13: {
    name: "Should Have Bought Anti-heal",
    description: "",
    rarity: "legendary",
    mediaPosition: "center 30%"
  },

  // ================= HORIZONS ROLLABLE =================

  119: {
    name: "Crystal Rose",
    description: "",
    rarity: "ultimate",
    video: "/banners/video/119.webm",
    mediaPosition: "center 25%",
  },

  34: { name: "Look Out Below", description: "", rarity: "legendary", mediaPosition: "center 20%" },
  56: { name: "A Grand Agendum", description: "", rarity: "legendary", mediaPosition: "center 40%"},
  105: { name: "Lux Illuminated", description: "", rarity: "legendary", mediaPosition: "center 10%"},
  60: { name: "Nine-tailed Fox", description: "", rarity: "legendary", mediaPosition: "center 30%"},
  85: { name: "Eye of the Storm", description: "", rarity: "legendary", mediaPosition: "center 30%" },
  112: { name: "Last Caress", description: "", rarity: "legendary", mediaPosition: "center 10%" },

  117: { name: "Experiment Gone Awry", description: "", rarity: "epic", mediaPosition: "center 10%"},
  111: { name: "Call of the Forge God", description: "", rarity: "epic", mediaPosition: "center 70%"},
  24: { name: "Welcome Back", description: "", rarity: "epic", mediaPosition: "center 20%" },
  118: { name: "Fluffiest Bed", description: "", rarity: "epic", mediaPosition: "center 40%" },
  116: { name: "The Boss", description: "", rarity: "epic", mediaPosition: "center 30%" },
  94: { name: "Planning Ahead", description: "", rarity: "epic", mediaPosition: "center 20%"},
  84: { name: "Minefield Deployed", description: "", rarity: "epic", mediaPosition: "center 30%"},

  8: { name: "The Wandering Caretaker", description: "", rarity: "rare", mediaPosition: "center 40%"},
  44: { name: "Crowd Favorite", description: "", rarity: "rare", mediaPosition: "center 10%"},
  48: { name: "Troublesome Troupe", description: "", rarity: "rare", mediaPosition: "center 40%"},
  91: { name: "Bubbly Buddies", description: "", rarity: "rare", mediaPosition: "center 40%"},
  46: { name: "Valuable Sidekick", description: "", rarity: "rare", mediaPosition: "center 20%" },
  37: { name: "Unlikely Warrior", description: "", rarity: "rare", mediaPosition: "center 10%" },
  89: { name: "Joyful Day Off", description: "", rarity: "rare", mediaPosition: "center 30%"},

  62: { name: "Big Grin", description: "", rarity: "common", mediaPosition: "center 30%"},
  65: { name: "Sorry About That", description: "", rarity: "common", mediaPosition: "center 20%"},
  69: { name: "Floral Surprise", description: "", rarity: "common", mediaPosition: "center 30%"},
  80: { name: "The Climb", description: "", rarity: "common", mediaPosition: "center 60%"},
  113: { name: "Next Challenger", description: "", rarity: "common", mediaPosition: "center 20%"},
  20: { name: "Stalwart Poro", description: "", rarity: "common", mediaPosition: "center 50%"},
  11: { name: "Spritelings", description: "", rarity: "common", mediaPosition: "center 35%"},
  14: { name: "Aerial Assault", description: "", rarity: "common", mediaPosition: "center 60%"},
  15: { name: "Faceless Knight", description: "", rarity: "common", mediaPosition: "center 30%"},
  18: { name: "Too Easy", description: "", rarity: "common", mediaPosition: "center 40%"},
  106: { name: "Poro Parade", description: "", rarity: "common", mediaPosition: "center 30%"},

  // ================= HORIZONS PURCHASEABLE =================
  39: { name: "The Order of Shadows", description: "", rarity: "legendary", mediaPosition: "center 10%" },
  16: { name: "Lux Discovery", description: "", rarity: "legendary", mediaPosition: "center 20%"},
  23: { name: "Braum is Here", description: "", rarity: "legendary", mediaPosition: "center 30%"},
  40: { name: "Wanderer", description: "", rarity: "epic", mediaPosition: "center 20%"},
  61: { name: "Together Forever", description: "", rarity: "epic", mediaPosition: "center 30%"},
  81: { name: "Voluntary Participant", description: "", rarity: "epic", mediaPosition: "center 20%"},

  // ================= DARK HARVEST ROLLABLE =================
  121: {
    name: "Little Devil",
    description: "",
    rarity: "ultimate",
    video: "/banners/video/121.webm",
    mediaPosition: "center 25%",
  },
  21: { name: "Drunken Alarm", description: "", rarity: "common", mediaPosition: "center 40%"},
  29: { name: "Peculiar Stranger", description: "", rarity: "rare", mediaPosition: "center 20%"},
  57: { name: "Come Out", description: "", rarity: "rare", mediaPosition: "center 10%"},
  58: { name: "Frightly Friends", description: "", rarity: "epic", mediaPosition: "center 40%"},
  55: { name: "Toadstool Thief", description: "", rarity: "epic", mediaPosition: "center 50%"},
  63: { name: "Sea Warden", description: "", rarity: "legendary", mediaPosition: "center 10%"},

  // ================= DARK HARVEST PURCHASEABLE =================
  96: { name: "A New Weapon", description: "", rarity: "legendary", mediaPosition: "center 20%"},
  87: { name: "Unfathomable Evil", description: "", rarity: "epic" , mediaPosition: "center 30%"},
  67: { name: "All You Can Eat", description: "", rarity: "epic", mediaPosition: "center 20%"},

  /**
   *
   * ===============================================
   * ================= COMING SOON =================
   * ===============================================
   *
   *
   * */

  12: { name: "Shadow", description: "", rarity: "rare", mediaPosition: "center 10%"},
  109: { name: "Forged in Flame", description: "", rarity: "legendary", mediaPosition: "center 40%"},
  99: { name: "Poro King", description: "", rarity: "common", mediaPosition: "center 30%"},
  86: { name: "Encore", description: "", rarity: "rare", mediaPosition: "center 30%"},
  17: { name: "Final Spark", description: "", rarity: "common", mediaPosition: "center 30%"},
  19: { name: "No Competition", description: "", rarity: "common", mediaPosition: "center 20%"},
  22: { name: "My Mountain", description: "", rarity: "common" , mediaPosition: "center 10%"},
  25: { name: "Most Comfortable Slumber", description: "", rarity: "common", mediaPosition: "center 45%"},
  26: { name: "Freljord Hound", description: "", rarity: "common", mediaPosition: "center 25%"},
  27: { name: "Poro Shepherd", description: "", rarity: "common", mediaPosition: "center 40%"},
  28: { name: "Sunrise", description: "", rarity: "common", mediaPosition: "center 50%"},
  30: { name: "Wynnstones", description: "", rarity: "common", mediaPosition: "center 40%"},
  31: { name: "Stepping Stones", description: "", rarity: "common", mediaPosition: "center 20%"},
  32: { name: "Alliance", description: "", rarity: "common", mediaPosition: "center 10%"},
  33: { name: "Undying Rage", description: "", rarity: "common", mediaPosition: "center 30%"},
  35: { name: "The Wolf and the Hare", description: "", rarity: "common", mediaPosition: "center 30%"},
  36: { name: "Poro Hero", description: "", rarity: "common", mediaPosition: "center 50%"},
  38: { name: "The Master of Shadows", description: "", rarity: "legendary", mediaPosition: "center 10%"},
  41: { name: "Empyrean", description: "", rarity: "common", mediaPosition: "center 10%"},
  42: { name: "Focused Blade", description: "", rarity: "common", mediaPosition: "center 30%"},
  43: { name: "The Enlightened", description: "", rarity: "common", mediaPosition: "center 30%"},
  45: { name: "The Humble One", description: "", rarity: "common", mediaPosition: "center 30%"},
  47: { name: "The Sinister Blade", description: "", rarity: "common", mediaPosition: "center 35%"},
  49: { name: "Adorable Prankster", description: "", rarity: "common", mediaPosition: "center 35%"},
  50: { name: "Mission Success", description: "", rarity: "common", mediaPosition: "center 10%"},
  51: { name: "Escape Plan", description: "", rarity: "common", mediaPosition: "center 50%"},
  52: { name: "Laying Down the Gauntlet", description: "", rarity: "common", mediaPosition: "center 20%"},
  53: { name: "Woke up in Paradise", description: "", rarity: "common", mediaPosition: "center 70%"},
  54: { name: "Fashionable Arrival", description: "", rarity: "common", mediaPosition: "center 20%"},
  59: { name: "Master of the Sea", description: "", rarity: "common", mediaPosition: "center 30%"},

  64: { name: "The Grand General", description: "", rarity: "common", mediaPosition: "center 0%"},
  70: { name: "Mischevious Fun", description: "", rarity: "common", mediaPosition: "center 50%"},
  71: { name: "Drums of War", description: "", rarity: "common", mediaPosition: "center 10%"},
  72: { name: "Get Up", description: "", rarity: "common", mediaPosition: "center 35%"},
  73: { name: "Risen Up", description: "", rarity: "common", mediaPosition: "center 30%"},
  74: { name: "The Star Forger", description: "", rarity: "common", mediaPosition: "center 60%"},
  75: { name: "Bejeweled", description: "", rarity: "common", mediaPosition: "center 40%"},
  76: { name: "Exemplar of Demacia", description: "", rarity: "common", mediaPosition: "center 30%"},
  77: { name: "Blade Dancer", description: "", rarity: "common", mediaPosition: "center 10%"},
  78: { name: "Dancing Droplet", description: "", rarity: "common", mediaPosition: "center 30%"},
  79: { name: "Unstoppable Smash", description: "", rarity: "common", mediaPosition: "center 20%"},
  82: { name: "Breaking Out", description: "", rarity: "common", mediaPosition: "center 10%"},
  83: { name: "Immeasurable Greed", description: "", rarity: "common", mediaPosition: "center 30%"},
  88: { name: "Reluctant Soldier", description: "", rarity: "common", mediaPosition: "center 20%"},
  92: { name: "Ahri Discovery", description: "", rarity: "common", mediaPosition: "center 20%"},
  93: { name: "Unwelcomed Entrance", description: "", rarity: "common", mediaPosition: "center 20%"},
  97: { name: "Thunderous Applause", description: "", rarity: "common", mediaPosition: "center 45%"},
  98: { name: "Icathian Mage", description: "", rarity: "common", mediaPosition: "center 20%"},
  100: { name: "Frolicking Friends", description: "", rarity: "common", mediaPosition: "center 30%"},
  101: { name: "Fallen Angel", description: "", rarity: "common", mediaPosition: "center 20%"},
  102: { name: "Elder Dragon", description: "", rarity: "common", mediaPosition: "center 70%"},
  104: { name: "False Friend", description: "", rarity: "common", mediaPosition: "center 40%"},
  107: { name: "Bathtime for Poros", description: "", rarity: "common", mediaPosition: "center 30%"},
  108: { name: "Collateral Damage", description: "", rarity: "common", mediaPosition: "center 10%"},
  110: { name: "The Fire Below the Mountain", description: "", rarity: "common", mediaPosition: "center 10%"},
  114: { name: "Immortal Enemies", description: "", rarity: "common", mediaPosition: "center 30%"},
  115: { name: "Daughter of the Void", description: "", rarity: "common", mediaPosition: "center 30%"},
} as const
