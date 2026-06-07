import { DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, List, message, Popconfirm, Space } from 'antd';
import type { Dayjs } from 'dayjs';
import { useState } from 'react';
import { createCertificate, deleteCertificate, fetchMyProfile } from '@/api/profile';
import FileUploadField from '@/components/FileUploadField';
import type { Certificate, TeacherProfile } from '@/types/profile';

interface CertificatesSectionProps {
  profile: TeacherProfile;
  onUpdated: (profile: TeacherProfile) => void;
}

export default function CertificatesSection({ profile, onUpdated }: CertificatesSectionProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (): Promise<void> => {
    if (!title.trim() || !startDate || !endDate || !file) {
      message.warning('Заполните все поля и прикрепите файл');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('start_date', startDate.format('YYYY-MM-DD'));
    formData.append('end_date', endDate.format('YYYY-MM-DD'));
    formData.append('file', file);

    setLoading(true);
    try {
      await createCertificate(formData);
      onUpdated(await fetchMyProfile());
      setTitle('');
      setStartDate(null);
      setEndDate(null);
      setFile(null);
      message.success('Сертификат добавлен');
    } catch {
      message.error('Не удалось добавить сертификат');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await deleteCertificate(id);
      onUpdated({
        ...profile,
        certificates: profile.certificates.filter((item) => item.id !== id),
      });
      message.success('Сертификат удалён');
    } catch {
      message.error('Не удалось удалить сертификат');
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <List
        bordered
        dataSource={profile.certificates}
        locale={{ emptyText: 'Сертификаты не добавлены' }}
        renderItem={(item: Certificate) => (
          <List.Item
            actions={[
              <a key="file" href={item.file} target="_blank" rel="noreferrer">
                <LinkOutlined /> Файл
              </a>,
              <Popconfirm key="delete" title="Удалить сертификат?" onConfirm={() => void handleDelete(item.id)}>
                <Button danger type="text" icon={<DeleteOutlined />} />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={item.title}
              description={`${item.start_date} — ${item.end_date}`}
            />
          </List.Item>
        )}
      />

      <Form layout="vertical">
        <Form.Item label="Название" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Form.Item>
        <Form.Item label="Дата начала" required>
          <DatePicker value={startDate} onChange={setStartDate} style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item label="Дата окончания" required>
          <DatePicker value={endDate} onChange={setEndDate} style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item label="Файл" required>
          <FileUploadField value={file} onChange={setFile} required />
        </Form.Item>
        <Button type="primary" loading={loading} onClick={() => void handleAdd()}>
          Добавить сертификат
        </Button>
      </Form>
    </Space>
  );
}
