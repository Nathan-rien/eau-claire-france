import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ExportOptions {
  includeHistory?: boolean;
  retailerId?: string;
  brand?: string;
  dateFrom?: string;
  dateTo?: string;
}

export class CSVExportService {
  private static formatCSVValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return String(value);
  }

  private static generateCSVContent(data: any[], headers: string[]): string {
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => this.formatCSVValue(row[header])).join(',')
      )
    ];
    return csvRows.join('\n');
  }

  static async exportLatestPrices(options: ExportOptions = {}): Promise<void> {
    try {
      let query = supabase
        .from('prices')
        .select(`
          *,
          retailers(name),
          runs(started_at, status)
        `)
        .order('scraped_at', { ascending: false });

      if (options.retailerId) {
        query = query.eq('retailer_id', options.retailerId);
      }
      
      if (options.brand) {
        query = query.ilike('brand', `%${options.brand}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const headers = [
        'retailer_name',
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
        'scraped_at',
        'run_status'
      ];

      const exportData = data?.map(price => ({
        retailer_name: 'N/A', // Will be populated via separate query if needed
        brand: price.brand,
        product_name: price.product_name,
        pack_count: price.pack_count,
        unit_volume_l: price.unit_volume_l,
        total_volume_l: price.total_volume_l,
        price_total_eur: price.price_total_eur,
        price_per_l_eur: price.price_per_l_eur,
        is_promo: price.is_promo,
        promo_label: price.promo_label,
        availability: price.availability,
        sku: price.sku,
        url: price.url,
        scraped_at: price.scraped_at,
        run_status: price.runs?.status || ''
      })) || [];

      const csvContent = this.generateCSVContent(exportData, headers);
      this.downloadCSV(csvContent, 'prices_latest.csv');
      
      toast.success(`Export réussi : ${exportData.length} produits`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    }
  }

  static async exportPriceHistory(options: ExportOptions = {}): Promise<void> {
    try {
      let query = supabase
        .from('prices_history')
        .select(`
          *
        `)
        .order('scraped_at', { ascending: false });

      if (options.retailerId) {
        query = query.eq('retailer_id', options.retailerId);
      }
      
      if (options.brand) {
        query = query.ilike('brand', `%${options.brand}%`);
      }

      if (options.dateFrom) {
        query = query.gte('scraped_at', options.dateFrom);
      }

      if (options.dateTo) {
        query = query.lte('scraped_at', options.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;

      const headers = [
        'retailer_name',
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

      const exportData = data?.map(price => ({
        retailer_name: 'Historical', // Historical data without retailer join
        brand: price.brand,
        product_name: price.product_name,
        pack_count: price.pack_count,
        unit_volume_l: price.unit_volume_l,
        total_volume_l: price.total_volume_l,
        price_total_eur: price.price_total_eur,
        price_per_l_eur: price.price_per_l_eur,
        is_promo: price.is_promo,
        promo_label: price.promo_label,
        availability: price.availability,
        sku: price.sku,
        url: price.url,
        scraped_at: price.scraped_at
      })) || [];

      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const csvContent = this.generateCSVContent(exportData, headers);
      this.downloadCSV(csvContent, `prices_history_${today}.csv`);
      
      toast.success(`Export historique réussi : ${exportData.length} enregistrements`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export historique');
    }
  }

  static async exportRetailerStats(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('runs')
        .select(`
          *,
          retailers(name, domain, status)
        `)
        .order('started_at', { ascending: false });

      if (error) throw error;

      const headers = [
        'retailer_name',
        'retailer_domain',
        'retailer_status',
        'run_status',
        'started_at',
        'finished_at',
        'items_found',
        'items_saved',
        'error_rate',
        'quality_score',
        'outliers_count',
        'unknown_brands_count'
      ];

      const exportData = data?.map(run => ({
        retailer_name: run.retailers?.name || '',
        retailer_domain: run.retailers?.domain || '',
        retailer_status: run.retailers?.status || '',
        run_status: run.status,
        started_at: run.started_at,
        finished_at: run.finished_at,
        items_found: run.items_found,
        items_saved: run.items_saved,
        error_rate: run.error_rate,
        quality_score: run.quality_score,
        outliers_count: run.outliers_count,
        unknown_brands_count: run.unknown_brands_count
      })) || [];

      const csvContent = this.generateCSVContent(exportData, headers);
      this.downloadCSV(csvContent, 'retailer_stats.csv');
      
      toast.success(`Export stats enseignes réussi : ${exportData.length} runs`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export des statistiques');
    }
  }

  private static downloadCSV(content: string, filename: string): void {
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}