import {NavLink, Outlet} from 'react-router-dom';

const navigationItems = [
  {to: '/kanban', label: '案件看板', badge: '3'},
  {to: '/messages', label: '訊息整合', badge: '8'},
  {to: '/management', label: '案件管理'},
  {to: '/customers', label: '客戶資料庫'},
  {to: '/', label: '統計分析'},
];

const platformConnections = [
  {label: 'Gmail', status: '已連'},
  {label: 'LINE', status: '已連'},
  {label: 'Instagram', status: '待審核'},
];

export function AppShell() {
  return (
    <div className="app-shell">
      <div className="app-shell__frame">
        <aside className="app-shell__sidebar">
          <div className="app-shell__brand">
            <div className="app-shell__brand-mark">聊若指掌</div>
            <p className="app-shell__brand-copy">自由工作者案件管理</p>
          </div>

          <div className="app-shell__section">
            <span className="app-shell__section-label">主選單</span>
            <nav className="app-shell__nav" aria-label="Primary navigation">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({isActive}) =>
                    isActive ? 'app-shell__nav-link app-shell__nav-link--active' : 'app-shell__nav-link'
                  }
                >
                  <span>{item.label}</span>
                  {item.badge ? <span className="app-shell__nav-badge">{item.badge}</span> : null}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="app-shell__section">
            <span className="app-shell__section-label">平台連接</span>
            <div className="app-shell__platforms">
              {platformConnections.map((item) => (
                <div key={item.label} className="app-shell__platform-row">
                  <span>{item.label}</span>
                  <span
                    className={
                      item.status === '已連'
                        ? 'app-shell__platform-status app-shell__platform-status--connected'
                        : 'app-shell__platform-status'
                    }
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="app-shell__profile">
            <div className="app-shell__avatar">鄭</div>
            <div>
              <strong className="app-shell__profile-name">鄭鈺潔</strong>
              <NavLink to="/settings" className="app-shell__profile-link">
                設定
              </NavLink>
            </div>
          </div>
        </aside>

        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
