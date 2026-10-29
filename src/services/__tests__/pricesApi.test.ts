import { getLatestPriceRun, getPrices, getPriceSummaryRows } from '../pricesApi';

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

test('summary reads only its eight fields, without an exact count, with the same 300-row ordering', async () => {
  jest.clearAllMocks();
  await getPriceSummaryRows();
  expect(mockQuery.select).toHaveBeenCalledWith('brand, product_name, price_per_l_eur, price_total_eur, pack_count, unit_volume_l, scraped_at, created_at');
  expect(mockQuery.select.mock.calls.every((args: unknown[]) => args.length === 1)).toBe(true);
  expect(mockQuery.not.mock.calls).toEqual([
    ['brand', 'is', null], ['product_name', 'is', null], ['unit_volume_l', 'is', null],
    ['retailer_id', 'is', null], ['price_total_eur', 'is', null], ['price_per_l_eur', 'is', null],
  ]);
  expect(mockQuery.eq).toHaveBeenCalledWith('run_id', 'current-run');
  expect(mockQuery.order.mock.calls).toEqual([
    ['price_per_l_eur', { ascending: true }], ['scraped_at', { ascending: false }], ['id', { ascending: true }],
  ]);
  expect(mockQuery.limit).toHaveBeenLastCalledWith(300);
});

test('summary preserves fallback rows after a history error', async () => {
  const row = { brand: 'Cristaline', product_name: 'Eau de source', price_per_l_eur: 0.2 };
  const originalThen = mockQuery.then;
  let calls = 0;
  mockQuery.then = (resolve: (value: unknown) => unknown) => Promise.resolve(
    calls++ === 0 ? { data: null, error: { message: 'history unavailable' } } : { data: [row], error: null },
  ).then(resolve);
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  try {
    expect(await getPriceSummaryRows()).toEqual([row]);
    expect(calls).toBe(2);
  } finally {
    mockQuery.then = originalThen;
    warning.mockRestore();
  }
});