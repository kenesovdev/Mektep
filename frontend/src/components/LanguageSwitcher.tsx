import { Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language.startsWith('kk') ? 'kk' : 'ru';

  return (
    <Space size={4}>
      <Button
        type={current === 'ru' ? 'primary' : 'text'}
        size="small"
        onClick={() => void i18n.changeLanguage('ru')}
      >
        РУС
      </Button>
      <span>|</span>
      <Button
        type={current === 'kk' ? 'primary' : 'text'}
        size="small"
        onClick={() => void i18n.changeLanguage('kk')}
      >
        ҚАЗ
      </Button>
    </Space>
  );
}
