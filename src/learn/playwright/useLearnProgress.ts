import {useCallback, useEffect, useState} from 'react';
import {
  clearProgress,
  loadProgress,
  saveProgress,
  type LearnProgress,
} from './progress';

export function useLearnProgress(): {
  progress: LearnProgress;
  setProgress: (next: LearnProgress) => void;
  resetProgress: () => void;
  hydrated: boolean;
} {
  const [progress, setProgressState] = useState<LearnProgress>(() =>
    loadProgress(),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgressState(loadProgress());
    setHydrated(true);
  }, []);

  const setProgress = useCallback((next: LearnProgress) => {
    setProgressState(next);
    saveProgress(next);
  }, []);

  const resetProgress = useCallback(() => {
    clearProgress();
    setProgressState(loadProgress());
  }, []);

  return {progress, setProgress, resetProgress, hydrated};
}
