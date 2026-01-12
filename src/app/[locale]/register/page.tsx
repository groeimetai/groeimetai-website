'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  Shield,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Loader2,
  AlertCircle,
  User,
  Building,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [urlParams, setUrlParams] = useState<URLSearchParams | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setUrlParams(params);

      setFormData(prev => ({
        ...prev,
        name: params.get('name') || '',
        company: params.get('company') || '',
        email: params.get('email') || ''
      }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register(formData.email, formData.password, {
        displayName: formData.name,
        company: formData.company,
      });

      const assessmentId = urlParams?.get('assessment');
      if (assessmentId) {
        router.push(`/dashboard?assessment=${assessmentId}&first=true`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden bij het registreren');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');

    try {
      await loginWithGoogle();

      const assessmentId = urlParams?.get('assessment');
      if (assessmentId && user) {
        await fetch('/api/user/link-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            assessmentId,
            source: 'google_registration'
          })
        });
      }

      if (assessmentId) {
        router.push(`/dashboard?assessment=${assessmentId}&first=true`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden bij Google registratie');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const benefits = [
    {
      icon: Shield,
      title: 'Volledig Assessment Rapport',
      description: 'Gedetailleerde analyse van jouw Agent Readiness met concrete aanbevelingen.',
    },
    {
      icon: MessageSquare,
      title: 'Gepersonaliseerde Roadmap',
      description: 'Step-by-step plan specifiek voor jouw systemen en organisatie.',
    },
    {
      icon: TrendingUp,
      title: 'Snow-flow Demo Toegang',
      description: 'Exclusieve toegang tot onze live MCP server demonstratie.',
    },
    {
      icon: Sparkles,
      title: 'Gratis Strategie Consult',
      description: '30-minuten gesprek met onze agent infrastructure experts.',
    },
  ];

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-28 sm:py-16">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Register Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center text-white/55 hover:text-[#FF9F43] mb-8 sm:mb-10 transition-colors text-sm"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Terug naar home
              </Link>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-[-0.02em]">
                Maak je{' '}
                <span
                  className="text-white px-2 py-0.5 inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                    boxShadow: '0 4px 16px -4px rgba(248, 115, 21, 0.4)',
                  }}
                >
                  Agent Readiness
                </span>{' '}
                Account
              </h1>
              <p className="text-white/60 text-base sm:text-lg">
                Start je journey naar een agent-ready organisatie
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white/80 text-sm">
                    Naam *
                  </Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 bg-white/[0.03] border-white/15 text-white placeholder:text-white/35 focus:border-[#FF9F43] transition-colors"
                      placeholder="Je naam"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="company" className="text-white/80 text-sm">
                    Bedrijf
                  </Label>
                  <div className="relative mt-1.5">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="pl-10 bg-white/[0.03] border-white/15 text-white placeholder:text-white/35 focus:border-[#FF9F43] transition-colors"
                      placeholder="Bedrijfsnaam"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-white/80 text-sm">
                  Email *
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-white/[0.03] border-white/15 text-white placeholder:text-white/35 focus:border-[#FF9F43] transition-colors"
                    placeholder="je@bedrijf.nl"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-white/80 text-sm">
                  Wachtwoord *
                </Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 bg-white/[0.03] border-white/15 text-white placeholder:text-white/35 focus:border-[#FF9F43] transition-colors"
                    placeholder="Minimaal 6 karakters"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-white/80 text-sm">
                  Bevestig Wachtwoord *
                </Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 bg-white/[0.03] border-white/15 text-white placeholder:text-white/35 focus:border-[#FF9F43] transition-colors"
                    placeholder="Herhaal je wachtwoord"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-white font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                  boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.5)',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Account aanmaken...
                  </>
                ) : (
                  <>
                    Account aanmaken
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/15" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-white/50">of</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              variant="outline"
              className="w-full h-12 border-white/15 hover:bg-white/[0.05] hover:border-white/30 text-white font-medium rounded-lg transition-all duration-300"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Registreren...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Registreer met Google
                </>
              )}
            </Button>

            <div className="mt-8 text-center">
              <p className="text-white/55 text-sm">
                Heb je al een account?{' '}
                <Link
                  href="/login"
                  className="text-[#FF9F43] hover:text-[#FF9F43]/80 transition-colors font-medium"
                >
                  Log in
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Right side - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:pl-8"
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-[-0.02em]">
                Waarom een account aanmaken?
              </h2>
              <p className="text-white/65 text-base sm:text-lg">
                Krijg toegang tot gepersonaliseerde Agent Readiness tools en expertise.
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start space-x-4 p-4 bg-white/[0.03] rounded-xl border border-white/10 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300"
                >
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                  >
                    <benefit.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 p-5 bg-white/[0.03] rounded-xl border border-white/10"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { value: '2+', label: 'Jaar AI Expertise' },
                  { value: '1M+', label: 'Tokens Verwerkt' },
                  { value: '100%', label: 'GDPR Compliant' }
                ].map((stat, idx) => (
                  <div key={idx}>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-white/50 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Final CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 p-5 bg-gradient-to-br from-[#F87315]/15 to-[#F87315]/5 rounded-xl border border-[#F87315]/20 text-center"
            >
              <p className="text-white/85 mb-2">
                <strong>Ready voor Agent Season 2025?</strong>
              </p>
              <p className="text-white/55 text-sm">
                Start je Agent Readiness Assessment direct na registratie
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
