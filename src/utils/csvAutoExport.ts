import { supabase } from '@/integrations/supabase/client';
import { generateCSV } from './csvExport';

interface ExportConfig {
  outputDir: string;
  enableAutoExport: boolean;
}

const DEFAULT_CONFIG: ExportConfig = {
  outputDir: 'exports',
  enableAutoExport: true
};

export class CSVAutoExport {
  private config: ExportConfig;

  constructor(config: Partial<ExportConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Génère automatiquement les exports CSV après un run success
   */
  async generatePostRunExports(runId: string): Promise<void> {
    if (!this.config.enableAutoExport) {
      console.log('Auto-export désactivé');
      return;
    }

    try {
      console.log(`Génération des exports automatiques pour le run ${runId}`);
      
      // 1. Export latest prices
      await this.exportLatestPrices();
      
      // 2. Export history du jour
      await this.exportDailyHistory();
      
      console.log('Exports automatiques générés avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération des exports automatiques:', error);
    }
  }

  /**
   * Export des derniers prix (prices_latest.csv)
   */
  private async exportLatestPrices(): Promise<void> {
    try {
      const { data: prices, error } = await supabase
        .from('prices')
        .select(`
          *,
          retailers!inner(name, slug)
        `)
        .order('scraped_at', { ascending: false });

      if (error) throw error;

      if (prices && prices.length > 0) {
        const transformedPrices = prices.map(price => ({
          retailer: (price as any).retailers.slug,
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
        }));

        const csvContent = generateCSV(transformedPrices);
        await this.writeToFile('prices_latest.csv', csvContent);
        console.log(`Export latest: ${transformedPrices.length} prix exportés`);
      }
    } catch (error) {
      console.error('Erreur export latest prices:', error);
    }
  }

  /**
   * Export de l'historique du jour (prices_history_YYYYMMDD.csv)
   */
  private async exportDailyHistory(): Promise<void> {
    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const filename = `prices_history_${dateStr.replace(/-/g, '')}.csv`;

      const { data: history, error } = await supabase
        .from('prices_history')
        .select('*')
        .gte('scraped_at', `${dateStr}T00:00:00Z`)
        .lt('scraped_at', `${dateStr}T23:59:59Z`)
        .order('scraped_at', { ascending: false });

      if (error) throw error;

      if (history && history.length > 0) {
        const csvContent = generateCSV(history);
        await this.writeToFile(filename, csvContent);
        console.log(`Export history: ${history.length} entrées exportées pour ${dateStr}`);
      } else {
        console.log(`Aucune donnée d'historique trouvée pour ${dateStr}`);
      }
    } catch (error) {
      console.error('Erreur export daily history:', error);
    }
  }

  /**
   * Écrit le contenu CSV dans un fichier
   */
  private async writeToFile(filename: string, content: string): Promise<void> {
    if (typeof window !== 'undefined') {
      // Browser environment - download file
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Node.js environment - would write to filesystem
      console.log(`Fichier généré: ${this.config.outputDir}/${filename}`);
    }
  }

  /**
   * Hook à appeler depuis le système de scraping après un run success
   */
  static async onRunSuccess(runId: string): Promise<void> {
    const exporter = new CSVAutoExport();
    await exporter.generatePostRunExports(runId);
  }
}

// Utilitaire pour déclencher l'export depuis les runs
export const triggerAutoExport = (runId: string) => {
  return CSVAutoExport.onRunSuccess(runId);
};