
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
  limite_de_qualite_parametre: number;
  conclusion_conformite_prelevement: string;
}

interface HubEauResponse {
  data: HubEauResult[];
  count: number;
}

// Fonction pour obtenir le code commune à partir du nom
const getCodeCommune = async (communeName: string): Promise<string | null> => {
  try {
    // Utilisation de l'API de géocodage française
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(communeName)}&type=municipality&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].properties.citycode;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la recherche du code commune:', error);
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
    });

    if (!response.ok) {
      console.warn('API Hub\'Eau non disponible, utilisation des données de démonstration');
      return getMockData(commune);
    }

    const hubEauData: HubEauResponse = await response.json();
    console.log('Données Hub\'Eau reçues:', hubEauData);
    
    // Conversion des données Hub'Eau vers notre format
    const convertedData: WaterQualityData[] = hubEauData.data.map(item => ({
      commune: item.libelle_commune,
      codeCommune: item.code_commune,
      datePrelevement: item.date_prelevement,
      parametreAnalyse: item.libelle_parametre,
      valeurParametre: item.resultat_numerique || 0,
      uniteParametre: item.libelle_unite || 'mg/L',
      limiteQualite: item.limite_de_qualite_parametre || 50,
      conformite: item.conclusion_conformite_prelevement === 'C' ? 'Conforme' : 
                  item.conclusion_conformite_prelevement === 'N' ? 'Non conforme' : 'Non déterminé'
    }));
    
    return {
      data: convertedData,
      total: hubEauData.count || convertedData.length
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
