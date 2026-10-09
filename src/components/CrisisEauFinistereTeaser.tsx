import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CrisisEauFinistereTeaser() {
  return <section className="px-4 py-4" aria-labelledby="finistere-teaser-title">
    <div className="container mx-auto max-w-4xl">
      <Card className="border-[hsl(var(--warning)/0.4)] bg-[hsl(var(--warning)/0.06)]">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start gap-4">
          <AlertTriangle className="h-6 w-6 shrink-0 text-[hsl(var(--warning))]" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 id="finistere-teaser-title" className="text-xl font-semibold">Finistère : risque de coupure d’eau potable</h2>
            <p className="text-sm text-muted-foreground mt-2 mb-4">Les collectivités du Nord-Finistère demandent de réduire la consommation d’environ moitié. Estimez celle de votre foyer.</p>
            <Button asChild variant="outline" className="h-auto min-h-11 whitespace-normal text-center border-[hsl(var(--warning)/0.4)] text-[hsl(var(--warning))]">
              <Link to="/actualites/crise-eau-finistere#calculateur">Calculer ma consommation</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>;
}
