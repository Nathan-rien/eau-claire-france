// Données de référence pour le mapping marques-enseignes
// Ce fichier peut être utilisé pour importer des données ou comme référence

export interface BrandRetailerMapping {
  brand_name: string;
  retailer_slug: string;
  retailer_name: string;
  is_available: boolean;
  price_position: 'low' | 'medium' | 'high';
  notes?: string;
}

// Mapping de référence des marques d'eau par enseigne
export const brandRetailerMappings: BrandRetailerMapping[] = [
  // Carrefour
  { brand_name: 'cristaline', retailer_slug: 'carrefour', retailer_name: 'Carrefour', is_available: true, price_position: 'low' },
  { brand_name: 'vittel', retailer_slug: 'carrefour', retailer_name: 'Carrefour', is_available: true, price_position: 'medium' },
  { brand_name: 'volvic', retailer_slug: 'carrefour', retailer_name: 'Carrefour', is_available: true, price_position: 'medium' },
  { brand_name: 'perrier', retailer_slug: 'carrefour', retailer_name: 'Carrefour', is_available: true, price_position: 'high' },
  { brand_name: 'evian', retailer_slug: 'carrefour', retailer_name: 'Carrefour', is_available: true, price_position: 'high' },
  { brand_name: 'hepar', retailer_slug: 'carrefour', retailer_name: 'Carrefour', is_available: true, price_position: 'medium' },
  { brand_name: 'contrex', retailer_slug: 'carrefour', retailer_name: 'Carrefour', is_available: true, price_position: 'medium' },
  
  // E.Leclerc
  { brand_name: 'cristaline', retailer_slug: 'leclerc', retailer_name: 'E.Leclerc', is_available: true, price_position: 'low' },
  { brand_name: 'vittel', retailer_slug: 'leclerc', retailer_name: 'E.Leclerc', is_available: true, price_position: 'medium' },
  { brand_name: 'volvic', retailer_slug: 'leclerc', retailer_name: 'E.Leclerc', is_available: true, price_position: 'medium' },
  { brand_name: 'perrier', retailer_slug: 'leclerc', retailer_name: 'E.Leclerc', is_available: true, price_position: 'high' },
  { brand_name: 'evian', retailer_slug: 'leclerc', retailer_name: 'E.Leclerc', is_available: true, price_position: 'high' },
  { brand_name: 'hepar', retailer_slug: 'leclerc', retailer_name: 'E.Leclerc', is_available: true, price_position: 'medium' },
  
  // Intermarché
  { brand_name: 'cristaline', retailer_slug: 'intermarche', retailer_name: 'Intermarché', is_available: true, price_position: 'low' },
  { brand_name: 'vittel', retailer_slug: 'intermarche', retailer_name: 'Intermarché', is_available: true, price_position: 'medium' },
  { brand_name: 'evian', retailer_slug: 'intermarche', retailer_name: 'Intermarché', is_available: true, price_position: 'high' },
  { brand_name: 'perrier', retailer_slug: 'intermarche', retailer_name: 'Intermarché', is_available: true, price_position: 'high' },
  
  // Auchan
  { brand_name: 'cristaline', retailer_slug: 'auchan', retailer_name: 'Auchan', is_available: true, price_position: 'low' },
  { brand_name: 'vittel', retailer_slug: 'auchan', retailer_name: 'Auchan', is_available: true, price_position: 'medium' },
  { brand_name: 'evian', retailer_slug: 'auchan', retailer_name: 'Auchan', is_available: true, price_position: 'high' },
  
  // Casino
  { brand_name: 'cristaline', retailer_slug: 'casino', retailer_name: 'Casino', is_available: true, price_position: 'low' },
  { brand_name: 'vittel', retailer_slug: 'casino', retailer_name: 'Casino', is_available: true, price_position: 'medium' },
  { brand_name: 'perrier', retailer_slug: 'casino', retailer_name: 'Casino', is_available: true, price_position: 'high' },
  
  // Franprix
  { brand_name: 'cristaline', retailer_slug: 'franprix', retailer_name: 'Franprix', is_available: true, price_position: 'low' },
  { brand_name: 'vittel', retailer_slug: 'franprix', retailer_name: 'Franprix', is_available: true, price_position: 'medium' },
  { brand_name: 'evian', retailer_slug: 'franprix', retailer_name: 'Franprix', is_available: true, price_position: 'high' },
];

// Fonction pour obtenir le mapping d'une marque par enseigne
export function getBrandMapping(brandName: string, retailerSlug: string): BrandRetailerMapping | undefined {
  return brandRetailerMappings.find(m => 
    m.brand_name.toLowerCase() === brandName.toLowerCase() && 
    m.retailer_slug.toLowerCase() === retailerSlug.toLowerCase()
  );
}

// Fonction pour obtenir toutes les enseignes qui vendent une marque
export function getRetailersForBrand(brandName: string): BrandRetailerMapping[] {
  return brandRetailerMappings.filter(m => 
    m.brand_name.toLowerCase() === brandName.toLowerCase() && m.is_available
  );
}

// Fonction pour obtenir toutes les marques d'une enseigne
export function getBrandsForRetailer(retailerSlug: string): BrandRetailerMapping[] {
  return brandRetailerMappings.filter(m => 
    m.retailer_slug.toLowerCase() === retailerSlug.toLowerCase() && m.is_available
  );
}

// Format CSV pour importer les données (pour documentation)
export const csvFormat = `
brand_name,retailer_slug,retailer_name,is_available,price_position,notes
cristaline,carrefour,Carrefour,true,low,Marque économique
vittel,carrefour,Carrefour,true,medium,Marque standard
evian,carrefour,Carrefour,true,high,Marque premium
`;

export const csvHeaders = [
  'brand_name',
  'retailer_slug', 
  'retailer_name',
  'is_available',
  'price_position',
  'notes'
];