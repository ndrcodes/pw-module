import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import type {LearnStep} from './manifest';
import {learnStepPath} from './paths';

type Props = {
  prev?: LearnStep;
  next?: LearnStep;
};

export default function StepNavigation({prev, next}: Props): ReactNode {
  return (
    <footer className="learn-step-nav">
      {prev ? (
        <Link className="learn-step-nav-card learn-step-nav-card--prev" to={learnStepPath(prev.id)}>
          <span className="learn-step-nav-label">Sebelumnya</span>
          <span className="learn-step-nav-title">
            <span className="learn-step-nav-id">{prev.id}</span>
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link className="learn-step-nav-card learn-step-nav-card--next" to={learnStepPath(next.id)}>
          <span className="learn-step-nav-label">Berikutnya</span>
          <span className="learn-step-nav-title">
            <span className="learn-step-nav-id">{next.id}</span>
            {next.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </footer>
  );
}
