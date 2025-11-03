import { Badge } from "@/components/ui/badge";
import { Clock, Database, TestTube } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DataFreshnessIndicatorProps {
  lastUpdate: Date;
  source: 'api' | 'mock';
  className?: string;
}

export function DataFreshnessIndicator({ lastUpdate, source, className = "" }: DataFreshnessIndicatorProps) {
  const hoursSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60));
  
  const getFreshnessStatus = () => {
    if (hoursSinceUpdate < 24) return { color: 'default', label: 'Données récentes', icon: Clock };
    if (hoursSinceUpdate < 168) return { color: 'secondary', label: 'Données modérément anciennes', icon: Clock };
    return { color: 'destructive', label: 'Données anciennes', icon: Clock };
  };

  const status = getFreshnessStatus();
  const Icon = status.icon;

  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`}>
      <Badge variant={status.color as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.label}
      </Badge>
      
      <Badge variant="outline" className="gap-1">
        {source === 'api' ? (
          <>
            <Database className="h-3 w-3" />
            API Hub'Eau
          </>
        ) : (
          <>
            <TestTube className="h-3 w-3" />
            Données de démonstration
          </>
        )}
      </Badge>

      <span className="text-sm text-muted-foreground">
        Mise à jour : {format(lastUpdate, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
      </span>
    </div>
  );
}
