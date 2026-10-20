export const OSM_IMPORT_STORAGE_KEY = 'infoeau-osm-import-v2';
export const OSM_IMPORT_GRID = 16;
export interface OsmImportProgress {
  completed: number[];
  failed: Record<string, string>;
  created: number;
  updated: number;
  received: number;
  requests: number;
  requestSuccesses: number;
  autoResume: boolean;
  currentTile: number | null;
  retryAt: number | null;
}
export const newOsmImportProgress = (): OsmImportProgress => ({ completed: [], failed: {}, created: 0, updated: 0, received: 0, requests: 0, requestSuccesses: 0, autoResume: false, currentTile: null, retryAt: null });
export const remainingOsmTiles = (progress: OsmImportProgress) => Array.from({ length: OSM_IMPORT_GRID ** 2 }, (_, tile) => tile).filter(tile => !progress.completed.includes(tile));
export const osmRetryDelay = (attempt: number, retryAfterMs = 0) => Math.max(2000 * 2 ** attempt, Number.isFinite(retryAfterMs) ? retryAfterMs : 0);
export function osmTileStatus(progress: OsmImportProgress, tile: number) {
  if (progress.completed.includes(tile)) return 'completed';
  if (progress.currentTile === tile) return 'running';
  return progress.failed[String(tile)] ? 'failed' : 'pending';
}
export function readOsmImportProgress(): OsmImportProgress {
  try {
    const value = JSON.parse(localStorage.getItem(OSM_IMPORT_STORAGE_KEY) || 'null');
    if (value && Array.isArray(value.completed) && value.completed.every((n: unknown) => Number.isInteger(n) && Number(n) >= 0 && Number(n) < OSM_IMPORT_GRID ** 2) && value.failed && typeof value.failed === 'object' && ['created', 'updated', 'received', 'requests', 'requestSuccesses'].every(k => Number.isFinite(value[k]) && value[k] >= 0)) return { ...newOsmImportProgress(), ...value, completed: [...new Set<number>(value.completed)], currentTile: null, autoResume: value.autoResume === true, retryAt: Number.isFinite(value.retryAt) ? value.retryAt : null };
  } catch { /* Missing/corrupt progress starts a new import, never authorizes it. */ }
  return newOsmImportProgress();
}