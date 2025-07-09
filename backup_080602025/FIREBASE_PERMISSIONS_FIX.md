# Firebase Permissions Fix

## Issues Fixed

1. **User Document Access**: Changed from query-based access to direct document reference
   - Before: `query(collection(db, 'users'), where('uid', '==', user.uid))`
   - After: `doc(db, 'users', user.uid)`

2. **Documents Collection Field Mismatch**: Fixed query to match Firestore rules
   - Before: `where('userId', '==', user.uid)`
   - After: `where('uploadedBy.uid', '==', user.uid)`

## If Errors Persist

### 1. Check Compound Indexes

If you see errors about "missing index", click the link in the console to create the required index in Firebase.

### 2. Verify User Document Structure

Ensure user documents are created with the user's UID as the document ID:

```javascript
// Correct
await setDoc(doc(db, 'users', user.uid), userData);

// Incorrect
await addDoc(collection(db, 'users'), { uid: user.uid, ...userData });
```

### 3. Check User Role

Verify the user has a role set in their document:

```javascript
{
  uid: "user123",
  role: "user", // or "admin"
  // other fields...
}
```

### 4. Create Missing Compound Indexes

The dashboard uses complex queries that may require indexes:

- **Meetings**: `participantIds`, `status`, `startTime` (compound)
- **Documents**: `uploadedBy.uid`, `createdAt` (compound)
- **Quotes**: `userId`, `createdAt` (compound)

### 5. Debug Specific Collections

If a specific widget fails, check the browser console for the exact collection causing issues:

- Projects: Requires `clientId` field matching user.uid
- Documents: Requires `uploadedBy.uid` field matching user.uid
- Meetings: Requires user.uid in `participantIds` array

## Testing

1. Clear browser cache and reload
2. Check browser console for specific error messages
3. Verify Firestore rules are deployed: `firebase deploy --only firestore:rules`
