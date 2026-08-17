import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkStripHiddenLinks from './src/remark/strip-hidden-links';

const config: Config = {
  title: 'QA Automation with Playwright',
  tagline:
    'From “I don’t know how to code” to designing, implementing, and maintaining an automation framework.',
  favicon: 'img/favicon.svg',

  url: 'https://ndrcodes.github.io',
  baseUrl: process.env.CI ? '/pw-module/' : '/',

  organizationName: 'ndrcodes',
  projectName: 'pw-module',

  onBrokenLinks: 'warn',
  onBrokenAnchors: 'warn',

  markdown: {
    format: 'detect',
    mermaid: true,
    preprocessor: ({fileContent}) =>
      fileContent.replace(
        /\]\((?:\.\.\/)+answer-keys\/([^)]+?)\.md\)/g,
        '](/docs/answer-keys/$1)',
      ),
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'id'],
    localeConfigs: {
      en: {
        label: 'English',
        htmlLang: 'en',
      },
      id: {
        label: 'Bahasa Indonesia',
        htmlLang: 'id',
      },
    },
  },

  themes: ['@docusaurus/theme-mermaid'],

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        createRedirects(existingPath: string) {
          if (existingPath.startsWith('/docs/') && !existingPath.endsWith('/')) {
            return [`${existingPath}.md`];
          }
          return undefined;
        },
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          numberPrefixParser: false,
          remarkPlugins: [remarkStripHiddenLinks],
          beforeDefaultRemarkPlugins: [remarkStripHiddenLinks],
          exclude: [
            '**/_*.{js,jsx,ts,tsx,md,mdx}',
            '**/_*/**',
            '**/*.test.{js,jsx,ts,tsx}',
            '**/__tests__/**',
            '**/instructor-notes.md',
            'PHASE-2-CONTINUE.md',
          ],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'QA Playwright Path',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'curriculumSidebar',
          position: 'left',
          label: 'Curriculum',
        },
        {
          to: '/docs/answer-keys',
          label: 'Answer keys',
          position: 'left',
        },
        {
          href: 'https://github.com/ndrcodes/pw-module',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Learn',
          items: [
            {label: 'Overview', to: '/docs/'},
            {label: 'Course overview', to: '/docs/00-course-overview/01-overview'},
            {label: 'Part I', to: '/docs/part-1-testing-fundamentals/00-module-overview'},
          ],
        },
        {
          title: 'Practice',
          items: [
            {label: 'Projects', to: '/docs/projects'},
            {label: 'Capstone', to: '/docs/capstone/00-capstone-overview'},
            {label: 'Answer keys', to: '/docs/answer-keys'},
          ],
        },
      ],
      copyright: `QA Automation Engineering with TypeScript and Playwright.`,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['bash', 'json', 'typescript', 'yaml', 'docker'],
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
