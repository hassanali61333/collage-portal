export function percentage(total, obtain) {
  const t = Number(total);
  const o = Number(obtain);

  // invalid ya zero total
  if (!t || t <= 0 || isNaN(t) || isNaN(o)) return 0;

  const result = (o / t) * 100;

  // 0 se 100 ke beech clamp
  return Math.min(Math.max(result, 0), 100);
}