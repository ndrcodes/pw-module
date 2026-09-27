import type {ReactNode} from 'react';
import clsx from 'clsx';
import type {LearnProgress} from './progress';
import {
  getChecklistState,
  markAllChecklist,
  setChecklistItem,
  setStepComplete,
} from './progress';

type Props = {
  stepId: string;
  items: string[];
  progress: LearnProgress;
  onChange: (next: LearnProgress) => void;
};

export default function ChecklistLab({
  stepId,
  items,
  progress,
  onChange,
}: Props): ReactNode {
  if (items.length === 0) {
    return null;
  }

  const state = getChecklistState(progress, stepId, items.length);
  const checkedCount = state.filter(Boolean).length;
  const allDone = checkedCount === items.length;

  const toggle = (index: number) => {
    const nextState = [...state];
    nextState[index] = !nextState[index];
    let next = setChecklistItem(
      progress,
      stepId,
      index,
      nextState[index],
      items.length,
    );
    next = setStepComplete(next, stepId, nextState.every(Boolean));
    onChange(next);
  };

  const markAll = () => {
    let next = markAllChecklist(progress, stepId, items.length, true);
    next = setStepComplete(next, stepId, true);
    onChange(next);
  };

  const markModuleOnly = () => {
    onChange(setStepComplete(progress, stepId, !allDone));
  };

  return (
    <section className="learn-checklist">
      <div className="learn-checklist-header">
        <h2>Checklist lab</h2>
        <span className="learn-checklist-count">
          {checkedCount}/{items.length}
        </span>
      </div>
      <ul className="learn-checklist-list">
        {items.map((label, index) => (
          <li key={label}>
            <label className={clsx('learn-checklist-item', state[index] && 'learn-checklist-item--done')}>
              <input
                type="checkbox"
                checked={state[index]}
                onChange={() => toggle(index)}
              />
              <span>{label}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="learn-checklist-actions">
        <p>Centang setelah praktik berhasil.</p>
        <div className="learn-checklist-buttons">
          <button type="button" className="learn-btn learn-btn--secondary" onClick={markAll}>
            Tandai semua selesai
          </button>
          <button type="button" className="learn-btn learn-btn--ghost" onClick={markModuleOnly}>
            {allDone ? 'Lepas tanda modul' : 'Tandai modul selesai'}
          </button>
        </div>
      </div>
    </section>
  );
}
