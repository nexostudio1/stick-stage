/**
 * How the stage is finished (`shots/finish.tsx` draws them). "flat" is the house look every
 * channel has used so far; "illustrated" is opt-in per skit (`finish`); "night" is The Catch's
 * night-shift world (`shots/nightFinish.tsx`): grain, a heavy vignette and a camera that never
 * stops drifting.
 */
export const FINISHES = ["flat", "illustrated", "night"] as const;
export type Finish = (typeof FINISHES)[number];
