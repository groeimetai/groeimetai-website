# Language Detection and Routing System

## Overview

The GroeimetAI website implements a sophisticated language detection and routing system that automatically directs users to the appropriate language version based on multiple factors.

## Detection Priority Order

The system uses the following priority order for language detection:

1. **User Preference (Cookie)**: If a user has previously selected a language, it's stored in the `NEXT_LOCALE` cookie and takes highest priority.

2. **Browser Language**: The system checks the `Accept-Language` header sent by the browser to determine user's preferred languages.

3. **Geographic Location**: As a fallback, the system uses the visitor's geographic location:
   - Netherlands (NL) → Dutch
   - Belgium (BE) → Dutch
   - All other countries → English

## Implementation Details

### Middleware Configuration

The language detection logic is implemented in `src/middleware-intl.ts`:

```typescript
// Detection priority:
1. Check NEXT_LOCALE cookie
2. Parse Accept-Language header
3. Check geo-location headers (Vercel, Cloudflare)
4. Default to configured defaultLocale
```

### Cookie Management

- Cookie name: `NEXT_LOCALE`
- Expiry: 1 year
- Updated when:
  - User first visits the site
  - User manually switches language via the language switcher
  - User navigates to a different locale URL

### Language Switcher

The language switcher component (`LanguageSwitcher.tsx`):

- Updates the cookie preference
- Redirects to the new locale path
- Shows a loading state during transition

## SEO Implementation

### Hreflang Tags

The system automatically generates hreflang tags for all pages:

```html
<link rel="alternate" hreflang="en" href="https://groeimetai.io/en/about" />
<link rel="alternate" hreflang="nl" href="https://groeimetai.io/nl/about" />
```

### Metadata Generation

Use the `generateMetadataWithAlternates` utility for pages:

```typescript
import { generateMetadataWithAlternates } from '@/utils/metadata';

export async function generateMetadata({ params }) {
  return generateMetadataWithAlternates({
    locale: params.locale,
    pathname: `/services`,
    title: 'Our Services',
    description: 'AI consultancy services',
  });
}
```

## Testing the System

### Manual Testing

1. **Cookie-based preference**:
   - Visit the site and switch language
   - Close and reopen browser
   - Verify it remembers your preference

2. **Browser language**:
   - Change browser language settings
   - Clear cookies
   - Visit site in incognito mode

3. **Geographic location**:
   - Use VPN to test from different countries
   - Verify NL/BE visitors get Dutch
   - Verify other countries get English

### Automated Tests

Run the test suite:

```bash
npm test src/__tests__/middleware-intl.test.ts
```

## Troubleshooting

### Common Issues

1. **Language not persisting**: Check if cookies are enabled
2. **Wrong language detected**: Clear cookies and check browser language settings
3. **Redirect loops**: Ensure locale prefix is correctly handled in middleware

### Debug Mode

Enable debug logging by setting:

```typescript
const DEBUG = process.env.NODE_ENV === 'development';
```

This will log:

- Detected locale and reason
- Cookie operations
- Redirect decisions
