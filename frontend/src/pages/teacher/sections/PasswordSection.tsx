import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, message } from 'antd';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import api from '@/api/axios';

export default function PasswordSection() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const passwordSchema = z.object({
    old_password: z.string().min(1, t('errors.required')),
    new_password: z.string().min(8, t('errors.minPassword')),
    confirm_password: z.string().min(8, t('errors.minPassword')),
  }).refine((data) => data.new_password === data.confirm_password, {
    message: t('errors.passwordMatch'),
    path: ['confirm_password'],
  });

  type PasswordFormValues = z.infer<typeof passwordSchema>;

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    setLoading(true);
    try {
      await api.post('/api/auth/change-password/', values);
      message.success(t('password.success'));
      reset();
    } catch (err: any) {
      if (err.response?.data) {
        const data = err.response.data;
        if (data.old_password) {
          setError('old_password', { message: data.old_password });
        }
        if (data.new_password) {
          setError('new_password', { message: data.new_password });
        }
        if (data.confirm_password) {
          setError('confirm_password', { message: data.confirm_password });
        }
        if (!data.old_password && !data.new_password && !data.confirm_password) {
          message.error(t('password.error'));
        }
      } else {
        message.error(t('password.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400 }}>
      <Form layout="vertical" onFinish={() => void handleSubmit(onSubmit)()}>
        <Form.Item
          label={t('password.oldPassword')}
          validateStatus={errors.old_password ? 'error' : ''}
          help={errors.old_password?.message}
        >
          <Controller
            name="old_password"
            control={control}
            render={({ field }) => <Input.Password {...field} />}
          />
        </Form.Item>

        <Form.Item
          label={t('password.newPassword')}
          validateStatus={errors.new_password ? 'error' : ''}
          help={errors.new_password?.message}
        >
          <Controller
            name="new_password"
            control={control}
            render={({ field }) => <Input.Password {...field} />}
          />
        </Form.Item>

        <Form.Item
          label={t('password.confirmPassword')}
          validateStatus={errors.confirm_password ? 'error' : ''}
          help={errors.confirm_password?.message}
        >
          <Controller
            name="confirm_password"
            control={control}
            render={({ field }) => <Input.Password {...field} />}
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading}>
          {t('password.change')}
        </Button>
      </Form>
    </div>
  );
}
