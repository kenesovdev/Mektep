import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Select, Table, Typography, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { createAchievement, deleteAchievement, fetchAchievements } from '@/api/achievements';
import type { Achievement } from '@/types/achievement';
import { validateAchievementFile } from '@/utils/achievementFile';
import { MONTH_OPTIONS } from '@/utils/months';
import { YEAR_OPTIONS } from '@/utils/years';

const currentYear = new Date().getFullYear();

const achievementSchema = z.object({
  title: z.string().min(1, 'Обязательно'),
  year: z
    .number()
    .min(2000, 'Год от 2000')
    .max(currentYear, 'Не может быть в будущем'),
  month: z.number().min(1).max(12),
});

type AchievementFormValues = z.infer<typeof achievementSchema>;

export interface AchievementSectionProps {
  title: string;
  apiPath: string;
  readOnly?: boolean;
  initialItems?: Achievement[];
}

export default function AchievementSection({
  title,
  apiPath,
  readOnly = false,
  initialItems,
}: AchievementSectionProps) {
  const [items, setItems] = useState<Achievement[]>(initialItems ?? []);
  const [loading, setLoading] = useState(!initialItems);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: '',
      year: currentYear,
      month: new Date().getMonth() + 1,
    },
  });

  const loadItems = useCallback(async (): Promise<void> => {
    if (initialItems) {
      setItems(initialItems);
      return;
    }
    setLoading(true);
    try {
      setItems(await fetchAchievements(apiPath));
    } catch {
      message.error('Не удалось загрузить достижения');
    } finally {
      setLoading(false);
    }
  }, [apiPath, initialItems]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (initialItems) {
      setItems(initialItems);
    }
  }, [initialItems]);

  const onSubmit = async (values: AchievementFormValues): Promise<void> => {
    if (selectedFile) {
      const validationError = validateAchievementFile(selectedFile);
      if (validationError) {
        setFileError(validationError);
        return;
      }
    }

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('year', String(values.year));
    formData.append('month', String(values.month));
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    setSubmitting(true);
    try {
      await createAchievement(apiPath, formData);
      message.success('Достижение добавлено');
      reset();
      setSelectedFile(null);
      setFileError(null);
      setShowForm(false);
      await loadItems();
    } catch {
      message.error('Не удалось добавить достижение');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm('Удалить запись?')) {
      return;
    }
    try {
      await deleteAchievement(apiPath, id);
      message.success('Достижение удалено');
      await loadItems();
    } catch {
      message.error('Не удалось удалить достижение');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      setFileError(null);
      return;
    }
    const validationError = validateAchievementFile(file);
    setFileError(validationError);
    setSelectedFile(validationError ? null : file);
  };

  return (
    <div>
      <Typography.Title level={5}>{title}</Typography.Title>

      <Table<Achievement>
        rowKey="id"
        loading={loading}
        dataSource={items}
        pagination={false}
        locale={{ emptyText: 'Записи не добавлены' }}
        columns={[
          { title: 'Год', dataIndex: 'year', width: 80 },
          {
            title: 'Месяц',
            dataIndex: 'month',
            width: 120,
            render: (month: number) =>
              MONTH_OPTIONS.find((option) => option.value === month)?.label ?? month,
          },
          { title: 'Название', dataIndex: 'title' },
          {
            title: 'Файл',
            dataIndex: 'file_url',
            width: 140,
            render: (fileUrl: string | null) =>
              fileUrl ? (
                <a href={fileUrl} target="_blank" rel="noreferrer">
                  📎 Открыть файл
                </a>
              ) : (
                '—'
              ),
          },
          ...(!readOnly
            ? [
                {
                  title: '',
                  key: 'actions',
                  width: 100,
                  render: (_: unknown, record: Achievement) => (
                    <Button danger type="link" onClick={() => void handleDelete(record.id)}>
                      Удалить
                    </Button>
                  ),
                },
              ]
            : []),
        ]}
      />

      {!readOnly && (
        <div style={{ marginTop: 16 }}>
          {!showForm ? (
            <Button type="dashed" onClick={() => setShowForm(true)}>
              Добавить
            </Button>
          ) : (
            <Form layout="vertical" onFinish={() => void handleSubmit(onSubmit)()}>
              <Form.Item
                label="Год"
                validateStatus={errors.year ? 'error' : ''}
                help={errors.year?.message}
              >
                <Controller
                  name="year"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      options={YEAR_OPTIONS}
                      style={{ width: '100%' }}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Месяц"
                validateStatus={errors.month ? 'error' : ''}
                help={errors.month?.message}
              >
                <Controller
                  name="month"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      options={MONTH_OPTIONS}
                      style={{ width: '100%' }}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Название"
                validateStatus={errors.title ? 'error' : ''}
                help={errors.title?.message}
              >
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>

              <Form.Item
                label="Файл (необязательно)"
                validateStatus={fileError ? 'error' : ''}
                help={fileError ?? (selectedFile ? `Выбран: ${selectedFile.name}` : undefined)}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={submitting} style={{ marginRight: 8 }}>
                Сохранить
              </Button>
              <Button
                onClick={() => {
                  setShowForm(false);
                  reset();
                  setSelectedFile(null);
                  setFileError(null);
                }}
              >
                Отмена
              </Button>
            </Form>
          )}
        </div>
      )}
    </div>
  );
}
