import { newOsmImportProgress, remainingOsmTiles, osmRetryDelay, osmTileStatus } from '../osmImportProgress';

describe('OSM remaining sector recovery', () => {
  test('resumption skips processed sectors and retains failed sectors', () => {
    const progress = newOsmImportProgress();
    progress.completed = [0, 1];
    progress.failed = { '2': 'timeout' };
    expect(remainingOsmTiles(progress)).toHaveLength(254);
    expect(remainingOsmTiles(progress).slice(0, 2)).toEqual([2, 3]);
  });
  test('progress distinguishes processed, current, failed and pending sectors', () => {
    const progress = newOsmImportProgress();
    progress.completed = [0];
    progress.currentTile = 1;
    progress.failed = { '1': 'old error', '2': 'timeout' };
    expect([0, 1, 2, 3].map(tile => osmTileStatus(progress, tile))).toEqual(['completed', 'running', 'failed', 'pending']);
  });
  test('automatic retry backs off and honors a longer provider delay', () => {
    expect([0, 1, 2].map(attempt => osmRetryDelay(attempt))).toEqual([2000, 4000, 8000]);
    expect(osmRetryDelay(1, 15000)).toBe(15000);
  });
});