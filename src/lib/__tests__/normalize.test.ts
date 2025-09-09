import { 
  parseFormat, 
  parsePrice, 
  guessBrand, 
  computePricePerL,
  generateUniqueHash,
  determineAvailability
} from '../normalize';

describe('parseFormat', () => {
  test('parses simple format', () => {
    expect(parseFormat('Eau 1,5L')).toEqual({
      pack_count: 1,
      unit_volume_l: 1.5,
      total_volume_l: 1.5
    });
  });

  test('parses pack format', () => {
    expect(parseFormat('Pack 6x1,5L')).toEqual({
      pack_count: 6,
      unit_volume_l: 1.5,
      total_volume_l: 9
    });
  });

  test('parses nested format', () => {
    expect(parseFormat('Lot 2x6x50cl')).toEqual({
      pack_count: 12,
      unit_volume_l: 0.5,
      total_volume_l: 6
    });
  });

  test('parses centiliters', () => {
    expect(parseFormat('Bouteille 50cl')).toEqual({
      pack_count: 1,
      unit_volume_l: 0.5,
      total_volume_l: 0.5
    });
  });

  test('handles no format', () => {
    expect(parseFormat('Eau minérale')).toEqual({
      pack_count: null,
      unit_volume_l: null,
      total_volume_l: null
    });
  });

  test('handles complex spacing', () => {
    expect(parseFormat('Pack 12 x 33 cl')).toEqual({
      pack_count: 12,
      unit_volume_l: 0.33,
      total_volume_l: 3.96
    });
  });
});

describe('parsePrice', () => {
  test('parses French decimal', () => {
    expect(parsePrice('4,98 €')).toBe(4.98);
  });

  test('parses with spaces', () => {
    expect(parsePrice('€ 2,50')).toBe(2.5);
  });

  test('handles no decimals', () => {
    expect(parsePrice('3€')).toBe(3);
  });

  test('handles empty string', () => {
    expect(parsePrice('')).toBeNull();
  });

  test('handles invalid text', () => {
    expect(parsePrice('abc')).toBeNull();
  });
});

describe('guessBrand', () => {
  test('detects Evian', () => {
    expect(guessBrand('Eau Evian 1,5L')).toBe('Evian');
  });

  test('detects Cristaline', () => {
    expect(guessBrand('Pack Cristaline 6x1L')).toBe('Cristaline');
  });

  test('detects Hépar with accent', () => {
    expect(guessBrand('Eau Hépar 1,5L')).toBe('Hépar');
  });

  test('detects brand with noise words', () => {
    expect(guessBrand('Eau minérale naturelle Volvic source 1L')).toBe('Volvic');
  });

  test('returns null for unknown brand', () => {
    expect(guessBrand('Eau inconnue 1L')).toBeNull();
  });
});

describe('computePricePerL', () => {
  test('computes price per liter', () => {
    expect(computePricePerL(4.98, 1.5)).toBe(3.32);
  });

  test('handles zero volume', () => {
    expect(computePricePerL(4.98, 0)).toBeNull();
  });

  test('handles null price', () => {
    expect(computePricePerL(null as any, 1.5)).toBeNull();
  });
});

describe('generateUniqueHash', () => {
  test('generates consistent hash', () => {
    const hash1 = generateUniqueHash('carrefour', 'SKU123', 'Evian 1,5L', 1.5, 4.98, '2024-01-01T10:00:00Z');
    const hash2 = generateUniqueHash('carrefour', 'SKU123', 'Evian 1,5L', 1.5, 4.98, '2024-01-01T10:00:00Z');
    expect(hash1).toBe(hash2);
  });

  test('generates different hash for different inputs', () => {
    const hash1 = generateUniqueHash('carrefour', 'SKU123', 'Evian 1,5L', 1.5, 4.98, '2024-01-01T10:00:00Z');
    const hash2 = generateUniqueHash('auchan', 'SKU123', 'Evian 1,5L', 1.5, 4.98, '2024-01-01T10:00:00Z');
    expect(hash1).not.toBe(hash2);
  });
});

describe('determineAvailability', () => {
  test('returns in_stock for add to cart button', () => {
    expect(determineAvailability(true)).toBe('in_stock');
  });

  test('returns out_of_stock for out of stock text', () => {
    expect(determineAvailability(false, 'Rupture de stock')).toBe('out_of_stock');
  });

  test('returns unknown by default', () => {
    expect(determineAvailability(false)).toBe('unknown');
  });
});