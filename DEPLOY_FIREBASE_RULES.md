# Deploy Firebase Security Rules

The Firebase security rules have been updated to fix the permission errors when accessing projects. 

## Changes Made

- Updated `firestore.rules` to allow users to read their own projects
- Added support for the `userId` field used by projects created from the QuoteRequestForm
- Allow authenticated users to create and update their own projects

## How to Deploy

To deploy these updated rules to Firebase, run:

```bash
firebase deploy --only firestore:rules
```

Or if you haven't set a default project:

```bash
firebase deploy --only firestore:rules --project groeimetai-458417
```

## Alternative: Deploy via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/groeimetai-458417/firestore/rules)
2. Copy the contents of `firestore.rules`
3. Paste into the rules editor
4. Click "Publish"

## Note

The rules have been committed to the repository but need to be deployed manually to take effect.