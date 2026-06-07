import { Button, Layout, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABELS } from '@/utils/roles';

const { Header, Content } = Layout;

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
}

export default function DashboardLayout({ title, children, extra }: DashboardLayoutProps) {
  const { user, role, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 24px',
        }}
      >
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          <Typography.Text type="secondary">
            {user?.email} · {role ? ROLE_LABELS[role] : ''}
          </Typography.Text>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <LanguageSwitcher />
          {extra}
          <Button onClick={logout}>{t('nav.logout')}</Button>
        </div>
      </Header>
      <Content style={{ padding: 24, maxWidth: 960, margin: '0 auto', width: '100%' }}>
        {children}
      </Content>
    </Layout>
  );
}
