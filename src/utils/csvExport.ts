import { Price } from '@/types/pricing';

export function generateCSV(prices: Price[]): string {
  const headers = [
    'retailer',
    'brand',
    'product_name',
    'pack_count',
    'unit_volume_l',
    'total_volume_l',
    'price_total_eur',
    'price_per_l_eur',
    'is_promo',
    'promo_label',
    'availability',
    'sku',
    'url',
    'scraped_at'
  ];

  const csvRows = [
    headers.join(','),
    ...prices.map(price => [
      escapeCSV(price.retailer_id),
      escapeCSV(price.brand),
      escapeCSV(price.product_name),
      price.pack_count || '',
      price.unit_volume_l || '',
      price.total_volume_l || '',
      price.price_total_eur || '',
      price.price_per_l_eur || '',
      price.is_promo ? 'true' : 'false',
      escapeCSV(price.promo_label || ''),
      escapeCSV(price.availability || ''),
      escapeCSV(price.sku || ''),
      escapeCSV(price.url || ''),
      price.scraped_at
    ].join(','))
  ];

  return csvRows.join('\n');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function downloadCSV(prices: Price[], filename = 'prices_latest.csv') {
  const csv = generateCSV(prices);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}