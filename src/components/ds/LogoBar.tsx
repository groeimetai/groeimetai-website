const DEFAULT_LOGOS = ['ABN AMRO', 'NS', 'DIM Haarlem', 'NovaSkin'];

export function LogoBar({ logos = DEFAULT_LOGOS }: { logos?: string[] }) {
  // Static row (no marquee) — better readable when there are only a handful of names.
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 48,
        rowGap: 16,
      }}
    >
      {logos.map((l, i) => (
        <div key={i} className="logo-text">
          {l}
        </div>
      ))}
    </div>
  );
}

export default LogoBar;
