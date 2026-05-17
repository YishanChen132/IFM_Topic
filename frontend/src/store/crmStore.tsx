/* eslint-disable react-refresh/only-export-components */
import {createContext, useContext, useMemo, useReducer} from 'react';
import type {ReactNode} from 'react';
import {crmCases, crmCustomers, crmThreads} from '@/mocks/crm';
import type {CaseStatus, CrmCase, CustomerProfile, MessageThread} from '@/types/crm';

interface CrmState {
  cases: CrmCase[];
  customers: CustomerProfile[];
  threads: MessageThread[];
}

type CrmAction =
  | {type: 'update_case_from_thread'; threadId: string}
  | {type: 'create_case_from_thread'; threadId: string}
  | {type: 'move_case_forward'; caseId: string};

interface CrmStoreValue extends CrmState {
  updateCaseFromThread: (threadId: string) => void;
  createCaseFromThread: (threadId: string) => void;
  moveCaseForward: (caseId: string) => void;
}

const CrmStoreContext = createContext<CrmStoreValue | null>(null);

const initialState: CrmState = {
  cases: crmCases,
  customers: crmCustomers,
  threads: crmThreads,
};

function applyThreadUpdate(state: CrmState, threadId: string): CrmState {
  const thread = state.threads.find((item) => item.id === threadId);
  if (!thread?.caseId) {
    return state;
  }

  const currentCase = state.cases.find((item) => item.id === thread.caseId);
  if (!currentCase) {
    return state;
  }

  let casePatch: Partial<CrmCase> | null = null;
  const threadStatus = `已更新案件：${currentCase.customerName}｜${currentCase.title}`;
  const topIntent = thread.classification[0]?.label ?? '';
  const quoteEntity = thread.entities.find((item) => item.key === 'QUOTE_AMOUNT')?.value ?? '';
  const deadlineEntity = thread.entities.find((item) => item.key === 'EXPECTED_DDL')?.value ?? '';
  const actionLabel = inferActionLabelFromStatus(inferUpdatedStatus(currentCase.status, topIntent, thread.tag));

  casePatch = {
    status: inferUpdatedStatus(currentCase.status, topIntent, thread.tag),
    nextStep: inferNextStep(thread, currentCase.status),
    actionLabel,
    note: thread.incomingMessage,
    highRisk: Boolean(thread.alertTitle) || currentCase.highRisk,
    amountLabel: quoteEntity !== '未提及' && quoteEntity ? quoteEntity : currentCase.amountLabel,
    deadline: deadlineEntity !== '未提及' && deadlineEntity ? deadlineEntity : currentCase.deadline,
    detail: {
      ...(currentCase.detail ?? buildDefaultDetail(currentCase)),
      stageLabel: inferUpdatedStatus(currentCase.status, topIntent, thread.tag),
      summary: `案件 ${currentCase.customerName} 已依據最新訊息更新。最新重點為「${thread.incomingMessage}」，下一步建議為「${inferNextStep(thread, currentCase.status)}」。`,
      summaryHighlights: [
        {title: '→ 案件摘要', copy: `${inferUpdatedStatus(currentCase.status, topIntent, thread.tag)}・${quoteEntity !== '未提及' && quoteEntity ? quoteEntity : currentCase.amountLabel}`, tone: 'blue'},
        {title: '→ 下一步行動', copy: inferNextStep(thread, currentCase.status), tone: 'green'},
        {title: '⚠ 風險提醒', copy: thread.alertTitle ? thread.alertTitle : currentCase.riskLabel ?? '持續追蹤案件狀況', tone: 'amber'},
      ],
      inlineAlert: thread.alertCopy ? `${thread.alertTitle ?? '提醒'} ${thread.alertCopy}` : currentCase.detail?.inlineAlert,
    },
  };

  return {
    ...state,
    cases: state.cases.map((item) => (item.id === currentCase.id ? {...item, ...casePatch} : item)),
    threads: state.threads.map((item) =>
      item.id === threadId
        ? {
            ...item,
            caseState: '已更新案件',
            recommendation: {
              ...item.recommendation,
              status: threadStatus,
              primaryLabel: '再次更新案件',
            },
          }
        : item,
    ),
  };
}

function buildDefaultDetail(item: CrmCase) {
  return {
    stageLabel: item.status,
    stageTone: item.status === '已完成' ? ('success' as const) : ('warning' as const),
    info: [
      {label: '案件編號', value: item.code},
      {label: '客戶名稱', value: item.customerName},
      {label: '來源平台', value: item.platform, tone: 'mint' as const},
      {label: '交付項目', value: item.deliverable},
      {label: '報價金額', value: item.amountLabel},
      {label: '交期', value: item.deadlineLabel ?? item.deadline},
      {label: '建立時間', value: item.createdAtLabel},
    ],
    health: [
      {label: '案件健康度', value: item.health.label, tone: item.health.tone === 'danger' ? ('danger' as const) : item.health.tone === 'warning' ? ('warning' as const) : ('success' as const)},
      {label: '付款狀態', value: item.status === '已完成' ? '已完成' : '進行中', tone: item.status === '已完成' ? ('success' as const) : ('neutral' as const)},
    ],
    timeline: ['潛在詢問', '需求確認中', '已報價', '等待回覆', '確認合作', '進行中', '待交付', '已完成'],
    summary: `案件 ${item.customerName}｜${item.title} 目前狀態為 ${item.status}。`,
    summaryHighlights: [
      {title: '→ 案件摘要', copy: `${item.status}・${item.amountLabel}`, tone: 'blue' as const},
      {title: '→ 下一步行動', copy: item.nextStep, tone: 'green' as const},
      {title: '⚠ 風險提醒', copy: item.riskLabel ?? '持續追蹤案件狀況', tone: 'amber' as const},
    ],
    relatedCases: [],
    watchers: [
      {id: 'generic-1', label: '24h 未回覆', status: '監控中', enabled: true},
      {id: 'generic-2', label: '交期前 3 天', status: '尚未觸發', enabled: true},
    ],
  };
}

function inferUpdatedStatus(currentStatus: CaseStatus, topIntent: string, tag: string): CaseStatus {
  if (topIntent.includes('確認合作')) {
    return '進行中';
  }
  if (topIntent.includes('需求變更')) {
    return currentStatus === '需求確認中' ? '已報價' : currentStatus;
  }
  if (topIntent.includes('交期風險') || tag.includes('等待素材')) {
    return '等待素材';
  }
  if (topIntent.includes('修改')) {
    return '待修改';
  }
  if (currentStatus === '潛在詢問') {
    return '需求確認中';
  }
  return currentStatus;
}

function inferNextStep(thread: MessageThread, currentStatus: CaseStatus) {
  const topIntent = thread.classification[0]?.label ?? '';
  if (topIntent.includes('確認合作')) {
    return '建立簽約流程';
  }
  if (topIntent.includes('需求變更')) {
    return '等待客戶確認加價';
  }
  if (topIntent.includes('交期風險') || thread.tag.includes('等待素材')) {
    return '追蹤素材進度';
  }
  if (topIntent.includes('修改')) {
    return '整理修改點並回覆';
  }
  return currentStatus === '潛在詢問' ? '釐清需求' : thread.recommendation.primaryLabel;
}

function inferActionLabelFromStatus(status: CaseStatus) {
  switch (status) {
    case '潛在詢問':
    case '需求確認中':
      return '回覆報價';
    case '已報價':
      return '等客戶確認';
    case '等待回覆':
      return '追蹤回覆';
    case '進行中':
      return '安排啟動';
    case '等待素材':
      return '追蹤素材';
    case '待修改':
      return '整理修改';
    case '待交付':
      return '確認後請款';
    case '已完成':
      return '已結案';
    case '已流失':
      return '重新聯繫';
  }
}

function moveStatusForward(status: CaseStatus): CaseStatus {
  switch (status) {
    case '潛在詢問':
      return '需求確認中';
    case '需求確認中':
      return '已報價';
    case '已報價':
      return '進行中';
    case '等待回覆':
      return '進行中';
    case '進行中':
      return '待交付';
    case '等待素材':
      return '進行中';
    case '待修改':
      return '待交付';
    case '待交付':
      return '已完成';
    case '已完成':
      return '已完成';
    case '已流失':
      return '進行中';
  }
}

function createCaseFromThread(state: CrmState, threadId: string): CrmState {
  const thread = state.threads.find((item) => item.id === threadId);
  if (!thread) {
    return state;
  }

  const customer = state.customers.find((item) => item.id === thread.customerId);
  const projectEntity = thread.entities.find((item) => item.key === 'PROJECT_ITEM')?.value ?? thread.preview;
  const quoteEntity = thread.entities.find((item) => item.key === 'QUOTE_AMOUNT')?.value ?? '未提及';
  const deadlineEntity = thread.entities.find((item) => item.key === 'EXPECTED_DDL')?.value ?? '未提及';
  const count = state.cases.length + 18;
  const status = thread.classification[0]?.label.includes('合作邀約')
    ? '潛在詢問'
    : thread.classification[0]?.label.includes('確認合作')
      ? '進行中'
      : '需求確認中';
  const newCase: CrmCase = {
    id: `case-${thread.id}`,
    code: `#2024-${String(count).padStart(3, '0')}`,
    customerId: thread.customerId,
    title: projectEntity.replace('（追加）', '').replace(' / 新案件', ''),
    customerName: customer?.name ?? '未命名客戶',
    platform: thread.platform,
    status,
    deliverable: projectEntity,
    amount: quoteEntity !== '未提及' ? parseAmount(quoteEntity) : null,
    amountLabel: quoteEntity !== '未提及' ? quoteEntity : '待估價',
    deadline: deadlineEntity !== '未提及' ? deadlineEntity : '未排定',
    note: thread.incomingMessage,
    nextStep: inferNextStep(thread, status),
    actionLabel: inferActionLabelFromStatus(status),
    createdAtLabel: thread.time,
    health: {label: thread.alertTitle ? '注意' : '正常', tone: thread.alertTitle ? 'warning' : 'success'},
    riskLabel: thread.alertTitle ?? '詳情',
    riskTone: thread.alertTitle ? 'warning' : 'neutral',
    highRisk: Boolean(thread.alertTitle),
    badges: [{label: thread.tag, tone: thread.tagTone === 'green' ? 'green' : thread.tagTone === 'purple' ? 'purple' : thread.tagTone === 'blue' ? 'mint' : 'peach'}],
  };

  return {
    ...state,
    cases: [newCase, ...state.cases],
    threads: state.threads.map((item) =>
      item.id === threadId
        ? {
            ...item,
            caseId: newCase.id,
            caseState: '已建立案件',
            recommendation: {
              ...item.recommendation,
              status: `已建立案件：${newCase.customerName}｜${newCase.title}`,
              primaryLabel: '更新案件',
              secondaryLabel: '查看案件',
            },
          }
        : item,
    ),
  };
}

function moveCaseForward(state: CrmState, caseId: string): CrmState {
  return {
    ...state,
    cases: state.cases.map((item) => {
      if (item.id !== caseId) {
        return item;
      }
      const nextStatus = moveStatusForward(item.status);
      return {
        ...item,
        status: nextStatus,
        actionLabel: inferActionLabelFromStatus(nextStatus),
        nextStep: nextStatus === '已完成' ? '確認款項入帳' : item.nextStep,
        highRisk: nextStatus === '已完成' ? false : item.highRisk,
        health: nextStatus === '已完成' ? {label: '正常', tone: 'success'} : item.health,
        detail: item.detail
          ? {
              ...item.detail,
              stageLabel: nextStatus,
              stageTone: nextStatus === '已完成' ? 'success' : item.detail.stageTone,
            }
          : item.detail,
      };
    }),
  };
}

function parseAmount(value: string) {
  const numeric = value.replace(/[^0-9]/g, '');
  return numeric ? Number(numeric) : null;
}

function crmReducer(state: CrmState, action: CrmAction): CrmState {
  switch (action.type) {
    case 'update_case_from_thread':
      return applyThreadUpdate(state, action.threadId);
    case 'create_case_from_thread':
      return createCaseFromThread(state, action.threadId);
    case 'move_case_forward':
      return moveCaseForward(state, action.caseId);
    default:
      return state;
  }
}

export function CrmStoreProvider({children}: {children: ReactNode}) {
  const [state, dispatch] = useReducer(crmReducer, initialState);

  const value = useMemo<CrmStoreValue>(
    () => ({
      ...state,
      updateCaseFromThread: (threadId: string) => {
        dispatch({type: 'update_case_from_thread', threadId});
      },
      createCaseFromThread: (threadId: string) => {
        dispatch({type: 'create_case_from_thread', threadId});
      },
      moveCaseForward: (caseId: string) => {
        dispatch({type: 'move_case_forward', caseId});
      },
    }),
    [state],
  );

  return <CrmStoreContext.Provider value={value}>{children}</CrmStoreContext.Provider>;
}

export function useCrmStore() {
  const context = useContext(CrmStoreContext);
  if (!context) {
    throw new Error('useCrmStore must be used within CrmStoreProvider');
  }
  return context;
}
