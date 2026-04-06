import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';
import mr from './locales/mr/translation.json';
import bn from './locales/bn/translation.json';
import ta from './locales/ta/translation.json';
import ml from './locales/ml/translation.json';
import kn from './locales/kn/translation.json';
import pa from './locales/pa/translation.json';
import gu from './locales/gu/translation.json';

const resources = {
    en: { translation: en },
    hi: { translation: hi },
    mr: { translation: mr },
    bn: { translation: bn },
    ta: { translation: ta },
    ml: { translation: ml },
    kn: { translation: kn },
    pa: { translation: pa },
    gu: { translation: gu }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        detection: {
            order: ['cookie', 'localStorage', 'navigator'],
            caches: ['cookie', 'localStorage'],
        },
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
