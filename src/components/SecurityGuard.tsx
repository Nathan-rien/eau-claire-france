import React from 'react';
import { FLAGS, IS_PROD } from '@/config/flags';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';

interface SecurityGuardProps {
  children: React.ReactNode;
  requireFlag?: keyof typeof FLAGS;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

const DefaultFallback = () => (
  <div className="container mx-auto py-16">
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-red-600" />
        </div>
        <CardTitle>Accès restreint</CardTitle>
        <CardDescription>
          Cette section n'est pas accessible en mode production ou nécessite des privilèges administrateur.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground">
        {IS_PROD ? (
          <p>Fonctionnalité désactivée en production pour des raisons de sécurité.</p>
        ) : (
          <p>Activez les flags appropriés pour accéder à cette fonctionnalité.</p>
        )}
      </CardContent>
    </Card>
  </div>
);

/**
 * Security Guard Component
 * Controls access to sensitive UI components based on feature flags and environment
 */
export const SecurityGuard: React.FC<SecurityGuardProps> = ({
  children,
  requireFlag,
  requireAdmin = false,
  fallback = <DefaultFallback />
}) => {
  // Check feature flag requirement
  if (requireFlag && !FLAGS[requireFlag]) {
    return <>{fallback}</>;
  }

  // Check admin requirement (simplified - in real app would check user role)
  if (requireAdmin && IS_PROD) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Admin Route Guard - specifically for admin pages
 */
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SecurityGuard requireFlag="FF_ADMIN_UI" requireAdmin={true}>
    {children}
  </SecurityGuard>
);

/**
 * Debug Feature Guard - for debug/development components
 */
export const DebugGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SecurityGuard requireFlag="FF_DEBUG_ROUTES">
    {children}
  </SecurityGuard>
);

/**
 * QuickStart Guard - for admin quickstart component
 */
export const QuickStartGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SecurityGuard requireFlag="FF_QUICKSTART">
    {children}
  </SecurityGuard>
);