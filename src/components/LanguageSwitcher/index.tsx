import type {ReactNode} from 'react';
import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useAlternatePageUtils} from '@docusaurus/theme-common/internal';
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

interface Props {
  docId: string;
}

export default function LanguageSwitcher({docId}: Props): ReactNode {
  const {i18n} = useDocusaurusContext();
  const currentLocale = i18n.currentLocale;
  const alternatePageUtils = useAlternatePageUtils();

  const hasTranslation = DOCS_WITH_ID_TRANSLATION.has(docId);
  if (!hasTranslation) return null;

  if (currentLocale === 'id') {
    // On Indonesian page: offer switch to English
    const enUrl = alternatePageUtils.createUrl({locale: 'en', fullyQualified: false});
    return (
      <div className={styles.switcher}>
        <span className={styles.currentLang}>🇮🇩 Bahasa Indonesia</span>
        <a href={enUrl} className={styles.switchButton}>
          Read in English
        </a>
      </div>
    );
  }

  // On English page: offer switch to Indonesian
  const idUrl = alternatePageUtils.createUrl({locale: 'id', fullyQualified: false});
  return (
    <div className={styles.switcher}>
      <span className={styles.currentLang}>🇬🇧 English</span>
      <a href={idUrl} className={styles.switchButton}>
        Baca dalam Bahasa Indonesia
      </a>
    </div>
  );
}
