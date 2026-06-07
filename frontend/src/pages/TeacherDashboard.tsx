import { Button, Card, Descriptions } from 'antd';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABELS } from '@/utils/roles';

export default function TeacherDashboard() {
  const { user, role } = useAuth();

  return (
    <DashboardLayout
      title="Панель учителя"
      extra={
        <Link to="/teacher/profile">
          <Button type="primary">Моё портфолио</Button>
        </Link>
      }
    >
      <Card title="Добро пожаловать">
        <Descriptions column={1}>
          <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
          <Descriptions.Item label="Роль">{role ? ROLE_LABELS[role] : ''}</Descriptions.Item>
          {user?.school && (
            <Descriptions.Item label="Школа">
              {user.school.name}, {user.school.city}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </DashboardLayout>
  );
}
