import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import kk from './locales/kk.json';
import ru from './locales/ru.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      kk: { translation: kk },
    },
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'kk'],
    interpolation: { escapeValue: false },
  });

export default i18n;
