import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  message,
} from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminSchools,
  fetchAdminUsers,
  resetAdminUserPassword,
  updateAdminUser,
} from '@/api/admin';
import type { AdminSchool, AdminUser } from '@/types/admin';
import type { UserRole } from '@/types/auth';
import { ROLES, ROLE_LABELS } from '@/utils/roles';

const createUserSchema = z
  .object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(8, 'Минимум 8 символов'),
    role: z.enum([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEACHER]),
    school_id: z.number().nullable().optional(),
  })
  .refine(
    (data) => {
      if (
        (data.role === ROLES.TEACHER || data.role === ROLES.MANAGER) &&
        !data.school_id
      ) {
        return false;
      }
      return true;
    },
    { message: 'Для учителя и менеджера необходимо выбрать школу', path: ['school_id'] },
  );

const updateUserSchema = z
  .object({
    role: z.enum([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEACHER]),
    school_id: z.number().nullable().optional(),
  })
  .refine(
    (data) => {
      if (
        (data.role === ROLES.TEACHER || data.role === ROLES.MANAGER) &&
        !data.school_id
      ) {
        return false;
      }
      return true;
    },
    { message: 'Для учителя и менеджера необходимо выбрать школу', path: ['school_id'] },
  );

type CreateUserValues = z.infer<typeof createUserSchema>;
type UpdateUserValues = z.infer<typeof updateUserSchema>;

const roleOptions = [
  { value: ROLES.ADMIN, label: 'Администратор' },
  { value: ROLES.MANAGER, label: 'Менеджер' },
  { value: ROLES.TEACHER, label: 'Учитель' },
];

const filterRoleOptions = [{ value: '', label: 'Все' }, ...roleOptions];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [schools, setSchools] = useState<AdminSchool[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [passwordUserId, setPasswordUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const createForm = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: '', password: '', role: ROLES.TEACHER, school_id: null },
  });

  const updateForm = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { role: ROLES.TEACHER, school_id: null },
  });

  const watchedCreateRole = createForm.watch('role');
  const watchedUpdateRole = updateForm.watch('role');

  const loadUsers = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      setUsers(await fetchAdminUsers({ search, role: roleFilter }));
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  const loadSchools = useCallback(async (): Promise<void> => {
    setSchools(await fetchAdminSchools(true));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadUsers();
    }, 300);
    return () => clearTimeout(timeout);
  }, [loadUsers]);

  useEffect(() => {
    void loadSchools();
  }, [loadSchools]);

  const openCreateDrawer = (): void => {
    setEditingUser(null);
    createForm.reset({ email: '', password: '', role: ROLES.TEACHER, school_id: null });
    setDrawerOpen(true);
  };

  const openEditDrawer = (user: AdminUser): void => {
    setEditingUser(user);
    updateForm.reset({ role: user.role, school_id: user.school_id });
    setDrawerOpen(true);
  };

  const closeDrawer = (): void => {
    setDrawerOpen(false);
    setEditingUser(null);
  };

  const onCreateSubmit = async (values: CreateUserValues): Promise<void> => {
    try {
      await createAdminUser({
        email: values.email,
        password: values.password,
        role: values.role,
        school_id: values.school_id ?? null,
      });
      message.success('Пользователь создан');
      closeDrawer();
      await loadUsers();
    } catch {
      message.error('Не удалось создать пользователя');
    }
  };

  const onUpdateSubmit = async (values: UpdateUserValues): Promise<void> => {
    if (!editingUser) return;
    try {
      await updateAdminUser(editingUser.id, {
        role: values.role,
        school_id: values.school_id ?? null,
      });
      message.success('Пользователь обновлён');
      closeDrawer();
      await loadUsers();
    } catch {
      message.error('Не удалось обновить пользователя');
    }
  };

  const handleDelete = async (user: AdminUser): Promise<void> => {
    if (!window.confirm('Удалить пользователя? Это действие необратимо.')) {
      return;
    }
    try {
      await deleteAdminUser(user.id);
      message.success('Пользователь удалён');
      await loadUsers();
    } catch {
      message.error('Не удалось удалить пользователя');
    }
  };

  const handleResetPassword = async (): Promise<void> => {
    if (!passwordUserId || newPassword.length < 8) {
      message.warning('Пароль должен содержать минимум 8 символов');
      return;
    }
    try {
      await resetAdminUserPassword(passwordUserId, newPassword);
      message.success('Пароль обновлён');
      setPasswordUserId(null);
      setNewPassword('');
    } catch {
      message.error('Не удалось сбросить пароль');
    }
  };

  const schoolOptions = schools.map((school) => ({
    value: school.id,
    label: `${school.name} (${school.city})`,
  }));

  return (
    <div>
      <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <Select
          value={roleFilter}
          onChange={setRoleFilter}
          options={filterRoleOptions}
          style={{ width: 160 }}
        />
        <Input.Search
          placeholder="Поиск по email"
          allowClear
          onChange={(event) => setSearch(event.target.value)}
          style={{ width: 280 }}
        />
        <Button type="primary" onClick={openCreateDrawer}>
          + Создать пользователя
        </Button>
      </Space>

      <Table<AdminUser>
        rowKey="id"
        loading={loading}
        dataSource={users}
        pagination={false}
        columns={[
          { title: 'Email', dataIndex: 'email' },
          {
            title: 'Роль',
            dataIndex: 'role',
            render: (role: UserRole) => ROLE_LABELS[role],
          },
          {
            title: 'Школа',
            dataIndex: 'school_name',
            render: (value: string | null) => value ?? '—',
          },
          {
            title: 'Действия',
            render: (_, record) => (
              <Space>
                <Button type="link" onClick={() => openEditDrawer(record)}>
                  Изменить
                </Button>
                <Button type="link" onClick={() => setPasswordUserId(record.id)}>
                  Сбросить пароль
                </Button>
                <Button type="link" danger onClick={() => void handleDelete(record)}>
                  🗑
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Drawer
        title={editingUser ? 'Изменить пользователя' : 'Создать пользователя'}
        open={drawerOpen}
        onClose={closeDrawer}
        width={420}
        destroyOnClose
      >
        {editingUser ? (
          <Form layout="vertical" onFinish={() => void updateForm.handleSubmit(onUpdateSubmit)()}>
            <Form.Item label="Email">
              <Input value={editingUser.email} disabled />
            </Form.Item>
            <Form.Item
              label="Роль"
              validateStatus={updateForm.formState.errors.role ? 'error' : ''}
              help={updateForm.formState.errors.role?.message}
            >
              <Controller
                name="role"
                control={updateForm.control}
                render={({ field }) => <Select {...field} options={roleOptions} />}
              />
            </Form.Item>
            {watchedUpdateRole !== ROLES.ADMIN && (
              <Form.Item
                label="Школа"
                validateStatus={updateForm.formState.errors.school_id ? 'error' : ''}
                help={updateForm.formState.errors.school_id?.message}
              >
                <Controller
                  name="school_id"
                  control={updateForm.control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? undefined}
                      onChange={(value) => field.onChange(value ?? null)}
                      options={schoolOptions}
                      allowClear
                      placeholder="Выберите школу"
                    />
                  )}
                />
              </Form.Item>
            )}
            <Button type="primary" htmlType="submit" loading={updateForm.formState.isSubmitting}>
              Сохранить
            </Button>
          </Form>
        ) : (
          <Form layout="vertical" onFinish={() => void createForm.handleSubmit(onCreateSubmit)()}>
            <Form.Item
              label="Email"
              validateStatus={createForm.formState.errors.email ? 'error' : ''}
              help={createForm.formState.errors.email?.message}
            >
              <Controller
                name="email"
                control={createForm.control}
                render={({ field }) => <Input {...field} type="email" />}
              />
            </Form.Item>
            <Form.Item
              label="Пароль"
              validateStatus={createForm.formState.errors.password ? 'error' : ''}
              help={createForm.formState.errors.password?.message}
            >
              <Controller
                name="password"
                control={createForm.control}
                render={({ field }) => <Input.Password {...field} />}
              />
            </Form.Item>
            <Form.Item
              label="Роль"
              validateStatus={createForm.formState.errors.role ? 'error' : ''}
              help={createForm.formState.errors.role?.message}
            >
              <Controller
                name="role"
                control={createForm.control}
                render={({ field }) => <Select {...field} options={roleOptions} />}
              />
            </Form.Item>
            {watchedCreateRole !== ROLES.ADMIN && (
              <Form.Item
                label="Школа"
                validateStatus={createForm.formState.errors.school_id ? 'error' : ''}
                help={createForm.formState.errors.school_id?.message}
              >
                <Controller
                  name="school_id"
                  control={createForm.control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? undefined}
                      onChange={(value) => field.onChange(value ?? null)}
                      options={schoolOptions}
                      allowClear
                      placeholder="Выберите школу"
                    />
                  )}
                />
              </Form.Item>
            )}
            <Button type="primary" htmlType="submit" loading={createForm.formState.isSubmitting}>
              Создать
            </Button>
          </Form>
        )}
      </Drawer>

      <Modal
        title="Сбросить пароль"
        open={passwordUserId !== null}
        onCancel={() => {
          setPasswordUserId(null);
          setNewPassword('');
        }}
        onOk={() => void handleResetPassword()}
        okText="Сохранить"
      >
        <Input.Password
          placeholder="Новый пароль"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </Modal>
    </div>
  );
}
