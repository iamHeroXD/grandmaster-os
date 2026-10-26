// Implementation of SuperMemo SM-2 algorithm for spaced repetition chess training

export interface RepetitionItem {
  easeFactor: number;        // default 2.5
  intervalDays: number;      // days until next review
  consecutiveSuccesses: number;
  nextReviewDate: string;    // ISO timestamp
}

export class SpacedRepetitionService {
  /**
   * Calculates new SM-2 interval and ease factor based on performance grade (0-5)
   * 5: Perfect response without hesitation or hints
   * 4: Correct response after some hesitation
   * 3: Correct response recalled with serious difficulty or with 1 hint
   * 2: Incorrect response, but remembered after solution shown
   * 1: Incorrect response, familiar with motif
   * 0: Complete blackout / total blunder
   */
  public static calculateNextReview(
    current: RepetitionItem,
    grade: number // 0 to 5
  ): RepetitionItem {
    const validGrade = Math.max(0, Math.min(5, Math.round(grade)));
    let { easeFactor, intervalDays, consecutiveSuccesses } = current;

    if (validGrade >= 3) {
      if (consecutiveSuccesses === 0) {
        intervalDays = 1;
      } else if (consecutiveSuccesses === 1) {
        intervalDays = 3;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
      consecutiveSuccesses += 1;
    } else {
      consecutiveSuccesses = 0;
      intervalDays = 1; // Due tomorrow
    }

    // New Ease Factor calculation: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - validGrade) * (0.08 + (5 - validGrade) * 0.02));
    if (easeFactor < 1.3) {
      easeFactor = 1.3;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);

    return {
      easeFactor: Number(easeFactor.toFixed(2)),
      intervalDays,
      consecutiveSuccesses,
      nextReviewDate: nextDate.toISOString(),
    };
  }

  public static isDue(nextReviewDateStr: string): boolean {
    if (!nextReviewDateStr) return true;
    const due = new Date(nextReviewDateStr).getTime();
    return Date.now() >= due;
  }
}
