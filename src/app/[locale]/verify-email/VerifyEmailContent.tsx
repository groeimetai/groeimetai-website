'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const t = useTranslations('auth.verifyEmail');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-orange" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription className="text-lg">{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">{t('message')}</p>
            {email && (
              <p className="font-medium text-foreground">{email}</p>
            )}
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">{t('nextSteps.title')}</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>{t('nextSteps.step1')}</li>
              <li>{t('nextSteps.step2')}</li>
              <li>{t('nextSteps.step3')}</li>
            </ol>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>{t('didntReceive')}</p>
            <p className="mt-2">{t('checkSpam')}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToLogin')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}