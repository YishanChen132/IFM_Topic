import {useMemo, useState} from 'react';
import {useCrmStore} from '@/store/crmStore';
import type {CaseStatus, CustomerFilter} from '@/types/crm';

const filterTabs: CustomerFilter[] = ['全部', '高風險', '準時付款', '常回購'];

const historyToneMap: Record<CaseStatus, 'warning' | 'neutral' | 'orange'> = {
  潛在詢問: 'warning',
  需求確認中: 'warning',
  已報價: 'neutral',
  等待回覆: 'orange',
  進行中: 'warning',
  等待素材: 'warning',
  待修改: 'orange',
  待交付: 'orange',
  已完成: 'neutral',
  已流失: 'neutral',
};

export function CustomersPage() {
  const {customers, cases, threads} = useCrmStore();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<CustomerFilter>('全部');
  const [selectedId, setSelectedId] = useState(customers[0]?.id ?? '');
  const [createLabel, setCreateLabel] = useState('新增客戶');

  const visibleCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const customerCases = cases.filter((item) => item.customerId === customer.id);
      const latestProject = customerCases[0]?.title ?? '新客戶';
      const firstPlatform = customerCases[0]?.platform ?? customer.contact[0]?.value ?? '';
      const matchesFilter = activeFilter === '全部' || customer.filters.includes(activeFilter);
      const keyword = query.trim().toLowerCase();
      const matchesQuery = !keyword || [customer.name, latestProject, firstPlatform].some((value) => value.toLowerCase().includes(keyword));
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, cases, customers, query]);

  const selectedCustomer = useMemo(
    () => visibleCustomers.find((customer) => customer.id === selectedId) ?? visibleCustomers[0] ?? customers[0],
    [customers, selectedId, visibleCustomers],
  );

  const selectedCases = useMemo(() => cases.filter((item) => item.customerId === selectedCustomer.id), [cases, selectedCustomer.id]);
  const selectedThreads = useMemo(() => threads.filter((thread) => thread.customerId === selectedCustomer.id), [selectedCustomer.id, threads]);

  const stats = useMemo(() => {
    const totalAmountValue = selectedCases.reduce((sum, item) => sum + (item.amount ?? 0), 0);
    const latestInteraction = selectedThreads[0]?.time ?? '—';
    return [
      {label: '合作次數', value: `${selectedCases.length} 次`},
      {label: '總合作金額', value: totalAmountValue ? `$${totalAmountValue.toLocaleString()}` : '—'},
      {label: '平均付款', value: selectedCustomer.paymentPace},
      {label: '最近互動', value: latestInteraction},
    ];
  }, [selectedCases, selectedCustomer.paymentPace, selectedThreads]);

  const latestProject = selectedCases[0]?.title ?? '新客戶';
  const primaryPlatform = selectedCases[0]?.platform ?? selectedCustomer.contact.find((item) => item.label === '常用平台')?.value ?? '—';

  const handleCreate = () => {
    setCreateLabel('已收到');
    window.setTimeout(() => {
      setCreateLabel('新增客戶');
    }, 1200);
  };

  if (!selectedCustomer) {
    return null;
  }

  return (
    <div className="customers-page">
      <header className="customers-page__header">
        <div>
          <h2 className="customers-page__title">客戶資料庫</h2>
          <p className="customers-page__subtitle">累積合作紀錄・風險標籤・歷史案件</p>
        </div>
        <button type="button" className="customers-page__create" onClick={handleCreate}>
          + {createLabel}
        </button>
      </header>

      <section className="customers-layout">
        <aside className="customers-sidebar">
          <div className="customers-toolbar">
            <label className="customers-search">
              <span className="customers-search__icon">⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="customers-search__input"
                placeholder="搜尋客戶名稱或平台"
              />
            </label>
            <div className="customers-filter-tabs" role="tablist" aria-label="客戶篩選">
              {filterTabs.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={
                    activeFilter === filter
                      ? 'customers-filter-tabs__button customers-filter-tabs__button--active'
                      : 'customers-filter-tabs__button'
                  }
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="customers-list">
            {visibleCustomers.map((customer) => {
              const customerCases = cases.filter((item) => item.customerId === customer.id);
              const totalAmount = customerCases.reduce((sum, item) => sum + (item.amount ?? 0), 0);
              const project = customerCases[0]?.title ?? '新客戶';
              const platform = customerCases[0]?.platform ?? 'Instagram';
              const badge = customer.tags[0];

              return (
                <button
                  key={customer.id}
                  type="button"
                  className={
                    selectedCustomer.id === customer.id
                      ? 'customers-list-card customers-list-card--active'
                      : 'customers-list-card'
                  }
                  onClick={() => setSelectedId(customer.id)}
                >
                  <span className={`customers-list-card__dot customers-list-card__dot--${customer.healthTone}`} />
                  <div className="customers-list-card__avatar">{customer.avatar}</div>
                  <div className="customers-list-card__content">
                    <div className="customers-list-card__top">
                      <strong>{customer.name}</strong>
                      <strong>{totalAmount ? `$${totalAmount.toLocaleString()}` : '—'}</strong>
                    </div>
                    <p className="customers-list-card__meta">
                      {platform} ・ 合作 {customerCases.length} 次
                    </p>
                    <p className="customers-list-card__project">{project}</p>
                    {badge ? <span className="customers-list-card__badge">{badge}</span> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="customers-main">
          <article className="customers-hero">
            <div className="customers-hero__identity">
              <div className="customers-hero__avatar">{selectedCustomer.avatar}</div>
              <div>
                <h3 className="customers-hero__name">{selectedCustomer.name}</h3>
                <p className="customers-hero__platform">常用平台：{primaryPlatform}</p>
                <div className="customers-hero__tags">
                  {selectedCustomer.tags.map((tag) => (
                    <span key={tag} className="customers-hero__tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="customers-hero__stats">
              {stats.map((item) => (
                <div key={item.label} className="customers-hero__stat">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="customers-analysis">
            <h3 className="customers-analysis__title">✦ AI 客戶分析</h3>
            <p className="customers-analysis__copy">{selectedCustomer.analysis}</p>
          </article>

          <div className="customers-detail-grid">
            <article className="customers-card">
              <h3 className="customers-card__title">歷史案件</h3>
              <div className="customers-history-list">
                {selectedCases.length === 0 ? (
                  <div className="customers-history-empty">目前還沒有正式案件紀錄</div>
                ) : (
                  selectedCases.map((item) => (
                    <div key={item.id} className="customers-history-item">
                      <div className="customers-history-item__top">
                        <strong>{item.title}</strong>
                        <span>{item.status === '已完成' ? '已完成' : item.createdAtLabel}</span>
                      </div>
                      <div className="customers-history-item__bottom">
                        <div className="customers-history-item__amount">
                          <span
                            className={
                              historyToneMap[item.status] === 'warning'
                                ? 'customers-history-item__pill customers-history-item__pill--warning'
                                : historyToneMap[item.status] === 'orange'
                                  ? 'customers-history-item__pill customers-history-item__pill--orange'
                                  : 'customers-history-item__pill'
                            }
                          >
                            {item.status}
                          </span>
                          <strong>{item.amountLabel}</strong>
                        </div>
                        <span className={item.highRisk ? 'customers-history-item__result customers-history-item__result--danger' : 'customers-history-item__result'}>
                          {item.highRisk ? '高風險' : item.status === '已完成' ? '準時交付' : latestProject === item.title ? '目前案件' : item.nextStep}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>

            <aside className="customers-side-stack">
              <article className="customers-card">
                <h3 className="customers-card__title">聯絡資訊 & 偏好</h3>
                <div className="customers-info-list">
                  {selectedCustomer.contact.map((item) => (
                    <div key={item.label} className="customers-info-list__row">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </article>

              <article className="customers-card">
                <h3 className="customers-card__title">備忘錄</h3>
                <div className="customers-note">{selectedCustomer.note}</div>
              </article>
            </aside>
          </div>
        </section>
      </section>
    </div>
  );
}
