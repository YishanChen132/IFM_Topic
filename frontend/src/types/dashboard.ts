export interface DashboardFilter {
  id: string;
  label: string;
  active?: boolean;
}

export interface DashboardMetric {
  id: string;
  icon: string;
  label: string;
  value: string;
  change: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
}

export interface RevenuePoint {
  id: string;
  label: string;
  valueLabel: string;
  barHeight: number;
  highlighted?: boolean;
}

export interface DistributionItem {
  id: string;
  label: string;
  count: string;
  share: string;
  progress: number;
  tone: 'blue' | 'amber' | 'orange' | 'green' | 'red';
}

export interface PlatformSourceItem {
  id: string;
  label: string;
  count: string;
  share: string;
  progress: number;
  tone: 'green' | 'red' | 'purple';
}

export interface AiMetricItem {
  id: string;
  label: string;
  value: string;
  target: string;
}

export interface CollectionSummary {
  label: string;
  amount: string;
  share: string;
  tone: 'success' | 'warning';
}

export interface ReceivableCase {
  id: string;
  project: string;
  client: string;
  amount: string;
}

export interface ExtractionMetricItem {
  id: string;
  label: string;
  value: string;
  progress: number;
  tone: 'success' | 'warning';
}

export interface ClosedCaseItem {
  id: string;
  project: string;
  client: string;
  amount: string;
  platform: string;
  completedAt: string;
  paymentStatus: string;
  paymentTone: 'success' | 'warning';
}

export interface DashboardData {
  title: string;
  subtitle: string;
  filters: DashboardFilter[];
  metrics: DashboardMetric[];
  revenueSeries: RevenuePoint[];
  statusDistribution: DistributionItem[];
  platformSources: PlatformSourceItem[];
  aiMetrics: AiMetricItem[];
  collectionSummaries: CollectionSummary[];
  receivableCases: ReceivableCase[];
  extractionAccuracy: ExtractionMetricItem[];
  closedCases: ClosedCaseItem[];
}
