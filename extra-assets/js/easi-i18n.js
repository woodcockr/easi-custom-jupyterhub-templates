define(["I18n", "react"], function (
  I18n,
  { useState, useEffect, createContext, useContext, createElement: e }
) {
  const i18n = new I18n.I18n();

  i18n.defaultLocale = "en";
  i18n.enableFallback = true;

  async function loadTranslations(i18n, locale) {
    const response = await fetch(
      `/hub/static/extra-assets/i18n/${locale}.json`
    );
    const translations = await response.json();
    i18n.store(translations);
  }

  const I18nContext = createContext();

  const I18nProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      (async () => {
        const loaders = [loadTranslations(i18n, "en")];
        const languageCode = navigator.language.split("-")[0];
        if (languageCode !== "en") {
          i18n.locale = languageCode;
          loaders.push(loadTranslations(i18n, languageCode));
        }
        await Promise.all(loaders);
        setLoading(false);
      })();
    }, []);

    if (loading) {
      return null;
    }
    return e(I18nContext.Provider, { value: i18n }, children);
  };

  const useI18n = () => {
    return useContext(I18nContext);
  };

  return { useI18n, I18nContext, I18nProvider };
});
