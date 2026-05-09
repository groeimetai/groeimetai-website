export function CaseCard({
  industry,
  title,
  snippet,
  metric,
}: {
  industry: string;
  title: string;
  snippet: string;
  metric: { num: string; label: string };
}) {
  return (
    <div className="card ds-case interactive">
      <div className="case-meta mono">{industry}</div>
      <h3 className="case-title">{title}</h3>
      <p>{snippet}</p>
      <div className="case-metric">
        <div className="case-metric-num mono">{metric.num}</div>
        <div className="case-metric-label">{metric.label}</div>
      </div>
    </div>
  );
}

export default CaseCard;
