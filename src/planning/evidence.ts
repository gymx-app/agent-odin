/**
 * Evidence-backed constants used across the planning pipeline.
 * Every value here is derived from peer-reviewed literature.
 * Rationale codes reference the citation keys below.
 *
 * CITATION KEYS (used in rationale_codes throughout the planner):
 *
 * SCHOENFELD_2017_DOSE_RESPONSE
 *   Schoenfeld BJ, Ogborn D, Krieger JW. Dose-response relationship between
 *   weekly resistance training volume and increases in muscle mass: A systematic
 *   review and meta-analysis. J Sports Sci. 2017;35(11):1073-1082.
 *   PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC6303131/
 *   Finding: 10+ sets/muscle/week superior to <5; graded dose-response across
 *   <5, 5-9, and 10+ weekly sets per muscle group.
 *
 * SCHOENFELD_2019_VOLUME_HYPERTROPHY
 *   Schoenfeld BJ et al. Resistance Training Volume Enhances Muscle Hypertrophy
 *   but Not Strength in Trained Men. Med Sci Sports Exerc. 2019;51(1):94-103.
 *   PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC6303131/
 *   Finding: 45 weekly sets > 27 > 9 for hypertrophy in trained men.
 *
 * ISRAETEL_RP_VOLUME_LANDMARKS
 *   Israetel M, Hoffmann J. Training Volume Landmarks for Muscle Growth.
 *   RP Strength. https://rpstrength.com/blogs/articles/training-volume-landmarks-muscle-growth
 *   MV ~6 sets/muscle/week; MEV ~6-8; MAV 12-20; individual MRV varies.
 *
 * ISRAETEL_RP_INDIRECT_VOLUME
 *   Israetel M. How Much Should You Train Each Muscle? RP Strength.
 *   https://rpstrength.com/blogs/articles/how-much-should-you-train-each-muscle
 *   Finding: a compound movement's secondary/indirect muscle involvement
 *   counts toward that muscle's weekly volume, at roughly half the credit
 *   of a set where the muscle is the primary target.
 *
 * SABAG_2022_CONCURRENT_HIIT
 *   Sabag A et al. The compatibility of concurrent high intensity interval
 *   training and resistance training for muscular strength and hypertrophy:
 *   a systematic review and meta-analysis. J Sports Sci. 2018;36(21):2472-2483.
 *   ResearchGate: https://www.researchgate.net/publication/328849154
 *   Finding: HIIT may reduce interference vs steady-state endurance when
 *   combined with resistance training. Cycling HIIT showed more lower-body
 *   interference than running.
 *
 * MURLASITS_2018_CONCURRENT
 *   Murlasits Z et al. The physiological effects of concurrent strength and
 *   endurance training sequence: A systematic review and meta-analysis.
 *   J Sports Sci. 2018;36(11):1212-1219.
 *   Finding: Resistance-before-endurance order preserves strength gains in
 *   programmes ≥5 weeks. Shorter endurance bouts (≤30 min) cause less
 *   interference than longer (50-60+ min).
 *
 * VIANA_2019_HIIT_FAT_LOSS
 *   Viana RB et al. Is interval training the magic bullet for fat loss?
 *   A systematic review and meta-analysis. Br J Sports Med. 2019;53(10):655-664.
 *   Finding: HIIT and SIT reduce total body fat mass (mean ~1.58 kg) with
 *   similar efficacy to MICT but ~40% less time commitment.
 *
 * WEWEGE_2017_HIIT_OBESITY
 *   Wewege M et al. The effects of high-intensity interval training vs.
 *   moderate-intensity continuous training on body composition in overweight
 *   and obese adults. Obes Rev. 2017;18(6):635-646.
 *   Finding: HIIT reduces total body fat mass by 1.38-2 kg; ≥3 sessions/week
 *   for 8+ weeks most effective for body composition.
 *
 * ACSM_2021_GUIDELINES
 *   American College of Sports Medicine. ACSM's Guidelines for Exercise
 *   Testing and Prescription, 11th ed. Wolters Kluwer, 2021.
 *   Finding: Previously sedentary/untrained individuals should complete a
 *   minimum base-building phase of moderate-intensity exercise before HIIT.
 *   Progressive overload ≤10-20% volume increase per week.
 *
 * GENTIL_2017_MINIMUM_VOLUME
 *   Gentil P et al. A Review of the Acute Effects and Long-Term Adaptations
 *   of Single- and Multi-Joint Exercises during Resistance Training.
 *   Sports Med. 2017;47(5):843-855.
 *   Finding: Even low-volume protocols (≤4 sets/muscle/week) produce
 *   substantial hypertrophy gains; meaningful threshold ~4-6 sets/week.
 *
 * KRIEGER_2010_SETS_META
 *   Krieger JW. Single vs. Multiple Sets of Resistance Exercise for Muscle
 *   Hypertrophy: A Meta-Analysis. J Strength Cond Res. 2010;24(4):1150-1159.
 *   Finding: 2-3 sets per exercise superior to 1 set; 4-6 sets per exercise
 *   showed additional but diminishing returns.
 *
 * SCHOENFELD_2021_LOAD_HYPERTROPHY
 *   Schoenfeld BJ et al. Loading Recommendations for Muscle Strength,
 *   Hypertrophy, and Local Endurance: A Re-Examination of the Repetition
 *   Continuum. Sports. 2021;9(2):32.
 *   PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC7927075/
 *   Finding: External load (≥30% 1RM) produces comparable hypertrophy to
 *   heavy loads when taken to failure, but heavier loads are superior for
 *   maximal strength development.
 *
 * WEAKLEY_2022_CONCURRENT_DOSE
 *   Weakley J et al. Optimizing concurrent training programs: A review on
 *   factors that enhance muscle strength. PMC 2024.
 *   PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC11688070/
 *   Finding: Endurance bouts ≤30 min cause less interference than 50-60+ min.
 *
 * HELMS_2016_RPE_SCALE
 *   Helms ER, Cronin J, Storey A, Zourdos MC. Application of the
 *   Repetitions in Reserve-Based Rating of Perceived Exertion Scale for
 *   Resistance Training. Strength Cond J. 2016;38(4):42-49.
 *   Finding: an RPE/RIR-based %1RM correspondence table (originating from
 *   Mike Tuchscherer's Reactive Training Systems chart, and reproduced/
 *   validated in this paper) lets a target RPE and rep count be converted
 *   to an estimated percentage of 1RM.
 *   2x/week endurance has minimal interference; 3x/week shows detriment.
 *   3-6 hour separation recommended for same-day sessions.
 */

// ─── Volume fill rates ───────────────────────────────────────────────
// Schoenfeld 2017: 10+ sets/muscle/week optimal for trained lifters.
// Schoenfeld 2019: graded response up to 45 sets/week in trained men.
// RP Volume Landmarks: MAV 12-20 sets/muscle/week; MV ~6 sets.
//
// Fill rates represent the fraction of maximum session capacity to target,
// scaled by training status to reflect the dose-response curve:
//   Beginner: conservative start (~75%) per ACSM progressive overload guidelines
//   Intermediate: moderate (~85%) approaching the 10+ set/muscle threshold
//   Advanced: near-ceiling (~92%) to reach the upper MAV range
export const VOLUME_FILL_RATES = {
  beginner: 0.75,
  intermediate: 0.85,
  advanced: 0.92,
} as const;

export const VOLUME_FILL_RATE_CITATIONS = [
  'SCHOENFELD_2017_DOSE_RESPONSE',
  'ISRAETEL_RP_VOLUME_LANDMARKS',
  'ACSM_2021_GUIDELINES',
] as const;

// ─── Minimum session volume floor ────────────────────────────────────
// Gentil 2017 / Krieger 2010: ≥4 sets/muscle/week produces meaningful
// hypertrophy. The 60% floor ensures even low-volume weeks stay above
// the minimum effective threshold (~4-6 sets/muscle/week) when applied
// to per-session capacity.
export const MIN_SESSION_VOLUME_FRACTION = 0.6;

export const MIN_SESSION_VOLUME_CITATIONS = [
  'GENTIL_2017_MINIMUM_VOLUME',
  'KRIEGER_2010_SETS_META',
  'SCHOENFELD_2017_DOSE_RESPONSE',
] as const;

// ─── Indirect (secondary-muscle) set crediting ────────────────────────
// A movement pattern's non-primary muscle (e.g. glutes on a squat, or
// triceps on a horizontal press) receives partial credit toward its
// weekly volume target rather than zero credit, since it's still worked
// through a meaningful range of motion under load — but less credit than
// a set where that muscle is the primary target, since stimulus is
// diluted across the compound movement. RP's volume-landmarks
// methodology treats indirect/secondary-muscle sets as roughly half the
// value of a direct/primary set for volume-counting purposes.
export const INDIRECT_SET_CREDIT_FACTOR = 0.5;

export const INDIRECT_SET_CREDIT_CITATIONS = [
  'ISRAETEL_RP_INDIRECT_VOLUME',
] as const;

// ─── RPE-based %1RM estimation ────────────────────────────────────────
// Helms, Cronin, Storey & Zourdos (2016) / Tuchscherer RTS chart: percent
// of 1RM by target RPE (6-10, in 0.5 increments) and target reps (1-12).
// Deliberately not extrapolated beyond this published range — outside it,
// callers should fall back to a goal-based percentage rather than trust a
// number this table was never validated for.
export const RPE_PERCENT_1RM_TABLE: Record<string, number[]> = {
  '10': [100, 95.5, 92.2, 89.2, 86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 71.7, 69.4],
  '9.5': [97.8, 93.9, 90.7, 87.8, 85.0, 82.4, 79.9, 77.4, 75.1, 72.8, 70.6, 68.5],
  '9': [95.5, 92.2, 89.2, 86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 71.7, 69.4, 67.4],
  '8.5': [93.9, 90.7, 87.8, 85.0, 82.4, 79.9, 77.4, 75.1, 72.8, 70.6, 68.5, 66.4],
  '8': [92.2, 89.2, 86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 71.7, 69.4, 67.4, 65.3],
  '7.5': [90.7, 87.8, 85.0, 82.4, 79.9, 77.4, 75.1, 72.8, 70.6, 68.5, 66.4, 64.5],
  '7': [89.2, 86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 71.7, 69.4, 67.4, 65.3, 63.4],
  '6.5': [87.8, 85.0, 82.4, 79.9, 77.4, 75.1, 72.8, 70.6, 68.5, 66.4, 64.5, 62.6],
  '6': [86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 71.7, 69.4, 67.4, 65.3, 63.4, 61.5],
};

// Rounds target_rpe to the nearest 0.5 (the table's granularity) before
// lookup. Returns undefined outside the table's published range (RPE < 6
// or > 10, reps < 1 or > 12) rather than guessing.
export const percentOneRepMaxForRpeReps = (
  targetRpe: number,
  targetReps: number,
): number | undefined => {
  const rpeKey = (Math.round(targetRpe * 2) / 2).toString();
  const row = RPE_PERCENT_1RM_TABLE[rpeKey];
  if (!row || !Number.isInteger(targetReps) || targetReps < 1 || targetReps > 12) {
    return undefined;
  }
  return row[targetReps - 1];
};

export const RPE_PERCENT_1RM_CITATIONS = ['HELMS_2016_RPE_SCALE'] as const;

// ─── Equipment preference scoring ────────────────────────────────────
// Schoenfeld 2021: External load ≥30% 1RM matches bodyweight-to-failure
// for hypertrophy but is superior for maximal strength. When equipment
// is available, loaded exercises are preferred for strength transfer;
// bodyweight-only receives a mild penalty (not exclusion) because it
// still drives hypertrophy when taken to failure.
export const EQUIPMENT_PREFERENCE = {
  loaded_bonus: 15,
  bodyweight_penalty: -10,
} as const;

export const EQUIPMENT_PREFERENCE_CITATIONS = [
  'SCHOENFELD_2021_LOAD_HYPERTROPHY',
] as const;

// ─── Post-resistance finisher duration ───────────────────────────────
// Murlasits 2018 / Weakley 2022: Endurance bouts ≤30 min post-resistance
// cause significantly less interference than 50-60+ min bouts.
// Practical lower bound: HIIT protocols require minimum ~8 min for
// adequate warm-up + 4-6 intervals of 30-60s work (Wewege 2017).
// Upper bound capped at 15 min to stay well within the ≤30 min
// low-interference window while leaving recovery margin.
export const FINISHER_DURATION = {
  min_minutes: 8,
  max_minutes: 15,
} as const;

export const FINISHER_DURATION_CITATIONS = [
  'MURLASITS_2018_CONCURRENT',
  'WEAKLEY_2022_CONCURRENT_DOSE',
  'WEWEGE_2017_HIIT_OBESITY',
] as const;

// ─── HIIT cycling frequency ─────────────────────────────────────────
// Wewege 2017: 2-3 HIIT sessions/week effective for fat mass reduction.
// Weakley 2022: 2x/week endurance has minimal interference; 3x shows
// detriment to strength. Since Odin users prioritise resistance training,
// we limit total HIIT exposure:
//   - Conditioning day: HIIT every 3rd week (≈1 HIIT session per 3-week
//     mesocycle, staying well under 2x/week chronic average)
//   - Resistance finisher: HIIT on last training day of even weeks
//     (≈2 HIIT finishers per 4-week block)
// Combined: ~1 HIIT exposure per 1.5-2 weeks, within the 2-3/week
// evidence range when accounting for total weekly frequency.
export const HIIT_CYCLING = {
  conditioning_day_interval_weeks: 3,
  finisher_even_week: true,
  finisher_last_resistance_day_only: true,
} as const;

export const HIIT_CYCLING_CITATIONS = [
  'WEWEGE_2017_HIIT_OBESITY',
  'WEAKLEY_2022_CONCURRENT_DOSE',
  'VIANA_2019_HIIT_FAT_LOSS',
] as const;

// ─── Beginner HIIT exclusion ─────────────────────────────────────────
// ACSM 2021: Previously untrained individuals require a base-building
// phase of regular moderate-intensity exercise before HIIT. Minimum
// 3 months for clinical populations; general recommendation is to
// establish an aerobic base first. Odin classifies 'beginner' as
// <6 months training history, so HIIT is withheld until intermediate.
export const BEGINNER_HIIT_EXCLUSION = true;

export const BEGINNER_HIIT_CITATIONS = ['ACSM_2021_GUIDELINES'] as const;

// ─── Baseline strength assessment ────────────────────────────────────
//
// CITATION KEYS (additional):
//
// ACSM_2021_PUSHUP_NORMS
//   American College of Sports Medicine. ACSM's Guidelines for Exercise
//   Testing and Prescription, 11th ed. Wolters Kluwer, 2021.
//   Chapter 4: Health-Related Physical Fitness Testing.
//   Finding: Normative push-up tables by age and sex classify muscular
//   endurance into percentile categories (poor → excellent).
//
// REYNOLDS_1999_PREDICTION
//   Reynolds JM, Gordon TJ, Robergs RA. Prediction of one repetition
//   maximum strength from multiple repetition maximum testing and
//   anthropometry. J Strength Cond Res. 1999;13(3):188-195.
//   Finding: All 7 tested prediction equations correlated r>0.95 with
//   actual squat 1RM in untrained subjects. Brzycki equation most
//   commonly recommended for ≤10 reps.
//
// EPLEY_1985_PREDICTION
//   Epley B. Poundage Chart. Boyd Epley Workout. 1985.
//   Formula: 1RM = weight × (1 + reps / 30).
//   Most widely validated across populations; linear model accurate
//   for 1-15 reps.
//
// BRZYCKI_1993_PREDICTION
//   Brzycki M. Strength Testing—Predicting a One-Rep Max from
//   Reps-to-Fatigue. J Phys Educ Recreat Dance. 1993;64(1):88-90.
//   Formula: 1RM = weight × 36 / (37 - reps).
//   Hyperbolic model; most accurate for ≤10 reps.
//
// RIPPETOE_2013_STRENGTH_STANDARDS
//   Rippetoe M, Baker A. Practical Programming for Strength Training,
//   3rd ed. The Aasgaard Company, 2013.
//   Finding: Bodyweight-ratio strength standards by training status and
//   sex for squat, bench, deadlift, and press.
//
// EXRX_STRENGTH_STANDARDS
//   ExRx.net. Weightlifting Strength Standards (Ages 18-39).
//   https://exrx.net/Testing/WeightLifting/SquatStandards
//   Finding: Population-derived bodyweight-ratio norms for major lifts
//   across untrained → elite categories by sex and bodyweight class.
//
// WOOD_2022_POPULATION_NORMS
//   Wood TM et al. Normative data for the squat, bench press and
//   deadlift exercises in powerlifting: Data from 809,986 competition
//   entries. J Sci Med Sport. 2024;27(8):550-556.
//   Finding: 10th-90th percentile strength ratios by sex, age, and
//   weight class from the largest competition dataset to date.
//
// MCGUIGAN_2017_PUSHUP_BENCH
//   Bartolomei S et al. Push-Ups are Able to Predict the Bench Press
//   1-RM and Constitute an Alternative for Measuring Maximum Upper Body
//   Strength Based on Load-Velocity Relationships. J Strength Cond Res.
//   2020.  PubMed: 32774533.
//   Finding: Large correlation (r=0.79) between ballistic push-up force
//   output and bench press 1RM.

// Bodyweight-ratio strength standards for untrained individuals.
// Sources: ExRx normative tables, Rippetoe/Baker Practical Programming 3rd ed.
// Expressed as fraction of bodyweight for estimated 1RM.
export const UNTRAINED_STRENGTH_RATIOS = {
  male: {
    squat: 0.75,
    hip_hinge: 1.0,
    horizontal_push: 0.5,
    horizontal_pull: 0.4,
    vertical_push: 0.35,
    vertical_pull: 0.5,
  },
  female: {
    squat: 0.5,
    hip_hinge: 0.65,
    horizontal_push: 0.3,
    horizontal_pull: 0.25,
    vertical_push: 0.2,
    vertical_pull: 0.35,
  },
} as const;

// Novice standards (3-6 months training). Rippetoe/ExRx "novice" tier.
export const NOVICE_STRENGTH_RATIOS = {
  male: {
    squat: 1.25,
    hip_hinge: 1.5,
    horizontal_push: 0.85,
    horizontal_pull: 0.7,
    vertical_push: 0.55,
    vertical_pull: 0.85,
  },
  female: {
    squat: 0.85,
    hip_hinge: 1.0,
    horizontal_push: 0.5,
    horizontal_pull: 0.45,
    vertical_push: 0.35,
    vertical_pull: 0.55,
  },
} as const;

// Intermediate standards (1-2 years). Rippetoe/ExRx "intermediate" tier.
export const INTERMEDIATE_STRENGTH_RATIOS = {
  male: {
    squat: 1.5,
    hip_hinge: 2.0,
    horizontal_push: 1.25,
    horizontal_pull: 1.0,
    vertical_push: 0.75,
    vertical_pull: 1.25,
  },
  female: {
    squat: 1.25,
    hip_hinge: 1.5,
    horizontal_push: 0.75,
    horizontal_pull: 0.6,
    vertical_push: 0.5,
    vertical_pull: 0.85,
  },
} as const;

export const STRENGTH_RATIO_CITATIONS = [
  'RIPPETOE_2013_STRENGTH_STANDARDS',
  'EXRX_STRENGTH_STANDARDS',
  'WOOD_2022_POPULATION_NORMS',
] as const;

// ACSM push-up normative categories by age decade and sex.
// Values represent minimum reps for each category boundary.
// Source: ACSM Guidelines 11th ed., Table 4.10.
export const PUSHUP_NORMS = {
  male: {
    '16-19': {
      poor: 0,
      below_average: 18,
      average: 23,
      above_average: 28,
      excellent: 39,
    },
    '20-29': {
      poor: 0,
      below_average: 17,
      average: 22,
      above_average: 29,
      excellent: 36,
    },
    '30-39': {
      poor: 0,
      below_average: 12,
      average: 17,
      above_average: 24,
      excellent: 30,
    },
    '40-49': {
      poor: 0,
      below_average: 10,
      average: 13,
      above_average: 20,
      excellent: 25,
    },
    '50-59': {
      poor: 0,
      below_average: 7,
      average: 10,
      above_average: 15,
      excellent: 21,
    },
    '60+': {
      poor: 0,
      below_average: 5,
      average: 8,
      above_average: 12,
      excellent: 18,
    },
  },
  female: {
    '16-19': {
      poor: 0,
      below_average: 11,
      average: 15,
      above_average: 20,
      excellent: 30,
    },
    '20-29': {
      poor: 0,
      below_average: 10,
      average: 14,
      above_average: 21,
      excellent: 30,
    },
    '30-39': {
      poor: 0,
      below_average: 8,
      average: 11,
      above_average: 17,
      excellent: 27,
    },
    '40-49': {
      poor: 0,
      below_average: 5,
      average: 8,
      above_average: 14,
      excellent: 24,
    },
    '50-59': {
      poor: 0,
      below_average: 2,
      average: 7,
      above_average: 11,
      excellent: 21,
    },
    '60+': {
      poor: 0,
      below_average: 2,
      average: 5,
      above_average: 12,
      excellent: 17,
    },
  },
} as const;

export const PUSHUP_NORM_CITATIONS = ['ACSM_2021_PUSHUP_NORMS'] as const;

// Field test → fitness tier adjustment multipliers.
// Applied to the base strength ratios to account for individual
// variation within the "untrained" population.
// An "excellent" pushup score suggests the individual is stronger
// than population average; a "poor" score suggests weaker.
export const FITNESS_TIER_ADJUSTMENTS = {
  poor: 0.8,
  below_average: 0.9,
  average: 1.0,
  above_average: 1.1,
  excellent: 1.2,
} as const;

// Age-based 1RM decline factor per decade after 40.
// Source: ExRx age-adjusted standards; Wood 2022 population norms
// show ~5% decline per decade in competition-level lifters.
export const AGE_DECLINE_PER_DECADE_AFTER_40 = 0.05;

export const BASELINE_ASSESSMENT_CITATIONS = [
  'ACSM_2021_PUSHUP_NORMS',
  'REYNOLDS_1999_PREDICTION',
  'EPLEY_1985_PREDICTION',
  'BRZYCKI_1993_PREDICTION',
  'RIPPETOE_2013_STRENGTH_STANDARDS',
  'EXRX_STRENGTH_STANDARDS',
  'WOOD_2022_POPULATION_NORMS',
  'MCGUIGAN_2017_PUSHUP_BENCH',
] as const;

// Merged registry of every real citation code, used to catch a hallucinated
// (plausible-looking but fake) citation in LLM-authored rationale_codes.
export const ALL_CITATION_CODES = new Set<string>([
  ...VOLUME_FILL_RATE_CITATIONS,
  ...MIN_SESSION_VOLUME_CITATIONS,
  ...EQUIPMENT_PREFERENCE_CITATIONS,
  ...FINISHER_DURATION_CITATIONS,
  ...HIIT_CYCLING_CITATIONS,
  ...BEGINNER_HIIT_CITATIONS,
  ...STRENGTH_RATIO_CITATIONS,
  ...PUSHUP_NORM_CITATIONS,
  ...BASELINE_ASSESSMENT_CITATIONS,
]);

// Structured form of the citation keys documented in the comment block above,
// for consumers (e.g. narrative synthesis) that need author/year/finding as
// data rather than prose. Transcribed from those comments — not a new source
// of truth; keep in sync with the comment block when citations change.
export type CitationEntry = {
  author: string;
  year: number;
  finding: string;
};

export const CITATION_REGISTRY: Record<string, CitationEntry> = {
  SCHOENFELD_2017_DOSE_RESPONSE: {
    author: 'Schoenfeld BJ, Ogborn D, Krieger JW',
    year: 2017,
    finding:
      '10+ sets per muscle per week is superior to fewer than 5; there is a graded dose-response across <5, 5-9, and 10+ weekly sets per muscle group.',
  },
  SCHOENFELD_2019_VOLUME_HYPERTROPHY: {
    author: 'Schoenfeld BJ et al.',
    year: 2019,
    finding:
      '45 weekly sets produced greater hypertrophy than 27, which produced greater hypertrophy than 9, in trained men.',
  },
  ISRAETEL_RP_VOLUME_LANDMARKS: {
    author: 'Israetel M, Hoffmann J',
    year: 2019,
    finding:
      'Maintenance volume is roughly 6 sets/muscle/week; minimum effective volume roughly 6-8; maximum adaptive volume 12-20; maximum recoverable volume varies by individual.',
  },
  ISRAETEL_RP_INDIRECT_VOLUME: {
    author: 'Israetel M',
    year: 2019,
    finding:
      "A compound movement's secondary/indirect muscle involvement counts toward that muscle's weekly volume, at roughly half the credit of a set where the muscle is the primary target.",
  },
  SABAG_2022_CONCURRENT_HIIT: {
    author: 'Sabag A et al.',
    year: 2018,
    finding:
      'HIIT may reduce interference with strength/hypertrophy gains compared to steady-state endurance when combined with resistance training; cycling HIIT showed more lower-body interference than running.',
  },
  MURLASITS_2018_CONCURRENT: {
    author: 'Murlasits Z et al.',
    year: 2018,
    finding:
      'Doing resistance training before endurance training preserves strength gains in programmes of 5+ weeks. Shorter endurance bouts (≤30 min) cause less interference than longer bouts (50-60+ min).',
  },
  VIANA_2019_HIIT_FAT_LOSS: {
    author: 'Viana RB et al.',
    year: 2019,
    finding:
      'HIIT and sprint interval training reduce total body fat mass (mean ~1.58 kg) with similar efficacy to moderate-intensity continuous training but roughly 40% less time commitment.',
  },
  WEWEGE_2017_HIIT_OBESITY: {
    author: 'Wewege M et al.',
    year: 2017,
    finding:
      'HIIT reduces total body fat mass by 1.38-2 kg in overweight and obese adults; 3+ sessions/week for 8+ weeks is most effective for body composition change.',
  },
  ACSM_2021_GUIDELINES: {
    author: 'American College of Sports Medicine',
    year: 2021,
    finding:
      'Previously sedentary or untrained individuals should complete a base-building phase of moderate-intensity exercise before starting HIIT. Progressive overload should not exceed a 10-20% volume increase per week.',
  },
  GENTIL_2017_MINIMUM_VOLUME: {
    author: 'Gentil P et al.',
    year: 2017,
    finding:
      'Even low-volume protocols (≤4 sets/muscle/week) produce substantial hypertrophy gains; the meaningful threshold is roughly 4-6 sets/week.',
  },
  KRIEGER_2010_SETS_META: {
    author: 'Krieger JW',
    year: 2010,
    finding:
      '2-3 sets per exercise produce greater hypertrophy than 1 set; 4-6 sets per exercise show additional but diminishing returns.',
  },
  SCHOENFELD_2021_LOAD_HYPERTROPHY: {
    author: 'Schoenfeld BJ et al.',
    year: 2021,
    finding:
      'External load of 30%+ 1RM produces comparable hypertrophy to heavy loads when taken to failure, but heavier loads are superior for maximal strength development.',
  },
  WEAKLEY_2022_CONCURRENT_DOSE: {
    author: 'Weakley J et al.',
    year: 2022,
    finding:
      'Endurance bouts of 30 minutes or less cause less interference with strength training than 50-60+ minute bouts. Twice-weekly endurance work has minimal interference; three times weekly shows a detriment. A 3-6 hour separation is recommended for same-day sessions.',
  },
  ACSM_2021_PUSHUP_NORMS: {
    author: 'American College of Sports Medicine',
    year: 2021,
    finding:
      'Normative push-up tables by age and sex classify muscular endurance into percentile categories from poor to excellent.',
  },
  REYNOLDS_1999_PREDICTION: {
    author: 'Reynolds JM, Gordon TJ, Robergs RA',
    year: 1999,
    finding:
      'All 7 tested one-rep-max prediction equations correlated at r>0.95 with actual squat 1RM in untrained subjects; the Brzycki equation is most commonly recommended for ≤10 reps.',
  },
  EPLEY_1985_PREDICTION: {
    author: 'Epley B',
    year: 1985,
    finding:
      'A linear formula (1RM = weight × (1 + reps / 30)) is the most widely validated one-rep-max prediction model across populations, accurate for 1-15 reps.',
  },
  BRZYCKI_1993_PREDICTION: {
    author: 'Brzycki M',
    year: 1993,
    finding:
      'A hyperbolic formula (1RM = weight × 36 / (37 - reps)) for predicting one-rep max from reps-to-fatigue is most accurate for ≤10 reps.',
  },
  RIPPETOE_2013_STRENGTH_STANDARDS: {
    author: 'Rippetoe M, Baker A',
    year: 2013,
    finding:
      'Bodyweight-ratio strength standards by training status and sex exist for the squat, bench press, deadlift, and overhead press.',
  },
  EXRX_STRENGTH_STANDARDS: {
    author: 'ExRx.net',
    year: 2023,
    finding:
      'Population-derived bodyweight-ratio strength norms for major lifts exist across untrained-to-elite categories, broken out by sex and bodyweight class.',
  },
  WOOD_2022_POPULATION_NORMS: {
    author: 'Wood TM et al.',
    year: 2024,
    finding:
      '10th-90th percentile strength ratios by sex, age, and weight class were derived from 809,986 powerlifting competition entries — the largest such dataset to date.',
  },
  MCGUIGAN_2017_PUSHUP_BENCH: {
    author: 'Bartolomei S et al.',
    year: 2020,
    finding:
      'There is a large correlation (r=0.79) between ballistic push-up force output and bench press one-rep max.',
  },
  HELMS_2016_RPE_SCALE: {
    author: 'Helms ER, Cronin J, Storey A, Zourdos MC',
    year: 2016,
    finding:
      "A target RPE (repetitions in reserve) and rep count can be converted to an estimated percentage of 1RM via a published correspondence table, letting load prescriptions track an athlete's RPE-based intensity progression.",
  },
};
