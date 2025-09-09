'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AgentReadinessHero from '@/components/landing/AgentReadinessHero';
import AgentBlindnessProblems from '@/components/landing/AgentBlindnessProblems';
import ApiToMcpAnimation from '@/components/landing/ApiToMcpAnimation';
import OnzeRolPartner from '@/components/landing/OnzeRolPartner';
import CompanyTimeline from '@/components/landing/CompanyTimeline';
import SnowFlowShowcase from '@/components/landing/SnowFlowShowcase';
import ForEveryBusiness from '@/components/landing/ForEveryBusiness';
import ObjectionsHandling from '@/components/landing/ObjectionsHandling';
import TestimonialSection from '@/components/landing/TestimonialSection';
import AmbientLightingBackground from '@/components/landing/AmbientLightingBackground';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function HomePageContent() {
  const searchParams = useSearchParams();
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('accountDeleted') === 'true') {
      setShowDeleteSuccess(true);
      // Remove the query parameter from URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete('accountDeleted');
      window.history.replaceState({}, '', url.pathname);

      // Hide the message after 10 seconds
      const timer = setTimeout(() => {
        setShowDeleteSuccess(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <>
      <AmbientLightingBackground />
      <main className="relative z-10">
        {/* Success Message */}
        <AnimatePresence>
          {showDeleteSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4"
            >
              <Alert className="bg-green-500/10 border-green-500/50 backdrop-blur-lg">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-500">
                  Your account has been successfully deleted. We&apos;re sorry to see you go. If you
                  change your mind, you&apos;re always welcome to create a new account.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <AgentReadinessHero />
        <AgentBlindnessProblems />
        <ApiToMcpAnimation />
        <OnzeRolPartner />
        <CompanyTimeline />
        <SnowFlowShowcase />
        <ObjectionsHandling />
        <ForEveryBusiness />
      </main>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}