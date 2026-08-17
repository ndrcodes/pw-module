import type {ReactNode} from 'react';
import React, {useEffect} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import styles from './styles.module.css';

/**
 * Doc ids (relative to docs root) that have an Indonesian translation.
 * These match the Docusaurus doc `id` field (file path without extension).
 */
const DOCS_WITH_ID_TRANSLATION = new Set([
  'part-3-automation-fundamentals/00-module-overview',
  'part-3-automation-fundamentals/01-principles-of-good-automated-tests',
  'part-3-automation-fundamentals/02-test-automation-architecture',
]);

const LANG_PREF_KEY = 'docs-lang-preference';

interface Props {
  docId: string;
}

/**
 * Builds the Indonesian locale URL for a given English pathname.
 * English pathname: /docs/part-3/...
 * Indonesian URL:   {baseUrl}id/docs/part-3/...
 */
function toIdUrl(baseUrl: string, enPathname: string): string {
  // baseUrl ends with '/', enPathname starts with '/'
  // Result: /pw-module/id/docs/... (production) or /id/docs/... (local)
  return `${baseUrl}id${enPathname}`;
}

/**
 * Builds the English locale URL for a given Indonesian pathname.
 * Indonesian pathname (from useLocation): /id/docs/part-3/...
 * English URL:                            {baseUrl.trimEnd('/') + '/docs/part-3/...'}
 */
function toEnUrl(baseUrl: string, idPathname: string): string {
  // Strip the leading /id segment from the pathname
  const enPathname = idPathname.replace(/^\/id\//, '/');
  // baseUrl ends with '/', so remove one trailing slash to avoid double-slash
  return `${baseUrl.slice(0, -1)}${enPathname}`;
}

export default function LanguageSwitcher({docId}: Props): ReactNode {
  const {i18n, siteConfig} = useDocusaurusContext();
  const currentLocale = i18n.currentLocale;
  const baseUrl = siteConfig.baseUrl;
  const location = useLocation();

  const hasTranslation = DOCS_WITH_ID_TRANSLATION.has(docId);

  // On English pages that have a translation: redirect to Indonesian unless
  // the user has explicitly chosen English.
  useEffect(() => {
    if (!hasTranslation) return;
    if (currentLocale !== 'en') return;

    const pref = localStorage.getItem(LANG_PREF_KEY);
    if (pref !== 'en') {
      window.location.replace(toIdUrl(baseUrl, location.pathname));
    }
  }, [hasTranslation, currentLocale, baseUrl, location.pathname]);

  if (!hasTranslation) return null;

  if (currentLocale === 'id') {
    const enUrl = toEnUrl(baseUrl, location.pathname);
    return (
      <div className={styles.switcher}>
        <span className={styles.currentLang}>🇮🇩 Bahasa Indonesia</span>
        <a
          href={enUrl}
          className={styles.switchButton}
          onClick={() => localStorage.setItem(LANG_PREF_KEY, 'en')}
        >
          Read in English
        </a>
      </div>
    );
  }

  // English page — show a switch button (visible briefly before redirect or
  // after the user explicitly chose English).
  const idUrl = toIdUrl(baseUrl, location.pathname);
  return (
    <div className={styles.switcher}>
      <span className={styles.currentLang}>🇬🇧 English</span>
      <a
        href={idUrl}
        className={styles.switchButton}
        onClick={() => localStorage.removeItem(LANG_PREF_KEY)}
      >
        Baca dalam Bahasa Indonesia
      </a>
    </div>
  );
}
