import { getLatestPriceRun, getPrices } from '../pricesApi';

const mockResult = { data: [], error: null, count: 150 };
const mockQuery: any = {};
for (const method of ['select', 'not', 'order', 'limit', 'eq', 'range']) {
  mockQuery[method] = jest.fn(() => mockQuery);
}
mockQuery.maybeSingle = jest.fn(async () => ({ data: { run_id: 'current-run' }, error: null }));
mockQuery.then = (resolve: (value: typeof mockResult) => unknown) => Promise.resolve(mockResult).then(resolve);

jest.mock('@/integrations/supabase/client', () => ({
  supabase: { from: () => mockQuery },
}));

test('latest run is reused concurrently and expires after the short two-minute cache', async () => {
  jest.spyOn(Date, 'now').mockReturnValue(1000);
  await Promise.all([getLatestPriceRun(), getLatestPriceRun()]);
  expect(mockQuery.maybeSingle).toHaveBeenCalledTimes(1);
  jest.spyOn(Date, 'now').mockReturnValue(120999);
  await getLatestPriceRun();
  expect(mockQuery.maybeSingle).toHaveBeenCalledTimes(1);
  jest.spyOn(Date, 'now').mockReturnValue(121000);
  await getLatestPriceRun();
  expect(mockQuery.maybeSingle).toHaveBeenCalledTimes(2);
  jest.restoreAllMocks();
});

test('first 50 prices and next 50 prices use non-overlapping ranges', async () => {
  await getPrices({ limit: 50 }, 0);
  expect(mockQuery.range).toHaveBeenLastCalledWith(0, 49);
  await getPrices({ limit: 50 }, 50);
  expect(mockQuery.range).toHaveBeenLastCalledWith(50, 99);
});

test('an explicit URL page size can be respected for subsequent batches', async () => {
  await getPrices({ limit: 75 }, 75);
  expect(mockQuery.range).toHaveBeenLastCalledWith(75, 149);
});