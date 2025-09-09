import { NextRequest, NextResponse } from 'next/server';
import { HomepageRouter } from '@/services/homepageRouting';

export async function POST(req: NextRequest) {
  try {
    const { entryPoint, userContext } = await req.json();
    
    // Route the user action
    const routing = await HomepageRouter.routeUserAction(entryPoint, userContext);
    
    // Track the entry point
    await HomepageRouter.trackEntry(entryPoint, userContext);
    
    return NextResponse.json({
      success: true,
      routing,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Homepage routing error:', error);
    return NextResponse.json(
      { error: 'Failed to route action' },
      { status: 500 }
    );
  }
}

// Smart routing based on user history
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    
    if (!action) {
      return NextResponse.json({ error: 'Action required' }, { status: 400 });
    }

    // Get user history for smart routing
    const userHistory = userId ? await getUserHistory(userId) : {};
    
    // Generate smart routing suggestion
    const smartRouting = HomepageRouter.getSmartRouting(userHistory, action);
    
    return NextResponse.json({
      success: true,
      smartRouting,
      userHistory: userHistory ? 'found' : 'new_visitor'
    });
    
  } catch (error) {
    console.error('Smart routing error:', error);
    return NextResponse.json(
      { error: 'Failed to get smart routing' },
      { status: 500 }
    );
  }
}

async function getUserHistory(userId: string): Promise<any> {
  // Implementation would fetch user interaction history
  return {
    previousAssessment: false,
    contactFormViewed: false,
    githubViewed: false,
    email: null,
    lastVisit: null
  };
}