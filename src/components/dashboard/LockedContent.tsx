'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, Unlock, ArrowRight, Star, Clock, CheckCircle,
  TrendingUp, Euro, Target, Eye, X
} from 'lucide-react';
import Link from 'next/link';

interface LockedSection {
  section: string;
  title: string;
  preview: string;
  description: string;
  unlockPrice: string;
  urgency: 'high' | 'medium' | 'low';
}

interface LockedContentProps {
  userId: string;
  sections: LockedSection[];
  leadScore: 'hot' | 'warm' | 'cold';
}

export default function LockedContent({ userId, sections, leadScore }: LockedContentProps) {
  const [dismissedSections, setDismissedSections] = useState<string[]>([]);
  const [viewedSections, setViewedSections] = useState<string[]>([]);

  useEffect(() => {
    // Track section views for analytics
    sections.forEach(section => {
      if (!viewedSections.includes(section.section)) {
        trackUpsellView(userId, section.section);
        setViewedSections(prev => [...prev, section.section]);
      }
    });
  }, [sections]);

  const trackUpsellView = async (userId: string, section: string) => {
    try {
      await fetch('/api/upsell/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'view',
          component: `locked_${section}`,
          userId
        })
      });
    } catch (error) {
      console.error('Tracking error:', error);
    }
  };

  const handleUnlockClick = async (section: string) => {
    await fetch('/api/upsell/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'click',
        component: `unlock_${section}`,
        userId
      })
    });
  };

  const handleDismiss = (section: string) => {
    setDismissedSections(prev => [...prev, section]);
    fetch('/api/upsell/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'dismiss',
        component: `locked_${section}`,
        userId
      })
    });
  };

  const visibleSections = sections.filter(section => 
    !dismissedSections.includes(section.section)
  );

  if (visibleSections.length === 0) return null;

  return (
    <div className="space-y-6">
      {visibleSections.map((section, index) => (
        <Card 
          key={section.section}
          className={`border-2 relative overflow-hidden ${
            section.urgency === 'high' 
              ? 'border-orange-500/50 bg-orange-500/5'
              : section.urgency === 'medium'
              ? 'border-orange-500/30 bg-orange-500/5'  
              : 'border-white/20 bg-white/5'
          }`}
        >
          {section.urgency === 'high' && (
            <div className="absolute top-0 right-0">
              <Badge className="bg-red-500/20 text-red-400 rounded-none rounded-bl-lg">
                HOT LEAD
              </Badge>
            </div>
          )}

          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="w-6 h-6" style={{ color: '#F87315' }} />
                <div>
                  <CardTitle className="text-white">{section.title}</CardTitle>
                  <p className="text-white/60 text-sm mt-1">{section.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleDismiss(section.section)}
                className="text-white/60 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Preview Content */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-sm"></div>
              <div className="relative">
                <p className="text-white/70 text-lg font-medium mb-2">
                  {section.preview}
                </p>
                <div className="text-white/50 text-sm">
                  [Detailed analysis requires expert assessment]
                </div>
              </div>
            </div>

            {/* Unlock Benefits */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center text-white/80 text-sm">
                <CheckCircle className="w-4 h-4 mr-2" style={{ color: '#F87315' }} />
                Specifiek voor jouw situatie
              </div>
              <div className="flex items-center text-white/80 text-sm">
                <TrendingUp className="w-4 h-4 mr-2" style={{ color: '#F87315' }} />
                Concrete ROI berekening
              </div>
              <div className="flex items-center text-white/80 text-sm">
                <Target className="w-4 h-4 mr-2" style={{ color: '#F87315' }} />
                90-dagen actieplan
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/expert-assessment" className="flex-1">
                <Button
                  onClick={() => handleUnlockClick(section.section)}
                  className="w-full text-white font-semibold"
                  style={{ backgroundColor: '#F87315' }}
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  Unlock met Expert Assessment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              
              {leadScore === 'hot' && (
                <Link href="/contact">
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Bel Nu
                  </Button>
                </Link>
              )}
            </div>

            {/* Urgency messaging */}
            {section.urgency === 'high' && (
              <div className="mt-4 text-center">
                <p className="text-orange-400 text-sm font-medium">
                  ⚡ Priority slots available - Book within 48h
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Social Proof */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center items-center mb-4">
            <Star className="w-5 h-5 mr-1" style={{ color: '#F87315' }} />
            <Star className="w-5 h-5 mr-1" style={{ color: '#F87315' }} />
            <Star className="w-5 h-5 mr-1" style={{ color: '#F87315' }} />
            <Star className="w-5 h-5 mr-1" style={{ color: '#F87315' }} />
            <Star className="w-5 h-5" style={{ color: '#F87315' }} />
          </div>
          <p className="text-white/80 italic mb-3">
            "Expert Assessment gaf ons clarity die we nodig hadden. ROI berekening was spot-on."
          </p>
          <p className="text-white/60 text-sm">
            - CTO, 250+ employees
          </p>
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-white/70 text-sm">
              <strong>92% van expert assessments</strong> leiden tot succesvolle implementatie
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}