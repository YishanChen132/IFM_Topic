const settingsTabs = [
  {id: 'profile', label: '個人資料', icon: '👤', active: true},
  {id: 'auth', label: '平台授權', icon: '🔗'},
  {id: 'rules', label: '提醒規則', icon: '🔔'},
  {id: 'pipeline', label: '案件狀態設定', icon: '◫'},
  {id: 'model', label: 'AI 模型設定', icon: '🤖'},
  {id: 'privacy', label: '資料與隱私', icon: '🔒'},
];

const authorizationItems = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: '透過 OAuth 2.0 授權，接收接案相關郵件',
    expiresAt: '有效至 2025/12/31',
    status: '已連接',
    action: '重新授權',
    tone: 'success',
  },
  {
    id: 'line',
    name: 'LINE',
    description: '透過 LINE Messaging API 接收訊息（需 LINE OA）',
    expiresAt: '有效至 2025/09/15',
    status: '已連接',
    action: '重新授權',
    tone: 'success',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Meta Graph API ─ 需商務帳號審核（MVP 後期）',
    expiresAt: '尚未連接',
    status: '待審核',
    action: '申請授權',
    tone: 'warning',
  },
];

const reminderItems = [
  {
    id: 'reply',
    title: '未回覆預警',
    description: '客戶傳訊後超過此時間仍未回覆時，觸發提醒',
    value: '24',
    unit: '小時',
    enabled: true,
  },
  {
    id: 'deadline',
    title: '交期前提醒',
    description: '距離交付期限前幾天，系統自動提醒',
    value: '3',
    unit: '天',
    enabled: true,
  },
  {
    id: 'proposal',
    title: '提案後跟進',
    description: '報價後幾天仍未收到客戶回覆，建議主動追蹤',
    value: '3',
    unit: '天',
    enabled: true,
  },
  {
    id: 'draft',
    title: 'AI 自動草稿建議',
    description: '符合情境時，自動產生回覆草稿供參考',
    value: '',
    unit: '',
    enabled: true,
  },
];

const statusChips = [
  {id: 'lead', label: '潛在詢問', tone: 'orange'},
  {id: 'confirm', label: '需求確認中', tone: 'blue'},
  {id: 'quote', label: '已報價', tone: 'green'},
  {id: 'waiting', label: '等待回覆', tone: 'peach'},
  {id: 'doing', label: '進行中', tone: 'navy'},
  {id: 'payment', label: '待交付', tone: 'amber'},
  {id: 'done', label: '已完成', tone: 'gray'},
  {id: 'lost', label: '已流失', tone: 'light'},
];

export function SettingsPage() {
  return (
    <div className="settings-page-v2">
      <header className="settings-page-v2__header">
        <div>
          <h2 className="settings-page-v2__title">設定</h2>
          <p className="settings-page-v2__subtitle">帳號資料 ・ 平台授權 ・ 提醒規則 ・ 案件狀態</p>
        </div>
      </header>

      <div className="settings-page-v2__layout">
        <aside className="settings-page-v2__menu">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={tab.active ? 'settings-menu-item settings-menu-item--active' : 'settings-menu-item'}
            >
              <span className="settings-menu-item__icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </aside>

        <div className="settings-page-v2__content">
          <section className="settings-panel">
            <div className="settings-panel__header">
              <h3 className="settings-panel__title">個人資料</h3>
              <span className="settings-panel__tag">P0 ・ 基本帳號設定</span>
            </div>

            <div className="profile-block">
              <div className="profile-block__top">
                <div className="profile-avatar">鄭</div>
                <button type="button" className="settings-small-button">
                  更換頭像
                </button>
              </div>

              <div className="profile-form">
                <label className="settings-field">
                  <span className="settings-field__label">姓名</span>
                  <input className="settings-input" value="鄭鈺潔" readOnly />
                </label>
                <label className="settings-field">
                  <span className="settings-field__label">電子信箱</span>
                  <input className="settings-input" value="cheng@ntut.edu.tw" readOnly />
                </label>
                <label className="settings-field settings-field--wide">
                  <span className="settings-field__label">接案者名稱（顯示於報價單）</span>
                  <input className="settings-input" value="鄭鈺潔設計工作室" readOnly />
                </label>
              </div>
            </div>
          </section>

          <section className="settings-panel">
            <div className="settings-panel__header">
              <h3 className="settings-panel__title">平台授權</h3>
              <span className="settings-panel__tag">P0 ・ 訊息接收來源</span>
            </div>

            <div className="authorization-list">
              {authorizationItems.map((item) => (
                <div key={item.id} className="authorization-item">
                  <div>
                    <div className="authorization-item__name">{item.name}</div>
                    <div className="authorization-item__description">{item.description}</div>
                    <div className="authorization-item__meta">{item.expiresAt}</div>
                  </div>

                  <div className="authorization-item__actions">
                    <span
                      className={
                        item.tone === 'warning'
                          ? 'status-pill status-pill--warning'
                          : 'status-pill status-pill--success'
                      }
                    >
                      {item.status}
                    </span>
                    <button
                      type="button"
                      className={
                        item.tone === 'warning'
                          ? 'settings-outline-button settings-outline-button--warning'
                          : 'settings-outline-button'
                      }
                    >
                      {item.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="settings-panel">
            <div className="settings-panel__header">
              <h3 className="settings-panel__title">提醒規則設定</h3>
              <span className="settings-panel__tag">P0 ・ 規則引擎觸發條件</span>
            </div>

            <div className="rule-list">
              {reminderItems.map((item) => (
                <div key={item.id} className="rule-item">
                  <div>
                    <div className="rule-item__title">{item.title}</div>
                    <div className="rule-item__description">{item.description}</div>
                  </div>

                  <div className="rule-item__controls">
                    {item.value ? (
                      <div className="rule-item__value-box">
                        <span className="rule-item__value">{item.value}</span>
                        <span className="rule-item__unit">{item.unit}</span>
                      </div>
                    ) : (
                      <div className="rule-item__value-box rule-item__value-box--empty" />
                    )}
                    <button
                      type="button"
                      className={item.enabled ? 'settings-toggle settings-toggle--on' : 'settings-toggle'}
                      aria-pressed={item.enabled}
                    >
                      <span className="settings-toggle__knob" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="settings-panel">
            <div className="settings-panel__header">
              <h3 className="settings-panel__title">預設案件狀態</h3>
              <span className="settings-panel__tag">P0 ・ 自訂看板欄位</span>
            </div>

            <p className="status-config__hint">拖曳調整順序，可自訂顯示/隱藏各狀態欄位</p>

            <div className="status-chip-row">
              {statusChips.map((chip) => (
                <span key={chip.id} className={`workflow-chip workflow-chip--${chip.tone}`}>
                  <span className="workflow-chip__handle">⋮</span>
                  {chip.label}
                </span>
              ))}
            </div>
          </section>

          <footer className="settings-footer-bar">
            <button type="button" className="settings-footer-bar__ghost">
              取消
            </button>
            <button type="button" className="settings-footer-bar__primary">
              儲存所有設定
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
