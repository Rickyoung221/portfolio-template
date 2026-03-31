/**
 * Whole calendar days from launchDate (local midnight) to today.
 * @param {string} launchDate ISO `YYYY-MM-DD`
 * @returns {{ value: string, unit: string } | null} null = invalid date
 */
export function getSiteAgeParts(launchDate) {
  const start = new Date(`${launchDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;

  const now = new Date();
  const startDay = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const d = Math.floor((today - startDay) / 86400000);

  if (d < 0) return { value: "0", unit: "days" };
  if (d === 1) return { value: "1", unit: "day" };
  return { value: String(d), unit: "days" };
}
