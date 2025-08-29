export const normalize = (s?: string) =>
  (s ?? '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ');

export const key = (...parts: (string | undefined)[]) =>
  parts.map(p => normalize(p)).filter(Boolean).join('|');