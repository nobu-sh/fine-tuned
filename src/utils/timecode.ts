/**
 * Creates duration string
 * @param {object} durObj The duration object
 * @returns {string}
 */
export function durationString(durObj: Record<string, number>) {
  return Object.values(durObj)
    .map((m) => (isNaN(m) ? 0 : m))
    .join(':');
}

/**
 * Parses milliseconds to consumable time object
 * @param {number} milliseconds The time in ms
 * @returns {TimeData}
 */
export function parseMS(milliseconds: number) {
  if (isNaN(milliseconds)) milliseconds = 0;
  const round = milliseconds > 0 ? Math.floor : Math.ceil;

  const r: TimeData = {
    days: round(milliseconds / 86400000),
    hours: round(milliseconds / 3600000) % 24,
    minutes: round(milliseconds / 60000) % 60,
    seconds: round(milliseconds / 1000) % 60
  };

  return r;
}

/**
 * Builds time code
 * @param {TimeData} duration The duration object
 * @returns {string}
 */
export function buildTimeCode(duration: TimeData) {
  const items = Object.keys(duration);
  const required = ['days', 'hours', 'minutes', 'seconds'];

  const parsed = items.filter((x) => required.includes(x)).map((m) => duration[m as keyof TimeData]);
  const final = parsed
    .slice(parsed.findIndex((x) => x !== 0))
    .map((x) => x.toString().padStart(2, '0'))
    .join(':');

  return final.length <= 3 ? `0:${final.padStart(2, '0') || 0}` : final;
}

export interface TimeData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
