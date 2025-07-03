# GroeimetAI Test Checklist

## 🌐 Internationalization (i18n)
- [ ] **Language Toggle**
  - [ ] Toggle switches UI from Dutch to English
  - [ ] Toggle switches UI from English to Dutch
  - [ ] Language preference persists on page refresh
  - [ ] URLs update correctly (/nl/... ↔ /en/...)
  
- [ ] **Automatic Language Detection**
  - [ ] Dutch users get Dutch by default
  - [ ] English/other users get English by default
  - [ ] Manual selection overrides automatic detection

## 🔐 Authentication Flow
- [ ] **Registration**
  - [ ] Can create new account with email/password
  - [ ] Email validation works
  - [ ] Password requirements are enforced
  - [ ] Success message appears after registration
  
- [ ] **Login**
  - [ ] Can login with valid credentials
  - [ ] Error messages for invalid credentials
  - [ ] "Forgot Password" link works
  - [ ] Redirects to dashboard after successful login
  
- [ ] **Password Reset**
  - [ ] Can request password reset email
  - [ ] Reset email is received
  - [ ] Can reset password with link from email
  
- [ ] **Two-Factor Authentication (2FA)**
  - [ ] Can enable 2FA in settings
  - [ ] QR code displays correctly
  - [ ] Can verify with authenticator app
  - [ ] Login requires 2FA code when enabled

## 📊 Dashboard Features
- [ ] **Dashboard Overview**
  - [ ] Statistics display correctly
  - [ ] Recent activity shows
  - [ ] Quick actions work
  
- [ ] **Projects**
  - [ ] Can view project list
  - [ ] Can create new project
  - [ ] Can edit project details
  - [ ] Can delete project
  
- [ ] **Messages**
  - [ ] Can view message list
  - [ ] Can send new message
  - [ ] Real-time updates work
  - [ ] Notifications appear
  
- [ ] **Documents**
  - [ ] Can upload documents
  - [ ] Can download documents
  - [ ] Can delete documents
  - [ ] File preview works
  
- [ ] **Settings**
  - [ ] Can update profile information
  - [ ] Can change password
  - [ ] Can manage 2FA
  - [ ] Can delete account

## 🤖 AI Features
- [ ] **Chatbot Widget**
  - [ ] Chatbot appears on homepage
  - [ ] Can interact with chatbot
  - [ ] Responses are relevant
  - [ ] Lead qualification works
  
- [ ] **Quote Request Form**
  - [ ] Form validation works
  - [ ] Multi-step navigation works
  - [ ] Data persists between steps
  - [ ] Submission creates request

## 📱 Responsive Design
- [ ] **Mobile (< 768px)**
  - [ ] Navigation menu works
  - [ ] All pages display correctly
  - [ ] Forms are usable
  - [ ] Animations perform well
  
- [ ] **Tablet (768px - 1024px)**
  - [ ] Layout adjusts properly
  - [ ] All features accessible
  
- [ ] **Desktop (> 1024px)**
  - [ ] Full layout displays
  - [ ] Hover effects work
  - [ ] Animations smooth

## 🎨 Visual & UX
- [ ] **Animations**
  - [ ] Particle background loads
  - [ ] Page transitions smooth
  - [ ] Loading states show
  - [ ] No visual glitches
  
- [ ] **Dark Mode**
  - [ ] Theme persists
  - [ ] All components styled correctly
  - [ ] Text remains readable
  
- [ ] **Accessibility**
  - [ ] Keyboard navigation works
  - [ ] Screen reader compatible
  - [ ] Focus states visible
  - [ ] Alt text present

## 🚀 Performance
- [ ] **Page Load Times**
  - [ ] Homepage < 3s
  - [ ] Dashboard < 3s
  - [ ] No blocking resources
  
- [ ] **SEO**
  - [ ] Meta tags present
  - [ ] Sitemap accessible
  - [ ] Robots.txt configured
  - [ ] Structured data valid

## 🔒 Security
- [ ] **Authentication**
  - [ ] Protected routes redirect to login
  - [ ] JWT tokens expire properly
  - [ ] Logout clears session
  
- [ ] **Data Protection**
  - [ ] HTTPS enforced
  - [ ] Input sanitization works
  - [ ] No sensitive data in URLs
  - [ ] CORS configured correctly

## 🐛 Error Handling
- [ ] **404 Pages**
  - [ ] Custom 404 page shows
  - [ ] Navigation back works
  
- [ ] **Form Errors**
  - [ ] Validation messages clear
  - [ ] Network errors handled
  - [ ] Retry mechanisms work
  
- [ ] **API Errors**
  - [ ] Error messages user-friendly
  - [ ] Fallback UI shows
  - [ ] No crashes on errors

## 📧 Email Functionality
- [ ] **Transactional Emails**
  - [ ] Welcome email sent
  - [ ] Password reset email works
  - [ ] Quote request notifications sent
  
## 🔗 Integration Tests
- [ ] **Firebase**
  - [ ] Firestore read/write works
  - [ ] Storage upload/download works
  - [ ] Security rules enforced
  
- [ ] **External APIs**
  - [ ] Gemini API integration works
  - [ ] Payment processing (if applicable)
  - [ ] Analytics tracking

## 📋 Final Checklist
- [ ] All links work (no broken links)
- [ ] All images load properly
- [ ] Console free of errors
- [ ] Cookies consent works
- [ ] Privacy policy accessible
- [ ] Terms of service accessible
- [ ] Contact form works

## Test Environments
- **Local**: http://localhost:3000
- **Production**: https://groeimetai-app-[PROJECT_ID].europe-west1.run.app

## Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)