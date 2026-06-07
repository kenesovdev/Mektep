import { Layout, Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';

const { Sider, Content } = Layout;

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    { key: '/admin/users', label: `👤 ${t('nav.users')}` },
    { key: '/admin/schools', label: `🏫 ${t('nav.schools')}` },
  ];

  return (
    <DashboardLayout title="Панель администратора">
      <Layout style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <Sider width={220} theme="light" className="sidebar" style={{ borderRight: '1px solid #f0f0f0' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Content style={{ padding: 24, minHeight: 400 }}>
          <Outlet />
        </Content>
      </Layout>
    </DashboardLayout>
  );
}
