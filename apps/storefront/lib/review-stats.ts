export type ReviewSummary = {
  average: number;
  count: number;
};

export function computeReviewSummary(ratings: number[]): ReviewSummary | null {
  if (ratings.length === 0) return null;
  const sum = ratings.reduce((a, b) => a + b, 0);
  const average = Math.round((sum / ratings.length) * 10) / 10;
  return { average, count: ratings.length };
}

export function formatReviewAverage(average: number): string {
  return average % 1 === 0 ? average.toFixed(1) : average.toFixed(1);
}
