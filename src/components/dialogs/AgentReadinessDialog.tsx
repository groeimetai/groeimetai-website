'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, User, UserCheck, ArrowRight, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/i18n/routing';

interface AgentReadinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentReadinessDialog({ open, onOpenChange }: AgentReadinessDialogProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleWithAccount = () => {
    if (user) {
      router.push('/agent-readiness');
    } else {
      router.push('/login?redirect=/agent-readiness');
    }
    onOpenChange(false);
  };

  const handleAsGuest = () => {
    router.push('/agent-readiness?mode=guest');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white text-center mb-6">
            Ontdek je{' '}
            <span
              className="text-white px-3 py-1 inline-block"
              style={{ background: 'linear-gradient(135deg, #F87315, #FF8533)' }}
            >
              Agent Readiness
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Met Account Option */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative">
            <div 
              className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: '#F87315' }}
            >
              Aanbevolen
            </div>
            
            <div className="flex items-center mb-4">
              <UserCheck className="w-6 h-6 mr-3" style={{ color: '#F87315' }} />
              <h3 className="text-lg font-bold text-white">Met account</h3>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-white/80 text-sm">
                <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                Volledig assessment rapport
              </li>
              <li className="flex items-center text-white/80 text-sm">
                <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                Gepersonaliseerde roadmap
              </li>
              <li className="flex items-center text-white/80 text-sm">
                <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                Snow-flow demo toegang
              </li>
              <li className="flex items-center text-white/80 text-sm">
                <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                Gratis consult optie
              </li>
            </ul>

            <Button
              onClick={handleWithAccount}
              className="w-full text-white font-semibold"
              style={{ backgroundColor: '#F87315' }}
            >
              <Target className="mr-2 w-4 h-4" />
              Start met account
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {/* Zonder Account Option */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <User className="w-6 h-6 mr-3 text-white/60" />
              <h3 className="text-lg font-bold text-white">Zonder account</h3>
            </div>

            <p className="text-white/70 text-sm mb-6">
              Basis assessment - upgrade later mogelijk
            </p>

            <Button
              onClick={handleAsGuest}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10 hover:border-white/40"
            >
              Start als gast
            </Button>
          </div>

          {/* Info Footer */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-white/60 text-xs">
              Dit past beter bij de consultancy flow: eerst ontdekken, dan pas committen.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}