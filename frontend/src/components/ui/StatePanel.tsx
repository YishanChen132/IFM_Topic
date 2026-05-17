interface StatePanelProps {
  badge: string;
  title: string;
  copy: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function StatePanel({badge, title, copy, actionLabel, onAction}: StatePanelProps) {
  return (
    <section className="page-card state-panel" aria-live="polite">
      <span className="state-panel__badge">{badge}</span>
      <h2 className="state-panel__title">{title}</h2>
      <p className="state-panel__copy">{copy}</p>
      {actionLabel && onAction ? (
        <button type="button" className="state-panel__action" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
