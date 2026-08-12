import { Helmet } from 'react-helmet-async';
import { AdminGuard } from '@/components/AdminGuard';
import IndexationDashboard from '@/components/IndexationDashboard';

export default function AdminIndexation() {
  return (
    <AdminGuard>
      <Helmet>
        <title>Suivi d'indexation | Admin InfoEau</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Suivi d'indexation</h1>
        <IndexationDashboard />
      </div>
    </AdminGuard>
  );
}
