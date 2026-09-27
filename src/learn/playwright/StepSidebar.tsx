import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import {PHASES, TRACK_META, getStepsForPhase} from './manifest';
import {learnStepPath} from './paths';
import ProgressSummary from './ProgressSummary';
import type {LearnProgress} from './progress';
import {isStepComplete} from './progress';

type Props = {
  activeStepId?: string;
  progress: LearnProgress;
  onReset?: () => void;
};

export default function StepSidebar({
  activeStepId,
  progress,
  onReset,
}: Props): ReactNode {
  return (
    <aside className="learn-sidebar">
      <Link to="/learn/playwright" className="learn-sidebar-track">
        {TRACK_META.title}
      </Link>
      <ProgressSummary progress={progress} compact />
      <nav className="learn-sidebar-nav" aria-label="Daftar modul">
        {PHASES.map((phase) => {
          const steps = getStepsForPhase(phase.id);
          if (steps.length === 0) {
            return null;
          }
          return (
            <div key={phase.id} className="learn-sidebar-phase">
              <p className="learn-sidebar-phase-title">{phase.title}</p>
              <ul>
                {steps.map((step) => {
                  const done = isStepComplete(progress, step.id);
                  const active = step.id === activeStepId;
                  return (
                    <li key={step.id}>
                      <Link
                        to={learnStepPath(step.id)}
                        className={clsx(
                          'learn-sidebar-link',
                          active && 'learn-sidebar-link--active',
                          done && 'learn-sidebar-link--done',
                        )}>
                        <span className="learn-sidebar-link-id">{step.id}</span>
                        <span className="learn-sidebar-link-title">
                          {step.title}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      {onReset && (
        <button type="button" className="learn-reset-btn" onClick={onReset}>
          Reset progress
        </button>
      )}
    </aside>
  );
}
