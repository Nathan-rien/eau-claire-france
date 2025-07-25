// Mapbox security service for secure API key management
export class MapboxSecurityService {
  private static readonly FALLBACK_TOKEN = 'pk.eyJ1IjoidGh1cnphciIsImEiOiJjbWJ1eG9xMmQwOTc5MnZzYTluODUxMmp3In0.LTG70XIWIvpzLVq8FVXUbw';

  // Get Mapbox token securely
  static getMapboxToken(): string {
    // In production, this should come from environment variables or secure storage
    // For now, we'll use the existing token but log its usage for monitoring
    const token = this.FALLBACK_TOKEN;
    
    // Log token usage for security monitoring
    import('./auditService').then(({ AuditService }) => {
      AuditService.logEvent({
        type: 'security',
        action: 'mapbox_token_access',
        details: { tokenPrefix: token.substring(0, 10) },
        severity: 'low'
      });
    });

    return token;
  }

  // Validate Mapbox token format
  static isValidMapboxToken(token: string): boolean {
    return token.startsWith('pk.') && token.length > 50;
  }

  // Configure Mapbox with secure token
  static configureMapbox(mapboxgl: any): void {
    const token = this.getMapboxToken();
    
    if (!this.isValidMapboxToken(token)) {
      console.warn('Invalid Mapbox token format detected');
      return;
    }

    mapboxgl.accessToken = token;
  }

  // Get secure map configuration
  static getSecureMapConfig(): {
    style: string;
    center: [number, number];
    zoom: number;
    maxZoom: number;
    minZoom: number;
  } {
    return {
      style: 'mapbox://styles/mapbox/light-v11',
      center: [2.3488, 46.6034],
      zoom: 4,
      maxZoom: 18,
      minZoom: 1
    };
  }

  // Create secure map options
  static createSecureMapOptions(container: HTMLElement): any {
    const config = this.getSecureMapConfig();
    
    return {
      container,
      style: config.style,
      center: config.center,
      zoom: config.zoom,
      maxZoom: config.maxZoom,
      minZoom: config.minZoom,
      // Security options
      trackResize: true,
      preserveDrawingBuffer: false,
      refreshExpiredTiles: true
    };
  }
}