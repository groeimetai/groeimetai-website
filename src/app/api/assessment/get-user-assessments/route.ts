import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');
    
    console.log('🔍 Enhanced assessment query received:', { userId, userEmail });
    
    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: 'User ID or email required' },
        { status: 400 }
      );
    }

    let assessments: any[] = [];
    let sources: string[] = [];
    
    // Method 1: Query by userId if provided
    if (userId) {
      console.log('🔍 Querying by userId:', userId);
      try {
        const userIdQuery = query(
          collection(db, 'agent_assessments'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const userIdSnapshot = await getDocs(userIdQuery);
        console.log('📊 UserId query results:', userIdSnapshot.size, 'documents');
        
        userIdSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          assessments.push({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            source: 'userId_match'
          });
        });
        sources.push(`userId(${userIdSnapshot.size})`);        
      } catch (error) {
        console.warn('⚠️ UserId query failed:', error);
      }
    }
    
    // Method 2: Query by email (both if no userId results, or always for completeness)
    if (userEmail) {
      console.log('🔍 Querying by email:', userEmail);
      try {
        const emailQuery = query(
          collection(db, 'agent_assessments'),
          where('email', '==', userEmail),
          orderBy('createdAt', 'desc')
        );
        
        const emailSnapshot = await getDocs(emailQuery);
        console.log('📊 Email query results:', emailSnapshot.size, 'documents');
        
        const existingIds = new Set(assessments.map(a => a.id));
        
        emailSnapshot.forEach((docSnap) => {
          // Avoid duplicates
          if (!existingIds.has(docSnap.id)) {
            const data = docSnap.data();
            assessments.push({
              id: docSnap.id,
              ...data,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
              source: 'email_match',
              needsLinking: !data.userId && userId // Flag assessments that could be linked
            });
          }
        });
        sources.push(`email(${emailSnapshot.size})`);       
      } catch (error) {
        console.warn('⚠️ Email query failed:', error);
      }
    }
    
    // Method 3: Check assessment_links collection for additional links
    if (userId) {
      try {
        console.log('🔍 Checking assessment_links collection for userId:', userId);
        const linksQuery = query(
          collection(db, 'assessment_links'),
          where('userId', '==', userId)
        );
        
        const linksSnapshot = await getDocs(linksQuery);
        console.log('📊 Assessment links found:', linksSnapshot.size);
        
        if (linksSnapshot.size > 0) {
          sources.push(`links(${linksSnapshot.size})`);
          // Could use these links to find additional assessments if needed
        }
      } catch (error) {
        console.warn('⚠️ Links query failed:', error);
      }
    }
    
    // Sort assessments by creation date (most recent first)
    assessments.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    const needsLinking = assessments.filter(a => a.needsLinking).length;
    
    console.log('✅ Enhanced assessment results:', {
      count: assessments.length,
      sources: sources.join(', '),
      needsLinking,
      assessmentIds: assessments.map(a => a.leadId || a.id),
      methods: {
        userId: !!userId,
        email: !!userEmail,
        foundResults: assessments.length > 0
      }
    });
    
    return NextResponse.json({
      success: true,
      assessments,
      count: assessments.length,
      stats: {
        total: assessments.length,
        needsLinking,
        linkedProperly: assessments.length - needsLinking,
        sources: sources
      },
      debug: {
        queriedUserId: userId,
        queriedEmail: userEmail,
        searchMethods: sources,
        foundViaUserId: assessments.filter(a => a.source === 'userId_match').length,
        foundViaEmail: assessments.filter(a => a.source === 'email_match').length
      }
    });

  } catch (error) {
    console.error('Error getting Agent Assessments:', error);
    return NextResponse.json(
      { error: 'Failed to load assessments' },
      { status: 500 }
    );
  }
}