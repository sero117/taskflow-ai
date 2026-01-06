"use client"

import { createContext, useContext, useState, useEffect } from "react"

const LanguageContext = createContext({
  lang: "ar",
  toggleLanguage: () => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState("ar");

  // حفظ اللغة في المتصفح لكي لا تضيع عند التحديث
  useEffect(() => {
    const savedLang = localStorage.getItem("app-lang") || "ar";
    setLang(savedLang);
    updateDocument(savedLang);
  }, []);

  const updateDocument = (l: string) => {
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = l;
  };

  const toggleLanguage = () => {
    const newLang = lang === "ar" ? "en" : "ar";
    setLang(newLang);
    localStorage.setItem("app-lang", newLang);
    updateDocument(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);