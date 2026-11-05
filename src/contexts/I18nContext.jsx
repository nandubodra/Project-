import { createContext, useContext, useMemo, useState } from 'react';

const dictionaries = {
  en: {
    home: 'Home', about: 'About', services: 'Services', login: 'Login', logout: 'Logout',
    dashboard: 'Dashboard', profile: 'Profile', applications: 'My Applications',
    citizen: 'Citizen', officer: 'Government Officer', getStarted: 'Get Started',
    title: 'Government forms, filled for you.', subtitle: 'Upload your documents, AI fills the form, you confirm. Track every application until it is approved.',
    required: 'Required documents', continue: 'Continue', submit: 'Confirm & Submit', review: 'Final review',
    upload: 'Upload documents', aiFill: 'AI Fill', status: 'Status', tracking: 'Tracking',
    official: 'Sahayak is an assistance portal, not an official government website. Final submission happens on official portals.'
  },
  hi: {
    home: 'होम', about: 'हमारे बारे में', services: 'सेवाएँ', login: 'लॉगिन', logout: 'लॉगआउट',
    dashboard: 'डैशबोर्ड', profile: 'प्रोफ़ाइल', applications: 'मेरे आवेदन',
    citizen: 'नागरिक', officer: 'सरकारी अधिकारी', getStarted: 'शुरू करें',
    title: 'सरकारी फ़ॉर्म, अब अपने-आप भरे।', subtitle: 'दस्तावेज़ अपलोड करें, AI फ़ॉर्म भरेगा, आप बस पुष्टि करें। मंज़ूरी तक हर आवेदन को ट्रैक करें।',
    required: 'आवश्यक दस्तावेज़', continue: 'आगे बढ़ें', submit: 'पुष्टि करें और जमा करें', review: 'अंतिम जाँच',
    upload: 'दस्तावेज़ अपलोड करें', aiFill: 'AI भरे', status: 'स्थिति', tracking: 'ट्रैकिंग',
    official: 'सहायक एक सहायता पोर्टल है, आधिकारिक सरकारी वेबसाइट नहीं। अंतिम आवेदन आधिकारिक वेबसाइट पर ही होता है।'
  }
};

const I18nContext = createContext(null);
export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem('sahayak-language') || 'en');
  const value = useMemo(() => ({
    language,
    toggleLanguage: () => setLanguage(v => { const next = v === 'en' ? 'hi' : 'en'; localStorage.setItem('sahayak-language', next); return next; }),
    t: key => dictionaries[language][key] || dictionaries.en[key] || key,
    pick: value => typeof value === 'string' && value.includes('|') ? value.split('|')[language === 'hi' ? 1 : 0] : value
  }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
export const useI18n = () => useContext(I18nContext);
