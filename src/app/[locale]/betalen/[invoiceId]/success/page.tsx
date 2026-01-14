'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Home } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const params = useParams();
  const invoiceId = params.invoiceId as string;

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#080D14' }}>
      <Card className="max-w-md w-full bg-white/5 border-white/10">
        <CardContent className="pt-8 pb-8 text-center">
          {/* Success icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">
            Betaling succesvol!
          </h1>

          {/* Description */}
          <p className="text-white/60 mb-8">
            Bedankt voor uw betaling. U ontvangt een bevestiging per e-mail.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/" className="block">
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                <Home className="h-4 w-4 mr-2" />
                Terug naar home
              </Button>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-white/40 text-sm">
              Vragen over uw betaling?
              <br />
              Neem contact op via{' '}
              <a href="mailto:info@groeimetai.io" className="text-orange hover:underline">
                info@groeimetai.io
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
