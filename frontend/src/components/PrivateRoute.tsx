import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/auth';

interface PrivateRouteProps {
  role?: UserRole;
  children: React.ReactNode;
}

export default function PrivateRoute({ role, children }: PrivateRouteProps) {
  const { role: userRole, loading, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip={t('common.loading')} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
