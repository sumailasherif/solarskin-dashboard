// Translations (i18n = "internationalisation").
// Every piece of text shown to people lives in locales/<language>.json.
// To add Uzbek later: create locales/uz.json with the same keys and list it below.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already protects against XSS
});

export default i18n;
