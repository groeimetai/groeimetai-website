# Google Calendar + Meet Integration Setup

## 🎯 Overview

Deze gids helpt je om echte Google Calendar en Google Meet integratie in te stellen voor je GroeimetAI admin dashboard.

## 📋 Wat Je Krijgt

✅ **Echte Google Meet Links** - Automatisch gegenereerd per meeting  
✅ **Calendar Events** - Verschijnen automatisch in Google Calendar  
✅ **Automatic Invites** - Attendees krijgen calendar uitnodigingen  
✅ **Meeting Management** - View, edit, delete via admin dashboard  
✅ **Agenda Integration** - Agenda wordt toegevoegd aan calendar event  

## 🔧 Setup Stappen

### 1. Google Cloud Console Configuration

**Ga naar Google Cloud Console:**
1. Open [Google Cloud Console](https://console.cloud.google.com)
2. Selecteer je Firebase project: `groeimetai-458417`

**Enable Google Calendar API:**
1. **APIs & Services** → **Library**
2. Zoek "Google Calendar API"
3. Klik **Enable**

**Service Account Permissions:**
1. **IAM & Admin** → **Service Accounts**
2. Find je Firebase service account: `firebase-adminsdk-fbsvc@groeimetai-458417.iam.gserviceaccount.com`
3. **Keys** → Download service account JSON (voor client_id en private_key_id)

**Note:** Service accounts krijgen automatisch calendar toegang via de API scopes. Geen extra IAM roles nodig!

### 2. Environment Variables

Je hebt al de meeste keys van Firebase. Voeg deze toe:

```env
# Google Calendar API (uses existing Firebase service account)
GOOGLE_PRIVATE_KEY_ID=your-private-key-id  # Get from Firebase service account JSON
GOOGLE_CLIENT_ID=your-client-id            # Get from Firebase service account JSON

# Already configured:
FIREBASE_PROJECT_ID=groeimetai-458417
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@groeimetai-458417.iam.gserviceaccount.com
```

**Hoe GOOGLE_CLIENT_ID vinden:**
1. Google Cloud Console → **IAM & Admin** → **Service Accounts**
2. Klik op je Firebase service account
3. **Keys** tab → **Add Key** → **Create New Key** → JSON
4. Download JSON file, vind `client_id` en `private_key_id`

### 3. Calendar Setup Opties

**Optie A: Service Account Calendar (Makkelijkst)**
- Service account heeft eigen calendar
- Meetings verschijnen in service account calendar
- Attendees krijgen uitnodigingen
- **Voordeel**: Werkt direct, geen extra setup

**Optie B: Personal Calendar Delegation (Google Workspace)**
- Alleen als je Google Workspace hebt
- **Google Admin Console** → **Security** → **API Controls** → **Domain-wide Delegation**
- Add service account client ID met scope: `https://www.googleapis.com/auth/calendar`
- **Voordeel**: Meetings in jouw persoonlijke calendar

**Optie C: Shared Calendar**
- Maak een gedeelde GroeimetAI calendar
- Share met service account email
- **Google Calendar** → **Settings** → **Share with specific people**
- Add: `firebase-adminsdk-fbsvc@groeimetai-458417.iam.gserviceaccount.com`

### 4. Testing

**Test de integratie:**
1. Ga naar `/dashboard/admin/contacts`
2. Plan een meeting met Google Meet
3. Check `/dashboard/admin/calendar` voor sync
4. Verify in je Google Calendar dat event is aangemaakt

## 📧 Email Integration

**Automatische features:**
- **ICS bijlage** voor elk email (backup import)
- **Google Calendar uitnodiging** (primary method)
- **Real Meet links** in email content
- **Agenda details** in calendar event

## 🎯 Admin Dashboard Features

### Contact Management (`/dashboard/admin/contacts`)
- **Enhanced Meeting Scheduler** met agenda builder
- **Google Meet Integration** met echte links
- **Template System** voor verschillende gesprektypes
- **Automatic Calendar Sync**

### Calendar Management (`/dashboard/admin/calendar`)
- **View All Meetings** van Google Calendar
- **Today's Schedule** met quick join links
- **Attendee Response Status** tracking
- **Calendar Sync** en management tools

## 🔧 Troubleshooting

### Google Calendar API Errors

**Authentication Failed:**
- Check service account permissions
- Verify API is enabled
- Check environment variables

**Meet Link Not Generated:**
- Ensure Google Meet is enabled voor domain
- Check conferenceDataVersion=1 parameter
- Verify Calendar API scopes

**Calendar Events Not Visible:**
- Check calendar sharing settings
- Verify service account permissions
- Test with personal calendar delegation

### Fallback Behavior

**Als Google Calendar API niet beschikbaar is:**
- ✅ **Placeholder Meet links** - `https://meet.google.com/new`
- ✅ **ICS calendar bijlage** - Voor handmatige import
- ✅ **Professional email** - Volledig styled invitation
- ✅ **Firestore storage** - Meeting data bewaard
- ✅ **Manual Google Meet** - Client kan zelf meeting aanmaken

**Quick Setup Zonder API:**
1. Laat environment variables leeg
2. System gebruikt automatisch fallback mode
3. Emails worden nog steeds perfect verzonden
4. ICS bijlage voor calendar import
5. Manual Google Meet links in email

## 🚀 Pro Tips

1. **Test eerst** met service account calendar
2. **Share service account calendar** met je team
3. **Use domain delegation** for personal calendar integration
4. **Monitor API quotas** in Google Cloud Console
5. **Set up calendar notifications** in Google Calendar

## 📞 Support

Als je hulp nodig hebt met de setup:
- Check Google Cloud Console logs
- Test API calls in `/dashboard/admin/calendar`
- Verify Firebase service account permissions

---

**Na setup**: Alle meetings via admin dashboard krijgen automatisch echte Google Meet links en calendar events! 🎯