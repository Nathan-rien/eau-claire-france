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
}
export const newOsmImportProgress = (): OsmImportProgress => ({ completed: [], failed: {}, created: 0, updated: 0, received: 0, requests: 0, requestSuccesses: 0 });
export function readOsmImportProgress(): OsmImportProgress {
  try {
    const value = JSON.parse(localStorage.getItem(OSM_IMPORT_STORAGE_KEY) || 'null');
    if (value && Array.isArray(value.completed) && value.completed.every((n: unknown) => Number.isInteger(n) && Number(n) >= 0 && Number(n) < OSM_IMPORT_GRID ** 2) && value.failed && typeof value.failed === 'object' && ['created', 'updated', 'received', 'requests', 'requestSuccesses'].every(k => Number.isFinite(value[k]) && value[k] >= 0)) return value;
  } catch { /* Missing/corrupt progress starts a new import, never authorizes it. */ }
  return newOsmImportProgress();
}