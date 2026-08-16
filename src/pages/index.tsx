import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

type Section = {
  title: string;
  description: string;
  to: string;
  status: 'ready' | 'wip';
};

const sections: Section[] = [
  {
    title: 'Course design',
    description: 'Overview, outcomes, progression, assessment, and AI policy.',
    to: '/docs/00-course-overview/01-overview',
    status: 'ready',
  },
  {
    title: 'Part I — Testing fundamentals',
    description: 'Why automation exists, and what it is for. No code yet.',
    to: '/docs/part-1-testing-fundamentals/00-module-overview',
    status: 'ready',
  },
  {
    title: 'Part II — Programming fundamentals',
    description: 'TypeScript from zero, taught with QA examples.',
    to: '/docs/part-2-programming-fundamentals/00-module-overview',
    status: 'ready',
  },
  {
    title: 'Part III — Automation fundamentals',
    description: 'What separates a passing script from a test you can trust.',
    to: '/docs/part-3-automation-fundamentals/00-module-overview',
    status: 'ready',
  },
  {
    title: 'Part IV — API testing',
    description: 'HTTP, REST, and Playwright API automation.',
    to: '/docs/part-4-api-testing-and-automation/00-module-overview',
    status: 'wip',
  },
  {
    title: 'Part V — Web automation',
    description: 'Playwright in the browser: locators, actions, assertions.',
    to: '/docs/part-5-web-automation-playwright/00-module-overview',
    status: 'wip',
  },
  {
    title: 'Part VI — Framework engineering',
    description: 'Page objects, fixtures, data, config, and flake diagnosis.',
    to: '/docs/part-6-framework-engineering/00-module-overview',
    status: 'wip',
  },
  {
    title: 'Part VII — CI/CD',
    description: 'Git, Jenkins pipelines, and Docker for test automation.',
    to: '/docs/part-7-cicd/00-module-overview',
    status: 'wip',
  },
  {
    title: 'Part VIII — Professional engineering',
    description: 'Clean code, review, and scalable architecture.',
    to: '/docs/part-8-professional-engineering/00-module-overview',
    status: 'wip',
  },
  {
    title: 'Projects',
    description: 'Four applied projects from CLI tooling to web automation.',
    to: '/docs/projects',
    status: 'wip',
  },
  {
    title: 'Capstone',
    description: 'Ship a full-stack TypeScript + Playwright framework.',
    to: '/docs/capstone/00-capstone-overview',
    status: 'wip',
  },
  {
    title: 'Answer keys',
    description: 'Quiz keys for completed chapters. Try the quiz first.',
    to: '/docs/answer-keys',
    status: 'ready',
  },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className="container">
        <p className={styles.kicker}>TypeScript · Playwright · 32 weeks</p>
        <Heading as="h1" className={styles.title}>
          {siteConfig.title}
        </Heading>
        <p className={styles.subtitle}>{siteConfig.tagline}</p>
        <div className={styles.actions}>
          <Link className="button button--primary button--lg" to="/docs/">
            Start learning
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/00-course-overview/01-overview">
            Course overview
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="QA Automation Learning Path"
      description="A beginner-to-intermediate QA automation curriculum with TypeScript and Playwright.">
      <HomepageHeader />
      <main className={styles.main}>
        <div className="container">
          <Heading as="h2" className={styles.sectionTitle}>
            Curriculum
          </Heading>
          <p className={styles.sectionLead}>
            Parts I–III are ready to study. Later parts and projects are listed
            in full, with an In Progress label until the chapter bodies are
            finished.
          </p>
          <div className={styles.grid}>
            {sections.map((section) => (
              <Link
                key={section.to}
                className={clsx(styles.card, section.status === 'wip' && styles.cardWip)}
                to={section.to}>
                <div className={styles.cardTop}>
                  <h3 className={styles.cardTitle}>{section.title}</h3>
                  <span
                    className={clsx(
                      styles.badge,
                      section.status === 'wip' ? styles.badgeWip : styles.badgeReady,
                    )}>
                    {section.status === 'wip' ? 'In Progress' : 'Ready'}
                  </span>
                </div>
                <p className={styles.cardBody}>{section.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
