'use client';

import { useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, ArrowRight, Home, MessageSquare, FileText, Clock, User } from 'lucide-react';

export default function QuoteSuccessPage() {
  const router = useRouter();
  const { user } = useAuth();

  const nextSteps = [
    {
      icon: Clock,
      title: 'Within 24 hours',
      description: 'Our team will review your request and contact you',
    },
    {
      icon: MessageSquare,
      title: 'Initial consultation',
      description: "We'll schedule a call to discuss your project in detail",
    },
    {
      icon: FileText,
      title: 'Tailored proposal',
      description: "You'll receive a customized solution and pricing",
    },
  ];

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Success Icon */}
          <motion.div
            className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <CheckCircle className="w-12 h-12 text-green-500" />
          </motion.div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-white mb-4">Quote Request Submitted!</h1>
          <p className="text-xl text-white/60 mb-8">
            Thank you for your interest in GroeimetAI. We&apos;ve received your request.
          </p>

          {/* Account Created Message */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-orange/10 border border-orange/20 rounded-lg p-6 mb-8"
            >
              <div className="flex items-center justify-center space-x-3 mb-2">
                <User className="w-5 h-5 text-orange" />
                <h2 className="text-lg font-semibold text-white">Account Created Successfully</h2>
              </div>
              <p className="text-sm text-white/60">
                Check your email for login instructions and access to your project portal.
              </p>
            </motion.div>
          )}

          {/* Next Steps */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-6">What happens next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {nextSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10"
                >
                  <div className="w-12 h-12 bg-orange/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <step.icon className="w-6 h-6 text-orange" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/60">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-orange hover:bg-orange/90 text-white">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link href="/services">
                <Button className="bg-orange hover:bg-orange/90 text-white">
                  Explore Services
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </motion.div>

          {/* Contact Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1 }}
            className="text-sm text-white/40 mt-8"
          >
            Need immediate assistance? Call us at{' '}
            <a
              href="tel:+31612345678"
              className="text-orange hover:text-orange/80 transition-colors"
            >
              +31 6 1234 5678
            </a>
          </motion.p>
        </motion.div>
      </div>
    </main>
  );
}
