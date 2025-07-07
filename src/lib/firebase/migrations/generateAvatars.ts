/**
 * Migration script to generate avatars for existing users without profile photos
 */
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { generateAvatarDataUri } from '@/lib/utils/avatar';

export async function generateAvatarsForExistingUsers() {
  try {
    console.log('Starting avatar generation for existing users...');

    // Query users without photoURL
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('photoURL', '==', null));
    const snapshot = await getDocs(q);

    console.log(`Found ${snapshot.size} users without avatars`);

    let updated = 0;
    const updatePromises = [];

    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      const displayName = userData.displayName || userData.email || 'User';

      // Generate avatar
      const avatarDataUri = generateAvatarDataUri(displayName);

      // Update user document
      const updatePromise = updateDoc(doc(db, 'users', userDoc.id), {
        photoURL: avatarDataUri,
        updatedAt: new Date(),
      });

      updatePromises.push(updatePromise);
      updated++;

      console.log(`Generated avatar for user: ${displayName} (${userDoc.id})`);
    }

    // Execute all updates
    await Promise.all(updatePromises);

    console.log(`✅ Successfully generated avatars for ${updated} users`);
    return { success: true, updated };
  } catch (error) {
    console.error('Error generating avatars:', error);
    return { success: false, error };
  }
}

// Run the migration if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  generateAvatarsForExistingUsers()
    .then((result) => {
      console.log('Migration completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
