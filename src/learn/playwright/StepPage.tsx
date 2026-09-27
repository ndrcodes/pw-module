import type {ReactNode} from 'react';
import {Redirect} from '@docusaurus/router';
import LearnLayout from './LearnLayout';
import MarkdownContent from './MarkdownContent';
import ChecklistLab from './ChecklistLab';
import StepNavigation from './StepNavigation';
import {
  getAdjacentSteps,
  getPhaseById,
  getStepById,
  TRACK_META,
} from './manifest';
import {useLearnProgress} from './useLearnProgress';

type Props = {
  stepId?: string;
};

export default function StepPage({stepId: forcedStepId}: Props): ReactNode {
  const step = forcedStepId ? getStepById(forcedStepId) : undefined;
  const {progress, setProgress} = useLearnProgress();

  if (!step) {
    return <Redirect to="/learn/playwright" />;
  }

  const phase = getPhaseById(step.phaseId);
  const {prev, next} = getAdjacentSteps(step.id);

  return (
    <LearnLayout
      title={`${step.id} — ${step.title}`}
      description={step.summary}
      activeStepId={step.id}>
      <article className="learn-article">
        <header className="learn-article-header">
          {phase && (
            <p className="learn-article-phase">
              Phase {phase.id} · {phase.title}
            </p>
          )}
          <p className="learn-article-modul">MODUL {step.id}</p>
          <h1>{step.title}</h1>
          <p className="learn-article-summary">{step.summary}</p>
        </header>

        <MarkdownContent source={step.body} />

        <ChecklistLab
          stepId={step.id}
          items={step.checklist}
          progress={progress}
          onChange={setProgress}
        />

        <StepNavigation prev={prev} next={next} />
      </article>
    </LearnLayout>
  );
}
