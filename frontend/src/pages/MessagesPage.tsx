import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCrmStore} from '@/store/crmStore';

const flowSteps = [
  {id: 'receive', title: '收到訊息', subtitle: 'LINE / Gmail', icon: '💌'},
  {id: 'webhook', title: 'Webhook 接收', subtitle: '< 3 秒', icon: '⚡'},
  {id: 'intent', title: '意圖分類', subtitle: '接案 / 非接案', icon: '🤖'},
  {id: 'ner', title: 'NER 擷取', subtitle: '客戶・金額・交期', icon: '🔍'},
  {id: 'case', title: '自動建案', subtitle: '案件卡片生成', icon: '📋'},
  {id: 'rule', title: '規則提醒', subtitle: '逾期・未回覆', icon: '🔔'},
] as const;

const filterOptions = [
  {id: 'all', label: '全部'},
  {id: 'LINE', label: 'LINE'},
  {id: 'Gmail', label: 'Gmail'},
  {id: 'Instagram', label: 'IG'},
] as const;

type FilterId = (typeof filterOptions)[number]['id'];

const statusClassMap = {
  done: 'messages-page__entity-status messages-page__entity-status--done',
  warning: 'messages-page__entity-status messages-page__entity-status--warning',
  classified: 'messages-page__entity-status messages-page__entity-status--classified',
} as const;

export function MessagesPage() {
  const navigate = useNavigate();
  const {threads, cases, customers, updateCaseFromThread, createCaseFromThread} = useCrmStore();
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [selectedThreadId, setSelectedThreadId] = useState(threads[0]?.id ?? '');
  const [composerText, setComposerText] = useState('');
  const [copyButtonLabel, setCopyButtonLabel] = useState('複製回覆');
  const [draftText, setDraftText] = useState(threads[0]?.suggestion ?? '');
  const [primaryActionLabel, setPrimaryActionLabel] = useState(threads[0]?.recommendation.primaryLabel ?? '更新案件');

  const filteredThreads = useMemo(
    () => threads.filter((thread) => activeFilter === 'all' || thread.platform === activeFilter),
    [activeFilter, threads],
  );

  const selectedThread = useMemo(
    () => filteredThreads.find((thread) => thread.id === selectedThreadId) ?? filteredThreads[0] ?? threads[0],
    [filteredThreads, selectedThreadId, threads],
  );

  const linkedCase = selectedThread.caseId ? cases.find((item) => item.id === selectedThread.caseId) : undefined;
  const linkedCustomer = customers.find((item) => item.id === selectedThread.customerId);

  useEffect(() => {
    if (!selectedThread) {
      return;
    }
    setDraftText(selectedThread.suggestion);
    setPrimaryActionLabel(selectedThread.recommendation.primaryLabel);
  }, [selectedThread]);

  const handleSelectThread = (threadId: string) => {
    const thread = threads.find((item) => item.id === threadId);
    setSelectedThreadId(threadId);
    if (thread) {
      setDraftText(thread.suggestion);
      setPrimaryActionLabel(thread.recommendation.primaryLabel);
    }
  };

  const handlePrimaryAction = () => {
    if (selectedThread.caseId && !selectedThread.recommendation.primaryLabel.includes('建立')) {
      updateCaseFromThread(selectedThread.id);
    } else {
      createCaseFromThread(selectedThread.id);
    }
    setPrimaryActionLabel('已更新');
    window.setTimeout(() => {
      setPrimaryActionLabel(selectedThread.caseId && !selectedThread.recommendation.primaryLabel.includes('建立') ? '再次更新案件' : '更新案件');
    }, 1200);
  };

  const handleSecondaryAction = () => {
    if (selectedThread.recommendation.secondaryLabel.includes('建立')) {
      createCaseFromThread(selectedThread.id);
      return;
    }

    if (linkedCase) {
      void navigate(`/kanban/${linkedCase.id}`);
    }
  };

  const handleCopyReply = async () => {
    try {
      await navigator.clipboard.writeText(draftText);
      setCopyButtonLabel('已複製');
    } catch {
      setCopyButtonLabel('複製失敗');
    }

    window.setTimeout(() => {
      setCopyButtonLabel('複製回覆');
    }, 1200);
  };

  const handleRegenerate = () => {
    setDraftText(`${selectedThread.suggestion}\n\n如果您希望，我也可以順便幫您把新的時程一起整理成確認版本。`);
  };

  const handleSend = () => {
    if (!composerText.trim()) {
      return;
    }

    setDraftText(`${draftText}\n\n補充訊息：${composerText.trim()}`);
    setComposerText('');
  };

  if (!selectedThread) {
    return null;
  }

  return (
    <div className="messages-page">
      <header className="messages-page__header">
        <div>
          <h2 className="messages-page__title">訊息整合</h2>
          <p className="messages-page__subtitle">即時監聽 LINE・Gmail・Instagram，AI 自動分析與建案</p>
        </div>
        <div className="messages-page__webhook-pill">● Webhook 監聽中</div>
      </header>

      <section className="messages-flow" aria-label="訊息自動化流程">
        {flowSteps.map((step, index) => (
          <div key={step.id} className="messages-flow__item">
            <div className="messages-flow__icon">{step.icon}</div>
            <div>
              <strong className="messages-flow__title">{step.title}</strong>
              <p className="messages-flow__subtitle">{step.subtitle}</p>
            </div>
            {index < flowSteps.length - 1 ? <span className="messages-flow__arrow">→</span> : null}
          </div>
        ))}
      </section>

      <section className="messages-layout">
        <aside className="messages-inbox">
          <div className="messages-panel__header">
            <h3 className="messages-panel__title">訊息串流</h3>
            <span className="messages-panel__status">● 即時</span>
          </div>

          <div className="messages-filter-tabs" role="tablist" aria-label="訊息平台篩選">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveFilter(option.id)}
                className={
                  activeFilter === option.id
                    ? 'messages-filter-tabs__button messages-filter-tabs__button--active'
                    : 'messages-filter-tabs__button'
                }
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="messages-thread-list">
            {filteredThreads.map((thread) => {
              const itemCase = thread.caseId ? cases.find((item) => item.id === thread.caseId) : undefined;
              return (
                <button
                  key={thread.id}
                  type="button"
                  className={
                    selectedThread.id === thread.id
                      ? 'messages-thread-card messages-thread-card--active'
                      : 'messages-thread-card'
                  }
                  onClick={() => handleSelectThread(thread.id)}
                >
                  <div className="messages-thread-card__top">
                    <span className={`messages-thread-card__platform messages-thread-card__platform--${thread.platform.toLowerCase()}`}>
                      {thread.platform === 'Instagram' ? 'IG' : thread.platform}
                    </span>
                    <span className={`messages-thread-card__tag messages-thread-card__tag--${thread.tagTone}`}>{thread.tag}</span>
                  </div>
                  <div className="messages-thread-card__main">
                    <strong>{customers.find((item) => item.id === thread.customerId)?.name ?? '未命名客戶'}</strong>
                    <span>{thread.time}</span>
                  </div>
                  <p className="messages-thread-card__preview">{thread.preview}</p>
                  <span className="messages-thread-card__state">● {itemCase ? `已連結案件` : thread.caseState}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="messages-analysis">
          <article className="messages-panel">
            <div className="messages-panel__field-label">原始訊息</div>
            <div className="messages-source-card">
              <span className="messages-source-card__meta">{selectedThread.sourceMeta}</span>
              <p className="messages-source-card__text">{selectedThread.incomingMessage}</p>
            </div>
            <div className="messages-panel__center-note">↓ AI 分析中</div>
          </article>

          <article className="messages-panel">
            <div className="messages-panel__header messages-panel__header--spaced">
              <h3 className="messages-panel__title">意圖分類結果</h3>
              <span className="messages-panel__meta">信心度 {selectedThread.classification[0]?.score ?? 0}%</span>
            </div>

            <div className="messages-score-list">
              {selectedThread.classification.map((item) => (
                <div key={item.id} className="messages-score-list__row">
                  <div className="messages-score-list__labels">
                    <span className={`messages-score-list__name messages-score-list__name--${item.tone}`}>{item.label}</span>
                    <span className={`messages-score-list__value messages-score-list__value--${item.tone}`}>{item.score}%</span>
                  </div>
                  <div className="messages-score-list__track">
                    <span className={`messages-score-list__bar messages-score-list__bar--${item.tone}`} style={{width: `${item.score}%`}} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="messages-panel">
            <div className="messages-panel__header messages-panel__header--spaced">
              <h3 className="messages-panel__title">NER 實體擷取</h3>
              <span className="messages-panel__meta">命名實體辨識</span>
            </div>

            <div className="messages-entity-list">
              {selectedThread.entities.map((entity) => (
                <div key={entity.key} className="messages-entity-list__row">
                  <span className="messages-entity-list__key">{entity.key}</span>
                  <strong className="messages-entity-list__value">{entity.value}</strong>
                  <span className={statusClassMap[entity.status]}>
                    {entity.status === 'done' ? '✓ 已擷取' : entity.status === 'warning' ? '△ 待補充' : '✓ 已分類'}
                  </span>
                </div>
              ))}
            </div>
          </article>

          {selectedThread.alertTitle && selectedThread.alertCopy ? (
            <article className="messages-alert-panel">
              <h3 className="messages-alert-panel__title">△ {selectedThread.alertTitle}</h3>
              <p className="messages-alert-panel__copy">
                {selectedThread.alertCopy.split('\n').map((line, index) => (
                  <span key={`${line}-${index}`}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            </article>
          ) : null}

          <article className="messages-panel messages-panel--recommendation">
            <h3 className="messages-panel__title">案件處理建議</h3>
            <p className="messages-panel__meta-copy">{selectedThread.recommendation.status}</p>
            <div className="messages-action-row">
              <button type="button" className="messages-action-chip messages-action-chip--primary" onClick={handlePrimaryAction}>
                {primaryActionLabel}
              </button>
              <button type="button" className="messages-action-chip messages-action-chip--secondary" onClick={handleSecondaryAction}>
                {selectedThread.recommendation.secondaryLabel}
              </button>
              <button type="button" className="messages-action-chip">
                {selectedThread.recommendation.muteLabel}
              </button>
            </div>
          </article>

          <article className="messages-learning-panel">
            <span>✎ AI 判斷有誤？</span>
            <button type="button">修正 →</button>
          </article>
        </section>

        <section className="messages-chat">
          <article className="messages-chat__thread-card">
            <div className="messages-chat__header">
              <div>
                <h3 className="messages-chat__title">{linkedCustomer?.name ?? '未命名客戶'}</h3>
                <div className="messages-chat__case-row">
                  <span className={`messages-thread-card__platform messages-thread-card__platform--${selectedThread.platform.toLowerCase()}`}>
                    {selectedThread.platform === 'Instagram' ? 'IG' : selectedThread.platform}
                  </span>
                  <span>案件：{linkedCase ? `${linkedCase.title}` : '尚未建案'}</span>
                </div>
              </div>
              <button
                type="button"
                className="messages-chat__link"
                onClick={() => {
                  if (linkedCase) {
                    void navigate(`/kanban/${linkedCase.id}`);
                  }
                }}
              >
                查看案件 →
              </button>
            </div>

            <div className="messages-chat__conversation">
              {selectedThread.messages.map((message) => (
                <article
                  key={message.id}
                  className={
                    message.role === 'ai'
                      ? 'messages-bubble messages-bubble--ai'
                      : message.tone === 'warning'
                        ? 'messages-bubble messages-bubble--warning'
                        : 'messages-bubble'
                  }
                >
                  <p className="messages-bubble__text">{message.text}</p>
                  <span className="messages-bubble__time">{message.time}</span>
                </article>
              ))}
              {selectedThread.alertTitle ? <div className="messages-chat__scope-note">△ {selectedThread.alertTitle}</div> : null}
            </div>
          </article>

          <article className="messages-chat__reply-card">
            <div className="messages-panel__header messages-panel__header--spaced">
              <h3 className="messages-panel__title messages-panel__title--green">✦ AI 回覆建議</h3>
              <span className="messages-panel__meta">{selectedThread.draftContext}</span>
            </div>
            <textarea className="messages-chat__draft" value={draftText} onChange={(event) => setDraftText(event.target.value)} aria-label="AI 回覆建議" />
            <div className="messages-chat__draft-actions">
              <button
                type="button"
                className="messages-chat__draft-primary"
                onClick={() => {
                  void handleCopyReply();
                }}
              >
                {copyButtonLabel}
              </button>
              <button type="button" className="messages-chat__draft-secondary" onClick={handleRegenerate}>
                重新生成
              </button>
            </div>
            <div className="messages-chat__composer">
              <input value={composerText} onChange={(event) => setComposerText(event.target.value)} className="messages-chat__input" placeholder="輸入訊息..." />
              <button type="button" className="messages-chat__send" onClick={handleSend}>
                送出
              </button>
            </div>
          </article>
        </section>
      </section>
    </div>
  );
}
