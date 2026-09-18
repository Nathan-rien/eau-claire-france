import React from 'react';
import { Helmet } from 'react-helmet-async';
import WaterPointsAdmin from '@/components/waterPoints/WaterPointsAdmin';

const AdminZoneEau: React.FC = () => (
  <div className="min-h-screen bg-background px-4 py-8">
    <Helmet>
      <meta name="robots" content="noindex, nofollow" />
      <title>Modération Zone d&apos;Eau</title>
    </Helmet>
    <div className="container mx-auto max-w-5xl">
      <WaterPointsAdmin />
    </div>
  </div>
);

export default AdminZoneEau;
