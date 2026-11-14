/** Seat-top height of each seat part, as a fraction of standing figure height (× part size). */
export const SEAT_HEIGHT = {
  chair: 0.19,
  bench: 0.18,
  couch: 0.17,
  bed: 0.2,
  /** Story kit: sized for the shorter shape figures. */
  "story-bench": 0.07,
  "story-bed": 0.08,
  "story-sofa": 0.075,
  /** The `crew` kit's train seat. */
  "crew-train-seat": 0.19,
  /** The `crew` kit's meeting-room and backyard seats. */
  "crew-office-chair": 0.2,
  "crew-office-chair-front": 0.2,
  "crew-camp-chair": 0.17,
  /** The medieval kit's horse: a rider sits on its back. */
  horse: 0.62,
} as const;

/** Set part id → seat kind. */
export const SEAT_PARTS: Record<string, keyof typeof SEAT_HEIGHT> = {
  chair: "chair",
  bench: "bench",
  couch: "couch",
  bed: "bed",
  "story-bench": "story-bench",
  "story-bed": "story-bed",
  "story-sofa": "story-sofa",
  "crew-train-seat": "crew-train-seat",
  "crew-office-chair": "crew-office-chair",
  "crew-office-chair-front": "crew-office-chair-front",
  "crew-camp-chair": "crew-camp-chair",
  horse: "horse",
};

/** Seats too high for planted feet: the rider's feet hang (the hip still rests on the seat). */
export const HIGH_SEATS: ReadonlySet<string> = new Set(["horse"]);
