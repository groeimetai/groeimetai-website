import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Migration script to link existing assessments to user accounts via email
 * This fixes the historical data where assessments were stored without userId
 */
export async function POST(req: NextRequest) {
  try {
    const { targetEmail, targetUserId } = await req.json();
    
    if (!targetEmail || !targetUserId) {
      return NextResponse.json({
        error: 'Both targetEmail and targetUserId are required'
      }, { status: 400 });
    }

    console.log('🔍 Starting assessment migration for:', { targetEmail, targetUserId });

    // Find all assessments with this email but no userId
    const assessmentsQuery = query(
      collection(db, 'agent_assessments'),
      where('email', '==', targetEmail)
    );
    
    const querySnapshot = await getDocs(assessmentsQuery);
    console.log('📊 Found', querySnapshot.size, 'assessments for email:', targetEmail);

    let updatedCount = 0;
    let skippedCount = 0;
    const updates: Promise<void>[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      if (!data.userId) {
        // Update document to add userId
        const updatePromise = updateDoc(doc(db, 'agent_assessments', docSnap.id), {
          userId: targetUserId,
          migrated: true,
          migratedAt: new Date()
        });
        
        updates.push(updatePromise);
        updatedCount++;
        
        console.log('✅ Queued update for assessment:', {
          firestoreId: docSnap.id,
          leadId: data.leadId,
          email: data.email,
          addingUserId: targetUserId
        });
      } else {
        skippedCount++;
        console.log('⏭️ Skipping assessment (already has userId):', {
          firestoreId: docSnap.id,
          existingUserId: data.userId
        });
      }
    });

    // Execute all updates
    await Promise.all(updates);

    const result = {
      success: true,
      message: `Migration completed for ${targetEmail}`,
      stats: {
        totalFound: querySnapshot.size,
        updated: updatedCount,
        skipped: skippedCount,
        targetEmail,
        targetUserId
      }
    };

    console.log('🎉 Migration completed:', result);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json(
      { 
        error: 'Migration failed', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to preview what assessments would be migrated
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({
        error: 'Email parameter required'
      }, { status: 400 });
    }

    console.log('🔍 Preview migration for email:', email);

    const assessmentsQuery = query(
      collection(db, 'agent_assessments'),
      where('email', '==', email)
    );
    
    const querySnapshot = await getDocs(assessmentsQuery);
    const assessments: any[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      assessments.push({
        id: docSnap.id,
        leadId: data.leadId,
        email: data.email,
        userId: data.userId,
        needsMigration: !data.userId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        migrated: data.migrated || false
      });
    });

    const needsMigration = assessments.filter(a => a.needsMigration);

    return NextResponse.json({
      success: true,
      email,
      stats: {
        total: assessments.length,
        needsMigration: needsMigration.length,
        alreadyLinked: assessments.length - needsMigration.length
      },
      assessments,
      needsMigration
    });

  } catch (error) {
    console.error('❌ Preview failed:', error);
    return NextResponse.json(
      { error: 'Preview failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}