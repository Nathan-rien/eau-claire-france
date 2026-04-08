export function parseCSV(input: string) {
  // Supprime BOM éventuel
  const text = input.replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);

  if (lines.length === 0) return { headers: [], rows: [] };

  // Détection séparateur sur l'en-tête
  const headerLine = lines[0];
  const sep = headerLine.includes(";") ? ";" : ",";
  const headers = headerLine.split(sep).map(h => h.trim());

  const rows = lines.slice(1).map(line => {
    const cells = line.split(sep).map(c => c.trim());
    const obj: Record<string,string> = {};
    headers.forEach((h, i) => { obj[h] = cells[i] ?? ""; });
    return obj;
  });

  return { headers, rows };
}

export const toNumber = (v?: string) => {
  if (!v || !String(v).trim()) return undefined;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
};