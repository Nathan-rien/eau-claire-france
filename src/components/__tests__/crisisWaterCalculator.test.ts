import { boundInput, boundMeter, calculateConsumption, calculateLevers, DEFAULT_INPUTS, FINISTERE_AVG, TARGET, INPUT_BOUNDS, METER_BOUNDS, PRESETS, volumeFromIndexes, measuredPerPersonPerDay, allAvailableLevers } from '../../lib/crisisWaterModel';

describe('Finistère household consumption rules', () => {
  test('references department average 112 and northern target 56', () => {
    expect(FINISTERE_AVG).toBe(112);
    expect(TARGET).toBe(56);
  });
  test.each(Object.entries(INPUT_BOUNDS))('%s enforces the specified bounds', (key, [min, max]) => {
    expect(boundInput(key as keyof typeof INPUT_BOUNDS, -100)).toBe(min);
    expect(boundInput(key as keyof typeof INPUT_BOUNDS, 100)).toBe(max);
  });
  test('meter bounds: days 1–366, index/volume 0–999999 with 3 decimals', () => {
    expect(METER_BOUNDS.days).toEqual([1, 366]);
    expect(boundMeter('days', 0)).toBe(1);
    expect(boundMeter('days', 500)).toBe(366);
    expect(boundMeter('index', -1)).toBe(0);
    expect(boundMeter('index', 2e6)).toBe(999999);
    expect(boundMeter('volume', 1.23456)).toBe(1.235);
  });
  test('drinking and cleaning alone range from 11 per person plus 5 to 12 plus 10 per household', () => {
    const result = calculateConsumption({ ...DEFAULT_INPUTS, showers: 0, baths: 0, flushes: 0, laundry: 0, dishes: 0 });
    expect(result.low).toBe(27);
    expect(result.high).toBe(34);
    expect(result.central).toBe(15.25);
  });
  test('daily five minute showers use 12 litres per minute', () => {
    const base = calculateConsumption({ ...DEFAULT_INPUTS, showers: 0 });
    expect(calculateConsumption(DEFAULT_INPUTS).low - base.low).toBe(120);
  });
  test('a weekly bath uses 150 litres', () => {
    const base = calculateConsumption(DEFAULT_INPUTS);
    expect(calculateConsumption({ ...DEFAULT_INPUTS, baths: 7 }).low - base.low).toBeCloseTo(150);
  });
  test('classic toilet uses 10 litres per flush', () => {
    const base = calculateConsumption({ ...DEFAULT_INPUTS, flushes: 0 });
    expect(calculateConsumption(DEFAULT_INPUTS).low - base.low).toBeCloseTo(80);
  });
  test('dual toilet uses a 3–6 litre range', () => {
    const base = calculateConsumption({ ...DEFAULT_INPUTS, flushes: 0 });
    const dual = calculateConsumption({ ...DEFAULT_INPUTS, toilet: 'dual' });
    expect(dual.low - base.low).toBeCloseTo(24);
    expect(dual.high - base.high).toBeCloseTo(48);
  });
  test('laundry uses 40–80 litres per cycle', () => {
    const base = calculateConsumption({ ...DEFAULT_INPUTS, laundry: 0 });
    const wash = calculateConsumption({ ...DEFAULT_INPUTS, laundry: 7 });
    expect(wash.low - base.low).toBeCloseTo(40);
    expect(wash.high - base.high).toBeCloseTo(80);
  });
  test('dishwasher uses 15 litres per cycle', () => {
    const base = calculateConsumption({ ...DEFAULT_INPUTS, dishes: 0 });
    expect(calculateConsumption({ ...DEFAULT_INPUTS, dishes: 7 }).low - base.low).toBeCloseTo(15);
  });
  test('handwashing replaces machine cycles with 15 litres per person daily', () => {
    const base = calculateConsumption({ ...DEFAULT_INPUTS, dishes: 0 });
    expect(calculateConsumption({ ...DEFAULT_INPUTS, dishMode: 'hand', dishes: 14 }).low - base.low).toBeCloseTo(30);
  });
  test('default fourchette and midpoint divide household totals by two people', () => {
    const result = calculateConsumption(DEFAULT_INPUTS);
    expect(result.low).toBeCloseTo(252.714285714);
    expect(result.high).toBeCloseTo(276.857142857);
    expect(result.perPersonLow).toBeCloseTo(126.357142857);
    expect(result.perPersonHigh).toBeCloseTo(138.428571429);
    expect(result.central).toBeCloseTo(132.392857143);
  });
  test('a leaking toilet adds 82.19 to 684.93 litres daily, removed by fixLeak', () => {
    const base = calculateConsumption(DEFAULT_INPUTS);
    const leak = calculateConsumption({ ...DEFAULT_INPUTS, leak: true });
    expect(Number((leak.low - base.low).toFixed(2))).toBe(82.19);
    expect(Number((leak.high - base.high).toFixed(2))).toBe(684.93);
    const fixed = calculateConsumption({ ...DEFAULT_INPUTS, leak: true }, { fixLeak: true });
    expect(fixed.low).toBeCloseTo(base.low);
    expect(fixed.high).toBeCloseTo(base.high);
  });
  test('all available levers are recalculated together, not summed', () => {
    const levers = allAvailableLevers(DEFAULT_INPUTS);
    expect(levers).toEqual({ shorterShower: true, dualFlush: true, bathToShower: false, fewerLaundry: true, fixLeak: false });
    const r = calculateConsumption(DEFAULT_INPUTS, levers);
    expect(r.low).toBeCloseTo(143);
    expect(r.high).toBeCloseTo(185.4285714);
    expect(r.perPersonLow).toBeCloseTo(71.5);
    expect(r.perPersonHigh).toBeCloseTo(92.7142857);
  });
  test('individual lever gains use low and high bounds separately', () => {
    const levers = calculateLevers(DEFAULT_INPUTS);
    const get = (id: string) => levers.find(l => l.id === id)!;
    expect(get('shorterShower').householdLow).toBeCloseTo(48);
    expect(get('shorterShower').householdHigh).toBeCloseTo(48);
    expect(get('shorterShower').perPersonLow).toBeCloseTo(24);
    expect(get('dualFlush').householdLow).toBeCloseTo(32);
    expect(get('dualFlush').householdHigh).toBeCloseTo(56);
    expect(get('fewerLaundry').householdLow).toBeCloseTo(5.714, 3);
    expect(get('fewerLaundry').householdHigh).toBeCloseTo(11.429, 3);
    expect(levers.map(l => l.id)).toEqual(['shorterShower', 'dualFlush', 'fewerLaundry']);
  });
  test('replacing a weekly bath saves 90/7 litres for the household', () => {
    const bath = calculateLevers({ ...DEFAULT_INPUTS, baths: 1 }).find(l => l.id === 'bathToShower')!;
    expect(bath.householdLow).toBeCloseTo(90 / 7);
    expect(bath.householdHigh).toBeCloseTo(90 / 7);
  });
  test('unavailable levers are absent', () => {
    expect(calculateLevers({ ...DEFAULT_INPUTS, minutes: 3 }).some(l => l.id === 'shorterShower')).toBe(false);
    expect(calculateLevers({ ...DEFAULT_INPUTS, minutes: 2, toilet: 'dual', baths: 0, laundry: 0 })).toEqual([]);
    expect(calculateLevers({ ...DEFAULT_INPUTS, minutes: 20, baths: 1 }).some(l => l.id === 'bathToShower')).toBe(false);
  });
  test('meter measurement', () => {
    expect(volumeFromIndexes(100, 112)).toBe(12);
    expect(volumeFromIndexes(112, 100)).toBeNull();
    expect(measuredPerPersonPerDay({ volumeM3: 12, days: 30, people: 2 })).toBe(200);
    expect(measuredPerPersonPerDay({ volumeM3: -1, days: 30, people: 2 })).toBeNull();
    expect(measuredPerPersonPerDay({ volumeM3: 12, days: 0, people: 2 })).toBeNull();
    expect(measuredPerPersonPerDay({ volumeM3: 12, days: 30, people: 0 })).toBeNull();
  });
  test.each(PRESETS)('preset $label respects INPUT_BOUNDS', ({ input }) => {
    for (const [key, [min, max]] of Object.entries(INPUT_BOUNDS)) {
      const v = input[key as keyof typeof INPUT_BOUNDS];
      expect(v).toBeGreaterThanOrEqual(min);
      expect(v).toBeLessThanOrEqual(max);
    }
  });
});
