import { ui, defaultLang } from '@/i18n/ui';

export type Lang = keyof typeof ui;

export function getLangFromUrl(url: URL): Lang {
  const [, maybeLang] = url.pathname.split('/');
  if (maybeLang in ui) return maybeLang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/**
 * Maps a default-locale (es) pathname to its equivalent in `lang`.
 * es is served unprefixed, other locales are prefixed (`/en/...`).
 */
export function useTranslatedPath(lang: Lang) {
  return function translatePath(path: string, targetLang: Lang = lang): string {
    return targetLang === defaultLang ? path : `/${targetLang}${path}`;
  };
}

/**
 * Given the current URL, returns the same path under each supported locale.
 * Used to build the language switcher and hreflang alternate links.
 */
export function getLocalizedPaths(pathname: string): Record<Lang, string> {
  const isPrefixed = pathname.startsWith(`/en/`) || pathname === '/en';
  const basePath = isPrefixed ? pathname.replace(/^\/en/, '') || '/' : pathname;

  return {
    es: basePath,
    en: basePath === '/' ? '/en' : `/en${basePath}`,
  };
}
