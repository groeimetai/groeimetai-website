'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  applyActionCode, 
  confirmPasswordReset, 
  verifyPasswordResetCode,
  checkActionCode 
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Mail, Lock } from 'lucide-react';
import Link from 'next/link';

type ActionMode = 'resetPassword' | 'verifyEmail' | 'recoverEmail';

export default function AuthActionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('auth');
  
  const mode = searchParams.get('mode') as ActionMode;
  const oobCode = searchParams.get('oobCode');
  const continueUrl = searchParams.get('continueUrl');
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!mode || !oobCode) {
      setError('Invalid action link');
      setLoading(false);
      return;
    }

    // Check the action code
    checkActionCode(auth, oobCode)
      .then((info) => {
        setEmail(info.data.email || '');
        
        // Auto-verify email if that's the mode
        if (mode === 'verifyEmail') {
          handleVerifyEmail();
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Invalid action code:', error);
        setError('This link is invalid or has expired');
        setLoading(false);
      });
  }, [mode, oobCode]);

  const handleVerifyEmail = async () => {
    if (!oobCode) return;
    
    try {
      await applyActionCode(auth, oobCode);
      setSuccess(true);
      setLoading(false);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push(continueUrl || '/dashboard');
      }, 3000);
    } catch (error: any) {
      console.error('Email verification error:', error);
      setError(error.message || 'Failed to verify email');
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Verify the reset code first
      await verifyPasswordResetCode(auth, oobCode!);
      
      // Reset the password
      await confirmPasswordReset(auth, oobCode!, newPassword);
      
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (loading && mode === 'verifyEmail') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-orange animate-spin mx-auto mb-4" />
              <p className="text-white">Verifying your email...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                {mode === 'verifyEmail' ? 'Email Verified!' : 'Password Reset!'}
              </h2>
              <p className="text-white/60 mb-4">
                {mode === 'verifyEmail' 
                  ? 'Your email has been successfully verified.' 
                  : 'Your password has been successfully reset.'}
              </p>
              <p className="text-white/40 text-sm">
                Redirecting you in a moment...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !mode || !oobCode) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
              <p className="text-white/60 mb-6">
                {error || 'This action link is invalid or has expired.'}
              </p>
              <Link href="/login">
                <Button className="bg-orange hover:bg-orange/90">
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Password Reset Form
  if (mode === 'resetPassword') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-white text-center">
              Reset Your Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white/80">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="pl-10 bg-white/10 border-white/20 text-white/60"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword" className="text-white/80">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Enter new password"
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Confirm new password"
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
              </div>

              {error && (
                <Alert className="bg-red-500/10 border-red-500/30">
                  <AlertDescription className="text-red-500">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-orange hover:bg-orange/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-white/60 hover:text-white text-sm">
                  Back to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}