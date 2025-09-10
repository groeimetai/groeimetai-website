# Firestore Security Rules Update

Voeg deze rules toe aan je Firestore Security Rules in Firebase Console:

## Contact Submissions Rules

```javascript
// Add this to your existing firestore.rules file
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Contact submissions - allow public write with rate limiting
    match /contact_submissions/{document} {
      // Allow anyone to create contact submissions (rate limited)
      allow create: if isValidContactSubmission(resource.data) 
                    && !isRateLimited();
      
      // Only admin can read/update/delete
      allow read, update, delete: if isAdmin();
    }
    
    // Mail collection - allow public write for email system
    match /mail/{document} {
      // Allow system to create emails
      allow create: if isValidEmailData(resource.data);
      
      // Only admin or system can read/update
      allow read, update: if isAdmin();
      
      // No delete allowed
      allow delete: if false;
    }
    
    // Helper functions
    function isValidContactSubmission(data) {
      return data.keys().hasAll(['name', 'email', 'company', 'submittedAt', 'status']) &&
             data.name is string && data.name.size() > 0 && data.name.size() <= 100 &&
             data.email is string && data.email.matches('.*@.*\\..*') &&
             data.company is string && data.company.size() > 0 && data.company.size() <= 200 &&
             data.status == 'new' &&
             data.submittedAt is timestamp &&
             data.source == 'website_contact_form';
    }
    
    function isValidEmailData(data) {
      return data.keys().hasAll(['to', 'message']) &&
             data.to is string && data.to.matches('.*@.*\\..*') &&
             data.message is map &&
             data.message.keys().hasAll(['subject', 'html']);
    }
    
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.admin == true;
    }
    
    function isRateLimited() {
      // Simple rate limiting based on timestamp
      // In production, use more sophisticated rate limiting
      return false; // For now, disable rate limiting
    }
    
    // Existing rules for other collections...
    // (keep your existing authentication, users, projects rules etc.)
  }
}
```

## Stappen om toe te passen:

1. **Firebase Console** → **Firestore Database** → **Rules**
2. Voeg bovenstaande rules toe aan je bestaande rules
3. **Publish** de nieuwe rules
4. Test contact form opnieuw

## Rate Limiting Opties:

Voor productie kun je meer geavanceerde rate limiting toevoegen:

```javascript
function isRateLimited() {
  // Example: Allow max 5 submissions per hour from same IP
  // This requires additional tracking collection
  return exists(/databases/$(database)/documents/rate_limits/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/rate_limits/$(request.auth.uid)).data.count > 5;
}
```

## Security Best Practices:

- ✅ Alleen nieuwe submissions met status 'new' 
- ✅ Email validatie met regex
- ✅ String length limits
- ✅ Required fields validation
- ✅ Admin-only read access
- ✅ Source validation (must be 'website_contact_form')