import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { parseOverpass, ImportError, httpImportError } from './overpass.ts';
Deno.test('An HTTP 200 timeout remark is not a successful empty tile', () => {
  assertThrows(() => parseOverpass({ elements: [], remark: 'Query timed out' }), ImportError);
});
Deno.test('An empty valid tile is successful', () => { assertEquals(parseOverpass({ elements: [] }), []); });
Deno.test('Only drinking_water nodes are imported, not standalone water taps', () => {
  assertEquals(parseOverpass({ elements: [{ type: 'node', id: 1, lat: 48, lon: 2, tags: { man_made: 'water_tap' } }, { type: 'node', id: 2, lat: 48, lon: 2, tags: { amenity: 'drinking_water' } }] }).map(p => p.id), [2]);
});
Deno.test('Rate limits honor retry-after and database failures are not retried', () => {
  assertEquals(httpImportError(429, '15').retryAfterMs, 15000);
  assertEquals(httpImportError(429, null).code, 'rate_limit');
  assertEquals(new ImportError('db', 'database', false).retryable, false);
});