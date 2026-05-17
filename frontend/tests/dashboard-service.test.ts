import {createMockDashboardService} from '@/services/dashboard';
import {mockDashboardData} from '@/mocks/dashboard';

describe('createMockDashboardService', () => {
  it('keeps the page-facing contract stable when the data source changes', async () => {
    const service = createMockDashboardService({
      delayMs: 0,
      data: mockDashboardData,
    });

    const result = await service.getDashboardData();

    expect(result).toMatchObject({
      title: mockDashboardData.title,
      metrics: mockDashboardData.metrics,
      statusDistribution: mockDashboardData.statusDistribution,
      closedCases: mockDashboardData.closedCases,
    });
  });
});
