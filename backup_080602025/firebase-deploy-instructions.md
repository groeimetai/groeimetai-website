# Firebase Deployment Instructions

To fix the permission errors, you need to deploy the updated Firebase rules and indexes.

## Quick Deploy (All at once)

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## IMPORTANT: Deploy the rules immediately!

The chat permission errors will be fixed once you deploy the updated rules:

```bash
firebase deploy --only firestore:rules
```

## Or deploy separately:

### 1. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 2. Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

## Important Notes

- The indexes may take a few minutes to build after deployment
- You can check the status in Firebase Console > Firestore > Indexes
- The permission errors should resolve once the rules are deployed

## What was fixed:

1. **Query Simplification**: Changed the query to avoid needing a composite index for userId + status + orderBy
2. **Email Fallback**: Added support for quotes created by email (guest users who later logged in)
3. **Error Handling**: Added graceful error handling for missing timelines
4. **Composite Index**: Added the required composite index to firestore.indexes.json for future use

The app should work immediately after deploying the rules, but the composite indexes will improve query performance once built.
