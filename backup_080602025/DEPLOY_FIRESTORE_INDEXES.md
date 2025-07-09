# Deploy Firestore Indexes

## What Changed

- Added error handling for documents and meetings collections in DashboardWidgets.tsx
- Added missing Firestore indexes for documents and meetings collections

## Deploy Steps

1. **Deploy the new Firestore indexes:**

```bash
firebase deploy --only firestore:indexes
```

2. **The code changes are already pushed to GitHub and will deploy automatically**

## What This Fixes

- Removes "Missing or insufficient permissions" console errors
- Handles empty collections gracefully
- Ensures queries work correctly with proper indexes

## Notes

- The documents and meetings widgets will show empty states if no data exists
- No data is lost - this just improves error handling
- The indexes may take a few minutes to build after deployment
