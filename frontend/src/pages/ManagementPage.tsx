import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {crmStatusOrder} from '@/mocks/crm';
import {useCrmStore} from '@/store/crmStore';
import type {CaseStatus, CrmPlatform} from '@/types/crm';

const statusTabs: Array<{id: '全部' | CaseStatus; label: string}> = [
  {id: '全部', label: '全部'},
  ...crmStatusOrder.map((status) => ({id: status, label: status})),
];

const statusToneMap: Record<CaseStatus, string> = {
  潛在詢問: 'management-status-pill management-status-pill--purple',
  需求確認中: 'management-status-pill management-status-pill--blue',
  已報價: 'management-status-pill management-status-pill--mint',
  等待回覆: 'management-status-pill management-status-pill--amber',
  進行中: 'management-status-pill management-status-pill--blue-strong',
  等待素材: 'management-status-pill management-status-pill--amber',
  待修改: 'management-status-pill management-status-pill--blue',
  待交付: 'management-status-pill management-status-pill--amber',
  已完成: 'management-status-pill management-status-pill--gray',
  已流失: 'management-status-pill management-status-pill--gray',
};

const platformClassMap: Record<Extract<CrmPlatform, 'LINE' | 'Gmail' | 'Instagram'>, string> = {
  LINE: 'messages-thread-card__platform messages-thread-card__platform--line',
  Gmail: 'messages-thread-card__platform messages-thread-card__platform--gmail',
  Instagram: 'messages-thread-card__platform messages-thread-card__platform--instagram',
};

export function ManagementPage() {
  const navigate = useNavigate();
  const {cases} = useCrmStore();
  const [query, setQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<(typeof statusTabs)[number]['id']>('全部');
  const [sortByLatest, setSortByLatest] = useState(true);
  const [highRiskOnly, setHighRiskOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [manualAddFeedback, setManualAddFeedback] = useState('手動新增案件');

  const visibleCases = useMemo(() => {
    return cases
      .filter((item) => activeStatus === '全部' || item.status === activeStatus)
      .filter((item) => !highRiskOnly || item.highRisk)
      .filter((item) => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) {
          return true;
        }

        return [item.title, item.customerName, item.deliverable].some((value) => value.toLowerCase().includes(keyword));
      })
      .slice()
      .sort((a, b) => (sortByLatest ? a.code.localeCompare(b.code) : (b.amount ?? 0) - (a.amount ?? 0)));
  }, [activeStatus, cases, highRiskOnly, query, sortByLatest]);

  const totalPages = Math.max(2, Math.ceil(visibleCases.length / 8) || 1);
  const safePage = Math.min(page, totalPages);
  const paginatedCases = visibleCases.slice((safePage - 1) * 8, safePage * 8);

  const summary = useMemo(() => {
    const inProgressCount = cases.filter((item) => item.status === '進行中').length;
    const riskCount = cases.filter((item) => item.highRisk).length;
    const confirmedIncome = cases
      .filter((item) => item.status === '已完成' || item.status === '進行中')
      .reduce((sum, item) => sum + (item.amount ?? 0), 0);
    const unpaidTotal = cases.filter((item) => item.status !== '已完成').reduce((sum, item) => sum + (item.amount ?? 0), 0);

    return {
      inProgressCount,
      riskCount,
      confirmedIncome: `$${confirmedIncome.toLocaleString()}`,
      unpaidTotal: `$${unpaidTotal.toLocaleString()}`,
      averageDealDays: '8.3 天',
    };
  }, [cases]);

  return (
    <div className="management-page">
      <header className="management-page__header">
        <div>
          <h2 className="management-page__title">案件管理</h2>
          <p className="management-page__subtitle">所有案件完整列表。點擊案件查看詳情</p>
        </div>
        <button
          type="button"
          className="management-page__create"
          onClick={() => {
            setManualAddFeedback('已收到');
            window.setTimeout(() => {
              setManualAddFeedback('手動新增案件');
            }, 1200);
          }}
        >
          + {manualAddFeedback}
        </button>
      </header>

      <section className="management-toolbar">
        <label className="management-search">
          <span className="management-search__icon">⌕</span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            className="management-search__input"
            placeholder="搜尋案件或客戶"
          />
        </label>

        <div className="management-tabs" role="tablist" aria-label="案件狀態篩選">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeStatus === tab.id ? 'management-tabs__button management-tabs__button--active' : 'management-tabs__button'}
              onClick={() => {
                setActiveStatus(tab.id);
                setPage(1);
              }}
            >
              {tab.id === '全部' ? `${tab.label} (${cases.length})` : tab.label}
            </button>
          ))}
        </div>

        <div className="management-toolbar__actions">
          <button
            type="button"
            className={sortByLatest ? 'management-sort management-sort--active' : 'management-sort'}
            onClick={() => setSortByLatest((current) => !current)}
          >
            {sortByLatest ? '最新建立 ↕' : '報價金額 ↕'}
          </button>
          <button
            type="button"
            className={highRiskOnly ? 'management-risk-filter management-risk-filter--active' : 'management-risk-filter'}
            onClick={() => {
              setHighRiskOnly((current) => !current);
              setPage(1);
            }}
          >
            △ 高風險
          </button>
        </div>
      </section>

      <section className="management-table" aria-label="案件管理列表">
        <div className="management-table__header">
          <span>健康度</span>
          <span>案件名稱</span>
          <span>客戶</span>
          <span>來源平台</span>
          <span>案件狀態</span>
          <span>交付項目</span>
          <span>報價金額</span>
          <span>交期</span>
          <span>下一步</span>
          <span>風險標籤</span>
        </div>

        {paginatedCases.map((item) => (
          <button
            key={item.id}
            type="button"
            className="management-row"
            onClick={() => {
              void navigate(`/kanban/${item.id}`);
            }}
          >
            <span className={`management-health-pill management-health-pill--${item.health.tone}`}>{item.health.label}</span>
            <strong className="management-row__title">{item.customerName}｜{item.title}</strong>
            <span>{item.customerName}</span>
            {item.platform === 'Alert' ? <span>Alert</span> : <span className={platformClassMap[item.platform]}>{item.platform}</span>}
            <span className={statusToneMap[item.status]}>{item.status}</span>
            <span>{item.deliverable.replace('設計', '').replace('貼文設計', '貼文')}</span>
            <strong>{item.amountLabel}</strong>
            <span
              className={
                item.deadline === '今天！'
                  ? 'management-row__deadline management-row__deadline--danger'
                  : item.deadline === '已完成'
                    ? 'management-row__deadline'
                    : 'management-row__deadline management-row__deadline--warning'
              }
            >
              {item.deadline}
            </span>
            <span className="management-row__next-step">→ {item.nextStep}</span>
            <span
              className={
                item.riskTone === 'danger'
                  ? 'management-row__risk management-row__risk--danger'
                  : item.riskTone === 'warning'
                    ? 'management-row__risk management-row__risk--warning'
                    : 'management-row__risk'
              }
            >
              {item.riskLabel ?? '詳情'}
            </span>
          </button>
        ))}
      </section>

      <footer className="management-page__footer">
        <p className="management-page__count">
          共 {visibleCases.length} 筆案件，顯示第 {(safePage - 1) * 8 + 1}-{Math.min(safePage * 8, visibleCases.length || 8)} 筆
        </p>
        <div className="management-pagination">
          <button type="button" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            上一頁
          </button>
          <button type="button" className={safePage === 1 ? 'management-pagination__page management-pagination__page--active' : 'management-pagination__page'} onClick={() => setPage(1)}>
            1
          </button>
          <button type="button" className={safePage === 2 ? 'management-pagination__page management-pagination__page--active' : 'management-pagination__page'} onClick={() => setPage(2)}>
            2
          </button>
          <button type="button" disabled={safePage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
            下一頁
          </button>
        </div>
      </footer>

      <div className="management-summary-bar">
        <div className="management-summary-bar__item">
          <span>進行中</span>
          <strong>{summary.inProgressCount} 件</strong>
        </div>
        <div className="management-summary-bar__item">
          <span>高風險</span>
          <strong className="management-summary-bar__value management-summary-bar__value--danger">{summary.riskCount} 件</strong>
        </div>
        <div className="management-summary-bar__item">
          <span>本月收入（已確認）</span>
          <strong className="management-summary-bar__value management-summary-bar__value--success">{summary.confirmedIncome}</strong>
        </div>
        <div className="management-summary-bar__item">
          <span>待請款</span>
          <strong className="management-summary-bar__value management-summary-bar__value--warning">{summary.unpaidTotal}</strong>
        </div>
        <div className="management-summary-bar__item">
          <span>平均成交天數</span>
          <strong>{summary.averageDealDays}</strong>
        </div>
      </div>
    </div>
  );
}
