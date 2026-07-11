
// API officielle Hub'Eau pour la qualité de l'eau potable
const API_BASE_URL = 'https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable';

export interface WaterQualityData {
  commune: string;
  codeCommune: string;
  datePrelevement: string;
  parametreAnalyse: string;
  valeurParametre: number;
  uniteParametre: string;
  limiteQualite: number;
  conformite: 'Conforme' | 'Non conforme' | 'Non déterminé';
}

export interface ApiResponse {
  data: WaterQualityData[];
  total: number;
}

// Interface pour l'API Hub'Eau
interface HubEauResult {
  libelle_commune: string;
  code_commune: string;
  date_prelevement: string;
  libelle_parametre: string;
  resultat_numerique: number;
  libelle_unite: string;
  limite_qualite_parametre: string | null;
  reference_qualite_parametre: string | null;
  conclusion_conformite_prelevement: string;
}

interface HubEauResponse {
  data: HubEauResult[];
  count: number;
}

// Parse numeric limit from Hub'Eau string like "<=50 mg/L" or ">=6,5 et <=9 unité pH"
function parseLimite(raw: string | null): number {
  if (!raw) return 0;
  const matches = raw.match(/[\d]+[,.]?[\d]*/g);
  if (!matches) return 0;
  return parseFloat(matches[matches.length - 1].replace(',', '.'));
}

// Fonction optimisée pour obtenir le code commune (avec données locales)
const getCodeCommune = async (communeName: string): Promise<string | null> => {
  if (!communeName || communeName.length < 2) return null;
  
  try {
    // Utiliser les données locales à la place de l'API externe
    const { searchCities } = await import('@/data/frenchCities');
    const cities = searchCities(communeName);
    
    if (cities.length > 0) {
      return cities[0].citycode;
    }
    return null;
  } catch (error) {
    console.error('Erreur recherche code commune:', error);
    return null;
  }
};

// Fonction pour rechercher les données de qualité de l'eau par commune
export const getWaterQualityByCommune = async (commune: string): Promise<ApiResponse> => {
  try {
    console.log(`Recherche des données pour: ${commune}`);
    
    // Récupération du code commune
    const codeCommune = await getCodeCommune(commune);
    if (!codeCommune) {
      console.warn('Code commune non trouvé, utilisation des données de démonstration');
      return getMockData(commune);
    }

    // Utilisation de l'API officielle Hub'Eau
    const url = `${API_BASE_URL}/resultats_dis?code_commune=${codeCommune}&size=50&sort=desc`;
    console.log('URL API Hub\'Eau:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.warn('API Hub\'Eau non disponible, utilisation des données de démonstration');
      return getMockData(commune);
    }

    const hubEauData: HubEauResponse = await response.json();
    console.log('Données Hub\'Eau reçues:', hubEauData);
    
    // Conversion des données Hub'Eau vers notre format
    const convertedData: WaterQualityData[] = hubEauData.data.map(item => {
      const valeur = item.resultat_numerique || 0;
      const limite = parseLimite(item.limite_qualite_parametre) || parseLimite(item.reference_qualite_parametre);
      const unite = item.libelle_unite || 'mg/L';
      const isQualitative = unite.toUpperCase() === 'SANS OBJET' || unite.toUpperCase() === 'N/A';

      // Conformité individuelle par paramètre
      // Priorité au champ officiel Hub'Eau si disponible
      let conformite: 'Conforme' | 'Non conforme' | 'Non déterminé';
      const officiel = (item as any).conformite_limites_pc_parametre
        || (item as any).conformite_reference_pc_parametre
        || (item as any).conformite_parametre;
      if (typeof officiel === 'string' && officiel.length > 0) {
        const c = officiel.toUpperCase();
        conformite = c === 'C' ? 'Conforme' : c === 'N' ? 'Non conforme' : 'Non déterminé';
      } else if (isQualitative) {
        // Paramètres qualitatifs (odeur, saveur…) : 0 = Conforme, sinon indéterminé faute de barème
        conformite = valeur === 0 ? 'Conforme' : 'Non déterminé';
      } else if (limite && limite > 0) {
        conformite = valeur <= limite ? 'Conforme' : 'Non conforme';
      } else {
        // Pas de limite réglementaire fournie → ne pas conclure
        conformite = 'Non déterminé';
      }

      return {
        commune: item.libelle_commune,
        codeCommune: item.code_commune,
        datePrelevement: item.date_prelevement,
        parametreAnalyse: item.libelle_parametre,
        valeurParametre: valeur,
        uniteParametre: unite,
        limiteQualite: limite,
        conformite,
      };
    });

    // Dédupliquer : garder uniquement le prélèvement le plus récent par paramètre
    const deduplicatedMap = new Map<string, WaterQualityData>();
    for (const item of convertedData) {
      const existing = deduplicatedMap.get(item.parametreAnalyse);
      if (!existing || new Date(item.datePrelevement) > new Date(existing.datePrelevement)) {
        deduplicatedMap.set(item.parametreAnalyse, item);
      }
    }
    const deduplicated = Array.from(deduplicatedMap.values());
    
    return {
      data: deduplicated,
      total: deduplicated.length
    };
  } catch (error) {
    console.error('Erreur API Hub\'Eau:', error);
    console.log('Utilisation des données de démonstration');
    return getMockData(commune);
  }
};

// Données de démonstration en cas d'indisponibilité de l'API (mises à jour pour 2025)
const getMockData = (commune: string): ApiResponse => {
  const today = new Date();
  const recentDate = new Date(today.getFullYear(), today.getMonth() - 1, 15).toISOString().split('T')[0];
  
  const mockData: WaterQualityData[] = [
    {
      commune,
      codeCommune: '75001',
      datePrelevement: recentDate,
      parametreAnalyse: 'Nitrates',
      valeurParametre: 12,
      uniteParametre: 'mg/L',
      limiteQualite: 50,
      conformite: 'Conforme'
    },
    {
      commune,
      codeCommune: '75001',
      datePrelevement: recentDate,
      parametreAnalyse: 'Chlore résiduel',
      valeurParametre: 0.3,
      uniteParametre: 'mg/L',
      limiteQualite: 2,
      conformite: 'Conforme'
    },
    {
      commune,
      codeCommune: '75001',
      datePrelevement: recentDate,
      parametreAnalyse: 'Trihalométhanes',
      valeurParametre: 28,
      uniteParametre: 'µg/L',
      limiteQualite: 100,
      conformite: 'Conforme'
    },
    {
      commune,
      codeCommune: '75001',
      datePrelevement: recentDate,
      parametreAnalyse: 'Plomb',
      valeurParametre: 2,
      uniteParametre: 'µg/L',
      limiteQualite: 10,
      conformite: 'Conforme'
    },
    {
      commune,
      codeCommune: '75001',
      datePrelevement: recentDate,
      parametreAnalyse: 'Escherichia coli',
      valeurParametre: 0,
      uniteParametre: 'NPP/100mL',
      limiteQualite: 0,
      conformite: 'Conforme'
    },
    {
      commune,
      codeCommune: '75001',
      datePrelevement: recentDate,
      parametreAnalyse: 'Entérocoques',
      valeurParametre: 0,
      uniteParametre: 'NPP/100mL',
      limiteQualite: 0,
      conformite: 'Conforme'
    }
  ];

  return {
    data: mockData,
    total: mockData.length
  };
};

// Fonction pour calculer le score de qualité basé sur les données réelles
export const calculateQualityScore = (data: WaterQualityData[]): number => {
  if (data.length === 0) return 0;
  
  let totalScore = 0;
  data.forEach(item => {
    const percentOfLimit = (item.valeurParametre / item.limiteQualite) * 100;
    let paramScore = 100;
    
    if (percentOfLimit > 80) paramScore = 60;
    else if (percentOfLimit > 60) paramScore = 75;
    else if (percentOfLimit > 40) paramScore = 85;
    else if (percentOfLimit > 20) paramScore = 95;
    
    if (item.conformite === 'Non conforme') paramScore = Math.min(paramScore, 50);
    
    totalScore += paramScore;
  });
  
  return Math.round(totalScore / data.length);
};

export const getQualityGrade = (score: number): string => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'E';
};
