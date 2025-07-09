# Deploy Firebase Rules

To fix the permissions errors, you need to deploy the updated Firebase rules:

## 1. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## 2. Deploy Storage Rules
```bash
firebase deploy --only storage:rules
```

## 3. Or deploy both at once
```bash
firebase deploy --only firestore:rules,storage:rules
```

## What was fixed:

### Storage Rules:
- Added `/uploads/{userId}/**` path for chat attachments
- Added `/documents/{userId}/**` path for document storage
- Allow authenticated users to read uploaded files (for sharing)
- 10MB file size limit for uploads

### Firestore Rules:
- Allow any authenticated user to create notifications
- Allow users to read admin profiles (for finding admins to notify)

### Code fixes:
- Fixed `startBefore` import issue (changed to `startAfter`)
- Fixed pagination logic for loading older messages