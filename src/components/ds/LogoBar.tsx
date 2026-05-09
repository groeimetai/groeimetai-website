const DEFAULT_LOGOS = [
  "Brouwerij 't IJ",
  'MKB Nederland',
  'TNO',
  'Coolblue',
  'Bever',
  'Schiphol Group',
  'Achmea',
  'Rabobank',
  'Picnic',
  'Bol',
];

export function LogoBar({ logos = DEFAULT_LOGOS }: { logos?: string[] }) {
  return (
    <div className="marquee">
      <div className="marquee-track">
        {[...logos, ...logos].map((l, i) => (
          <div key={i} className="logo-text">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LogoBar;
