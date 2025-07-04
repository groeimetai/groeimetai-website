'use client';

import { useState } from 'react';
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
  Smartphone,
} from 'lucide-react';
import { twoFactorService } from '@/services/twoFactorService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const t = useTranslations('auth.login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [mfaResolver, setMfaResolver] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying2FA, setVerifying2FA] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      // Set user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        setError(t('errors.userNotFound'));
      } else if (error.code === 'auth/wrong-password') {
        setError(t('errors.wrongPassword'));
      } else if (error.code === 'auth/invalid-email') {
        setError(t('errors.invalidEmail'));
      } else if (error.code === 'auth/too-many-requests') {
        setError(t('errors.tooManyRequests'));
      } else if (error.code === 'auth/multi-factor-auth-required') {
        // Handle 2FA requirement
        setMfaResolver(error.resolver);
        setShow2FADialog(true);
        setIsLoading(false);
        return;
      } else if (error.code === 'auth/email-not-verified') {
        setError(t('errors.emailNotVerified'));
      } else {
        setError(t('errors.general'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerification = async () => {
    if (!mfaResolver || !verificationCode) return;

    setVerifying2FA(true);
    setError('');

    try {
      const userCredential = await twoFactorService.verifyTotpCode(mfaResolver, verificationCode);

      // Successfully authenticated with 2FA
      setShow2FADialog(false);
      setVerificationCode('');
      setMfaResolver(null);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('2FA verification failed:', error);
      setError(t('errors.invalidCode'));
      setVerificationCode('');
    } finally {
      setVerifying2FA(false);
    }
  };

  const benefits = [
    {
      icon: Shield,
      title: t('benefits.secure.title'),
      description: t('benefits.secure.description'),
    },
    {
      icon: MessageSquare,
      title: t('benefits.updates.title'),
      description: t('benefits.updates.description'),
    },
    {
      icon: TrendingUp,
      title: t('benefits.tracking.title'),
      description: t('benefits.tracking.description'),
    },
    {
      icon: Sparkles,
      title: t('benefits.insights.title'),
      description: t('benefits.insights.description'),
    },
  ];

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center text-white/60 hover:text-orange mb-6 transition-colors"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                {t('backToHome')}
              </Link>
              <h1 className="text-4xl font-bold text-white mb-2">{t('title')}</h1>
              <p className="text-white/60 text-lg">{t('subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-white">
                  {t('emailLabel')}
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    placeholder={t('emailPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="password" className="text-white">
                    {t('passwordLabel')}
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-orange hover:text-orange/80 transition-colors"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    placeholder={t('passwordPlaceholder')}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange hover:bg-orange/90 text-white py-6 text-lg font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('signingIn')}
                  </>
                ) : (
                  <>
                    {t('signIn')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-white/60">
                {t('noAccount')}{' '}
                <Link
                  href="/#quote"
                  className="text-orange hover:text-orange/80 transition-colors font-medium"
                >
                  {t('getStarted')}
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Right side - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:pl-12"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">{t('portalTitle')}</h2>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-orange" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                      <p className="text-sm text-white/60">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-orange/10 rounded-lg border border-orange/20">
                <p className="text-sm text-white">{t('trustMessage')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 2FA Verification Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="bg-black border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{t('twoFactor.title')}</DialogTitle>
            <DialogDescription className="text-white/60">
              {t('twoFactor.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <Smartphone className="w-16 h-16 text-orange" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="2fa-code" className="text-white">
                {t('twoFactor.codeLabel')}
              </Label>
              <Input
                id="2fa-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder={t('twoFactor.codePlaceholder')}
                className="bg-white/5 border-white/20 text-white text-center text-lg"
                maxLength={6}
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShow2FADialog(false);
                setVerificationCode('');
                setError('');
                setMfaResolver(null);
              }}
              disabled={verifying2FA}
            >
              {t('twoFactor.cancel')}
            </Button>
            <Button
              onClick={handle2FAVerification}
              className="bg-orange hover:bg-orange/90"
              disabled={verifying2FA || verificationCode.length !== 6}
            >
              {verifying2FA ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              {t('twoFactor.verify')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
