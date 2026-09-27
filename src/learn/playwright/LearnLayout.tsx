import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import StepSidebar from './StepSidebar';
import {useLearnProgress} from './useLearnProgress';

type Props = {
  title: string;
  description?: string;
  activeStepId?: string;
  children: ReactNode;
};

export default function LearnLayout({
  title,
  description,
  activeStepId,
  children,
}: Props): ReactNode {
  const {progress, resetProgress} = useLearnProgress();

  const handleReset = () => {
    if (
      typeof window !== 'undefined' &&
      window.confirm('Hapus semua progress belajar di browser ini?')
    ) {
      resetProgress();
    }
  };

  return (
    <Layout title={title} description={description ?? title}>
      <div className="learn-shell">
        <header className="learn-topbar">
          <Link to="/" className="learn-topbar-brand">
            QA Playwright Path
          </Link>
          <nav className="learn-topbar-nav">
            <Link to="/docs/part-5-web-automation-playwright/00-module-overview">
              Kurikulum EN
            </Link>
            <Link to="/learn/playwright" className="learn-topbar-nav-active">
              Belajar ID
            </Link>
          </nav>
        </header>
        <div className="learn-body">
          <StepSidebar
            activeStepId={activeStepId}
            progress={progress}
            onReset={handleReset}
          />
          <div className="learn-main">{children}</div>
        </div>
      </div>
    </Layout>
  );
}
