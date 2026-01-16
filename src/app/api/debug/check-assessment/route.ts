import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

// All assessment collection names
const ASSESSMENT_COLLECTIONS = [
  'agent_assessments',
  'data_readiness_assessments',
  'ai_security_assessments',
  'process_automation_assessments',
  'cx_ai_assessments',
  'ai_maturity_assessments',
  'integration_readiness_assessments',
  'roi_calculator_assessments',
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assessmentId = searchParams.get('id');
    const email = searchParams.get('email');

    const results: any = {
      searchedId: assessmentId,
      searchedEmail: email,
      collections: {},
      found: false
    };

    for (const collectionName of ASSESSMENT_COLLECTIONS) {
      try {
        // If we have an assessmentId, search by leadId
        if (assessmentId) {
          const byLeadId = await adminDb
            .collection(collectionName)
            .where('leadId', '==', assessmentId)
            .limit(1)
            .get();

          if (!byLeadId.empty) {
            const doc = byLeadId.docs[0];
            const data = doc.data();
            results.collections[collectionName] = {
              found: true,
              method: 'leadId',
              firestoreId: doc.id,
              leadId: data.leadId,
              hasReport: !!data.report,
              status: data.status,
              email: data.email,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
            };
            results.found = true;
            continue;
          }
        }

        // If we have an email, search by email
        if (email) {
          const byEmail = await adminDb
            .collection(collectionName)
            .where('email', '==', email)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

          if (!byEmail.empty) {
            results.collections[collectionName] = {
              found: true,
              method: 'email',
              count: byEmail.size,
              assessments: byEmail.docs.map(doc => {
                const data = doc.data();
                return {
                  firestoreId: doc.id,
                  leadId: data.leadId,
                  hasReport: !!data.report,
                  status: data.status,
                  createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
                };
              })
            };
            results.found = true;
            continue;
          }
        }

        // Get latest 3 from this collection (for debugging)
        const latest = await adminDb
          .collection(collectionName)
          .orderBy('createdAt', 'desc')
          .limit(3)
          .get();

        if (!latest.empty) {
          results.collections[collectionName] = {
            found: false,
            latestEntries: latest.docs.map(doc => {
              const data = doc.data();
              return {
                firestoreId: doc.id,
                leadId: data.leadId,
                email: data.email,
                status: data.status,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
              };
            })
          };
        } else {
          results.collections[collectionName] = { found: false, empty: true };
        }
      } catch (error) {
        results.collections[collectionName] = {
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
