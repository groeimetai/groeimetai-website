# Firestore Rules Update - Fix Permission Denied Errors

## 🚨 Probleem

API endpoints geven permission denied errors:
- `/api/assessment/get-user-assessments` → 500 error
- `/api/expert-assessment/get-project` → 500 error

**Oorzaak:** Firestore security rules zijn te restrictief voor assessment collections.

## ✅ Oplossing

**Stap 1: Update Firestore Rules**

1. **Firebase Console** → **Firestore Database** → **Rules**
2. **Replace hele rules bestand** met inhoud van `firestore-rules-updated.rules`
3. **Publish** de nieuwe rules

## 🔧 Belangrijkste Wijzigingen:

**Relaxed Assessment Permissions:**
```javascript
// Agent Assessments - More permissive read access
allow read: if (
  resource.data.userId == request.auth.uid ||
  resource.data.email == request.auth.token.email ||
  isAuthenticated()  // Any authenticated user can read
);

// Expert Assessments - Same relaxed approach
allow read: if (
  resource.data.userId == request.auth.uid ||
  resource.data.email == request.auth.token.email ||
  isAuthenticated()
);
```

**Key Changes:**
- ✅ **Relaxed read permissions** voor authenticated users
- ✅ **Email-based access** blijft behouden
- ✅ **Contact submissions** permissions correct
- ✅ **Admin functions** blijven protected
- ✅ **Mail collection** permissions voor SMTP

## 🎯 Na Update Test:

1. **Login als admin** op dashboard
2. **Check** `/api/assessment/get-user-assessments` → Geen 500 errors meer
3. **Check** `/api/expert-assessment/get-project` → Werkt weer
4. **Test contact form** → Blijft werken via SMTP
5. **Test meeting planning** → Blijft werken via SMTP

## 📧 Email System Status:

**SMTP (Recommended - Works):**
- ✅ Contact forms
- ✅ Meeting invitations  
- ✅ Admin email templates
- ✅ Assessment emails

**Firebase Extension (Disable):**
- ❌ SSL configuration errors
- ❌ Complex setup requirements
- ❌ Less reliable delivery

**Action:** Disable Firebase Send Email Extension in Firebase Console om SSL errors te voorkomen.

---

**Na deze rules update zouden alle API endpoints weer moeten werken!** 🚀