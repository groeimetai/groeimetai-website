'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import HeroSection from '@/components/landing/HeroSection';
import ServicesShowcase from '@/components/landing/ServicesShowcase';
import Expertise from '@/components/landing/Expertise';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import OurApproach from '@/components/landing/OurApproach';
import TrustIndicators from '@/components/landing/TrustIndicators';
import QuoteRequestForm from '@/components/forms/QuoteRequestForm';
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

        <HeroSection />
        <ServicesShowcase />
        <Expertise />
        <WhyChooseUs />
        <OurApproach />
        <TrustIndicators />

        <section id="quote" className="py-20 bg-black relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 30% 30%, #FF6600 0%, transparent 40%),
                               radial-gradient(circle at 70% 70%, #0A4A0A 0%, transparent 40%)`,
              }}
            />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">
                Let&apos;s Discuss Your <span className="text-orange-500">AI Strategy</span>
              </h2>
              <QuoteRequestForm />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  );
}
