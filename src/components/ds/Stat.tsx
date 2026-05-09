export function Stat({
  num,
  label,
  suffix,
}: {
  num: string;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="stat">
      <div className="stat-num mono">
        <span>{num}</span>
        {suffix && <span className="stat-suffix">{suffix}</span>}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default Stat;
