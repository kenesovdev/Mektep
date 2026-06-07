import { Card, Spin, Tabs, message } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyProfile } from '@/api/profile';
import DashboardLayout from '@/components/DashboardLayout';
import type { TeacherProfile } from '@/types/profile';
import AchievementSection from '@/components/AchievementSection';
import CertificatesSection from './sections/CertificatesSection';
import DiplomasSection from './sections/DiplomasSection';
import PersonalInfoSection from './sections/PersonalInfoSection';
import QualificationsSection from './sections/QualificationsSection';
import PasswordSection from './sections/PasswordSection';
import { useTranslation } from 'react-i18next';

export default function TeacherProfilePage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        setProfile(await fetchMyProfile());
      } catch {
        message.error('Не удалось загрузить профиль');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading || !profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Моё портфолио"
      extra={<Link to="/teacher/dashboard">← На главную</Link>}
    >
      <Card>
        <Tabs
          defaultActiveKey="personal"
          items={[
            {
              key: 'personal',
              label: 'Личные данные',
              children: <PersonalInfoSection profile={profile} onUpdated={setProfile} />,
            },
            {
              key: 'diplomas',
              label: 'Дипломы',
              children: <DiplomasSection profile={profile} onUpdated={setProfile} />,
            },
            {
              key: 'certificates',
              label: 'Сертификаты',
              children: <CertificatesSection profile={profile} onUpdated={setProfile} />,
            },
            {
              key: 'qualifications',
              label: 'Квалификация',
              children: <QualificationsSection profile={profile} onUpdated={setProfile} />,
            },
            {
              key: 'achievements',
              label: 'Жетістіктер',
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  <AchievementSection
                    title="Мұғалім жетістігі"
                    apiPath="/api/profile/me/achievements/teacher/"
                  />
                  <AchievementSection
                    title="Оқушы жетістігі"
                    apiPath="/api/profile/me/achievements/student/"
                  />
                </div>
              ),
            },
            {
              key: 'password',
              label: t('password.tab', 'Изменить пароль'),
              children: <PasswordSection />,
            },
          ]}
        />
      </Card>
    </DashboardLayout>
  );
}
