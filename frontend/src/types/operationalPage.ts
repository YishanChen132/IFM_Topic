export interface OperationalMetric {
  id: string;
  label: string;
  value: string;
  tone?: 'success' | 'warning' | 'danger' | 'neutral';
}

export interface OperationalListItem {
  id: string;
  title: string;
  meta: string;
  description: string;
  status?: string;
  tone?: 'success' | 'warning' | 'danger' | 'neutral';
}

export interface OperationalTableColumn {
  key: string;
  label: string;
}

export interface OperationalTableRow {
  id: string;
  values: Record<string, string>;
  status?: string;
  tone?: 'success' | 'warning' | 'danger' | 'neutral';
}

export interface OperationalPageContent {
  title: string;
  subtitle: string;
  metrics: OperationalMetric[];
  priorityLabel: string;
  priorityItems: OperationalListItem[];
  tableTitle: string;
  tableColumns: OperationalTableColumn[];
  tableRows: OperationalTableRow[];
}
