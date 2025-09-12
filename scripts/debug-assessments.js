require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, orderBy } = require('firebase/firestore');

// Firebase config - use same as in your app
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugAssessments() {
  try {
    console.log('🔍 Debugging assessment data flow...');
    console.log('📊 Firebase Config:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    });

    // Test 1: Get all assessments
    console.log('\n1️⃣ Getting ALL assessments in agent_assessments collection...');
    const allQuery = query(
      collection(db, 'agent_assessments'),
      orderBy('createdAt', 'desc')
    );
    
    const allSnapshot = await getDocs(allQuery);
    console.log(`📊 Total assessments found: ${allSnapshot.size}`);
    
    allSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📄 Assessment ${index + 1}:`, {
        id: doc.id,
        leadId: data.leadId,
        email: data.email,
        userId: data.userId || 'NOT SET',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        type: data.type,
        status: data.status
      });
    });

    // Test 2: Search by specific email
    console.log('\n2️⃣ Searching for niels@groeimetai.io assessments...');
    const emailQuery = query(
      collection(db, 'agent_assessments'),
      where('email', '==', 'niels@groeimetai.io'),
      orderBy('createdAt', 'desc')
    );
    
    const emailSnapshot = await getDocs(emailQuery);
    console.log(`📧 Assessments for niels@groeimetai.io: ${emailSnapshot.size}`);
    
    emailSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('✅ Found assessment:', {
        id: doc.id,
        leadId: data.leadId,
        email: data.email,
        userId: data.userId || 'MISSING',
        needsUserId: !data.userId
      });
    });

    // Test 3: Search by userId
    console.log('\n3️⃣ Searching by userId: x1rUYgbSBChidYHIEUnaJTFOLnk2...');
    const userIdQuery = query(
      collection(db, 'agent_assessments'),
      where('userId', '==', 'x1rUYgbSBChidYHIEUnaJTFOLnk2')
    );
    
    const userIdSnapshot = await getDocs(userIdQuery);
    console.log(`🔑 Assessments for userId: ${userIdSnapshot.size}`);
    
    if (userIdSnapshot.empty) {
      console.log('❌ No assessments found for this userId - THIS IS THE PROBLEM!');
    } else {
      userIdSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('✅ Found by userId:', {
          id: doc.id,
          leadId: data.leadId,
          email: data.email
        });
      });
    }

    // Test 4: Show all unique emails in collection
    console.log('\n4️⃣ Unique emails in collection:');
    const uniqueEmails = new Set();
    allSnapshot.forEach((doc) => {
      const email = doc.data().email;
      if (email) uniqueEmails.add(email);
    });
    
    console.log('📧 Emails found:', Array.from(uniqueEmails));

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugAssessments().then(() => {
  console.log('\n✅ Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Debug script failed:', error);
  process.exit(1);
});