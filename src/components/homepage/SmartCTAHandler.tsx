'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { HomepageRouter, EntryPoint } from '@/services/homepageRouting';

export function useSmartCTA() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCTAClick = async (
    entryPoint: EntryPoint,
    userContext: any = {}
  ) => {
    setIsLoading(true);
    
    try {
      // Get routing information
      const response = await fetch('/api/homepage/route-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryPoint,
          userContext: {
            ...userContext,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const { destination, intent, trackingData } = data.routing;
        
        // Handle modal destinations
        if (destination.startsWith('modal:')) {
          const modalType = destination.split(':')[1];
          await handleModalAction(modalType);
        } else if (destination.startsWith('http')) {
          // External link
          window.open(destination, '_blank');
        } else {
          // Internal navigation
          router.push(destination);
        }

        // Track conversion funnel
        await trackConversionStep(entryPoint, intent, trackingData);
        
      } else {
        console.error('Routing failed:', data.error);
      }
      
    } catch (error) {
      console.error('CTA handling error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalAction = async (modalType: string) => {
    switch (modalType) {
      case 'account_or_guest':
        // This would open the AgentReadinessDialog
        // Implementation depends on your modal system
        break;
      default:
        console.log('Unknown modal type:', modalType);
    }
  };

  const trackConversionStep = async (
    entryPoint: EntryPoint,
    intent: string,
    trackingData: any
  ) => {
    // Send to analytics/admin dashboard
    await fetch('/api/analytics/conversion-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entryPoint,
        intent,
        trackingData,
        timestamp: new Date().toISOString()
      })
    });
  };

  return {
    handleCTAClick,
    isLoading
  };
}

// Smart Button Component
interface SmartCTAButtonProps {
  entryPoint: EntryPoint;
  children: React.ReactNode;
  className?: string;
  userContext?: any;
  onClick?: () => void;
}

export function SmartCTAButton({
  entryPoint,
  children,
  className,
  userContext = {},
  onClick
}: SmartCTAButtonProps) {
  const { handleCTAClick, isLoading } = useSmartCTA();

  const handleClick = async () => {
    if (onClick) onClick();
    await handleCTAClick(entryPoint, userContext);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {children}
    </button>
  );
}

// Usage in homepage components:
// <SmartCTAButton 
//   entryPoint="hero_assessment"
//   className="your-button-classes"
// >
//   Start Assessment
// </SmartCTAButton>