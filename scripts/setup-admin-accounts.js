const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env' });

// Define admin emails directly here to avoid module issues
const ADMIN_EMAILS = ['info@groeimetai.io', 'niels@groeimetai.io', 'admin@groeimetai.io'];

// Initialize Firebase Admin SDK
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore(app);
const auth = getAuth(app);

async function setupAdminAccounts() {
  console.log('Setting up admin accounts...');

  for (const email of ADMIN_EMAILS) {
    try {
      // Try to get user by email
      let user;
      try {
        user = await auth.getUserByEmail(email);
        console.log(`Found existing user: ${email}`);
      } catch (error) {
        console.log(`User ${email} does not exist yet - will be created when they sign up`);
        continue;
      }

      // Update user document in Firestore
      const userRef = db.collection('users').doc(user.uid);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        // Update existing user to admin
        await userRef.update({
          role: 'admin',
          updatedAt: new Date(),
        });
        console.log(`✅ Updated ${email} to admin role`);
      } else {
        // Create user document with admin role
        await userRef.set({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          firstName: '',
          lastName: '',
          role: 'admin',
          permissions: [],
          isActive: true,
          isVerified: user.emailVerified,
          preferences: {
            language: 'en',
            timezone: 'Europe/Amsterdam',
            notifications: {
              email: true,
              push: true,
              sms: false,
              inApp: true,
            },
            theme: 'system',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
          lastActivityAt: new Date(),
          stats: {
            projectsCount: 0,
            consultationsCount: 0,
            messagesCount: 0,
            totalSpent: 0,
          },
        });
        console.log(`✅ Created admin user document for ${email}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${email}:`, error);
    }
  }

  console.log('\nAdmin setup complete!');
  console.log('Note: Users need to sign up/login first before they can be made admin.');
  process.exit(0);
}

// Run the setup
setupAdminAccounts().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});
