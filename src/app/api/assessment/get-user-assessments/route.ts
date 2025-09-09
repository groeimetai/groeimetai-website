import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');
    
    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: 'User ID or email required' },
        { status: 400 }
      );
    }

    // Query agent_assessments collection
    const q = query(
      collection(db, 'agent_assessments'),
      userEmail 
        ? where('email', '==', userEmail)
        : where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const assessments = [];
    
    querySnapshot.forEach((doc) => {
      assessments.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
      });
    });
    
    return NextResponse.json({
      success: true,
      assessments,
      count: assessments.length
    });

  } catch (error) {
    console.error('Error getting Agent Assessments:', error);
    return NextResponse.json(
      { error: 'Failed to load assessments' },
      { status: 500 }
    );
  }
}