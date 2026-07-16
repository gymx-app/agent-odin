# Odin — Programme Architecture Decision Logic

## Purpose

Odin does not default to Upper/Lower or Push/Pull/Legs with a bolted-on conditioning block. Split selection, set-structure selection, load-vs-rep emphasis, and proximity-to-failure are outputs of a decision process driven by goal, training age, recovery capacity, session budget, and injury profile.

Every claim below is tagged:
- **[Meta-analysis]** — backed by a systematic review/meta-analysis, citation given.
- **[Single/few studies]** — backed by specific trials, not yet meta-analyzed; weaker but real evidence, citation given.
- **[Heuristic]** — a widely used practitioner framework with no direct RCT proving the specific thresholds. Flagged explicitly so Odin doesn't present it with false certainty. Still usable as a working model, but the Why tab should label it as a heuristic, not "proven."

Do not choose a split first and fit variables to it. Split is decided *last*, after frequency, volume, and recovery constraints are already fixed.

---

## 1. Split Selection

Inputs, in order of weight: days/week available (hard constraint), training age, primary goal, session time budget, recovery signal (sleep/stress/injury flags).

- **Frequency floor:** Training a muscle group ≥2x/week outperforms 1x/week on hypertrophy when weekly volume is *not* equated — this was the original conclusion of Schoenfeld, Ogborn & Krieger's 2016 meta-analysis (*Sports Medicine*, 25 studies). **[Meta-analysis]**
  Important correction to that original claim: a later, larger meta-analysis by the same lead author — Schoenfeld, Grgic & Krieger (2019, *Journal of Sports Sciences*) — found **no significant difference between higher and lower frequency when total weekly volume is equated.** In other words, frequency itself isn't the active ingredient — it's a vehicle for fitting more quality volume into the week without single sessions becoming too long or too fatiguing. **[Meta-analysis]** Odin should use frequency as a volume-distribution tool, not claim higher frequency is inherently superior.

- **Volume dose-response:** More weekly sets per muscle group produce more hypertrophy up to a point, with diminishing returns — Schoenfeld, Ogborn & Krieger's 2017 dose-response meta-analysis (*Journal of Sports Sciences*, 15 studies) found a graded positive relationship, with meaningfully diminishing returns appearing around ~10 sets/muscle group/week. A later Bayesian meta-regression (Aguiar et al./related dose-response work) corroborated a positive but diminishing-returns curve. **[Meta-analysis]** The exact numeric landmarks (MEV/MAV/MRV terminology, specific set counts per split type) are a practitioner framework (Israetel et al.) built on top of this dose-response data — useful as an operating model, but the specific thresholds themselves haven't been independently RCT-validated. **[Heuristic, grounded in real dose-response data]**

- **Practical split logic built from the above, not from a fixed template:**
  - 2–3 days/week → full body, so each muscle group still gets hit more than once weekly without needing more session-days than the person has.
  - 3–4 days/week → Upper/Lower, splits total weekly volume into fewer, larger sessions while still allowing 2x/week frequency per muscle group.
  - 5–6 days/week → PPL or PPL-repeat is defensible *only* if the person's target weekly volume is high enough that Upper/Lower would force single sessions to run too long or too fatiguing to complete with quality. This is a volume-fitting decision, not a rule that more days = better hypertrophy.
  - Return-to-training / high injury flag / low recovery signal → Full body or Upper/Lower regardless of days available, at reduced volume, until recovery trend stabilizes. This is a conservative default for safety, not something with a specific supporting trial — treat as **[Heuristic]**.
  - Fat loss / general health primary goal → split choice is secondary to adherence; do not force a higher-frequency split onto someone whose real constraint is consistency, not muscle-group frequency.

---

## 2. Conditioning — Integrated, Not Appended

The interference effect (concurrent endurance + resistance training blunting resistance adaptations) is real but **modality- and outcome-dependent, and smaller than commonly assumed for hypertrophy specifically.**

- Wilson et al.'s 2012 meta-analysis (*Journal of Strength and Conditioning Research*, 21 studies) found concurrent training reduced hypertrophy, strength, and power outcomes relative to resistance training alone, but **the effect was driven mainly by running-based endurance work, not cycling**, and was largest for power output, smaller for hypertrophy. **[Meta-analysis]**
- More recent, updated meta-analyses (Schumann et al.-line work through 2022, *Sports Medicine*) found whole-muscle hypertrophy and maximal strength are generally **not meaningfully compromised** by concurrent training; a small negative effect shows up specifically at the muscle-fiber level (mainly type I fibers) and for explosive/power output, more so with running than cycling. **[Meta-analysis]**

Practical implication for Odin: don't treat conditioning as automatically hostile to a hypertrophy or strength goal. The real levers are (a) modality — low-impact/cycling-style conditioning interferes less than running-style, (b) placement — conditioning after resistance work, not before, since pre-fatiguing the muscle for the primary lift degrades that stimulus (this ordering logic is standard practice, not itself a cited RCT finding — **[Heuristic]**), and (c) volume/frequency of the conditioning itself, since the negative correlation with hypertrophy/strength scales with how much endurance work is added, per Wilson et al.'s correlational sub-analysis.

So: minimize interference by modality choice and placement for strength/hypertrophy-primary phases, rather than removing conditioning altogether or bolting it onto every session by default.

---

## 3. Set Structure Selection

The honest picture from the literature: **most intensity techniques (drop sets, rest-pause, cluster sets) produce similar hypertrophy to straight sets when total training volume is equated.** Their real, evidenced benefit is *time efficiency* and, for cluster sets specifically, *maintained velocity/power output* — not a hypertrophy stimulus straight sets can't match. Odin should not oversell these as "better," only as situationally the right tool.

| Structure | What the evidence actually shows | Best use | Avoid when |
|---|---|---|---|
| **Straight sets** | Baseline condition against which everything else is compared; no confound from intra-set manipulation | Novices, technique acquisition, main compound lifts, whenever uncertain | Rarely — safe default |
| **Pyramid sets** | No direct meta-analysis isolating pyramid structure vs. straight sets on hypertrophy outcomes. Functionally it's a warm-up-into-work-set structure. **[Heuristic — commonly used, not separately validated]** | Main compound lifts where warm-up and top-set intensity both matter | Isolation work late in a session — added complexity, no evidenced extra benefit |
| **Cluster sets** | Intra-set rest (e.g. ~20–30s) maintains bar velocity and power output across a set far better than traditional sets — well-replicated in squat/clean-pull research (Haff et al. 2003; Tufano et al. 2016, *IJSPP*). **[Meta-analysis + multiple direct trials]** Evidence for *superior hypertrophy* over straight sets specifically is weak — a volume/effort-matched comparison found similar hypertrophy between cluster and traditional sets. **[Single study]** | Strength/power work, heavy technical compound lifts, advanced lifters chasing bar speed under load | Isolation/hypertrophy-only phases where power maintenance isn't the goal — pyramid or straight sets are simpler and equally effective |
| **Drop sets** | Similar hypertrophy and strength to straight sets when volume is equated (PubMed 34260860, rest-pause and drop-set trial). **[Single/few studies]** The real benefit is roughly halving session time while maintaining volume, per a 2021 narrative review on time-efficient training (Iversen et al., *Sports Medicine*). **[Narrative review, multiple trials cited]** That review also explicitly notes drop sets are best suited to single-joint/isolation exercises and are not advisable on compound free-weight lifts like the squat, for safety reasons. | Isolation/machine exercises, end of session, time-constrained hypertrophy work | Heavy compound barbell lifts |
| **Rest-pause** | Same picture as drop sets — comparable hypertrophy/strength to straight sets at equated volume, with a possible small edge for strength specifically (PubMed 34260860). Real benefit is time efficiency: trials show meaningfully more volume completed in less time versus traditional sets (Korak et al. 2017; comparable squat data). **[Few studies]** | Time-constrained hypertrophy work, intermediate–advanced lifters | Main strength lifts where bar speed/technique quality matters most in every rep |
| **Supersets** | Covered under the same time-efficient-training review — antagonist-pairing supersets roughly halve session time while maintaining volume. **[Narrative review]** No strong evidence supersets add stimulus beyond volume, only that they save time. | Time efficiency, hypertrophy/general fitness goals | Max-strength-focused sessions — elevated heart rate and residual fatigue reduce force output on the second exercise (mechanistically plausible, not separately RCT-tested — **[Heuristic]**) |
| **Giant sets (3+ exercises, one area)** | No dedicated trials found isolating giant sets from the general drop-set/superset/rest-pause literature above. Treat as an extension of the same time-efficiency logic, not a distinct evidenced technique. **[Heuristic]** | Advanced hypertrophy or metabolic-conditioning-in-a-fat-loss phase, used sparingly given high fatigue cost | Strength-primary phases, heavy compound work in the same block |

Practical rule for Odin: **default to straight or pyramid sets on heavy, technical, multi-joint lifts.** Reach for drop sets, rest-pause, or supersets on isolation/machine work primarily to save session time, not because they add stimulus straight sets can't. Reach for cluster sets specifically when the goal is maintaining velocity/power under load on strength-focused compound work.

---

## 4. Reps vs. Weight

- **Load doesn't matter much for hypertrophy across a wide range**, provided volume is equated and sets are taken close to failure — Schoenfeld et al.'s 2017 meta-analysis (*Journal of Strength and Conditioning Research*, 21 studies) found no meaningful hypertrophy difference between low-load and high-load training. Schoenfeld, Van Every & Plotkin's 2021 re-examination of the "repetition continuum" (*Sports*) reinforced this — hypertrophy is achievable across roughly a 5–35 rep range when effort and volume are matched. **[Meta-analysis]**
- **Load matters directly for strength/1RM outcomes** — the same body of evidence (and dedicated strength-outcome meta-analyses) shows heavier loads produce a real advantage for maximal strength specifically, even when hypertrophy is similar. **[Meta-analysis]**
- So the rule Odin should use is goal-specific, not phase-specific by default:
  - **Strength-primary goal:** load is the target variable — low reps, high %1RM, long rest.
  - **Hypertrophy-primary goal:** proximity to failure and total volume are the target variables, not a specific load. Rep range can vary widely without hurting the outcome.
  - **Novice / new movement pattern / return-to-training:** reps and ROM quality are the practical target before load progression, because technique needs to stabilize first — this is standard coaching practice, not itself a cited RCT finding. **[Heuristic]**
  - **Injury/joint-stress flag on file:** reps and pain-free ROM take priority over load regardless of phase, until the flag clears. **[Heuristic — clinically standard, not a specific RCT]**

---

## 5. Proximity to Failure

- **Training to failure produces only a trivial hypertrophy advantage over stopping short, and it costs more fatigue.** Refalo et al.'s 2022 meta-analysis (*Sports Medicine*, 15 studies) found a small effect size (ES = 0.19, 95% CI 0.00–0.37, p = 0.045) favoring set failure — real, but marginal, with no significant moderation by volume or relative load. A companion meta-analysis (Grgic et al. 2022, *Journal of Sport and Health Science*) reached a similar conclusion. **[Meta-analysis]**
- **RIR-based effort tracking is validated against bar velocity** — Zourdos et al. (2016) established a strong inverse relationship between RIR-based RPE and measured bar velocity (r = -0.77 to -0.88). **[Direct validation study]** However, accuracy of RIR self-report **degrades the further a set is from failure and at higher rep counts** (Zourdos et al. 2019; corroborated in a 2024 scoping review, Bastos et al., *Journal of Sports Sciences*). **[Multiple studies + scoping review]** This means RIR is a genuinely useful tool, but self-reported RIR on a set left at 4–5 reps in reserve is less trustworthy than RIR called near failure.
- **"Stimulus-to-fatigue ratio" / "junk volume"** is a widely used practitioner framework, not a single peer-reviewed finding — I was wrong to attribute it to a specific study in the earlier draft. It's a reasonable model built on top of the Refalo/Grgic failure-vs-non-failure findings above (failure adds a small amount of stimulus at a fatigue cost), but treat the specific "ratio" language as a coaching heuristic, not a cited law. **[Heuristic]**

Practical rule for Odin, grounded in the above rather than assumed:
- Given the marginal-but-real advantage of failure training and the fatigue cost, a reasonable default is stopping most sets 1–3 RIR, since RIR estimation is most accurate in that zone anyway (per Zourdos et al.), with occasional sets taken closer to or to failure on lower-injury-risk exercises (isolation/machine work) — this specific "most sets 1-3 RIR, some closer" split isn't itself a tested protocol, it's a synthesis of the failure-effect-size finding and the RIR-accuracy finding. **[Heuristic built on cited evidence, not itself directly tested]**
- Heavy technical compound lifts should bias toward the conservative end of that range, since technical breakdown under fatigue is a plausible injury mechanism, though this specific injury-risk claim doesn't have a dedicated RCT behind it — it's a reasonable inference from biomechanics literature on fatigue-related form degradation, not a hypertrophy/strength outcome study. **[Heuristic]**
- Low recovery signal → shift the whole session's RIR target further from failure. This is a fatigue-management judgment call, not a cited finding.

---

## 6. Required Output Behavior

For every programme Odin generates, attach to each block/exercise:

1. **Set structure chosen** and why, tagged by the evidence tier above (meta-analysis / few studies / heuristic) — don't present a heuristic as settled science in the Why tab.
2. **Reps-vs-load target** for that block and which case in Section 4 applies.
3. **RIR/proximity-to-failure target** and which case in Section 5 applies.
4. **Split rationale at the programme level** (once per programme), citing the frequency/volume evidence in Section 1, with the frequency-vs-volume distinction stated explicitly (frequency is a volume-distribution tool, not independently superior).

Where Odin doesn't have a real citation for a choice, it should say so in the Why tab rather than manufacturing a study — a confidence score of "heuristic, not directly tested" is more useful and more honest than a false citation.
