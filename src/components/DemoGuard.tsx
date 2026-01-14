import { ReactNode } from 'react';
import { useDemo } from '@/contexts/DemoContext';

interface DemoGuardProps {
  action: string;
  feature?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function DemoGuard({ action, feature, children, fallback }: DemoGuardProps) {
  const { isDemoMode, canPerformAction, showUpgradePrompt } = useDemo();

  if (!isDemoMode) {
    return <>{children}</>;
  }

  if (!canPerformAction(action)) {
    return (
      <div onClick={() => showUpgradePrompt(feature || action)}>
        {fallback || children}
      </div>
    );
  }

  return <>{children}</>;
}
