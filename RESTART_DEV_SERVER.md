# Restart Development Server Required

## What Changed
- Added `lh3.googleusercontent.com` to allowed image domains in next.config.mjs
- This fixes the Google profile picture loading error on admin/users page

## Action Required

**You need to restart your development server for this change to take effect:**

1. Stop the current server (Ctrl+C)
2. Start it again:
```bash
npm run dev
```

## Why This is Needed
Next.js configuration changes require a server restart to reload the configuration file.

After restarting, Google profile pictures will load correctly on the admin/users page.