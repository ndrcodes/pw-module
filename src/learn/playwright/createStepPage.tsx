import type {ReactNode} from 'react';
import StepPage from './StepPage';

export function createStepPage(stepId: string): () => ReactNode {
  return function LearnStepRoute(): ReactNode {
    return <StepPage stepId={stepId} />;
  };
}
