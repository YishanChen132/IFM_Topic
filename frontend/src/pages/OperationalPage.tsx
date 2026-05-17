import {operationalPages} from '@/mocks/operationalPages';

interface OperationalPageProps {
  pageKey: keyof typeof operationalPages;
}

export function OperationalPage({pageKey}: OperationalPageProps) {
  const page = operationalPages[pageKey];

  return (
    <div className="operational-page">
      <header className="operational-page__header">
        <div>
          <h2 className="operational-page__title">{page.title}</h2>
          <p className="operational-page__subtitle">{page.subtitle}</p>
        </div>
      </header>

      <section className="operational-page__metrics">
        {page.metrics.map((metric) => (
          <article key={metric.id} className="metric-card">
            <span className="metric-card__label">{metric.label}</span>
            <strong className="metric-card__value">{metric.value}</strong>
            <span className={`metric-card__change metric-card__change--${metric.tone ?? 'neutral'}`}>
              {metric.tone === 'success'
                ? '目前狀態穩定'
                : metric.tone === 'warning'
                  ? '需要追蹤'
                  : metric.tone === 'danger'
                    ? '建議優先處理'
                    : '可作為次要指標'}
            </span>
          </article>
        ))}
      </section>

      <section className="operational-page__grid">
        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <h3 className="dashboard-card__title">{page.priorityLabel}</h3>
          </div>

          <div className="operational-list">
            {page.priorityItems.map((item) => (
              <article key={item.id} className="operational-list__item">
                <div className="operational-list__top">
                  <div>
                    <h4 className="operational-list__title">{item.title}</h4>
                    <p className="operational-list__meta">{item.meta}</p>
                  </div>
                  {item.status ? (
                    <span className={`operational-list__pill operational-list__pill--${item.tone ?? 'neutral'}`}>
                      {item.status}
                    </span>
                  ) : null}
                </div>
                <p className="operational-list__copy">{item.description}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="dashboard-card dashboard-card--table">
          <div className="dashboard-card__header">
            <h3 className="dashboard-card__title">{page.tableTitle}</h3>
          </div>

          <div className="case-table" role="table" aria-label={page.tableTitle}>
            <div
              className="case-table__row case-table__row--header"
              role="row"
              style={{gridTemplateColumns: `repeat(${page.tableColumns.length}, minmax(0, 1fr))`}}
            >
              {page.tableColumns.map((column) => (
                <span key={column.key}>{column.label}</span>
              ))}
            </div>

            {page.tableRows.map((row) => (
              <div
                key={row.id}
                className="case-table__row"
                role="row"
                style={{gridTemplateColumns: `repeat(${page.tableColumns.length}, minmax(0, 1fr))`}}
              >
                {page.tableColumns.map((column, index) => (
                  <span key={column.key} className={index === 0 ? 'case-table__primary' : undefined}>
                    {row.values[column.key]}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
