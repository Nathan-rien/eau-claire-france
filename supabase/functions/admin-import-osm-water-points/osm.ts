export interface OsmNode {
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

export function osmWaterPoint(el: OsmNode) {
  const tags = el.tags || {};
  const description = [
    tags.name,
    tags.description,
    [tags['addr:housenumber'], tags['addr:street'], tags['addr:postcode'], tags['addr:city']].filter(Boolean).join(' '),
    tags.operator ? `Gestionnaire : ${tags.operator}` : null,
    tags.fee === 'no' ? 'Gratuit' : tags.fee === 'yes' ? 'Payant' : null,
    tags.bottle === 'yes' ? 'Remplissage de bouteille indiqué' : null,
  ].filter(Boolean).join(' · ').slice(0, 1000) || null;
  const accessibilite = [
    tags.opening_hours ? `Horaires : ${tags.opening_hours}` : null,
    tags.wheelchair === 'yes' ? 'Accessible en fauteuil roulant (déclaré)' : tags.wheelchair === 'no' ? 'Non accessible en fauteuil roulant (déclaré)' : tags.wheelchair === 'limited' ? 'Accessibilité fauteuil limitée' : null,
    tags.access ? `Accès : ${tags.access}` : null,
    tags.indoor === 'yes' ? 'En intérieur' : tags.indoor === 'no' ? 'En extérieur' : null,
    tags.seasonal === 'yes' ? 'Service saisonnier' : null,
  ].filter(Boolean).join(' · ').slice(0, 500) || null;
  return {
    source_ref: `osm:${el.id}`,
    type: 'fontaine_publique',
    latitude: el.lat,
    longitude: el.lon,
    description,
    accessibilite,
    statut_potabilite: tags.drinking_water === 'yes' ? 'declare_potable' : tags.drinking_water === 'no' ? 'declare_non_potable' : 'non_verifie',
    source_donnee: 'import_osm',
    statut_moderation: 'valide',
    // Import time is not an official inspection or sampling date.
    derniere_verification_at: null,
  };
}