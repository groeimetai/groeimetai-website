/* ===== GroeimetAI — Premium Logo Concepts =====
   Each concept uses 2-3 distinct visual layers:
   - Background structure (geometric base, grid, ring, glyph)
   - Primary mark (the meaningful glyph)
   - Detail layer (highlight, gradient, negative-space play, accent)
*/

/* === CONCEPT A — "Aurora G" =====================================
   A circular dial divided into folder/instructions/tools sectors,
   with a stylised G carved out of negative space, plus a glowing
   agent-node at the center. 3 layers: dial → sectors → core node.
*/
const Logo_Aurora = ({ size = 96, accent = "#ff5a1f", deep = "#b8340a", ink = "#0a0a0b" }) => {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent}/>
          <stop offset="100%" stopColor={deep}/>
        </linearGradient>
        <radialGradient id={`core-${id}`} cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.4"/>
          <stop offset="60%" stopColor={accent} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Layer 1: Outer ring with notches */}
      <circle cx="48" cy="48" r="44" stroke={ink} strokeWidth="1" strokeOpacity="0.18" fill="none"/>
      {[0, 60, 120, 180, 240, 300].map(a => (
        <line key={a}
          x1={48 + 44 * Math.cos(a * Math.PI/180)}
          y1={48 + 44 * Math.sin(a * Math.PI/180)}
          x2={48 + 40 * Math.cos(a * Math.PI/180)}
          y2={48 + 40 * Math.sin(a * Math.PI/180)}
          stroke={ink} strokeWidth="1" strokeOpacity="0.3"/>
      ))}

      {/* Layer 2: Three filled sectors (folder/instructions/tools) — at 12, 4, 8 o'clock */}
      <g>
        {/* Top sector — "knowledge" — full fill */}
        <path d="M48 8 A40 40 0 0 1 82.6 28 L48 48 Z" fill={`url(#grad-${id})`}/>
        {/* Bottom-right — "tools" — 70% */}
        <path d="M82.6 28 A40 40 0 0 1 65.3 84.6 L48 48 Z" fill={accent} fillOpacity="0.55"/>
        {/* Bottom-left — "instructions" — 35% */}
        <path d="M65.3 84.6 A40 40 0 0 1 13.4 68 L48 48 Z" fill={accent} fillOpacity="0.22"/>
        {/* Empty quadrant remainder — gives breathing room */}
        <path d="M13.4 68 A40 40 0 0 1 48 8 L48 48 Z" fill={ink} fillOpacity="0.04"/>
      </g>

      {/* Layer 3: Inner core (no G) — clean lit center disc */}
      <g>
        <circle cx="48" cy="48" r="22" fill={ink}/>
        <circle cx="48" cy="48" r="22" fill={`url(#core-${id})`}/>
        {/* Subtle inner ring */}
        <circle cx="48" cy="48" r="16" stroke={accent} strokeWidth="1" strokeOpacity="0.35" fill="none"/>
      </g>

      {/* Layer 4: removed — clean center */}
    </svg>
  );
};

/* === CONCEPT B — "Strata" =======================================
   Three stacked geometric layers (circle / square / arc) representing
   the 3 building blocks, offset to create depth. The G emerges from
   the gap between them. Multi-tone, sculptural feel.
*/
const Logo_Strata = ({ size = 96, accent = "#ff5a1f", deep = "#b8340a", ink = "#0a0a0b" }) => {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      <defs>
        <linearGradient id={`gradB-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent}/>
          <stop offset="100%" stopColor={deep}/>
        </linearGradient>
      </defs>

      {/* Background subtle frame */}
      <rect x="6" y="6" width="84" height="84" rx="20" fill={ink} fillOpacity="0.04" stroke={ink} strokeOpacity="0.1" strokeWidth="1"/>

      {/* Layer 1: Bottom — large filled square (folder = foundation) */}
      <path d="M22 36 H44 L48 32 H72 V70 a4 4 0 0 1 -4 4 H26 a4 4 0 0 1 -4 -4 Z"
            fill={accent} fillOpacity="0.18"/>
      <path d="M22 36 H44 L48 32 H72 V70 a4 4 0 0 1 -4 4 H26 a4 4 0 0 1 -4 -4 Z"
            stroke={accent} strokeWidth="1.5" fill="none"/>

      {/* Layer 2: Middle — instruction tablet, offset and rotated subtly */}
      <g transform="rotate(-4 48 48)">
        <rect x="30" y="28" width="40" height="50" rx="3" fill={ink}/>
        <rect x="30" y="28" width="40" height="50" rx="3" fill={`url(#gradB-${id})`} fillOpacity="0.92"/>
        {/* Instruction lines */}
        <rect x="36" y="36" width="22" height="2" rx="1" fill="#fff" fillOpacity="0.7"/>
        <rect x="36" y="42" width="28" height="2" rx="1" fill="#fff" fillOpacity="0.5"/>
        <rect x="36" y="48" width="20" height="2" rx="1" fill="#fff" fillOpacity="0.5"/>
        <rect x="36" y="54" width="24" height="2" rx="1" fill="#fff" fillOpacity="0.35"/>
        <rect x="36" y="60" width="16" height="2" rx="1" fill="#fff" fillOpacity="0.35"/>
      </g>

      {/* Layer 3: Top — agent node / tool circle, sitting on top */}
      <circle cx="68" cy="30" r="14" fill={ink}/>
      <circle cx="68" cy="30" r="14" stroke={accent} strokeWidth="2" fill="none"/>
      <circle cx="68" cy="30" r="6" fill={accent}/>
      <circle cx="68" cy="30" r="2.5" fill="#fff"/>
      {/* Connecting tick from circle to tablet */}
      <line x1="61" y1="35" x2="56" y2="40" stroke={accent} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
};

/* === CONCEPT C — "Cypher G" ====================================
   A complex monogram: G built from intersecting strokes, with
   embedded slash patterns suggesting code/terminal underneath.
   Three layers: outer G arc, inner counter, code-fill texture.
*/
const Logo_Cypher = ({ size = 96, accent = "#ff5a1f", deep = "#b8340a", ink = "#0a0a0b" }) => {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      <defs>
        <pattern id={`stripes-${id}`} patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke={accent} strokeWidth="1.2" strokeOpacity="0.45"/>
        </pattern>
        <mask id={`gmask-${id}`}>
          <rect width="96" height="96" fill="black"/>
          {/* G shape mask */}
          <path d="M48 12 a36 36 0 1 0 36 36 h-22 v8 h12 a26 26 0 1 1 -26 -26 a26 26 0 0 1 21 11 l8 -6 a36 36 0 0 0 -29 -15 Z"
                fill="white"/>
        </mask>
      </defs>

      {/* Layer 1: Striped fill behind G */}
      <rect width="96" height="96" fill={`url(#stripes-${id})`} mask={`url(#gmask-${id})`}/>

      {/* Layer 2: G outline */}
      <path d="M48 12 a36 36 0 1 0 36 36 h-22 v8 h12 a26 26 0 1 1 -26 -26 a26 26 0 0 1 21 11 l8 -6 a36 36 0 0 0 -29 -15 Z"
            stroke={accent} strokeWidth="2.5" fill="none" strokeLinejoin="round"/>

      {/* Layer 3: Inner accents — three dots representing the 3 building blocks, on G's path */}
      <circle cx="48" cy="12" r="3.5" fill={ink}/>
      <circle cx="48" cy="12" r="3.5" stroke={accent} strokeWidth="2" fill={accent}/>

      <circle cx="84" cy="48" r="3.5" fill={ink}/>
      <circle cx="84" cy="48" r="3.5" stroke={accent} strokeWidth="2" fill={accent}/>

      <circle cx="62" cy="56" r="3.5" fill={ink}/>
      <circle cx="62" cy="56" r="3.5" stroke={accent} strokeWidth="2" fill={accent}/>

      {/* Layer 4: Center caret/cursor — terminal accent */}
      <g transform="translate(38 42)">
        <rect x="0" y="0" width="3" height="12" fill={deep}/>
        <path d="M5 2 L11 6 L5 10 Z" fill={accent}/>
      </g>
    </svg>
  );
};

/* === CONCEPT D — "Bloom Graph" =================================
   A node graph where the agent is a flower: three petal-shapes
   (folder/instructions/tools) meeting at a central core, with
   subtle radial guide lines like a botanical illustration.
*/
const Logo_Bloom = ({ size = 96, accent = "#ff5a1f", deep = "#b8340a", ink = "#0a0a0b" }) => {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      <defs>
        <radialGradient id={`bloomG-${id}`} cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor={accent}/>
          <stop offset="100%" stopColor={deep}/>
        </radialGradient>
      </defs>

      {/* Layer 1: Compass / botanical guide circle */}
      <circle cx="48" cy="48" r="40" stroke={ink} strokeWidth="0.6" strokeOpacity="0.25" fill="none" strokeDasharray="2 4"/>
      <circle cx="48" cy="48" r="28" stroke={ink} strokeWidth="0.6" strokeOpacity="0.18" fill="none"/>

      {/* Layer 2: Three petals (rotated) */}
      {[0, 120, 240].map((angle, i) => (
        <g key={i} transform={`rotate(${angle} 48 48)`}>
          {/* Outer petal outline */}
          <path d="M48 48 C 38 28, 38 14, 48 8 C 58 14, 58 28, 48 48 Z"
                fill={accent} fillOpacity={0.3 + i*0.15}
                stroke={accent} strokeWidth="1.5" strokeLinejoin="round"/>
          {/* Inner vein */}
          <line x1="48" y1="48" x2="48" y2="14" stroke={ink} strokeWidth="1" strokeOpacity="0.35"/>
          {/* Tip dot */}
          <circle cx="48" cy="10" r="2.5" fill={ink}/>
        </g>
      ))}

      {/* Layer 3: Stem going down */}
      <path d="M48 48 V82" stroke={accent} strokeWidth="3" strokeLinecap="round"/>
      <path d="M48 70 C 42 68, 38 62, 36 58" stroke={accent} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M48 76 C 54 74, 58 68, 60 64" stroke={accent} strokeWidth="2" strokeLinecap="round" fill="none"/>

      {/* Layer 4: Core */}
      <circle cx="48" cy="48" r="9" fill={ink}/>
      <circle cx="48" cy="48" r="9" fill={`url(#bloomG-${id})`} fillOpacity="0.95"/>
      <circle cx="48" cy="48" r="3" fill="#fff"/>
    </svg>
  );
};

/* === CONCEPT E — "Mainframe" ===================================
   A bold, blocky monogram. Two G's interlocking — one outline,
   one filled — with terminal cursor and grid texture. Heavy,
   technical, brutalist-ish but warm because of the orange.
*/
const Logo_Mainframe = ({ size = 96, accent = "#ff5a1f", deep = "#b8340a", ink = "#0a0a0b" }) => {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      <defs>
        <linearGradient id={`mainG-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent}/>
          <stop offset="100%" stopColor={deep}/>
        </linearGradient>
      </defs>

      {/* Layer 1: Background grid square */}
      <rect x="6" y="6" width="84" height="84" rx="14" fill={ink}/>
      {/* Subtle grid lines on dark background */}
      {[18, 30, 42, 54, 66, 78].map(p => (
        <React.Fragment key={p}>
          <line x1={p} y1="10" x2={p} y2="86" stroke="#fff" strokeOpacity="0.04" strokeWidth="1"/>
          <line x1="10" y1={p} x2="86" y2={p} stroke="#fff" strokeOpacity="0.04" strokeWidth="1"/>
        </React.Fragment>
      ))}

      {/* Layer 2: Outline G (back, offset) */}
      <g transform="translate(4 4)">
        <path d="M44 18 a26 26 0 1 0 26 26 h-16 v6 h10 a16 16 0 1 1 -16 -16 a16 16 0 0 1 12 5"
              stroke={accent} strokeOpacity="0.4" strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
      </g>

      {/* Layer 3: Main filled G (front) */}
      <path d="M44 18 a26 26 0 1 0 26 26 h-16 v6 h10 a16 16 0 1 1 -16 -16 a16 16 0 0 1 12 5"
            stroke={`url(#mainG-${id})`} strokeWidth="6" fill="none" strokeLinejoin="round" strokeLinecap="round"/>

      {/* Layer 4: Three building-block dots aligned bottom — folder/instructions/tools */}
      <rect x="20" y="78" width="6" height="6" rx="1.5" fill={accent}/>
      <rect x="32" y="78" width="6" height="6" rx="1.5" fill={accent} fillOpacity="0.7"/>
      <rect x="44" y="78" width="6" height="6" rx="1.5" fill={accent} fillOpacity="0.4"/>

      {/* Layer 5: Cursor blink in top-right */}
      <rect x="74" y="14" width="3" height="10" fill={accent}/>
    </svg>
  );
};

/* === CONCEPT F — "Origami" =====================================
   A folded paper construct — a folder that's been creased into a
   geometric, dimensional shape. Layered triangles + a single hot
   accent crease. Very unusual, premium, almost architectural.
*/
const Logo_Origami = ({ size = 96, accent = "#ff5a1f", deep = "#b8340a", ink = "#0a0a0b" }) => {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      <defs>
        <linearGradient id={`origLight-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#fff" stopOpacity="0.65"/>
        </linearGradient>
        <linearGradient id={`origMid-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent}/>
          <stop offset="100%" stopColor={deep}/>
        </linearGradient>
        <linearGradient id={`origDark-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={deep}/>
          <stop offset="100%" stopColor={ink}/>
        </linearGradient>
      </defs>

      {/* Background round-square */}
      <rect x="4" y="4" width="88" height="88" rx="20" fill={ink}/>

      {/* Origami construct — folded folder shape with 3 visible facets */}
      {/* Back panel (lightest) */}
      <path d="M20 30 L48 14 L76 30 L76 70 L48 86 L20 70 Z"
            fill={`url(#origLight-${id})`} fillOpacity="0.08"
            stroke="#fff" strokeOpacity="0.15" strokeWidth="1"/>

      {/* Mid panel (orange gradient) */}
      <path d="M28 36 L48 24 L68 36 L68 68 L48 80 L28 68 Z"
            fill={`url(#origMid-${id})`}/>

      {/* Front panel (darkest) — creates depth */}
      <path d="M48 24 L68 36 L48 48 L28 36 Z" fill="#fff" fillOpacity="0.18"/>
      <path d="M48 80 L68 68 L48 56 L28 68 Z" fill={ink} fillOpacity="0.4"/>
      <path d="M48 48 L48 56" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.5"/>

      {/* Crease lines on mid panel for "folder tab" suggestion */}
      <path d="M36 32 L48 26 L60 32" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M36 32 L36 40 L60 40 L60 32" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Hot accent — single crease that pops */}
      <path d="M28 36 L48 48 L68 36" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.6" fill="none"/>
      <circle cx="48" cy="48" r="3.5" fill="#fff"/>
      <circle cx="48" cy="48" r="6" stroke="#fff" strokeWidth="1" strokeOpacity="0.4" fill="none"/>
    </svg>
  );
};

window.Logo_Aurora = Logo_Aurora;
window.Logo_Strata = Logo_Strata;
window.Logo_Cypher = Logo_Cypher;
window.Logo_Bloom = Logo_Bloom;
window.Logo_Mainframe = Logo_Mainframe;
window.Logo_Origami = Logo_Origami;
