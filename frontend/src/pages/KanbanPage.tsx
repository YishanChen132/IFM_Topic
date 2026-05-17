import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCrmStore} from '@/store/crmStore';
import type {CaseStatus, CrmCase, CrmPlatform} from '@/types/crm';

type KanbanColumnId = 'lead' | 'quoted' | 'doing' | 'client' | 'delivery' | 'risk' | 'done';

interface KanbanCardView {
  id: string;
  sourceCaseId: string;
  columnId: KanbanColumnId;
  platform: CrmPlatform;
  badges: Array<{label: string; tone: 'mint' | 'peach' | 'red' | 'purple' | 'green'}>;
  title: string;
  client: string;
  amount: string;
  deadline: string;
  note: string;
  actionLabel: string;
  accent: 'orange' | 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'gray';
  urgent?: boolean;
}

const columnOrder: Array<{id: KanbanColumnId; title: string; subtitle: string; dotTone: 'orange' | 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'gray'}> = [
  {id: 'lead', title: '詢價中', subtitle: '潛在案件', dotTone: 'orange'},
  {id: 'quoted', title: '已報價', subtitle: '等待戶確認', dotTone: 'blue'},
  {id: 'doing', title: '進行中', subtitle: '製作執行中', dotTone: 'green'},
  {id: 'client', title: '待客戶', subtitle: '等待對方確認', dotTone: 'purple'},
  {id: 'delivery', title: '待交付', subtitle: '完成待交付/收款', dotTone: 'amber'},
  {id: 'risk', title: '高風險', subtitle: '逾期、停滯、變更', dotTone: 'red'},
  {id: 'done', title: '已完成', subtitle: '本月結案', dotTone: 'gray'},
];

const statusToColumnMap: Record<CaseStatus, KanbanColumnId> = {
  潛在詢問: 'lead',
  需求確認中: 'lead',
  已報價: 'quoted',
  等待回覆: 'quoted',
  進行中: 'doing',
  等待素材: 'client',
  待修改: 'client',
  待交付: 'delivery',
  已完成: 'done',
  已流失: 'risk',
};

const nextColumnMap: Record<KanbanColumnId, KanbanColumnId> = {
  lead: 'quoted',
  quoted: 'doing',
  doing: 'client',
  client: 'delivery',
  delivery: 'done',
  risk: 'doing',
  done: 'done',
};

const accentMap: Record<KanbanColumnId, KanbanCardView['accent']> = {
  lead: 'orange',
  quoted: 'blue',
  doing: 'green',
  client: 'purple',
  delivery: 'amber',
  risk: 'red',
  done: 'gray',
};

function deriveCards(cases: CrmCase[]): KanbanCardView[] {
  const baseCards = cases.map((item) => {
    const columnId = item.highRisk ? 'risk' : statusToColumnMap[item.status];
    return {
      id: item.id,
      sourceCaseId: item.id,
      columnId,
      platform: item.platform,
      badges: item.badges ?? [],
      title: item.title,
      client: item.customerName,
      amount: item.amountLabel,
      deadline: item.deadline,
      note: item.note,
      actionLabel: item.actionLabel,
      accent: accentMap[columnId],
      urgent: item.highRisk,
    };
  });

  return baseCards;
}

export function KanbanPage() {
  const navigate = useNavigate();
  const {cases, moveCaseForward} = useCrmStore();
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [overrides, setOverrides] = useState<Record<string, Partial<KanbanCardView>>>({});
  const [draftCards, setDraftCards] = useState<KanbanCardView[]>([]);
  const [newCaseCount, setNewCaseCount] = useState(0);

  const cards = useMemo(
    () => [...deriveCards(cases).map((card) => (overrides[card.id] ? {...card, ...overrides[card.id]} : card)), ...draftCards],
    [cases, draftCards, overrides],
  );

  const metrics = useMemo(() => {
    const all = cards.filter((card) => card.columnId !== 'done').length;
    const closed = cards.filter((card) => card.columnId === 'done').length;
    const risk = cards.filter((card) => card.columnId === 'risk' || card.urgent).length;
    const waiting = cards.filter((card) => card.columnId === 'client').length;
    const income = cases.filter((item) => item.status === '已完成' || item.status === '進行中').reduce((sum, item) => sum + (item.amount ?? 0), 0);

    return [
      {label: '所有案件', value: String(all)},
      {label: '本月成交', value: String(closed), tone: 'green'},
      {label: '高風險', value: String(risk), tone: 'red'},
      {label: '待回覆', value: String(waiting), tone: 'orange'},
      {label: '本月收入', value: `$${Math.round(income / 1000)}k`},
    ];
  }, [cards, cases]);

  const moveCardForward = (cardId: string) => {
    const currentCard = cards.find((card) => card.id === cardId);
    if (!currentCard) {
      return;
    }

    if (currentCard.id.startsWith('draft-')) {
      setOverrides((current) => {
        const nextColumn = nextColumnMap[currentCard.columnId];
        return {
          ...current,
          [cardId]: {
            columnId: nextColumn,
            actionLabel: nextColumn === 'done' ? '已結案' : '已更新',
            accent: accentMap[nextColumn],
            urgent: nextColumn === 'risk',
          },
        };
      });
      return;
    }

    moveCaseForward(cardId);
  };

  const addCaseToColumn = (columnId: KanbanColumnId) => {
    const nextNumber = newCaseCount + 1;
    setNewCaseCount(nextNumber);
    setDraftCards((current) => [
      ...current,
      {
        id: `draft-${nextNumber}`,
        sourceCaseId: 'abc',
        columnId,
        platform: 'LINE',
        badges: [{label: '新增', tone: 'peach'}],
        title: `新案件草稿 ${nextNumber}`,
        client: '待補客戶',
        amount: '待估價',
        deadline: '未排定',
        note: '剛建立的案件草稿，後續可補齊需求內容。',
        actionLabel: '前往編輯',
        accent: columnId === 'risk' ? 'red' : accentMap[columnId],
      },
    ]);
  };

  return (
    <div className="kanban-page">
      <header className="kanban-page__header">
        <div>
          <h2 className="kanban-page__title">案件看板</h2>
          <p className="kanban-page__subtitle">訊息自動歸動・AI 即時建案・共 {cards.filter((card) => card.columnId !== 'done').length} 個進行中案件</p>
        </div>

        <div className="kanban-page__controls">
          <div className="kanban-view-toggle" role="group" aria-label="Kanban view toggle">
            <button type="button" onClick={() => setViewMode('board')} className={viewMode === 'board' ? 'kanban-view-toggle__button kanban-view-toggle__button--active' : 'kanban-view-toggle__button'}>
              看板
            </button>
            <button type="button" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'kanban-view-toggle__button kanban-view-toggle__button--active' : 'kanban-view-toggle__button'}>
              列表
            </button>
          </div>

          <button type="button" className="kanban-primary-button" onClick={() => addCaseToColumn('lead')}>
            + 新增案件
          </button>
        </div>
      </header>

      <section className="kanban-metrics">
        {metrics.map((metric) => (
          <article key={metric.label} className="kanban-metric-card">
            <span className="kanban-metric-card__label">{metric.label}</span>
            <strong
              className={
                metric.tone === 'green'
                  ? 'kanban-metric-card__value kanban-metric-card__value--green'
                  : metric.tone === 'red'
                    ? 'kanban-metric-card__value kanban-metric-card__value--red'
                    : metric.tone === 'orange'
                      ? 'kanban-metric-card__value kanban-metric-card__value--orange'
                      : 'kanban-metric-card__value'
              }
            >
              {metric.value}
            </strong>
          </article>
        ))}
      </section>

      {viewMode === 'board' ? (
        <section className="kanban-board" aria-label="案件看板欄位">
          {columnOrder.map((column) => {
            const columnCards = cards.filter((card) => card.columnId === column.id);
            return (
              <section key={column.id} className="kanban-column">
                <header className="kanban-column__header">
                  <div>
                    <div className="kanban-column__title-row">
                      <span className={`kanban-column__dot kanban-column__dot--${column.dotTone}`} />
                      <h3 className="kanban-column__title">{column.title}</h3>
                      <span className="kanban-column__count">{columnCards.length}</span>
                    </div>
                    <p className="kanban-column__subtitle">{column.subtitle}</p>
                  </div>
                </header>

                <div className="kanban-column__cards">
                  {columnCards.map((card) => (
                    <article
                      key={card.id}
                      className={card.urgent ? `kanban-card kanban-card--${card.accent} kanban-card--urgent kanban-card--clickable` : `kanban-card kanban-card--${card.accent} kanban-card--clickable`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        void navigate(`/kanban/${card.sourceCaseId}`);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          void navigate(`/kanban/${card.sourceCaseId}`);
                        }
                      }}
                    >
                      <div className="kanban-card__chips">
                        <span className={`kanban-card__platform kanban-card__platform--${card.platform.toLowerCase()}`}>
                          {card.platform === 'Alert' ? '高風險' : card.platform}
                        </span>
                        {card.badges.map((badge) => (
                          <span key={badge.label} className={`kanban-card__badge kanban-card__badge--${badge.tone}`}>
                            {badge.label}
                          </span>
                        ))}
                      </div>

                      <h4 className="kanban-card__title">{card.client}｜{card.title}</h4>
                      <p className="kanban-card__client">{card.client}</p>
                      {card.amount ? <div className="kanban-card__amount">{card.amount}</div> : null}
                      <div className="kanban-card__deadline">📅 {card.deadline}</div>
                      {card.note ? <p className="kanban-card__note">「{card.note}」</p> : null}

                      <button
                        type="button"
                        className={card.urgent ? 'kanban-card__action kanban-card__action--urgent' : 'kanban-card__action'}
                        onClick={(event) => {
                          event.stopPropagation();
                          moveCardForward(card.id);
                        }}
                        disabled={card.columnId === 'done'}
                      >
                        → {card.actionLabel}
                      </button>
                    </article>
                  ))}

                  <button type="button" className="kanban-column__add" onClick={() => addCaseToColumn(column.id)}>
                    + 新增案件
                  </button>
                </div>
              </section>
            );
          })}
        </section>
      ) : (
        <section className="kanban-list-view">
          <div className="kanban-list-view__table" role="table" aria-label="案件列表">
            <div className="kanban-list-view__row kanban-list-view__row--header" role="row">
              <span>案件</span>
              <span>客戶</span>
              <span>欄位</span>
              <span>金額</span>
              <span>期限</span>
            </div>
            {cards
              .filter((card) => card.columnId !== 'done')
              .map((card) => (
                <div
                  key={card.id}
                  className="kanban-list-view__row kanban-list-view__row--clickable"
                  role="row"
                  tabIndex={0}
                  onClick={() => {
                    void navigate(`/kanban/${card.sourceCaseId}`);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      void navigate(`/kanban/${card.sourceCaseId}`);
                    }
                  }}
                >
                  <span className="kanban-list-view__primary">{card.title}</span>
                  <span>{card.client}</span>
                  <span>{columnOrder.find((column) => column.id === card.columnId)?.title}</span>
                  <span>{card.amount || '-'}</span>
                  <span>{card.deadline}</span>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
