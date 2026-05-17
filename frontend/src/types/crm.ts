export type CrmPlatform = 'LINE' | 'Gmail' | 'Instagram' | 'Alert';

export type CaseStatus =
  | '潛在詢問'
  | '需求確認中'
  | '已報價'
  | '等待回覆'
  | '進行中'
  | '等待素材'
  | '待修改'
  | '待交付'
  | '已完成'
  | '已流失';

export type CustomerFilter = '全部' | '高風險' | '準時付款' | '常回購';

export interface CrmCase {
  id: string;
  code: string;
  customerId: string;
  title: string;
  customerName: string;
  platform: CrmPlatform;
  status: CaseStatus;
  deliverable: string;
  amount: number | null;
  amountLabel: string;
  deadline: string;
  deadlineLabel?: string;
  note: string;
  nextStep: string;
  actionLabel: string;
  createdAtLabel: string;
  health: {
    label: string;
    tone: 'success' | 'warning' | 'danger';
  };
  riskLabel?: string;
  riskTone?: 'danger' | 'warning' | 'neutral';
  highRisk?: boolean;
  badges?: Array<{
    label: string;
    tone: 'mint' | 'peach' | 'red' | 'purple' | 'green';
  }>;
  detail?: {
    stageLabel: string;
    stageTone: 'warning' | 'success';
    info: Array<{label: string; value: string; tone?: 'mint'}>;
    health: Array<{label: string; value: string; tone: 'warning' | 'success' | 'danger' | 'neutral'}>;
    timeline: string[];
    summary: string;
    summaryHighlights: Array<{title: string; copy: string; tone: 'blue' | 'green' | 'amber'}>;
    inlineAlert?: string;
    relatedCases: Array<{id: string; title: string; meta: string; amount: string; note: string; score: string}>;
    watchers: Array<{id: string; label: string; status: string; enabled: boolean}>;
  };
}

export interface CustomerProfile {
  id: string;
  name: string;
  avatar: string;
  healthTone: 'success' | 'warning' | 'danger';
  tags: string[];
  filters: CustomerFilter[];
  analysis: string;
  contact: Array<{label: string; value: string}>;
  note: string;
  paymentPace: '準時' | '偏慢' | '待確認' | '—';
}

export interface MessageThread {
  id: string;
  customerId: string;
  caseId?: string;
  platform: Extract<CrmPlatform, 'LINE' | 'Gmail' | 'Instagram'>;
  time: string;
  preview: string;
  caseState: string;
  tag: string;
  tagTone: 'orange' | 'blue' | 'purple' | 'green';
  sourceMeta: string;
  incomingMessage: string;
  classification: Array<{id: 'scope' | 'delivery' | 'clarify'; label: string; score: number; tone: 'orange' | 'amber' | 'blue'}>;
  entities: Array<{key: string; value: string; status: 'done' | 'warning' | 'classified'}>;
  alertTitle?: string;
  alertCopy?: string;
  recommendation: {
    status: string;
    primaryLabel: string;
    secondaryLabel: string;
    muteLabel: string;
  };
  draftContext: string;
  suggestion: string;
  messages: Array<{id: string; role: 'client' | 'ai'; text: string; time: string; tone?: 'warning'}>;
}
