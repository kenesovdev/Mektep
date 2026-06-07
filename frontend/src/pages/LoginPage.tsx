import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardPath } from '@/utils/roles';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth();
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && role) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  const handleSubmit = async (values: { email: string; password: string }): Promise<void> => {
    setError('');
    setSubmitting(true);
    try {
      const user = await login(values.email, values.password);
      navigate(getDashboardPath(user.role), { replace: true });
    } catch {
      setError(t('auth.invalidCredentials'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <Card style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
          <Typography.Title level={3} style={{ marginTop: 0 }}>
            {t('auth.title')}
          </Typography.Title>
          <LanguageSwitcher />
        </div>
        <Typography.Paragraph type="secondary">{t('auth.subtitle')}</Typography.Paragraph>

        {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} showIcon />}

        <Form layout="vertical" onFinish={(values) => void handleSubmit(values as { email: string; password: string })}>
          <Form.Item label={t('auth.email')} name="email" rules={[{ required: true, type: 'email' }]}>
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item label={t('auth.password')} name="password" rules={[{ required: true }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={submitting}>
            {t('auth.login')}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
