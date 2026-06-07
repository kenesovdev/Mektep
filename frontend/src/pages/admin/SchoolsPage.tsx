import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Drawer, Form, Input, Space, Table, Tag, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  activateSchool,
  createAdminSchool,
  deactivateSchool,
  fetchAdminSchools,
  updateAdminSchool,
} from '@/api/admin';
import type { AdminSchool } from '@/types/admin';

const schoolSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  city: z.string().min(2, 'Минимум 2 символа'),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<AdminSchool[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<AdminSchool | null>(null);

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: { name: '', city: '' },
  });

  const loadSchools = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      setSchools(await fetchAdminSchools());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSchools();
  }, [loadSchools]);

  const openCreate = (): void => {
    setEditingSchool(null);
    form.reset({ name: '', city: '' });
    setDrawerOpen(true);
  };

  const openEdit = (school: AdminSchool): void => {
    setEditingSchool(school);
    form.reset({ name: school.name, city: school.city });
    setDrawerOpen(true);
  };

  const onSubmit = async (values: SchoolFormValues): Promise<void> => {
    try {
      if (editingSchool) {
        await updateAdminSchool(editingSchool.id, values);
        message.success('Школа обновлена');
      } else {
        await createAdminSchool(values);
        message.success('Школа создана');
      }
      setDrawerOpen(false);
      await loadSchools();
    } catch {
      message.error('Не удалось сохранить школу');
    }
  };

  const toggleActive = async (school: AdminSchool): Promise<void> => {
    try {
      if (school.is_active) {
        await deactivateSchool(school.id);
        message.success('Школа деактивирована');
      } else {
        await activateSchool(school.id);
        message.success('Школа активирована');
      }
      await loadSchools();
    } catch {
      message.error('Не удалось изменить статус школы');
    }
  };

  return (
    <div>
      <Button type="primary" onClick={openCreate} style={{ marginBottom: 16 }}>
        + Добавить школу
      </Button>

      <Table<AdminSchool>
        rowKey="id"
        loading={loading}
        dataSource={schools}
        pagination={false}
        columns={[
          { title: 'Школа', dataIndex: 'name' },
          { title: 'Город', dataIndex: 'city' },
          { title: 'Учителей', dataIndex: 'teacher_count', width: 100 },
          { title: 'Менеджеров', dataIndex: 'manager_count', width: 110 },
          {
            title: 'Статус',
            dataIndex: 'is_active',
            width: 120,
            render: (active: boolean) =>
              active ? <Tag color="green">✅ Акт.</Tag> : <Tag color="red">❌ Неакт.</Tag>,
          },
          {
            title: 'Действия',
            render: (_, record) => (
              <Space>
                <Button type="link" onClick={() => openEdit(record)}>
                  Ред.
                </Button>
                <Button type="link" onClick={() => void toggleActive(record)}>
                  {record.is_active ? 'Деакт.' : 'Акт.'}
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Drawer
        title={editingSchool ? 'Редактировать школу' : 'Добавить школу'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={400}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={() => void form.handleSubmit(onSubmit)()}>
          <Form.Item
            label="Название"
            validateStatus={form.formState.errors.name ? 'error' : ''}
            help={form.formState.errors.name?.message}
          >
            <Controller
              name="name"
              control={form.control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>
          <Form.Item
            label="Город"
            validateStatus={form.formState.errors.city ? 'error' : ''}
            help={form.formState.errors.city?.message}
          >
            <Controller
              name="city"
              control={form.control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={form.formState.isSubmitting}>
            Сохранить
          </Button>
        </Form>
      </Drawer>
    </div>
  );
}
