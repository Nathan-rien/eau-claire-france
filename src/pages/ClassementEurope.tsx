import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getEUWaterQuality, getScoreBadgeClass, type EUCountryWaterQuality } from '@/services/europeWaterApi';
import { Trophy, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

type SortKey = 'complianceRate' | 'nitrateAvg' | 'qualityScore' | 'countryName';

const ClassementEurope: React.FC = () => {
  const [data, setData] = useState<EUCountryWaterQuality[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('complianceRate');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    getEUWaterQuality().then(setData);
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === 'countryName'); }
  };

  const sorted = [...data].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'countryName') cmp = a.countryName.localeCompare(b.countryName);
    else if (sortKey === 'qualityScore') cmp = a.qualityScore.localeCompare(b.qualityScore);
    else cmp = (a[sortKey] as number) - (b[sortKey] as number);
    return sortAsc ? cmp : -cmp;
  });

  return (
    <Layout>
      <SEOHead
        title="Classement qualité de l'eau en Europe – 27 pays EU"
        description="Classement des 27 pays de l'Union européenne par qualité de l'eau potable. Conformité, nitrates, polluants."
      />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Classement européen</h1>
          </div>
          <p className="text-muted-foreground">Qualité de l'eau potable dans les 27 pays de l'UE</p>
          <Link to="/classement" className="text-sm text-primary hover:underline">
            ← Retour au classement France
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('countryName')} className="gap-1 px-0">
                      Pays <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('qualityScore')} className="gap-1 px-0">
                      Score <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('complianceRate')} className="gap-1 px-0">
                      Conformité <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('nitrateAvg')} className="gap-1 px-0">
                      Nitrates moy. <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Violations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((c, i) => (
                  <TableRow key={c.countryCode}>
                    <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{c.countryName}</TableCell>
                    <TableCell>
                      <Badge className={getScoreBadgeClass(c.qualityScore)}>{c.qualityScore}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{c.complianceRate}%</TableCell>
                    <TableCell>{c.nitrateAvg} mg/L</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                      {c.pesticideViolations + c.leadViolations + c.bacteriaViolations} total
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          Source : EEA WISE DWD, 2023. Scores : A (≥99%), B (97-99%), C (&lt;97%).
        </p>
      </div>
    </Layout>
  );
};

export default ClassementEurope;
