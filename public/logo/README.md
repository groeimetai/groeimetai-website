# GroeimetAI logo pack

Open brackets around one folder. The brackets say the box is open; the folder is
what is inside. One accent colour, used once.

## Files

| file | use |
|---|---|
| mark-primary-dark.svg | the mark on dark surfaces (default) |
| mark-primary-light.svg | the mark on paper surfaces |
| mark-mono-white.svg / mark-mono-ink.svg | one-colour, where the accent cannot print |
| mark-accent.svg | one-hue orange, for stamps and merch |
| mark-knockout.svg | on an accent-orange surface, everything in #1a0d05 |
| mark-compact-dark.svg / -light.svg | below 24px — heavier brackets, larger folder + tab |
| icon-tile-black.svg / icon-tile-accent.svg | app icon, avatar, social profile |
| favicon.svg | browser tab |
| lockup-horizontal-*.svg | default lockup: mark + wordmark |
| lockup-stacked-*.svg | narrow spaces, merch |
| wordmark-*.svg | wordmark alone, where the mark already appears |

## Geometry

32-unit grid. Bracket stroke 3, arm 6.5, outer box x4-28 / y5-27. Folder body
12 x 8 at (10, 13.2), radius 1.3; tab 4.6 x 2.6 at (10, 10.6). The folder is
65% of the bracket opening — do not rescale one without the other.

## Rules

- Clear space on all sides: one bracket arm (6.5 units, ~30% of the mark height).
- Compact keeps the tab; it is redrawn at 13 x 8 with a 6 x 3.4 tab and heavier
  radii (outer 1.6, tab 1.1, fillet 0.8) so the folder still reads at 14px.
- Minimum size: 24px for the primary mark (below that, switch to compact),
  14px for compact, 96px wide for the horizontal lockup.
- Colours come from the design tokens: --fg / --ink for the brackets,
  --accent (#ff7014) for the folder. On an accent tile the mark knocks out
  in #1a0d05.
- Never close the brackets, rotate the mark, stretch it, outline it, or recolour
  the folder to anything outside the accent family.

## Wordmark

Set in Geist Medium, letter-spacing -0.02em, "AI" in the accent. The lockup SVGs
use live text — outline it in your design tool before sending anything to print.
