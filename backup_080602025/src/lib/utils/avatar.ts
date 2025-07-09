/**
 * Generate a deterministic avatar based on a user's display name
 * Creates a colorful gradient background with initials
 */
export function generateAvatarDataUri(displayName: string): string {
  // Get initials (max 2 characters)
  const initials = displayName
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Generate a deterministic hash from the display name
  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    const char = displayName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Define color palettes for gradients
  const colorPalettes = [
    ['#FF6B6B', '#FF8E53'], // Red-Orange
    ['#4ECDC4', '#44A3AA'], // Teal
    ['#667EEA', '#764BA2'], // Purple
    ['#F093FB', '#F5576C'], // Pink
    ['#FA709A', '#FEE140'], // Pink-Yellow
    ['#30CFD0', '#330867'], // Cyan-Purple
    ['#A8EDEA', '#FED6E3'], // Pastel Cyan-Pink
    ['#FD6585', '#0D25B9'], // Pink-Blue
    ['#FC466B', '#3F5EFB'], // Pink-Blue 2
    ['#FDBB2D', '#22C1C3'], // Yellow-Cyan
    ['#38F9D7', '#43E97B'], // Green
    ['#FA8BFF', '#2BD2FF'], // Purple-Blue
    ['#FFE53B', '#FF2525'], // Yellow-Red
    ['#21D4FD', '#B721FF'], // Blue-Purple
    ['#08AEEA', '#2AF598'], // Blue-Green
    ['#FFE259', '#FFA751'], // Yellow-Orange
    ['#F72585', '#7209B7'], // Pink-Purple
    ['#84FAB0', '#8FD3F4'], // Green-Blue
    ['#A9C9FF', '#FFBBEC'], // Blue-Pink
    ['#FC6C8F', '#FFB86C'], // Pink-Orange
  ];

  // Select a color palette based on the hash
  const paletteIndex = Math.abs(hash) % colorPalettes.length;
  const [color1, color2] = colorPalettes[paletteIndex];

  // Generate the SVG
  const svg = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#gradient)" />
      <text x="100" y="100" font-family="system-ui, -apple-system, sans-serif" font-size="80" font-weight="600" fill="white" text-anchor="middle" dy=".35em">${initials}</text>
    </svg>
  `;

  // Convert to base64 data URI
  const base64 = btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generate avatar URL or fallback to generated avatar
 */
export function getAvatarUrl(user: {
  displayName?: string;
  photoURL?: string | null;
  email: string;
}): string {
  if (user.photoURL) {
    return user.photoURL;
  }

  const displayName = user.displayName || user.email;
  return generateAvatarDataUri(displayName);
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
}
