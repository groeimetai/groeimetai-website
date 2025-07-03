# Firebase Storage Rules Configuration

To enable document uploads and downloads, you need to configure Firebase Storage rules in the Firebase Console:

## Steps to Configure

1. Go to Firebase Console > Storage > Rules
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow users to read/write their own documents
    match /documents/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null &&
                      request.auth.uid == userId &&
                      request.resource.size < 50 * 1024 * 1024; // 50MB max file size
      allow delete: if request.auth != null && request.auth.uid == userId;
    }

    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Firestore Rules

Also ensure your Firestore rules allow document collection access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Existing rules...

    // Documents collection
    match /documents/{documentId} {
      allow read: if request.auth != null &&
                     request.auth.uid == resource.data.uploadedBy.uid;
      allow create: if request.auth != null &&
                       request.auth.uid == request.resource.data.uploadedBy.uid;
      allow update: if request.auth != null &&
                       request.auth.uid == resource.data.uploadedBy.uid;
      allow delete: if request.auth != null &&
                       request.auth.uid == resource.data.uploadedBy.uid;
    }
  }
}
```

## Important Notes

- The storage rules restrict users to only access their own documents
- Maximum file size is set to 50MB (adjust as needed)
- Files are organized by user ID in the storage bucket
- Make sure to deploy these rules before testing the documents feature
