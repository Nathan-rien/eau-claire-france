export type ChannelType = 'retail' | 'drive' | 'wholesale' | 'marketplace' | 'unknown';

export interface SourceInfo {
  domain: string;
  subdomain?: string;
  channelType: ChannelType;
  displayName: string;
  fullDomain: string;
}

/**
 * Détecte le type de canal de vente à partir de l'URL
 */
export function detectChannelType(url: string): ChannelType {
  if (!url) return 'unknown';
  
  const urlLower = url.toLowerCase();
  
  // Patterns pour les grossistes
  const wholesalePatterns = [
    'metro.fr',
    'promocash.com',
    'transgourmet.fr',
    'grossiste',
    'professionnel',
    'b2b',
    'pro.',
    '/pro/',
  ];
  
  if (wholesalePatterns.some(pattern => urlLower.includes(pattern))) {
    return 'wholesale';
  }
  
  // Patterns pour les drives
  const drivePatterns = [
    'drive.',
    'chronodrive.',
    'coursesenligne',
    'courses-en-ligne',
    '/drive/',
  ];
  
  if (drivePatterns.some(pattern => urlLower.includes(pattern))) {
    return 'drive';
  }
  
  // Patterns pour les marketplaces
  const marketplacePatterns = [
    'marketplace',
    'seller',
    'vendeur',
    '/mp/',
    '/market/',
  ];
  
  if (marketplacePatterns.some(pattern => urlLower.includes(pattern))) {
    return 'marketplace';
  }
  
  // Par défaut, site principal de vente au détail
  return 'retail';
}

/**
 * Extrait les informations de source depuis l'URL
 */
export function extractSourceInfo(url: string, retailerName: string): SourceInfo {
  if (!url) {
    return {
      domain: '',
      channelType: 'unknown',
      displayName: retailerName,
      fullDomain: '',
    };
  }
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    const parts = hostname.split('.');
    
    // Extraire le sous-domaine si présent
    let subdomain: string | undefined;
    if (parts.length > 2) {
      subdomain = parts.slice(0, -2).join('.');
    }
    
    const channelType = detectChannelType(url);
    
    // Créer un nom d'affichage avec le canal si pertinent
    let displayName = retailerName;
    if (subdomain && subdomain !== 'www') {
      displayName = `${retailerName} (${subdomain})`;
    } else if (channelType === 'drive') {
      displayName = `${retailerName} (drive)`;
    } else if (channelType === 'wholesale') {
      displayName = `${retailerName} (pro)`;
    } else if (channelType === 'marketplace') {
      displayName = `${retailerName} (marketplace)`;
    }
    
    return {
      domain: parts.slice(-2).join('.'),
      subdomain,
      channelType,
      displayName,
      fullDomain: hostname,
    };
  } catch (e) {
    return {
      domain: '',
      channelType: 'unknown',
      displayName: retailerName,
      fullDomain: '',
    };
  }
}

/**
 * Obtient l'emoji/icône pour le type de canal
 */
export function getChannelIcon(channelType: ChannelType): string {
  switch (channelType) {
    case 'retail':
      return '🏪';
    case 'drive':
      return '🚗';
    case 'wholesale':
      return '📦';
    case 'marketplace':
      return '🛒';
    default:
      return '❓';
  }
}

/**
 * Obtient la description du type de canal
 */
export function getChannelDescription(channelType: ChannelType): string {
  switch (channelType) {
    case 'retail':
      return 'Site principal de vente au détail';
    case 'drive':
      return 'Drive ou Click & Collect';
    case 'wholesale':
      return 'Prix grossiste/professionnel - peut nécessiter conditions particulières';
    case 'marketplace':
      return 'Marketplace - vendeur tiers';
    default:
      return 'Source inconnue';
  }
}
