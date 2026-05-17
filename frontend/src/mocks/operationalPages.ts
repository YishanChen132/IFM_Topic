import type {OperationalPageContent} from '@/types/operationalPage';

export const operationalPages: Record<string, OperationalPageContent> = {
  kanban: {
    title: '案件看板',
    subtitle: '把潛在案件、進行中任務與待交付工作放在同一個流程面板中。',
    metrics: [
      {id: 'active', label: '進行中', value: '12 件', tone: 'success'},
      {id: 'waiting', label: '待客戶回覆', value: '4 件', tone: 'warning'},
      {id: 'due', label: '本週到期', value: '3 件', tone: 'danger'},
    ],
    priorityLabel: '看板重點',
    priorityItems: [
      {
        id: 'card-1',
        title: '品牌識別系統',
        meta: '進行中 ・ 新芽咖啡',
        description: '本週需完成提案修訂與報價確認，建議放在第一欄追蹤。',
        status: '需追進',
        tone: 'warning',
      },
      {
        id: 'card-2',
        title: '電商視覺設計',
        meta: '待素材 ・ 鑫達電商',
        description: '客戶尚未補齊商品圖，卡片需要明確標示阻塞原因。',
        status: '阻塞中',
        tone: 'danger',
      },
      {
        id: 'card-3',
        title: '官網設計',
        meta: '待驗收 ・ 木石工作室',
        description: '可作為交付前最後一欄，整合請款狀態與版本備註。',
        status: '待驗收',
        tone: 'success',
      },
    ],
    tableTitle: '欄位規劃',
    tableColumns: [
      {key: 'column', label: '欄位'},
      {key: 'purpose', label: '用途'},
      {key: 'count', label: '案件數'},
    ],
    tableRows: [
      {id: 'lead', values: {column: '新進詢價', purpose: '收集剛進來的需求', count: '5'}},
      {id: 'quote', values: {column: '報價中', purpose: '等待報價或提案確認', count: '4'}},
      {id: 'doing', values: {column: '製作中', purpose: '追蹤執行進度與交付風險', count: '7'}},
      {
        id: 'done',
        values: {column: '待請款 / 已完成', purpose: '整合交付與收款流程', count: '3'},
      },
    ],
  },
  management: {
    title: '案件管理',
    subtitle: '集中管理案件主檔、狀態更新、負責人與交付節點。',
    metrics: [
      {id: 'open', label: '啟用案件', value: '18 件', tone: 'success'},
      {id: 'review', label: '待審核', value: '2 件', tone: 'warning'},
      {id: 'closed', label: '本月結案', value: '6 件', tone: 'neutral'},
    ],
    priorityLabel: '管理重點',
    priorityItems: [
      {
        id: 'mgmt-1',
        title: '狀態欄位標準化',
        meta: '核心資料表',
        description: '先統一詢價、報價、進行中、待驗收、結案等狀態定義。',
      },
      {
        id: 'mgmt-2',
        title: '交付期限與提醒',
        meta: '排程規則',
        description: '案件主檔需能直接標記 deadline，供預警中心與請款追蹤共用。',
        status: '高優先',
        tone: 'warning',
      },
      {
        id: 'mgmt-3',
        title: '附件與對話連動',
        meta: '資料整合',
        description: '預留欄位讓日後可串訊息整合與案件詳情的紀錄區。',
      },
    ],
    tableTitle: '案件清單欄位',
    tableColumns: [
      {key: 'project', label: '案件'},
      {key: 'client', label: '客戶'},
      {key: 'owner', label: '負責人'},
      {key: 'deadline', label: '期限'},
      {key: 'state', label: '狀態'},
    ],
    tableRows: [
      {
        id: 'p1',
        values: {
          project: '品牌識別系統',
          client: '新芽咖啡',
          owner: '鄭鈺潔',
          deadline: '06/12',
          state: '進行中',
        },
        status: '進行中',
        tone: 'success',
      },
      {
        id: 'p2',
        values: {
          project: '官網設計',
          client: '木石工作室',
          owner: '鄭鈺潔',
          deadline: '06/08',
          state: '待驗收',
        },
        status: '待驗收',
        tone: 'warning',
      },
      {
        id: 'p3',
        values: {
          project: '電商視覺',
          client: '鑫達電商',
          owner: '鄭鈺潔',
          deadline: '06/05',
          state: '待素材',
        },
        status: '待素材',
        tone: 'danger',
      },
    ],
  },
  customers: {
    title: '客戶資料庫',
    subtitle: '建立可搜尋、可分群的客戶主檔，支援往後案件與訊息綁定。',
    metrics: [
      {id: 'clients', label: '客戶總數', value: '42 位', tone: 'success'},
      {id: 'active', label: '近 90 天互動', value: '18 位', tone: 'neutral'},
      {id: 'vip', label: '高價值客戶', value: '6 位', tone: 'warning'},
    ],
    priorityLabel: '資料庫重點',
    priorityItems: [
      {
        id: 'customer-1',
        title: '統一聯絡方式',
        meta: 'Gmail / LINE / Instagram',
        description: '同一客戶可能跨平台聯繫，資料表需要能做 identity merge。',
      },
      {
        id: 'customer-2',
        title: '案件歷程關聯',
        meta: '案件追蹤',
        description: '每位客戶要能直接看到歷史案件、報價範圍與回覆習慣。',
      },
      {
        id: 'customer-3',
        title: '標籤分群',
        meta: 'CRM 基礎',
        description: '先從產業別、合作類型與收款狀態做最小分群。',
      },
    ],
    tableTitle: '客戶主檔',
    tableColumns: [
      {key: 'name', label: '客戶'},
      {key: 'industry', label: '產業'},
      {key: 'channel', label: '主要平台'},
      {key: 'last', label: '最近互動'},
    ],
    tableRows: [
      {
        id: 'c1',
        values: {name: '新芽咖啡', industry: '餐飲', channel: 'Gmail', last: '05/30'},
      },
      {
        id: 'c2',
        values: {name: '鑫達電商', industry: '電商', channel: 'Instagram', last: '05/29'},
      },
      {
        id: 'c3',
        values: {name: '木石工作室', industry: '設計', channel: 'Gmail', last: '05/28'},
      },
    ],
  },
  settings: {
    title: '設定',
    subtitle: '集中管理帳號、平台連接、提醒規則與自動化偏好。',
    metrics: [
      {id: 'connections', label: '已連接平台', value: '3 個', tone: 'success'},
      {id: 'rules', label: '啟用規則', value: '8 條', tone: 'neutral'},
      {id: 'needs-review', label: '待調整項目', value: '2 個', tone: 'warning'},
    ],
    priorityLabel: '設定模組',
    priorityItems: [
      {
        id: 'set-1',
        title: '平台授權狀態',
        meta: 'Gmail / LINE / Instagram',
        description: '需要清楚呈現連線狀態、重新授權入口與最近同步時間。',
      },
      {
        id: 'set-2',
        title: '提醒規則',
        meta: '預警中心',
        description: '將逾期未回覆、即將到期、待請款等規則集中設定。',
        status: '高優先',
        tone: 'warning',
      },
      {
        id: 'set-3',
        title: 'AI 功能閾值',
        meta: '系統效能',
        description: '保留 NER 準確率門檻、Webhook timeout 與自動建案策略。',
      },
    ],
    tableTitle: '設定項目',
    tableColumns: [
      {key: 'group', label: '分類'},
      {key: 'item', label: '項目'},
      {key: 'state', label: '狀態'},
    ],
    tableRows: [
      {
        id: 's1',
        values: {group: '平台連接', item: 'Instagram 授權', state: '待審核'},
        status: '待審核',
        tone: 'warning',
      },
      {
        id: 's2',
        values: {group: '提醒規則', item: '48 小時未回覆', state: '已啟用'},
        status: '已啟用',
        tone: 'success',
      },
      {
        id: 's3',
        values: {group: 'AI 自動化', item: '自動建案開關', state: '已啟用'},
        status: '已啟用',
        tone: 'success',
      },
    ],
  },
  messages: {
    title: '訊息整合',
    subtitle: '把跨平台訊息流集中，支援快速回覆、摘要與後續建案。',
    metrics: [
      {id: 'unread', label: '未讀訊息', value: '12 則', tone: 'warning'},
      {id: 'today', label: '今日新訊息', value: '24 則', tone: 'neutral'},
      {id: 'urgent', label: '需立即回覆', value: '3 則', tone: 'danger'},
    ],
    priorityLabel: '整合重點',
    priorityItems: [
      {
        id: 'msg-1',
        title: '對話列表',
        meta: '左側清單',
        description: '需同時顯示平台、未讀數、最後訊息時間與案件關聯狀態。',
      },
      {
        id: 'msg-2',
        title: '訊息摘要',
        meta: 'AI 協助',
        description: '預留自動摘要與意圖判斷區，之後可接入 NER / intent 模組。',
      },
      {
        id: 'msg-3',
        title: '一鍵建案',
        meta: '工作流程',
        description: '讓高潛力詢價可以直接轉成案件，降低手動重建資料成本。',
        status: '優先功能',
        tone: 'success',
      },
    ],
    tableTitle: '最近訊息串',
    tableColumns: [
      {key: 'contact', label: '對象'},
      {key: 'channel', label: '平台'},
      {key: 'message', label: '最後訊息'},
      {key: 'time', label: '時間'},
    ],
    tableRows: [
      {
        id: 'm1',
        values: {contact: '鑫達電商', channel: 'Instagram', message: '請問報價何時提供？', time: '10:42'},
        status: '未讀',
        tone: 'warning',
      },
      {
        id: 'm2',
        values: {contact: '木石工作室', channel: 'Gmail', message: '首頁調整已確認', time: '09:10'},
      },
      {
        id: 'm3',
        values: {contact: '新芽咖啡', channel: 'LINE', message: '可否提前交付？', time: '昨天'},
        status: '需追蹤',
        tone: 'danger',
      },
    ],
  },
};
