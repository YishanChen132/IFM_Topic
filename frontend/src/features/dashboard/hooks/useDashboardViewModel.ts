import {useEffect, useState} from 'react';
import type {DashboardService} from '@/services/dashboard';
import {dashboardService as defaultDashboardService} from '@/services/dashboard';
import type {DashboardData} from '@/types/dashboard';

export interface DashboardViewModel {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

export function useDashboardViewModel(
  service: DashboardService = defaultDashboardService,
): DashboardViewModel {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    setIsLoading(true);
    setError(null);

    service
      .getDashboardData(controller.signal)
      .then((nextData) => {
        if (!isMounted) {
          return;
        }

        setData(nextData);
      })
      .catch((reason: unknown) => {
        if (!isMounted) {
          return;
        }

        if (reason instanceof DOMException && reason.name === 'AbortError') {
          return;
        }

        setError(
          reason instanceof Error ? reason.message : 'Unexpected dashboard loading error.',
        );
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [reloadKey, service]);

  return {
    data,
    isLoading,
    error,
    reload: () => setReloadKey((current) => current + 1),
  };
}
