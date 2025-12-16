import { useState, useEffect } from 'react';
import { Composition } from '@/utils/rankingV2';

export interface WaterSource {
  brand: string;
  source_name: string;
  location: string;
  is_sparkling: boolean;
  composition: Composition;
}

export function useWaterCompositions() {
  const [waters, setWaters] = useState<WaterSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCSV() {
      try {
        const response = await fetch('/data/infoeau_emn_composition_v2_partial.csv');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setWaters([]);
          setLoading(false);
          return;
        }

        const headers = lines[0].split(',');
        const parsed: WaterSource[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length < headers.length) continue;

          const getVal = (name: string): number | undefined => {
            const idx = headers.indexOf(name);
            if (idx === -1) return undefined;
            const v = parseFloat(values[idx]);
            return isNaN(v) ? undefined : v;
          };

          const brand = values[headers.indexOf('brand')] || '';
          const source_name = values[headers.indexOf('source_name')] || '';
          const location = values[headers.indexOf('location')] || '';
          const is_sparkling = values[headers.indexOf('is_sparkling')]?.toLowerCase() === 'true';

          const composition: Composition = {
            NO3_mg_L: getVal('NO3_mg_L'),
            residu_sec_180_mg_L: getVal('residu_sec_180_mg_L'),
            Ca_mg_L: getVal('Ca_mg_L'),
            Mg_mg_L: getVal('Mg_mg_L'),
            Na_mg_L: getVal('Na_mg_L'),
            pH: getVal('pH'),
            HCO3_mg_L: getVal('HCO3_mg_L'),
            SO4_mg_L: getVal('SO4_mg_L'),
            F_mg_L: getVal('F_mg_L'),
            K_mg_L: getVal('K_mg_L'),
            Cl_mg_L: getVal('Cl_mg_L'),
          };

          parsed.push({ brand, source_name, location, is_sparkling, composition });
        }

        setWaters(parsed);
        setLoading(false);
      } catch (err) {
        console.error('Error loading water compositions:', err);
        setError('Impossible de charger les données');
        setLoading(false);
      }
    }

    loadCSV();
  }, []);

  return { waters, loading, error };
}

// Helper to parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
