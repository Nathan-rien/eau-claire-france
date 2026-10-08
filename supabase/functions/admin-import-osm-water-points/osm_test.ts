import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { osmWaterPoint } from './osm.ts';

Deno.test('Only explicit drinking_water=yes is declared potable', () => {
  assertEquals(osmWaterPoint({ id: 1, lat: 48, lon: 2, tags: { drinking_water: 'yes' } }).statut_potabilite, 'declare_potable');
  assertEquals(osmWaterPoint({ id: 2, lat: 48, lon: 2 }).statut_potabilite, 'non_verifie');
});
Deno.test('Explicit drinking_water=no is declared non potable', () => {
  assertEquals(osmWaterPoint({ id: 3, lat: 48, lon: 2, tags: { drinking_water: 'no' } }).statut_potabilite, 'declare_non_potable');
});
Deno.test('Imported nodes retain stable references and never invent an inspection date', () => {
  const point = osmWaterPoint({ id: 42, lat: 48, lon: 2 });
  assertEquals(point.source_ref, 'osm:42');
  assertEquals(point.derniere_verification_at, null);
  assertEquals(point.description, null);
  assertEquals(point.accessibilite, null);
});