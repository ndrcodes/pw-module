import {PROGRESS_STORAGE_KEY, STEPS} from './manifest';

export type LearnProgress = {
  completedSteps: string[];
  checklist: Record<string, boolean[]>;
};

function emptyProgress(): LearnProgress {
  return {completedSteps: [], checklist: {}};
}

export function loadProgress(): LearnProgress {
  if (typeof window === 'undefined') {
    return emptyProgress();
  }
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return emptyProgress();
    }
    const parsed = JSON.parse(raw) as LearnProgress;
    return {
      completedSteps: Array.isArray(parsed.completedSteps)
        ? parsed.completedSteps
        : [],
      checklist:
        parsed.checklist && typeof parsed.checklist === 'object'
          ? parsed.checklist
          : {},
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: LearnProgress): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

export function isStepComplete(
  progress: LearnProgress,
  stepId: string,
): boolean {
  return progress.completedSteps.includes(stepId);
}

export function setStepComplete(
  progress: LearnProgress,
  stepId: string,
  complete: boolean,
): LearnProgress {
  const set = new Set(progress.completedSteps);
  if (complete) {
    set.add(stepId);
  } else {
    set.delete(stepId);
  }
  return {...progress, completedSteps: [...set].sort()};
}

export function getChecklistState(
  progress: LearnProgress,
  stepId: string,
  itemCount: number,
): boolean[] {
  const stored = progress.checklist[stepId];
  if (!stored || stored.length !== itemCount) {
    return Array.from({length: itemCount}, () => false);
  }
  return stored;
}

export function setChecklistItem(
  progress: LearnProgress,
  stepId: string,
  index: number,
  checked: boolean,
  itemCount: number,
): LearnProgress {
  const next = getChecklistState(progress, stepId, itemCount);
  next[index] = checked;
  return {
    ...progress,
    checklist: {...progress.checklist, [stepId]: next},
  };
}

export function markAllChecklist(
  progress: LearnProgress,
  stepId: string,
  itemCount: number,
  checked: boolean,
): LearnProgress {
  return {
    ...progress,
    checklist: {
      ...progress.checklist,
      [stepId]: Array.from({length: itemCount}, () => checked),
    },
  };
}

export function countCompletedModules(progress: LearnProgress): number {
  return progress.completedSteps.filter((id) =>
    STEPS.some((s) => s.id === id),
  ).length;
}

export function progressPercent(progress: LearnProgress): number {
  if (STEPS.length === 0) {
    return 0;
  }
  return Math.round((countCompletedModules(progress) / STEPS.length) * 100);
}

export function clearProgress(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
}
