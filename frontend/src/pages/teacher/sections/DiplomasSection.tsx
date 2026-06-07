import { DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, List, message, Popconfirm, Select, Space } from 'antd';
import { useState } from 'react';
import { createDiploma, deleteDiploma, fetchMyProfile } from '@/api/profile';
import FileUploadField from '@/components/FileUploadField';
import { MONTH_OPTIONS } from '@/utils/months';
import type { Diploma, TeacherProfile } from '@/types/profile';

interface DiplomasSectionProps {
  profile: TeacherProfile;
  onUpdated: (profile: TeacherProfile) => void;
}

export default function DiplomasSection({ profile, onUpdated }: DiplomasSectionProps) {
  const [year, setYear] = useState<number | null>(new Date().getFullYear());
  const [month, setMonth] = useState<number | null>(new Date().getMonth() + 1);
  const [institution, setInstitution] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (): Promise<void> => {
    if (!year || !month || !institution.trim() || !file) {
      message.warning('Заполните все поля и прикрепите файл');
      return;
    }

    const formData = new FormData();
    formData.append('year', String(year));
    formData.append('month', String(month));
    formData.append('institution', institution.trim());
    formData.append('file', file);

    setLoading(true);
    try {
      await createDiploma(formData);
      onUpdated(await fetchMyProfile());
      setInstitution('');
      setFile(null);
      message.success('Диплом добавлен');
    } catch {
      message.error('Не удалось добавить диплом');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await deleteDiploma(id);
      onUpdated({
        ...profile,
        diplomas: profile.diplomas.filter((item) => item.id !== id),
      });
      message.success('Диплом удалён');
    } catch {
      message.error('Не удалось удалить диплом');
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <List
        bordered
        dataSource={profile.diplomas}
        locale={{ emptyText: 'Дипломы не добавлены' }}
        renderItem={(item: Diploma) => (
          <List.Item
            actions={[
              <a key="file" href={item.file} target="_blank" rel="noreferrer">
                <LinkOutlined /> Файл
              </a>,
              <Popconfirm key="delete" title="Удалить диплом?" onConfirm={() => void handleDelete(item.id)}>
                <Button danger type="text" icon={<DeleteOutlined />} />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={item.institution}
              description={`${MONTH_OPTIONS.find((m) => m.value === item.month)?.label ?? item.month} ${item.year}`}
            />
          </List.Item>
        )}
      />

      <Form layout="vertical" title="Добавить диплом">
        <Form.Item label="Год" required>
          <InputNumber value={year} onChange={setYear} min={1950} max={2100} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Месяц" required>
          <Select value={month} onChange={setMonth} options={MONTH_OPTIONS} />
        </Form.Item>
        <Form.Item label="Учебное заведение" required>
          <Input value={institution} onChange={(e) => setInstitution(e.target.value)} />
        </Form.Item>
        <Form.Item label="Файл" required>
          <FileUploadField value={file} onChange={setFile} required />
        </Form.Item>
        <Button type="primary" loading={loading} onClick={() => void handleAdd()}>
          Добавить диплом
        </Button>
      </Form>
    </Space>
  );
}
