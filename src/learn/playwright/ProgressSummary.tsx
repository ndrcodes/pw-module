import type {ReactNode} from 'react';
import {STEPS} from './manifest';
import {countCompletedModules, progressPercent} from './progress';
import type {LearnProgress} from './progress';

type Props = {
  progress: LearnProgress;
  compact?: boolean;
};

export default function ProgressSummary({
  progress,
  compact,
}: Props): ReactNode {
  const done = countCompletedModules(progress);
  const total = STEPS.length;
  const percent = progressPercent(progress);

  return (
    <div className={compact ? 'learn-progress learn-progress--compact' : 'learn-progress'}>
      <div className="learn-progress-label">
        <span>{done}/{total} modul selesai</span>
        <span>{percent}%</span>
      </div>
      <div
        className="learn-progress-bar"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}>
        <div
          className="learn-progress-bar-fill"
          style={{width: `${percent}%`}}
        />
      </div>
    </div>
  );
}
