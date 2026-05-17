import {useEffect, useMemo, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {useCrmStore} from '@/store/crmStore';

export function KanbanDetailPage() {
  const {cardId = 'abc'} = useParams();
  const navigate = useNavigate();
  const {cases, threads} = useCrmStore();
  const detail = cases.find((item) => item.id === cardId) ?? cases.find((item) => item.id === 'abc');
  const thread = detail ? threads.find((item) => item.caseId === detail.id) : undefined;
  const [activeDraftId, setActiveDraftId] = useState('clarify');
  const [copyLabel, setCopyLabel] = useState('複製草稿');
  const [regenerateLabel, setRegenerateLabel] = useState('重新生成');
  const [watchers, setWatchers] = useState(
    detail?.detail?.watchers ?? [
      {id: 'generic-1', label: '24h 未回覆', status: '監控中', enabled: true},
      {id: 'generic-2', label: '交期前 3 天', status: '尚未觸發', enabled: true},
    ],
  );

  const aiDrafts = useMemo(() => {
    const suggestion = thread?.suggestion ?? '目前尚無 AI 草稿。';
    return [
      {id: 'clarify', label: '釐清需求', content: suggestion},
      {id: 'quote', label: '提供報價', content: suggestion},
      {id: 'follow', label: '追蹤跟進', content: suggestion},
      {id: 'confirm', label: '確認合作', content: suggestion},
      {id: 'invoice', label: '請款', content: suggestion},
    ];
  }, [thread?.suggestion]);

  const activeDraft = aiDrafts.find((draft) => draft.id === activeDraftId) ?? aiDrafts[0];

  useEffect(() => {
    setWatchers(
      detail?.detail?.watchers ?? [
        {id: 'generic-1', label: '24h 未回覆', status: '監控中', enabled: true},
        {id: 'generic-2', label: '交期前 3 天', status: '尚未觸發', enabled: true},
      ],
    );
  }, [detail]);

  if (!detail) {
    return null;
  }

  const detailContent = detail.detail ?? {
    stageLabel: detail.status,
    stageTone: detail.status === '已完成' ? ('success' as const) : ('warning' as const),
    info: [
      {label: '案件編號', value: detail.code},
      {label: '客戶名稱', value: detail.customerName},
      {label: '來源平台', value: detail.platform, tone: 'mint' as const},
      {label: '交付項目', value: detail.deliverable},
      {label: '報價金額', value: detail.amountLabel},
      {label: '交期', value: detail.deadlineLabel ?? detail.deadline},
      {label: '建立時間', value: detail.createdAtLabel},
    ],
    health: [
      {label: '案件健康度', value: detail.health.label, tone: detail.health.tone === 'danger' ? ('danger' as const) : detail.health.tone === 'warning' ? ('warning' as const) : ('success' as const)},
      {label: '付款狀態', value: detail.status === '已完成' ? '已完成' : '進行中', tone: detail.status === '已完成' ? ('success' as const) : ('neutral' as const)},
    ],
    timeline: ['潛在詢問', '需求確認中', '已報價', '等待回覆', '確認合作', '進行中', '待交付', '已完成'],
    summary: `案件 ${detail.customerName}｜${detail.title} 目前狀態為 ${detail.status}，交付項目為 ${detail.deliverable}，下一步建議為「${detail.nextStep}」。`,
    summaryHighlights: [
      {title: '→ 案件摘要', copy: `${detail.status}・${detail.amountLabel}`, tone: 'blue' as const},
      {title: '→ 下一步行動', copy: detail.nextStep, tone: 'green' as const},
      {title: '⚠ 風險提醒', copy: detail.riskLabel ?? '持續追蹤案件狀況', tone: 'amber' as const},
    ],
    relatedCases: [],
    watchers: [
      {id: 'generic-1', label: '24h 未回覆', status: '監控中', enabled: true},
      {id: 'generic-2', label: '交期前 3 天', status: '尚未觸發', enabled: true},
    ],
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeDraft.content);
      setCopyLabel('已複製');
    } catch {
      setCopyLabel('複製失敗');
    }
    window.setTimeout(() => setCopyLabel('複製草稿'), 1200);
  };

  const handleRegenerate = () => {
    setRegenerateLabel('已重新生成');
    window.setTimeout(() => setRegenerateLabel('重新生成'), 1200);
  };

  return (
    <div className="kanban-detail-page">
      <header className="kanban-detail-page__header">
        <div>
          <button
            type="button"
            className="kanban-detail-page__back"
            onClick={() => {
              void navigate('/kanban');
            }}
          >
            ← 案件看板
          </button>
          <h2 className="kanban-detail-page__title">
            {detail.customerName}｜{detail.title}
          </h2>
        </div>

        <div className="kanban-detail-page__header-actions">
          <span
            className={
              detailContent.stageTone === 'warning'
                ? 'kanban-detail-page__stage kanban-detail-page__stage--warning'
                : 'kanban-detail-page__stage kanban-detail-page__stage--success'
            }
          >
            {detailContent.stageLabel}
          </span>
          <button type="button" className="kanban-detail-page__edit">
            ✎ 編輯案件
          </button>
        </div>
      </header>

      <div className="kanban-detail-page__layout">
        <aside className="kanban-detail-sidebar">
          <section className="kanban-detail-card">
            <h3 className="kanban-detail-card__title">案件資訊</h3>
            <div className="kanban-info-list">
              {detailContent.info.map((item) => (
                <div key={item.label} className="kanban-info-list__row">
                  <span className="kanban-info-list__label">{item.label}</span>
                  {item.tone === 'mint' ? <span className="kanban-info-list__tag">{item.value}</span> : <strong className="kanban-info-list__value">{item.value}</strong>}
                </div>
              ))}
            </div>
          </section>

          <section className="kanban-detail-card">
            <h3 className="kanban-detail-card__title">案件健康度</h3>
            <div className="kanban-health-list">
              {detailContent.health.map((item) => (
                <div key={item.label} className="kanban-health-list__row">
                  <span className="kanban-health-list__label">{item.label}</span>
                  <span className={`kanban-health-list__pill kanban-health-list__pill--${item.tone}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="kanban-detail-card">
            <h3 className="kanban-detail-card__title">案件階段</h3>
            <div className="kanban-stage-list">
              {detailContent.timeline.map((stage, index) => (
                <div key={stage} className="kanban-stage-list__row">
                  <span className={index === 0 ? 'kanban-stage-list__dot kanban-stage-list__dot--done' : index === 1 ? 'kanban-stage-list__dot kanban-stage-list__dot--active' : 'kanban-stage-list__dot'} />
                  <span className={index === 1 ? 'kanban-stage-list__label kanban-stage-list__label--active' : 'kanban-stage-list__label'}>{stage}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <section className="kanban-detail-main">
          <section className="kanban-detail-card">
            <div className="kanban-detail-card__header">
              <div>
                <h3 className="kanban-detail-card__title kanban-detail-card__title--green">✦ AI 案件摘要</h3>
                <p className="kanban-detail-card__summary">{detailContent.summary}</p>
              </div>
              <span className="kanban-detail-card__meta">自動分析・每次訊息更新</span>
            </div>

            <div className="kanban-highlight-grid">
              {detailContent.summaryHighlights.map((item) => (
                <div key={item.title} className={`kanban-highlight kanban-highlight--${item.tone}`}>
                  <strong>{item.title}</strong>
                  <span>{item.copy}</span>
                </div>
              ))}
            </div>
          </section>

          {detailContent.inlineAlert ? <section className="kanban-inline-alert">{detailContent.inlineAlert}</section> : null}

          <section className="kanban-detail-card">
            <div className="kanban-detail-card__header">
              <h3 className="kanban-detail-card__title">訊息記錄</h3>
              <span className="kanban-detail-card__meta">來自 {detail.platform}</span>
            </div>

            <div className="kanban-conversation">
              {(thread?.messages ?? []).map((message) => (
                <div key={message.id} className={message.role === 'ai' ? 'kanban-conversation__bubble kanban-conversation__bubble--ai' : 'kanban-conversation__bubble'}>
                  {message.role === 'ai' ? <span className="kanban-conversation__tag">✦ AI 草稿</span> : null}
                  <p className="kanban-conversation__text">{message.text}</p>
                  <span className="kanban-conversation__time">{message.time}</span>
                </div>
              ))}
            </div>
          </section>
        </section>

        <aside className="kanban-detail-aside">
          <section className="kanban-detail-card">
            <div className="kanban-detail-card__header">
              <div>
                <h3 className="kanban-detail-card__title kanban-detail-card__title--green">✦ AI 回覆草稿</h3>
                <p className="kanban-detail-card__meta">根據情境自動生成</p>
              </div>
            </div>

            <div className="kanban-draft-tabs">
              {aiDrafts.map((draft) => (
                <button
                  key={draft.id}
                  type="button"
                  onClick={() => setActiveDraftId(draft.id)}
                  className={activeDraftId === draft.id ? 'kanban-draft-tabs__button kanban-draft-tabs__button--active' : 'kanban-draft-tabs__button'}
                >
                  {draft.label}
                </button>
              ))}
            </div>

            <div className="kanban-draft-box">
              {activeDraft.content.split('\n').map((line, index) => (
                <p key={`${line}-${index}`} className="kanban-draft-box__line">
                  {line}
                </p>
              ))}
            </div>

            <div className="kanban-draft-actions">
              <button
                type="button"
                className="kanban-draft-actions__primary"
                onClick={() => {
                  void handleCopy();
                }}
              >
                {copyLabel}
              </button>
              <button type="button" className="kanban-draft-actions__secondary" onClick={handleRegenerate}>
                {regenerateLabel}
              </button>
            </div>
          </section>

          <section className="kanban-detail-card">
            <div className="kanban-detail-card__header">
              <h3 className="kanban-detail-card__title kanban-detail-card__title--green">✦ RAG 相似歷史案件</h3>
              <span className="kanban-detail-card__meta">向量相似度搜尋</span>
            </div>
            <div className="kanban-related-list">
              {detailContent.relatedCases.map((item) => (
                <article key={item.id} className="kanban-related-item">
                  <div className="kanban-related-item__top">
                    <strong>{item.title}</strong>
                    <span className="kanban-related-item__score">{item.score}</span>
                  </div>
                  <p className="kanban-related-item__meta">{item.meta}</p>
                  <p className="kanban-related-item__amount">報價：{item.amount}</p>
                  <p className="kanban-related-item__note">{item.note}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="kanban-detail-card">
            <div className="kanban-detail-card__header">
              <h3 className="kanban-detail-card__title">規則引擎提醒</h3>
            </div>

            <div className="kanban-rule-list">
              {watchers.map((item) => (
                <div key={item.id} className="kanban-rule-list__row">
                  <span>{item.label}</span>
                  <div className="kanban-rule-list__actions">
                    <span className="kanban-rule-list__status">{item.status}</span>
                    <button
                      type="button"
                      className={item.enabled ? 'settings-toggle settings-toggle--on' : 'settings-toggle'}
                      aria-pressed={item.enabled}
                      onClick={() =>
                        setWatchers((current) =>
                          current.map((watcher) =>
                            watcher.id === item.id
                              ? {...watcher, enabled: !watcher.enabled, status: watcher.enabled ? '已停用' : '監控中'}
                              : watcher,
                          ),
                        )
                      }
                    >
                      <span className="settings-toggle__knob" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <Link to="/kanban" className="kanban-detail-page__floating-back">
        返回看板
      </Link>
    </div>
  );
}
