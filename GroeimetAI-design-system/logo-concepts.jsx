/* ===== Logo concepts — 6 richtingen voor GroeimetAI =====
   Elk concept is een eigen mark + lockup. Donkere en lichte versie. */

/* === CONCEPT 1: Growth Branch ===
   Een organische lijn die opwaarts groeit en zich vertakt in 3 nodes
   = groei + de 3 building blocks (folder, instructions, tools).
   Reads as both a sprout AND a mini decision tree / agent graph. */
const Logo_Growth = ({ size = 64, color = "var(--accent)", bg = null }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {bg && <rect width="64" height="64" rx="12" fill={bg}/>}
    {/* Stem */}
    <path d="M32 54 V32" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    {/* Left branch */}
    <path d="M32 38 C 28 36, 22 34, 18 28" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* Right branch */}
    <path d="M32 36 C 36 34, 42 32, 46 26" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* Three nodes (the building blocks) */}
    <circle cx="18" cy="26" r="4" fill={color}/>
    <circle cx="32" cy="22" r="4" fill={color}/>
    <circle cx="46" cy="24" r="4" fill={color}/>
    {/* Top connection */}
    <path d="M32 28 V22" stroke={color} strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

/* === CONCEPT 2: Folder Sprout ===
   Een folder waar een groei-stengel uit komt
   = letterlijk "groei MET ai", waarbij de folder de agent-metafoor is. */
const Logo_FolderSprout = ({ size = 64, color = "var(--accent)", bg = null }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {bg && <rect width="64" height="64" rx="12" fill={bg}/>}
    {/* Folder tab */}
    <path d="M14 32 H26 L30 36 H50 V52 a2 2 0 0 1 -2 2 H16 a2 2 0 0 1 -2 -2 Z"
          stroke={color} strokeWidth="3" strokeLinejoin="round" fill="none"/>
    {/* Sprout stem */}
    <path d="M32 32 V14" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    {/* Sprout leaves */}
    <path d="M32 22 C 28 22, 24 20, 22 16 C 26 16, 30 18, 32 22 Z" fill={color}/>
    <path d="M32 18 C 36 18, 40 16, 42 12 C 38 12, 34 14, 32 18 Z" fill={color}/>
  </svg>
);

/* === CONCEPT 3: Ascending G ===
   Een geometrische 'G' die opbouwt uit horizontale lijnen die naar boven dichter worden
   = signal / staircase / progress, waarbij het laatste segment de G-sluiting maakt.
   Modern, technisch, leesbaar als monogram. */
const Logo_AscendingG = ({ size = 64, color = "var(--accent)", bg = null }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {bg && <rect width="64" height="64" rx="12" fill={bg}/>}
    {/* Bottom bar (longest) */}
    <rect x="12" y="46" width="40" height="4" rx="2" fill={color}/>
    {/* Middle bar */}
    <rect x="12" y="36" width="34" height="4" rx="2" fill={color}/>
    {/* Upper bar */}
    <rect x="12" y="26" width="26" height="4" rx="2" fill={color}/>
    {/* Top bar (shortest) */}
    <rect x="12" y="16" width="18" height="4" rx="2" fill={color}/>
    {/* Right vertical = G's "tongue" */}
    <rect x="48" y="36" width="4" height="14" rx="2" fill={color}/>
    {/* Inward stub */}
    <rect x="38" y="36" width="14" height="4" rx="2" fill={color}/>
  </svg>
);

/* === CONCEPT 4: Node Network (Agent Graph) ===
   Drie nodes met een verbindingslijn = letterlijk de agent-mental-model.
   Centrum = instructions (bigger), buiten = folders + tools. */
const Logo_NodeGraph = ({ size = 64, color = "var(--accent)", bg = null }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {bg && <rect width="64" height="64" rx="12" fill={bg}/>}
    {/* Connecting lines */}
    <path d="M16 22 L32 38 L48 22 M32 38 V52" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    {/* Three small "input" nodes */}
    <rect x="11" y="17" width="10" height="10" rx="2.5" fill={color}/>
    <rect x="43" y="17" width="10" height="10" rx="2.5" fill={color}/>
    {/* Center "agent" node — bigger, ringed */}
    <circle cx="32" cy="38" r="7" fill="none" stroke={color} strokeWidth="2.5"/>
    <circle cx="32" cy="38" r="3" fill={color}/>
    {/* Output node */}
    <rect x="27" y="49" width="10" height="10" rx="2.5" fill={color}/>
  </svg>
);

/* === CONCEPT 5: Bracket Plant ===
   Een opening curly brace { vermomd als een groeiend plantje
   = code (technisch, instructies) + organische groei.
   Heel afwijkend, eigen identiteit. */
const Logo_BracketPlant = ({ size = 64, color = "var(--accent)", bg = null }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {bg && <rect width="64" height="64" rx="12" fill={bg}/>}
    {/* Curly brace as stem */}
    <path d="M40 12 C 28 12, 28 28, 24 32 C 28 36, 28 52, 40 52"
          stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
    {/* Three growth dots on the curve */}
    <circle cx="30" cy="20" r="3" fill={color}/>
    <circle cx="24" cy="32" r="3.5" fill={color}/>
    <circle cx="30" cy="44" r="3" fill={color}/>
    {/* Top leaf accent */}
    <path d="M40 12 C 44 8, 50 8, 52 12" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
  </svg>
);

/* === CONCEPT 6: Pixel Sprout ===
   Een groeiende plant maar opgebouwd uit blokjes / pixels.
   Heel digitaal-organisch.  */
const Logo_PixelSprout = ({ size = 64, color = "var(--accent)", bg = null }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {bg && <rect width="64" height="64" rx="12" fill={bg}/>}
    {/* Stem (vertical pixel column) */}
    <rect x="29" y="30" width="6" height="22" fill={color}/>
    {/* Right leaf — staircase going up-right */}
    <rect x="35" y="24" width="6" height="6" fill={color}/>
    <rect x="41" y="18" width="6" height="6" fill={color}/>
    <rect x="47" y="12" width="6" height="6" fill={color}/>
    {/* Left leaf — staircase going up-left */}
    <rect x="23" y="20" width="6" height="6" fill={color}/>
    <rect x="17" y="14" width="6" height="6" fill={color}/>
    {/* Base */}
    <rect x="20" y="52" width="24" height="4" fill={color} opacity="0.4"/>
  </svg>
);

/* === Wordmarks (with mark) === */
const Lockup = ({ Mark, size = 48, color, bg, textColor = "currentColor" }) => (
  <div style={{display: "inline-flex", alignItems: "center", gap: 14}}>
    <Mark size={size} color={color} accent={color} bg={bg}/>
    <span style={{
      fontFamily: "var(--font-display)",
      fontSize: size * 0.46,
      fontWeight: 600,
      letterSpacing: "-0.025em",
      color: textColor,
    }}>
      Groeimet<span style={{color: "var(--accent)"}}>AI</span>
    </span>
  </div>
);

window.Logo_Growth = Logo_Growth;
window.Logo_FolderSprout = Logo_FolderSprout;
window.Logo_AscendingG = Logo_AscendingG;
window.Logo_NodeGraph = Logo_NodeGraph;
window.Logo_BracketPlant = Logo_BracketPlant;
window.Logo_PixelSprout = Logo_PixelSprout;
window.Lockup = Lockup;
