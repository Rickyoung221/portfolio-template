/** Human-readable wait hint from Ratelimit `reset` (ms timestamp). */
export default function formatWaitTime(reset) {
  const ms = reset - Date.now();
  if (ms <= 0) return "a moment";
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.ceil(s / 60)} min`;
}
