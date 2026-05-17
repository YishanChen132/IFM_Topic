import {render, screen} from '@testing-library/react';
import {DashboardPage} from '@/pages/DashboardPage';
import {createMockDashboardService} from '@/services/dashboard';
import {mockDashboardData} from '@/mocks/dashboard';

describe('DashboardPage', () => {
  it('renders the success state from the service contract', async () => {
    render(<DashboardPage service={createMockDashboardService({delayMs: 0})} />);

    expect(screen.getByText(/正在整理統計分析畫面/i)).toBeInTheDocument();
    expect(await screen.findByText(mockDashboardData.subtitle)).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: /收款追蹤/i})).toBeInTheDocument();
  });

  it('renders the empty state when no metrics are available', async () => {
    render(
      <DashboardPage
        service={createMockDashboardService({
          delayMs: 0,
          data: {
            ...mockDashboardData,
            metrics: [],
          },
        })}
      />,
    );

    expect(await screen.findByText(/目前還沒有統計資料/i)).toBeInTheDocument();
  });

  it('renders the error state when the service fails', async () => {
    render(<DashboardPage service={createMockDashboardService({delayMs: 0, shouldFail: true})} />);

    expect(await screen.findByText(/統計分析資料載入失敗/i)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /重新載入/i})).toBeInTheDocument();
  });
});
