import { zodResolver } from '@hookform/resolvers/zod';
import { Button, DatePicker, Form, Input, InputNumber, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { updateMyProfile } from '@/api/profile';
import type { TeacherProfile } from '@/types/profile';

type ProfileFormValues = {
  first_name: string;
  last_name: string;
  middle_name?: string;
  birth_date?: string;
  experience_years: number;
  phone?: string;
  email?: string;
};

interface PersonalInfoSectionProps {
  profile: TeacherProfile;
  onUpdated: (profile: TeacherProfile) => void;
}

export default function PersonalInfoSection({ profile, onUpdated }: PersonalInfoSectionProps) {
  const { t } = useTranslation();

  const profileSchema = z.object({
    first_name: z.string().min(1, t('errors.required')),
    last_name: z.string().min(1, t('errors.required')),
    middle_name: z.string().optional(),
    birth_date: z.string().optional(),
    experience_years: z.number().min(1).max(40),
    phone: z.string().optional(),
    email: z.union([z.string().email(t('errors.invalidEmail')), z.literal('')]).optional(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile.first_name,
      last_name: profile.last_name,
      middle_name: profile.middle_name,
      birth_date: profile.birth_date ?? '',
      experience_years: profile.experience_years,
      phone: profile.phone,
      email: profile.email,
    },
  });

  const onSubmit = async (values: ProfileFormValues): Promise<void> => {
    try {
      const updated = await updateMyProfile({
        ...values,
        middle_name: values.middle_name ?? '',
        phone: values.phone ?? '',
        email: values.email ?? '',
        birth_date: values.birth_date || null,
      });
      onUpdated(updated);
      message.success(t('profile.saved'));
    } catch {
      message.error(t('profile.saveError'));
    }
  };

  return (
    <Form layout="vertical" className="form-grid" onFinish={() => void handleSubmit(onSubmit)()}>
      <Form.Item label={t('profile.lastName')} validateStatus={errors.last_name ? 'error' : ''} help={errors.last_name?.message}>
        <Controller
          name="last_name"
          control={control}
          render={({ field }) => <Input {...field} name="last_name" />}
        />
      </Form.Item>

      <Form.Item label={t('profile.firstName')} validateStatus={errors.first_name ? 'error' : ''} help={errors.first_name?.message}>
        <Controller
          name="first_name"
          control={control}
          render={({ field }) => <Input {...field} name="first_name" />}
        />
      </Form.Item>

      <Form.Item label={t('profile.middleName')}>
        <Controller
          name="middle_name"
          control={control}
          render={({ field }) => <Input {...field} name="middle_name" />}
        />
      </Form.Item>

      <Form.Item label={t('profile.birthDate')}>
        <Controller
          name="birth_date"
          control={control}
          render={({ field }) => (
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              value={field.value ? dayjs(field.value) : null}
              onChange={(date: Dayjs | null) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label={t('profile.experience')}
        validateStatus={errors.experience_years ? 'error' : ''}
        help={errors.experience_years?.message}
      >
        <Controller
          name="experience_years"
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field}
              id="experience_years"
              name="experience_years"
              min={1}
              max={40}
              style={{ width: '100%' }}
            />
          )}
        />
      </Form.Item>

      <Form.Item label={t('profile.phone')}>
        <Controller name="phone" control={control} render={({ field }) => <Input {...field} name="phone" />} />
      </Form.Item>

      <Form.Item label={t('profile.email')} validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => <Input {...field} name="email" type="email" />}
        />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={isSubmitting} data-testid="profile-save">
        {t('profile.save')}
      </Button>
    </Form>
  );
}
