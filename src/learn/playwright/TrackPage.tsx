import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import LearnLayout from './LearnLayout';
import ProgressSummary from './ProgressSummary';
import {PHASES, STEPS, TRACK_META, getStepsForPhase} from './manifest';
import {learnStepPath} from './paths';
import {useLearnProgress} from './useLearnProgress';
import {isStepComplete} from './progress';

export default function TrackPage(): ReactNode {
  const {progress, hydrated} = useLearnProgress();
  const firstStep = STEPS[0];

  return (
    <LearnLayout
      title={`${TRACK_META.title} — Modul belajar`}
      description={TRACK_META.description}>
      <article className="learn-track-hero">
        <p className="learn-kicker">{TRACK_META.kicker}</p>
        <h1>{TRACK_META.title}</h1>
        <p className="learn-lead">{TRACK_META.description}</p>
        <div className="learn-stats">
          <div className="learn-stat">
            <span className="learn-stat-value">{TRACK_META.phasesCount}</span>
            <span className="learn-stat-label">phase</span>
          </div>
          <div className="learn-stat">
            <span className="learn-stat-value">{STEPS.length}</span>
            <span className="learn-stat-label">modul</span>
          </div>
          <div className="learn-stat">
            <span className="learn-stat-value">Gratis</span>
            <span className="learn-stat-label">akses</span>
          </div>
        </div>
        {hydrated && <ProgressSummary progress={progress} />}
        {firstStep && (
          <Link
            className="learn-btn learn-btn--primary learn-track-cta"
            to={learnStepPath(firstStep.id)}>
            Mulai dari modul pertama
          </Link>
        )}
      </article>

      <section className="learn-curriculum">
        <h2>Kurikulum</h2>
        {PHASES.map((phase) => {
          const steps = getStepsForPhase(phase.id);
          if (steps.length === 0) {
            return null;
          }
          return (
            <div key={phase.id} className="learn-curriculum-phase">
              <div className="learn-curriculum-phase-head">
                <span className="learn-curriculum-phase-tag">Phase {phase.id}</span>
                <h3>{phase.title}</h3>
              </div>
              <ul className="learn-curriculum-list">
                {steps.map((step) => {
                  const done = hydrated && isStepComplete(progress, step.id);
                  return (
                    <li key={step.id}>
                      <Link to={learnStepPath(step.id)} className="learn-curriculum-item">
                        <span className="learn-curriculum-id">{step.id}</span>
                        <div>
                          <span className="learn-curriculum-title">{step.title}</span>
                          <p className="learn-curriculum-summary">{step.summary}</p>
                        </div>
                        {done && <span className="learn-curriculum-done" aria-label="Selesai">✓</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>
    </LearnLayout>
  );
}
