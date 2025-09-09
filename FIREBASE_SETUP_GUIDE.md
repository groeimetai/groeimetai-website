# Firebase Setup Guide - GroeimetAI Website

## 🔥 Firebase Configuratie Stappen

### 1. Firebase Project Setup

**Ga naar Firebase Console:**
- https://console.firebase.google.com
- Maak een nieuw project of gebruik bestaande
- Project naam: `groeimetai-prod` (of jouw voorkeur)

### 2. Web App Registratie

**In Firebase Console:**
1. Klik "Add app" → Web (</>) icon
2. App naam: "GroeimetAI Website"
3. **Firebase Hosting aanzetten** (optioneel)
4. Krijg configuratie object

### 3. Kopieer Configuratie naar .env.local

**Firebase geeft je dit:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "groeimetai-prod.firebaseapp.com",
  projectId: "groeimetai-prod",
  storageBucket: "groeimetai-prod.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

**Zet dit in .env.local:**
```bash
# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=groeimetai-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=groeimetai-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=groeimetai-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. Firebase Services Inschakelen

**In Firebase Console:**

**Authentication:**
1. Ga naar "Authentication" → "Get started"
2. Sign-in methods → Email/Password **aanzetten**
3. Sign-in methods → Google **aanzetten** (optioneel)

**Firestore Database:**
1. Ga naar "Firestore Database" → "Create database"
2. Kies "Start in test mode" (voor development)
3. Locatie: europe-west (Amsterdam)

**Storage:**
1. Ga naar "Storage" → "Get started"  
2. Start in test mode
3. Locatie: europe-west

### 5. Test de Configuratie

**Restart development server:**
```bash
npm run dev
```

**Test in browser console:**
```javascript
// Open browser console op http://localhost:3001
console.log(window.firebase) // Should show Firebase object
```

### 6. Firestore Security Rules (Development)

**In Firebase Console → Firestore → Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Development - Allow read/write for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow public read for some collections if needed
    match /public/{document=**} {
      allow read: if true;
    }
  }
}
```

### 7. Storage Security Rules (Development)

**In Firebase Console → Storage → Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚨 Troubleshooting

### "API key not valid" Error:

**Check 1: Environment Variables**
```bash
# In terminal, check if env vars are loaded:
echo $NEXT_PUBLIC_FIREBASE_API_KEY
```

**Check 2: Restart Development Server**
```bash
# Kill current server
# Restart with:
npm run dev
```

**Check 3: Browser Console**
```javascript
// Check if config is loaded:
console.log({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
});
```

**Check 4: Firebase Project Settings**
- Firebase Console → Project Settings → General
- Verify Web app configuration matches .env.local

### API Key Restrictions:

**In Google Cloud Console:**
1. Go to APIs & Services → Credentials
2. Find your Firebase API key  
3. **Remove HTTP referrers restriction** voor development
4. Add `localhost:3001` if restrictions needed

### Common Issues:

**1. Wrong Project ID**
- Check Firebase Console URL: `https://console.firebase.google.com/project/[PROJECT_ID]`
- Must match `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

**2. Services Not Enabled**
- Authentication, Firestore, Storage moeten allemaal "enabled" zijn

**3. Browser Cache**
- Clear browser cache/localStorage
- Hard refresh (Cmd+Shift+R)

## 🧪 Test Checklist

### ✅ Authentication Test:
1. Ga naar `/register`
2. Maak account aan
3. Check Firebase Console → Authentication → Users

### ✅ Firestore Test:
1. Submit assessment form
2. Check Firebase Console → Firestore → Data

### ✅ Storage Test:
1. Upload file (als geïmplementeerd)
2. Check Firebase Console → Storage

## 📞 Als het nog niet werkt:

**Debug output toevoegen aan firebase.ts:**
```typescript
console.log('Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
});
```

**Check network tab:**
- Open Developer Tools → Network
- Try to register/login
- Look for failed Firebase requests
- Check error details

---

**🔥 Na deze setup zou alles moeten werken voor lokale development!**