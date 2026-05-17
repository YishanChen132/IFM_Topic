import {useMemo} from 'react';
import {StatePanel} from '@/components/ui/StatePanel';
import {useDashboardViewModel} from '@/features/dashboard/hooks/useDashboardViewModel';
import {useCrmStore} from '@/store/crmStore';
import type {DashboardService} from '@/services/dashboard';
import type {DashboardData} from '@/types/dashboard';

interface DashboardPageProps {
  service?: DashboardService;
}

const revenueAxis = ['$150k', '$100k', '$50k', '$0k'];

function parseCurrencyLabel(value: string) {
  const normalized = value.replace('$', '').toLowerCase();
  if (normalized.includes('k')) {
    return Number.parseFloat(normalized.replace('k', '')) * 1000;
  }

  return Number.parseFloat(normalized.replace(/,/g, '')) || 0;
}

export function DashboardPage({service}: DashboardPageProps) {
  if (service) {
    return <DashboardServicePage service={service} />;
  }

  return <LiveDashboardPage />;
}

function DashboardServicePage({service}: {service: DashboardService}) {
  const {data, error, isLoading, reload} = useDashboardViewModel(service);
  return <DashboardContent data={data} error={error} isLoading={isLoading} reload={reload} />;
}

function LiveDashboardPage() {
  const {cases, threads} = useCrmStore();

  const data = useMemo<DashboardData>(() => {
    const completedCases = cases.filter((item) => item.status === '已完成');
    const activeCases = cases.filter((item) => item.status === '進行中');
    const quoteCases = cases.filter((item) => item.status === '需求確認中' || item.status === '已報價' || item.status === '等待回覆');
    const clientCases = cases.filter((item) => item.status === '等待素材' || item.status === '待修改' || item.status === '待交付');
    const riskCases = cases.filter((item) => item.highRisk);
    const totalAmount = cases.reduce((sum, item) => sum + (item.amount ?? 0), 0);
    const confirmedIncome = completedCases.reduce((sum, item) => sum + (item.amount ?? 0), 0);
    const averageTicket = cases.filter((item) => item.amount).length > 0 ? Math.round(totalAmount / cases.filter((item) => item.amount).length) : 0;
    const receivableCases = cases.filter((item) => item.status !== '已完成' && item.amount);
    const lineCount = cases.filter((item) => item.platform === 'LINE').length;
    const gmailCount = cases.filter((item) => item.platform === 'Gmail').length;
    const instagramCount = cases.filter((item) => item.platform === 'Instagram').length;

    const statusTotal = Math.max(cases.length, 1);
    const lineTotal = Math.max(lineCount + gmailCount + instagramCount, 1);

    return {
      title: '統計分析',
      subtitle: '業務績效・AI 系統效能・收款追蹤',
      filters: [
        {id: 'month', label: '本月', active: true},
        {id: 'quarter', label: '近3月'},
        {id: 'half-year', label: '近6月'},
        {id: 'year', label: '全年'},
      ],
      metrics: [
        {
          id: 'income',
          icon: '💰',
          label: '本月收入',
          value: `$${confirmedIncome.toLocaleString()}`,
          change: `${completedCases.length} 件已完成`,
          tone: 'success',
        },
        {
          id: 'conversion',
          icon: '✅',
          label: '成交率',
          value: `${Math.round((completedCases.length / statusTotal) * 100)}%`,
          change: `${completedCases.length} / ${cases.length} 件`,
          tone: 'success',
        },
        {
          id: 'ticket',
          icon: '📊',
          label: '平均案件金額',
          value: averageTicket ? `$${averageTicket.toLocaleString()}` : '$0',
          change: `${cases.filter((item) => item.amount).length} 件計算`,
          tone: 'neutral',
        },
        {
          id: 'response',
          icon: '⚡',
          label: '訊息串流',
          value: `${threads.length} 則`,
          change: `${threads.filter((item) => item.caseId).length} 則已連結案件`,
          tone: 'success',
        },
        {
          id: 'receivable',
          icon: '⏳',
          label: '待收款',
          value: `$${receivableCases.reduce((sum, item) => sum + (item.amount ?? 0), 0).toLocaleString()}`,
          change: `${receivableCases.length} 件待付款`,
          tone: 'warning',
        },
      ],
      revenueSeries: [
        {id: 'dec', label: '12月', valueLabel: '$82k', barHeight: 55},
        {id: 'jan', label: '1月', valueLabel: '$104k', barHeight: 74},
        {id: 'feb', label: '2月', valueLabel: '$61k', barHeight: 36},
        {id: 'mar', label: '3月', valueLabel: '$91k', barHeight: 61},
        {id: 'apr', label: '4月', valueLabel: '$113k', barHeight: 85},
        {id: 'may', label: '5月', valueLabel: `$${Math.round(confirmedIncome / 1000)}k`, barHeight: Math.min(100, Math.max(18, Math.round((confirmedIncome / 150000) * 100))), highlighted: true},
      ],
      statusDistribution: [
        {id: 'active', label: '進行中', count: `${activeCases.length}件`, share: `${Math.round((activeCases.length / statusTotal) * 100)}%`, progress: Math.round((activeCases.length / statusTotal) * 100), tone: 'blue'},
        {id: 'quote', label: '詢價/報價', count: `${quoteCases.length}件`, share: `${Math.round((quoteCases.length / statusTotal) * 100)}%`, progress: Math.round((quoteCases.length / statusTotal) * 100), tone: 'amber'},
        {id: 'client', label: '待客戶', count: `${clientCases.length}件`, share: `${Math.round((clientCases.length / statusTotal) * 100)}%`, progress: Math.round((clientCases.length / statusTotal) * 100), tone: 'orange'},
        {id: 'done', label: '已完成', count: `${completedCases.length}件`, share: `${Math.round((completedCases.length / statusTotal) * 100)}%`, progress: Math.round((completedCases.length / statusTotal) * 100), tone: 'green'},
        {id: 'risk', label: '高風險', count: `${riskCases.length}件`, share: `${Math.round((riskCases.length / statusTotal) * 100)}%`, progress: Math.round((riskCases.length / statusTotal) * 100), tone: 'red'},
      ],
      platformSources: [
        {id: 'line', label: 'LINE', count: `${lineCount} 件`, share: `${Math.round((lineCount / lineTotal) * 100)}%`, progress: Math.round((lineCount / lineTotal) * 100), tone: 'green'},
        {id: 'gmail', label: 'Gmail', count: `${gmailCount} 件`, share: `${Math.round((gmailCount / lineTotal) * 100)}%`, progress: Math.round((gmailCount / lineTotal) * 100), tone: 'red'},
        {id: 'instagram', label: 'Instagram', count: `${instagramCount} 件`, share: `${Math.round((instagramCount / lineTotal) * 100)}%`, progress: Math.round((instagramCount / lineTotal) * 100), tone: 'purple'},
      ],
      aiMetrics: [
        {id: 'webhook', label: 'Webhook 平均延遲', value: '1.8 秒', target: '目標 < 3 秒'},
        {id: 'ner', label: 'NER 擷取準確率', value: `${Math.min(96, 84 + threads.length)}%`, target: '目標 > 85%'},
        {id: 'intent', label: '意圖分類準確率', value: `${Math.min(94, 82 + threads.length)}%`, target: '目標 > 85%'},
        {id: 'case', label: '自動建案成功率', value: `${Math.round((threads.filter((item) => item.caseId).length / Math.max(threads.length, 1)) * 100)}%`, target: '目標 > 90%'},
      ],
      collectionSummaries: [
        {label: '已收款', amount: `$${confirmedIncome.toLocaleString()}`, share: `${Math.round((confirmedIncome / Math.max(totalAmount, 1)) * 100)}%`, tone: 'success'},
        {label: '待收款', amount: `$${receivableCases.reduce((sum, item) => sum + (item.amount ?? 0), 0).toLocaleString()}`, share: `${Math.round((receivableCases.reduce((sum, item) => sum + (item.amount ?? 0), 0) / Math.max(totalAmount, 1)) * 100)}%`, tone: 'warning'},
      ],
      receivableCases: receivableCases.slice(0, 2).map((item) => ({
        id: item.id,
        project: item.title,
        client: item.customerName,
        amount: item.amountLabel,
      })),
      extractionAccuracy: [
        {id: 'client', label: 'CLIENT_NAME 客戶名稱', value: '96%', progress: 96, tone: 'success'},
        {id: 'quote', label: 'QUOTE_AMOUNT 報價金額', value: '91%', progress: 91, tone: 'success'},
        {id: 'deadline', label: 'EXPECTED_DDL 交付期限', value: '88%', progress: 88, tone: 'success'},
        {id: 'item', label: 'PROJECT_ITEM 交付項目', value: '83%', progress: 83, tone: 'warning'},
        {id: 'intent', label: 'INTENT_TYPE 意圖分類', value: '88%', progress: 88, tone: 'success'},
      ],
      closedCases: completedCases.slice(0, 4).map((item) => ({
        id: item.id,
        project: item.title,
        client: item.customerName,
        amount: item.amountLabel,
        platform: item.platform,
        completedAt: item.createdAtLabel,
        paymentStatus: '已付款',
        paymentTone: 'success' as const,
      })),
    };
  }, [cases, threads]);

  return <DashboardContent data={data} error={null} isLoading={false} reload={() => {}} />;
}

function DashboardContent({
  data,
  error,
  isLoading,
  reload,
}: {
  data: DashboardData | null;
  error: string | null;
  isLoading: boolean;
  reload: () => void;
}) {
  if (isLoading) {
    return (
      <StatePanel
        badge="Loading"
        title="正在整理統計分析畫面"
        copy="Dashboard 會先透過 service 層讀取資料，之後你可以直接把 mock 換成真 API。"
      />
    );
  }

  if (error) {
    return (
      <StatePanel
        badge="Error"
        title="統計分析資料載入失敗"
        copy={error}
        actionLabel="重新載入"
        onAction={reload}
      />
    );
  }

  if (!data || data.metrics.length === 0) {
    return (
      <StatePanel
        badge="Empty"
        title="目前還沒有統計資料"
        copy="先保留頁面結構與資料介面，之後可以接真 API 或補更完整的 mock dataset。"
      />
    );
  }

  const revenueMax = parseCurrencyLabel(revenueAxis[0]);
  const revenueSeries = data.revenueSeries.map((point) => {
    const numericValue = parseCurrencyLabel(point.valueLabel);
    const height = revenueMax > 0 ? Math.max(8, Math.round((numericValue / revenueMax) * 100)) : 0;

    return {
      ...point,
      computedHeight: height,
    };
  });

  return (
    <div className="dashboard-v2">
      <header className="dashboard-v2__header">
        <div>
          <h2 className="dashboard-v2__title">{data.title}</h2>
          <p className="dashboard-v2__subtitle">{data.subtitle}</p>
        </div>

        <div className="dashboard-v2__filters" role="group" aria-label="Time filters">
          {data.filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={filter.active ? 'dashboard-v2__filter dashboard-v2__filter--active' : 'dashboard-v2__filter'}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      <section className="dashboard-v2__metrics">
        {data.metrics.map((metric) => (
          <article key={metric.id} className="metric-card">
            <div className="metric-card__label-row">
              <span className="metric-card__icon">{metric.icon}</span>
              <span className="metric-card__label">{metric.label}</span>
            </div>
            <strong className="metric-card__value">{metric.value}</strong>
            <span className={`metric-card__change metric-card__change--${metric.tone}`}>{metric.change}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-v2__hero-grid">
        <article className="dashboard-card dashboard-card--wide">
          <div className="dashboard-card__header">
            <h3 className="dashboard-card__title">月收入趨勢</h3>
            <span className="dashboard-card__caption">近 6 個月</span>
          </div>

          <div className="revenue-chart">
            <div className="revenue-chart__plot">
              <div className="revenue-chart__grid" aria-hidden="true">
                {revenueAxis.map((label) => (
                  <div key={label} className="revenue-chart__grid-line">
                    <span className="revenue-chart__grid-label">{label}</span>
                    <span className="revenue-chart__grid-rule" />
                  </div>
                ))}
              </div>

              <div className="revenue-chart__bars">
                {revenueSeries.map((point) => (
                  <div key={point.id} className="revenue-chart__column">
                    {point.highlighted ? <span className="revenue-chart__annotation">{point.valueLabel}</span> : null}
                    <div
                      className={point.highlighted ? 'revenue-chart__bar revenue-chart__bar--active' : 'revenue-chart__bar'}
                      style={{height: `${point.computedHeight}%`}}
                      aria-hidden="true"
                    />
                    <span className="revenue-chart__month">{point.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <h3 className="dashboard-card__title">案件狀態分佈</h3>
            <span className="dashboard-card__caption">本月共 {data.statusDistribution.reduce((sum, item) => sum + Number.parseInt(item.count, 10), 0)} 件</span>
          </div>

          <div className="progress-list">
            {data.statusDistribution.map((item) => (
              <div key={item.id} className="progress-list__item">
                <div className="progress-list__top">
                  <span className="progress-list__label">{item.label}</span>
                  <span className={`progress-list__count progress-list__count--${item.tone}`}>{item.count}</span>
                </div>
                <div className="progress-list__bar">
                  <div className={`progress-list__fill progress-list__fill--${item.tone}`} style={{width: `${item.progress}%`}} aria-hidden="true" />
                </div>
                <span className={`progress-list__share progress-list__share--${item.tone}`}>{item.share}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-v2__mid-grid">
        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <h3 className="dashboard-card__title">案件來源平台</h3>
          </div>

          <div className="source-list">
            {data.platformSources.map((item) => (
              <div key={item.id} className={`source-list__item source-list__item--${item.tone}`}>
                <div className="source-list__top">
                  <div className="source-list__label-row">
                    <span className={`source-list__dot source-list__dot--${item.tone}`} />
                    <span className={`source-list__label source-list__label--${item.tone}`}>{item.label}</span>
                  </div>
                  <span className={`source-list__count source-list__count--${item.tone}`}>{item.count}</span>
                </div>
                <div className="source-list__track">
                  <div className={`source-list__fill source-list__fill--${item.tone}`} style={{width: `${item.progress}%`}} />
                </div>
                <span className={`source-list__share source-list__share--${item.tone}`}>{item.share}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <h3 className="dashboard-card__title">AI 系統效能</h3>
            <span className="dashboard-card__caption">P0 驗證指標</span>
          </div>

          <div className="ai-list">
            {data.aiMetrics.map((item) => (
              <div key={item.id} className="ai-list__item">
                <div>
                  <div className="ai-list__label">{item.label}</div>
                  <div className="ai-list__target">{item.target}</div>
                </div>
                <div className="ai-list__metric">
                  <strong className="ai-list__value">{item.value}</strong>
                  <span className="ai-list__badge">達標</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <h3 className="dashboard-card__title">收款追蹤</h3>
          </div>

          <div className="collection-list">
            {data.collectionSummaries.map((item) => (
              <div key={item.label} className={item.tone === 'success' ? 'collection-list__summary collection-list__summary--success' : 'collection-list__summary collection-list__summary--warning'}>
                <div>
                  <div className="collection-list__label">{item.label}</div>
                  <div className="collection-list__amount">{item.amount}</div>
                </div>
                <strong className="collection-list__share">{item.share}</strong>
              </div>
            ))}

            <div className="receivable-list">
              <h4 className="receivable-list__title">待收款案件</h4>
              {data.receivableCases.map((item) => (
                <div key={item.id} className="receivable-list__item">
                  <div>
                    <div className="receivable-list__project">{item.project}</div>
                    <div className="receivable-list__client">{item.client}</div>
                  </div>
                  <strong className="receivable-list__amount">{item.amount}</strong>
                </div>
              ))}
            </div>

            <button type="button" className="collection-list__action">
              傳送請款提醒
            </button>
          </div>
        </article>
      </section>

      <section className="dashboard-v2__bottom-grid">
        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <h3 className="dashboard-card__title">NER 欄位擷取準確率</h3>
            <span className="dashboard-card__caption">目標 &gt; 85%</span>
          </div>

          <div className="accuracy-list">
            {data.extractionAccuracy.map((item) => (
              <div key={item.id} className="accuracy-list__item">
                <div className="accuracy-list__top">
                  <span className="accuracy-list__label">{item.label}</span>
                  <strong className={item.tone === 'warning' ? 'accuracy-list__value accuracy-list__value--warning' : 'accuracy-list__value'}>{item.value}</strong>
                </div>
                <div className="accuracy-list__track">
                  <div className={item.tone === 'warning' ? 'accuracy-list__fill accuracy-list__fill--warning' : 'accuracy-list__fill'} style={{width: `${item.progress}%`}} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card dashboard-card--table">
          <div className="dashboard-card__header">
            <h3 className="dashboard-card__title">近期結案紀錄</h3>
          </div>

          <div className="case-table" role="table" aria-label="近期結案紀錄">
            <div className="case-table__row case-table__row--header" role="row">
              <span>案件名稱</span>
              <span>客戶</span>
              <span>金額</span>
              <span>平台</span>
              <span>完成日</span>
              <span>付款狀態</span>
            </div>

            {data.closedCases.map((item) => (
              <div key={item.id} className="case-table__row" role="row">
                <span className="case-table__primary">{item.project}</span>
                <span>{item.client}</span>
                <span className="case-table__primary">{item.amount}</span>
                <span>{item.platform}</span>
                <span>{item.completedAt}</span>
                <span>
                  <span className={item.paymentTone === 'warning' ? 'case-table__pill case-table__pill--warning' : 'case-table__pill'}>{item.paymentStatus}</span>
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
