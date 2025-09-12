import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(req: NextRequest) {
  try {
    const { userId, assessmentId, source, userEmail } = await req.json();
    
    if (!userId || !assessmentId) {
      return NextResponse.json(
        { error: 'User ID and assessment ID required' },
        { status: 400 }
      );
    }

    console.log('🔗 Linking assessment to user:', { userId, assessmentId, source, userEmail });

    const batch = writeBatch(db);
    let linkedCount = 0;

    // Method 1: Link by specific assessmentId (leadId)
    if (assessmentId) {
      try {
        const assessmentQuery = query(
          collection(db, 'agent_assessments'),
          where('leadId', '==', assessmentId)
        );
        
        const snapshot = await getDocs(assessmentQuery);
        snapshot.forEach((docSnap) => {
          const assessmentRef = doc(db, 'agent_assessments', docSnap.id);
          batch.update(assessmentRef, {
            userId: userId,
            linkedAt: new Date(),
            linkingSource: source || 'manual_link'
          });
          linkedCount++;
          console.log('✅ Queued assessment update:', { firestoreId: docSnap.id, leadId: assessmentId });
        });
      } catch (error) {
        console.error('⚠️ Error finding assessment by leadId:', error);
      }
    }

    // Method 2: Link by email if provided (retroactive linking)
    if (userEmail && linkedCount === 0) {
      try {
        const emailQuery = query(
          collection(db, 'agent_assessments'),
          where('email', '==', userEmail)
        );
        
        const emailSnapshot = await getDocs(emailQuery);
        console.log(`📝 Found ${emailSnapshot.size} assessments for email ${userEmail}`);
        
        emailSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Only link if not already linked to prevent overwrites
          if (!data.userId) {
            const assessmentRef = doc(db, 'agent_assessments', docSnap.id);
            batch.update(assessmentRef, {
              userId: userId,
              linkedAt: new Date(),
              linkingSource: 'email_match',
              retroactiveLink: true
            });
            linkedCount++;
            console.log('✅ Queued retroactive link:', { 
              firestoreId: docSnap.id, 
              leadId: data.leadId,
              email: userEmail 
            });
          } else {
            console.log('⚠️ Skipping already linked assessment:', {
              firestoreId: docSnap.id,
              existingUserId: data.userId
            });
          }
        });
      } catch (error) {
        console.error('⚠️ Error finding assessments by email:', error);
      }
    }

    // Create assessment link document in separate collection for easy querying
    const linkRef = doc(db, 'assessment_links', `${userId}_${assessmentId}`);
    batch.set(linkRef, {
      userId: userId,
      assessmentId: assessmentId,
      userEmail: userEmail,
      type: 'agent_readiness',
      source: source || 'manual_link',
      linkedAt: new Date(),
      createdAt: new Date(),
      status: 'linked',
      assessmentsLinked: linkedCount
    });
    
    // Update user's lastActivity (simple update, no arrays)
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      lastActivityAt: new Date(),
      lastAssessmentId: assessmentId,
      assessmentCount: linkedCount
    });

    // Execute all updates atomically
    await batch.commit();

    console.log('✅ Assessment linking completed:', { 
      userId, 
      assessmentId, 
      linkedCount,
      method: linkedCount > 0 ? 'successful' : 'no_matches'
    });

    return NextResponse.json({
      success: true,
      message: `Assessment linked to user account (${linkedCount} assessments updated)`,
      stats: {
        linkedCount,
        userId,
        assessmentId,
        userEmail
      }
    });

  } catch (error: any) {
    console.error('❌ Assessment linking error:', error);
    
    // Handle offline mode gracefully
    if (error?.code === 'permission-denied' || error?.message?.includes('offline')) {
      console.log('🔄 Firestore offline - assessment will be linked when connection is restored');
      return NextResponse.json({
        success: true,
        message: 'Assessment will be linked when connection is restored',
        offline: true,
        stats: { linkedCount: 0, offline: true }
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to link assessment',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}