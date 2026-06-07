import { Button, DatePicker, Form, List, message, Select, Space } from 'antd';
import type { Dayjs } from 'dayjs';
import { useState } from 'react';
import { createQualification, fetchMyProfile } from '@/api/profile';
import { QUALIFICATION_OPTIONS } from '@/utils/months';
import type { Qualification, TeacherProfile } from '@/types/profile';

interface QualificationsSectionProps {
  profile: TeacherProfile;
  onUpdated: (profile: TeacherProfile) => void;
}

export default function QualificationsSection({ profile, onUpdated }: QualificationsSectionProps) {
  const [category, setCategory] = useState<string | null>(null);
  const [awardedDate, setAwardedDate] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (): Promise<void> => {
    if (!category || !awardedDate) {
      message.warning('Выберите категорию и дату');
      return;
    }

    setLoading(true);
    try {
      await createQualification({
        category,
        awarded_date: awardedDate.format('YYYY-MM-DD'),
      });
      onUpdated(await fetchMyProfile());
      setCategory(null);
      setAwardedDate(null);
      message.success('Категория добавлена');
    } catch {
      message.error('Не удалось добавить категорию');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <List
        bordered
        dataSource={profile.qualifications}
        locale={{ emptyText: 'Категории не добавлены' }}
        renderItem={(item: Qualification) => (
          <List.Item>
            <List.Item.Meta title={item.category} description={item.awarded_date} />
          </List.Item>
        )}
      />

      <Form layout="vertical">
        <Form.Item label="Категория" required>
          <Select value={category} onChange={setCategory} options={QUALIFICATION_OPTIONS} placeholder="Выберите категорию" />
        </Form.Item>
        <Form.Item label="Дата присвоения" required>
          <DatePicker value={awardedDate} onChange={setAwardedDate} style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
        <Button type="primary" loading={loading} onClick={() => void handleAdd()}>
          Добавить категорию
        </Button>
      </Form>
    </Space>
  );
}
