// Helpers for working with local calendar days. The app stores timestamps in UTC
// but most views operate on "the day" in the user's local timezone.

export function startOfDay(d: Date | string): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfDay(d: Date | string): Date {
  const date = new Date(d);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function toYMD(d: Date | string): string {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromYMD(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ageFromBirthDate(birth: Date | string | null | undefined): number | null {
  if (!birth) return null;
  const b = new Date(birth);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}
