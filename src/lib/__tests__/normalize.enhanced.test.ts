import { 
  parseFormat, 
  parsePrice, 
  guessBrand, 
  computePricePerL,
  computeFallbackPricePerL,
  generateUniqueHash,
  determineAvailability
} from '../normalize';

describe('parseFormat - Enhanced tests', () => {
  test('parses nested formats correctly', () => {
    expect(parseFormat('2x6x50cl')).toEqual({
      pack_count: 12,
      unit_volume_l: 0.5,
      total_volume_l: 6
    });
  });

  test('ignores bonus offers', () => {
    expect(parseFormat('6×1 l + 2 offertes')).toEqual({
      pack_count: 6,
      unit_volume_l: 1,
      total_volume_l: 6
    });

    expect(parseFormat('Pack 12x50cl + 2 gratuites')).toEqual({
      pack_count: 12,
      unit_volume_l: 0.5,
      total_volume_l: 6
    });
  });

  test('handles various spacing in pack formats', () => {
    expect(parseFormat('12 x 1 l')).toEqual({
      pack_count: 12,
      unit_volume_l: 1,
      total_volume_l: 12
    });
  });

  test('handles promo lot formats', () => {
    expect(parseFormat('Lot promo 4x1,5L')).toEqual({
      pack_count: 4,
      unit_volume_l: 1.5,
      total_volume_l: 6
    });
  });
});

describe('parsePrice - Enhanced tests', () => {
  test('handles strikethrough prices correctly', () => {
    expect(parsePrice('̶3̶,̶9̶8̶ € 2,50 €')).toBe(2.5);
    expect(parsePrice('Prix barré 4,99€ Prix final 3,75€')).toBe(3.75);
  });

  test('handles euro symbol variations', () => {
    expect(parsePrice('€ 4,25')).toBe(4.25);
    expect(parsePrice('4,25€')).toBe(4.25);
    expect(parsePrice('4,25 EUR')).toBe(4.25);
  });

  test('handles non-breaking spaces', () => {
    expect(parsePrice('3,75 €')).toBe(3.75);
    expect(parsePrice('3,75\u00A0€')).toBe(3.75); // Non-breaking space
  });

  test('handles decimal variations', () => {
    expect(parsePrice('4,99')).toBe(4.99);
    expect(parsePrice('4.99')).toBe(4.99);
  });
});

describe('guessBrand - Enhanced tests', () => {
  test('detects Hépar variations correctly', () => {
    expect(guessBrand('Eau Hepar 1,5L')).toBe('Hépar');
    expect(guessBrand('HEPAR eau riche en magnésium')).toBe('Hépar');
    expect(guessBrand('Hépar source naturelle')).toBe('Hépar');
  });

  test('detects Saint-Amand variations', () => {
    expect(guessBrand('Eau Saint-Amand 1L')).toBe('Saint-Amand');
    expect(guessBrand('St Amand eau minérale')).toBe('Saint-Amand');
    expect(guessBrand('Saint Amand source')).toBe('Saint-Amand');
  });

  test('detects Quézac variations', () => {
    expect(guessBrand('Eau Quezac 1L')).toBe('Quézac');
    expect(guessBrand('QUEZAC eau gazeuse')).toBe('Quézac');
    expect(guessBrand('Quézac pétillante')).toBe('Quézac');
  });

  test('ignores noise words correctly', () => {
    expect(guessBrand('Eau minérale naturelle Volvic source 1L')).toBe('Volvic');
    expect(guessBrand('Pack lot eau Evian plate 6x1L')).toBe('Evian');
  });
});

describe('computeFallbackPricePerL', () => {
  test('returns existing price_per_l_eur if available', () => {
    const price = {
      price_per_l_eur: 2.5,
      price_total_eur: 3.75,
      total_volume_l: 1.5
    };
    expect(computeFallbackPricePerL(price)).toBe(2.5);
  });

  test('calculates fallback when price_per_l_eur is missing', () => {
    const price = {
      price_per_l_eur: null,
      price_total_eur: 3.75,
      total_volume_l: 1.5
    };
    expect(computeFallbackPricePerL(price)).toBe(2.5);
  });

  test('returns null when cannot calculate fallback', () => {
    const price = {
      price_per_l_eur: null,
      price_total_eur: null,
      total_volume_l: 1.5
    };
    expect(computeFallbackPricePerL(price)).toBeNull();
  });

  test('returns null when volume is zero or missing', () => {
    const price = {
      price_per_l_eur: null,
      price_total_eur: 3.75,
      total_volume_l: 0
    };
    expect(computeFallbackPricePerL(price)).toBeNull();

    const price2 = {
      price_per_l_eur: null,
      price_total_eur: 3.75,
      total_volume_l: null
    };
    expect(computeFallbackPricePerL(price2)).toBeNull();
  });
});