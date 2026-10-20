export type ImportErrorCode = 'rate_limit' | 'timeout' | 'upstream_http' | 'invalid_response' | 'database' | 'network';
export class ImportError extends Error {
  constructor(message: string, public code: ImportErrorCode, public retryable = true, public retryAfterMs = 2000) {
    super(message);
  }
}
export function parseOverpass(data: unknown): import('./osm.ts').OsmNode[] {
  if (!data || typeof data !== 'object') throw new ImportError('Réponse OpenStreetMap invalide', 'invalid_response');
  const value = data as { elements?: unknown; remark?: string };
  if (value.remark) throw new ImportError(value.remark, /timed out|timeout/i.test(value.remark) ? 'timeout' : 'upstream_http');
  if (!Array.isArray(value.elements)) throw new ImportError('Liste de points absente', 'invalid_response');
  return value.elements.filter((el) => el?.type === 'node' && el.tags?.amenity === 'drinking_water' && Number.isFinite(el.id) && Number.isFinite(el.lat) && Number.isFinite(el.lon));
}
export function httpImportError(status: number, retryAfter: string | null) {
  return new ImportError(`Overpass HTTP ${status}`, status === 429 ? 'rate_limit' : 'upstream_http', status === 429 || status === 406 || status >= 500, Math.min(60000, Math.max(2000, Number(retryAfter) * 1000 || 2000)));
}