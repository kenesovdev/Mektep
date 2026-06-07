import { Button, Card, Descriptions, Spin, Table, Tabs, message } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  downloadSchoolZip,
  fetchManagerTeacherDetail,
  getTeacherFileDownloadUrl,
} from '@/api/manager';
import DashboardLayout from '@/components/DashboardLayout';
import { downloadBlob } from '@/utils/download';
import { MONTH_OPTIONS } from '@/utils/months';
import type { DownloadFileType, ManagerTeacherDetail } from '@/types/manager';
import type { Achievement } from '@/types/achievement';
import type { Certificate, Diploma } from '@/types/profile';

export default function ManagerTeacherDetail() {
  const { id } = useParams<{ id: string }>();
  const profileId = Number(id);
  const [profile, setProfile] = useState<ManagerTeacherDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [zipLoading, setZipLoading] = useState(false);

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (!id) return;
      try {
        setProfile(await fetchManagerTeacherDetail(profileId));
      } catch {
        message.error('Не удалось загрузить профиль');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, profileId]);

  const handleDownload = async (
    type: DownloadFileType,
    fileId: number,
    filename: string,
  ): Promise<void> => {
    try {
      await downloadBlob(getTeacherFileDownloadUrl(profileId, type, fileId), filename);
    } catch {
      message.error('Не удалось скачать файл');
    }
  };

  const handleDownloadZip = async (): Promise<void> => {
    setZipLoading(true);
    try {
      await downloadSchoolZip();
    } catch {
      message.error('Не удалось скачать архив');
    } finally {
      setZipLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  const monthLabel = (month: number): string =>
    MONTH_OPTIONS.find((option) => option.value === month)?.label ?? String(month);

  const downloadButton = (type: DownloadFileType, fileId: number, filename: string) => (
    <Button type="link" onClick={() => void handleDownload(type, fileId, filename)}>
      ⬇ Скачать
    </Button>
  );

  return (
    <DashboardLayout
      title={profile.full_name}
      extra={
        <div style={{ display: 'flex', gap: 8 }}>
          <Button loading={zipLoading} onClick={() => void handleDownloadZip()}>
            Скачать всё (ZIP)
          </Button>
          <Link to="/manager/dashboard">← Назад</Link>
        </div>
      }
    >
      <Card>
        <Tabs
          items={[
            {
              key: 'personal',
              label: 'Личные данные',
              children: (
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="ФИО">{profile.full_name}</Descriptions.Item>
                  <Descriptions.Item label="Школа">{profile.school_name ?? '—'}</Descriptions.Item>
                  <Descriptions.Item label="Дата рождения">{profile.birth_date ?? '—'}</Descriptions.Item>
                  <Descriptions.Item label="Стаж">{profile.experience_years} лет</Descriptions.Item>
                  <Descriptions.Item label="Телефон">{profile.phone || '—'}</Descriptions.Item>
                  <Descriptions.Item label="Email">{profile.email || '—'}</Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: 'diplomas',
              label: 'Дипломы',
              children: (
                <Table<Diploma>
                  rowKey="id"
                  dataSource={profile.diplomas}
                  pagination={false}
                  locale={{ emptyText: 'Нет данных' }}
                  columns={[
                    { title: 'Год', dataIndex: 'year', width: 80 },
                    { title: 'Месяц', dataIndex: 'month', render: monthLabel, width: 120 },
                    { title: 'Учебное заведение', dataIndex: 'institution' },
                    {
                      title: 'Файл',
                      width: 120,
                      render: (_, record) =>
                        record.file
                          ? downloadButton('diploma', record.id, `diploma_${record.year}.pdf`)
                          : '—',
                    },
                  ]}
                />
              ),
            },
            {
              key: 'certificates',
              label: 'Сертификаты',
              children: (
                <Table<Certificate>
                  rowKey="id"
                  dataSource={profile.certificates}
                  pagination={false}
                  locale={{ emptyText: 'Нет данных' }}
                  columns={[
                    { title: 'Название', dataIndex: 'title' },
                    { title: 'Начало', dataIndex: 'start_date', width: 120 },
                    { title: 'Окончание', dataIndex: 'end_date', width: 120 },
                    {
                      title: 'Файл',
                      width: 120,
                      render: (_, record) =>
                        record.file
                          ? downloadButton('certificate', record.id, `cert_${record.id}.pdf`)
                          : '—',
                    },
                  ]}
                />
              ),
            },
            {
              key: 'qualifications',
              label: 'Біліктілік санаты',
              children: (
                <Table
                  rowKey="id"
                  dataSource={profile.qualifications}
                  pagination={false}
                  locale={{ emptyText: 'Нет данных' }}
                  columns={[
                    { title: 'Категория', dataIndex: 'category' },
                    { title: 'Дата присвоения', dataIndex: 'awarded_date', width: 160 },
                  ]}
                />
              ),
            },
            {
              key: 'teacher_achievements',
              label: 'Мұғалім жетістігі',
              children: (
                <Table<Achievement>
                  rowKey="id"
                  dataSource={profile.teacher_achievements}
                  pagination={false}
                  locale={{ emptyText: 'Нет данных' }}
                  columns={[
                    { title: 'Год', dataIndex: 'year', width: 80 },
                    { title: 'Месяц', dataIndex: 'month', render: monthLabel, width: 120 },
                    { title: 'Название', dataIndex: 'title' },
                    {
                      title: 'Файл',
                      width: 120,
                      render: (_, record) =>
                        record.file_url
                          ? downloadButton(
                              'teacher_achievement',
                              record.id,
                              `teacher_achievement_${record.id}.pdf`,
                            )
                          : '—',
                    },
                  ]}
                />
              ),
            },
            {
              key: 'student_achievements',
              label: 'Оқушы жетістігі',
              children: (
                <Table<Achievement>
                  rowKey="id"
                  dataSource={profile.student_achievements}
                  pagination={false}
                  locale={{ emptyText: 'Нет данных' }}
                  columns={[
                    { title: 'Год', dataIndex: 'year', width: 80 },
                    { title: 'Месяц', dataIndex: 'month', render: monthLabel, width: 120 },
                    { title: 'Название', dataIndex: 'title' },
                    {
                      title: 'Файл',
                      width: 120,
                      render: (_, record) =>
                        record.file_url
                          ? downloadButton(
                              'student_achievement',
                              record.id,
                              `student_achievement_${record.id}.pdf`,
                            )
                          : '—',
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </Card>
    </DashboardLayout>
  );
}
