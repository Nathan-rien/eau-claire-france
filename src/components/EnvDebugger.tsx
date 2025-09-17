import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';

interface EnvVar {
  name: string;
  value: string | undefined;
  maskedValue: string;
  isDefined: boolean;
  isRequired: boolean;
}

const EnvDebugger: React.FC = () => {
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [showValues, setShowValues] = useState(false);
  const [buildInfo, setBuildInfo] = useState<any>(null);

  const maskValue = (value: string | undefined): string => {
    if (!value || value.length <= 8) return '***masked***';
    const start = value.substring(0, Math.ceil(value.length * 0.1));
    const end = value.substring(Math.floor(value.length * 0.9));
    const middle = '*'.repeat(value.length - start.length - end.length);
    return `${start}${middle}${end}`;
  };

  const checkEnvVars = () => {
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY', 
      'VITE_ADMIN_DASHBOARD_TOKEN'
    ];

    const optionalVars = [
      'VITE_SUPABASE_PUBLISHABLE_KEY',
      'VITE_WATER_COMPO_CSV_URL',
      'VITE_WATER_CATALOG_CSV_URL',
      'VITE_WATER_MDD_CSV_URL'
    ];

    // Check for mapping VITE_SUPABASE_PUBLISHABLE_KEY to VITE_SUPABASE_ANON_KEY
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    const allVars = [...requiredVars, ...optionalVars];
    const vars: EnvVar[] = allVars.map(name => {
      let value = import.meta.env[name];
      
      // Special mapping for ANON_KEY
      if (name === 'VITE_SUPABASE_ANON_KEY' && !value) {
        value = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      }
      
      return {
        name,
        value,
        maskedValue: maskValue(value),
        isDefined: !!value,
        isRequired: requiredVars.includes(name)
      };
    });

    setEnvVars(vars);

    // Build info
    setBuildInfo({
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
      baseUrl: import.meta.env.BASE_URL,
      timestamp: new Date().toISOString()
    });

    // Console logging with masking
    console.log('🔍 InfoEau ENV Debug - Runtime Values');
    console.log('=====================================');
    vars.forEach(envVar => {
      const status = envVar.isDefined ? '✅' : '❌';
      const priority = envVar.isRequired ? '🔑' : '📝';
      console.log(`${status} ${priority} ${envVar.name}: ${envVar.maskedValue}`);
    });
    
    console.log('\nℹ️ Build Info:', {
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
      baseUrl: import.meta.env.BASE_URL
    });
  };

  useEffect(() => {
    checkEnvVars();
  }, []);

  const getStatusBadge = (envVar: EnvVar) => {
    if (envVar.isDefined) {
      return <Badge variant="default">✅ Définie</Badge>;
    } else if (envVar.isRequired) {
      return <Badge variant="destructive">❌ Manquante</Badge>;
    } else {
      return <Badge variant="outline">⚪ Optionnelle</Badge>;
    }
  };

  const requiredVars = envVars.filter(v => v.isRequired);
  const missingRequired = requiredVars.filter(v => !v.isDefined);
  const overallStatus = missingRequired.length === 0 ? 'OK' : 'ERROR';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🔍 ENV Debugger</span>
          <Badge variant={overallStatus === 'OK' ? 'default' : 'destructive'}>
            {overallStatus}
          </Badge>
        </CardTitle>
        <CardDescription>
          Vérification des variables d'environnement Vite au runtime
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={checkEnvVars} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Rafraîchir
          </Button>
          <Button 
            onClick={() => setShowValues(!showValues)} 
            size="sm" 
            variant="outline"
          >
            {showValues ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showValues ? 'Masquer' : 'Afficher'} valeurs
          </Button>
        </div>

        {buildInfo && (
          <div className="p-3 bg-muted rounded-lg text-sm">
            <div className="font-medium mb-2">ℹ️ Build Info</div>
            <div>Mode: {buildInfo.mode} | Dev: {buildInfo.dev ? 'Yes' : 'No'} | Prod: {buildInfo.prod ? 'Yes' : 'No'}</div>
            <div>Base URL: {buildInfo.baseUrl}</div>
            <div>Timestamp: {buildInfo.timestamp}</div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">🔑 Variables Requises</h4>
          {requiredVars.map(envVar => (
            <div key={envVar.name} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{envVar.name}</span>
                {getStatusBadge(envVar)}
              </div>
              <div className="text-sm text-muted-foreground">
                {showValues ? (envVar.value || 'undefined') : envVar.maskedValue}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">📝 Variables Optionnelles</h4>
          {envVars.filter(v => !v.isRequired).map(envVar => (
            <div key={envVar.name} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{envVar.name}</span>
                {getStatusBadge(envVar)}
              </div>
              <div className="text-sm text-muted-foreground">
                {showValues ? (envVar.value || 'undefined') : envVar.maskedValue}
              </div>
            </div>
          ))}
        </div>

        {missingRequired.length > 0 && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="font-medium text-destructive mb-2">⚠️ Variables Manquantes</div>
            <ul className="text-sm text-destructive space-y-1">
              {missingRequired.map(envVar => (
                <li key={envVar.name}>• {envVar.name}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          ℹ️ Les variables VITE_* sont injectées au build par Vite et disponibles via import.meta.env.*
        </div>
      </CardContent>
    </Card>
  );
};

export default EnvDebugger;