import { Button, Card, Input, Table } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { downloadSchoolZip, fetchManagerTeachers } from '@/api/manager';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABELS } from '@/utils/roles';
import type { TeacherListItem } from '@/types/manager';

export default function ManagerDashboard() {
  const { user, role } = useAuth();
  const [search, setSearch] = useState('');
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchTeachers(search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchTeachers = async (query: string): Promise<void> => {
    setLoading(true);
    try {
      setTeachers(await fetchManagerTeachers(query));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadZip = async (): Promise<void> => {
    setZipLoading(true);
    try {
      await downloadSchoolZip();
    } finally {
      setZipLoading(false);
    }
  };

  return (
    <DashboardLayout title="Панель менеджера">
      <Card
        title="Учителя школы"
        extra={
          <Button loading={zipLoading} onClick={() => void handleDownloadZip()}>
            Скачать всё (ZIP)
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <p style={{ marginTop: 0, color: '#666' }}>
          {user?.school ? `${user.school.name}, ${user.school.city}` : ''}
          {role ? ` · ${ROLE_LABELS[role]}` : ''}
        </p>
        <Input.Search
          placeholder="Поиск по имени"
          allowClear
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ marginBottom: 16, maxWidth: 360 }}
        />
        <Table<TeacherListItem>
          rowKey="id"
          loading={loading}
          dataSource={teachers}
          pagination={false}
          locale={{ emptyText: 'Учителя не найдены' }}
          columns={[
            { title: 'ФИО', dataIndex: 'full_name' },
            { title: 'Стаж', dataIndex: 'experience_years', width: 80, render: (v: number) => `${v} л.` },
            { title: 'Email', dataIndex: 'email' },
            { title: 'Школа', dataIndex: 'school_name' },
            {
              title: '',
              width: 120,
              render: (_, record) => <Link to={`/manager/teachers/${record.id}`}>Просмотр</Link>,
            },
          ]}
        />
      </Card>
    </DashboardLayout>
  );
}
