import { filterProduct, generateWaterQueries } from '../productFilters';

describe('productFilters', () => {
  describe('filterProduct', () => {
    // Positive test cases (should be included)
    const positiveTests = [
      'Evian Eau minérale naturelle 1,5L',
      'Cristaline Eau de source 6x1,5L',
      'Volvic Eau minérale naturelle 50cl',
      'Hépar Eau minérale naturelle 1L',
      'Contrex Eau minérale naturelle pack 6x1L',
      'Vittel Eau minérale 1,5 litre',
      'Perrier Eau gazeuse 6×50cl',
      'Badoit Eau pétillante naturelle 1L',
      'Mont Roucous Eau de source 6 bouteilles 1,5L',
      'Saint-Amand Eau minérale naturelle lot 6'
    ];

    // Negative test cases (should be excluded)
    const negativeTests = [
      'Evian Eau aromatisée citron 50cl',
      'Volvic Juicy saveur pêche 1L',
      'Perrier Eau gazeuse menthe 33cl',
      'Badoit Eau pétillante aromatisée fraise',
      'Cristalline Thé glacé 1,5L',
      'Machine SodaStream pour eau gazeuse',
      'Carafe filtrante Brita',
      'Fontaine à eau distributeur',
      'Bonbonne 19L pour bureau',
      'Sirop concentration fruit rouge'
    ];

    positiveTests.forEach((title, index) => {
      test(`should include positive case ${index + 1}: ${title}`, () => {
        const result = filterProduct(title);
        expect(result.include).toBe(true);
        expect(result.exclude).toBe(false);
        expect(result.reasons.length).toBeGreaterThan(0);
      });
    });

    negativeTests.forEach((title, index) => {
      test(`should exclude negative case ${index + 1}: ${title}`, () => {
        const result = filterProduct(title);
        expect(result.exclude).toBe(true);
        expect(result.include).toBe(false);
        expect(result.reasons.length).toBeGreaterThan(0);
      });
    });

    test('should mark uncertain products', () => {
      const uncertainTitles = [
        'Eau préparation bébé',
        'Mélange minéral concentration',
        'Recharge pour fontaine'
      ];

      uncertainTitles.forEach(title => {
        const result = filterProduct(title);
        expect(result.uncertain).toBe(true);
        expect(result.include).toBe(false);
      });
    });

    test('should handle empty or invalid input', () => {
      const result = filterProduct('');
      expect(result.include).toBe(false);
      expect(result.uncertain).toBe(true);
    });
  });

  describe('generateWaterQueries', () => {
    test('should generate comprehensive query list', () => {
      const queries = generateWaterQueries();
      
      expect(queries.length).toBeGreaterThan(50);
      expect(queries).toContain('evian');
      expect(queries).toContain('evian 1,5 l');
      expect(queries).toContain('eau minérale');
      expect(queries).toContain('eau 50 cl');
      
      // Should not have duplicates
      const uniqueQueries = new Set(queries);
      expect(uniqueQueries.size).toBe(queries.length);
    });

    test('should include brand variations', () => {
      const queries = generateWaterQueries();
      
      expect(queries).toContain('evian');
      expect(queries).toContain('évian');
      expect(queries).toContain('cristaline');
      expect(queries).toContain('cristalline');
    });
  });
});