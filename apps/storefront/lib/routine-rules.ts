export type SkinType = "Dry" | "Oily" | "Combination" | "Normal" | "Sensitive";
export type Concern = "Dryness" | "Dullness" | "Daily care" | "Sensitive" | "Fine lines";
export type RoutineTime = "Morning" | "Night" | "Full day";
export type TexturePref = "Lightweight" | "Rich" | "No preference";
export type RoutineScope = "One hero product" | "Full routine";

export type RoutineAnswers = {
  skinType: SkinType | "";
  concern: Concern | "";
  time: RoutineTime | "";
  texture: TexturePref | "";
  scope: RoutineScope | "";
};

const cleanser = "Soft Refresh Gel Cleanser";
const moisturizer = "Airy Whip Silk Cream Moisturizer";
const serum = "Pre-Shift Renewal Serum";

export type CompleteRoutineAnswers = {
  skinType: SkinType;
  concern: Concern;
  time: RoutineTime;
  texture: TexturePref;
  scope: RoutineScope;
};

export function buildRoutineRecommendation(a: CompleteRoutineAnswers): {
  morning: string[];
  night: string[];
  notes: string;
} {
  const morning: string[] = [];
  const night: string[] = [];
  let notes =
    "These recommendations are rules-based (MVP). Connect AI personalization in a later phase.";

  if (a.scope === "One hero product") {
    if (a.concern === "Dryness" || a.texture === "Rich") {
      morning.push(moisturizer);
      night.push(moisturizer);
      notes = "You asked for one hero—moisturizer anchors hydration day and night.";
    } else if (a.time === "Night" || a.concern === "Dullness") {
      night.push(serum);
      notes = "One hero at night: renewal serum for glow and texture.";
    } else {
      morning.push(cleanser);
      night.push(cleanser);
      notes = "One hero: cleanser as the daily reset—pair later for full results.";
    }
    return { morning, night, notes };
  }

  // Full routine paths
  if (a.time === "Morning" || a.time === "Full day") {
    morning.push(cleanser, moisturizer);
  }
  if (a.time === "Night" || a.time === "Full day") {
    night.push(cleanser, serum, moisturizer);
  }
  if (a.time === "Morning") {
    notes =
      "Morning focus: cleanse + hydrate. Add serum at night when you are ready for renewal.";
  }
  if (a.skinType === "Sensitive" || a.concern === "Sensitive") {
    notes += " Patch test new steps; introduce serum 2–3 nights per week at first.";
  }
  return { morning, night, notes };
}
