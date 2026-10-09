import { boundInput, calculateConsumption, calculateSavings, DEFAULT_INPUTS, FINISTERE_AVG, TARGET, INPUT_BOUNDS } from '../CrisisWaterCalculator';

describe('Finistère household consumption rules', () => {
  test('references department average 112 and northern target 56', () => {
    expect(FINISTERE_AVG).toBe(112);
    expect(TARGET).toBe(56);
  });
  test.each(Object.entries(INPUT_BOUNDS))('%s enforces the specified bounds', (key, [min, max]) => {
    expect(boundInput(key as keyof typeof INPUT_BOUNDS, -100)).toBe(min);
    expect(boundInput(key as keyof typeof INPUT_BOUNDS, 100)).toBe(max);
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
  test('selects three highest positive gains and converts them to per-person gains', () => {
    const savings = calculateSavings({ ...DEFAULT_INPUTS, baths: 1 });
    expect(savings.map(s => s.id)).toEqual(['shower', 'toilet', 'bath']);
    expect(savings[0].household).toBe(48);
    expect(savings[0].perPerson).toBe(24);
    expect(savings[1].household).toBe(44);
    expect(savings[2].household).toBeCloseTo(90 / 7);
  });
  test('one less laundry cycle saves the midpoint 60 litres weekly', () => {
    const savings = calculateSavings(DEFAULT_INPUTS);
    expect(savings.find(s => s.id === 'laundry')?.household).toBeCloseTo(60 / 7);
  });
  test('omits ineligible or negative-gain actions', () => {
    expect(calculateSavings({ ...DEFAULT_INPUTS, minutes: 2, toilet: 'dual', baths: 0, laundry: 0 })).toEqual([]);
    expect(calculateSavings({ ...DEFAULT_INPUTS, minutes: 20, baths: 1 }).some(s => s.id === 'bath')).toBe(false);
  });
});