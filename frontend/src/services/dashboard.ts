import {mockDashboardData} from '@/mocks/dashboard';
import type {DashboardData} from '@/types/dashboard';

export interface DashboardService {
  getDashboardData(signal?: AbortSignal): Promise<DashboardData>;
}

export interface DashboardServiceOptions {
  delayMs?: number;
  data?: DashboardData;
  shouldFail?: boolean;
}

export function createMockDashboardService(
  options: DashboardServiceOptions = {},
): DashboardService {
  const {delayMs = 240, data = mockDashboardData, shouldFail = false} = options;

  return {
    async getDashboardData(signal) {
      await wait(delayMs, signal);

      if (shouldFail) {
        throw new Error('Unable to load dashboard data.');
      }

      return data;
    },
  };
}

export const dashboardService = createMockDashboardService();

function wait(delayMs: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', abortHandler);
      resolve();
    }, delayMs);

    const abortHandler = () => {
      window.clearTimeout(timer);
      signal?.removeEventListener('abort', abortHandler);
      reject(new DOMException('Request aborted', 'AbortError'));
    };

    signal?.addEventListener('abort', abortHandler, {once: true});
  });
}
