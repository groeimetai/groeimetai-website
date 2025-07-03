'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie, Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const COOKIE_CONSENT_KEY = 'groeimetai-cookie-consent';
const COOKIE_PREFERENCES_KEY = 'groeimetai-cookie-preferences';

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsented) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
        applyCookiePreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Apply analytics scripts
    if (prefs.analytics) {
      // Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      }

      // Enable Sentry
      if (typeof window !== 'undefined' && window.Sentry) {
        window.Sentry.setUser({ id: 'anonymous' });
      }
    } else {
      // Disable analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      }

      // Disable Sentry
      if (typeof window !== 'undefined' && window.Sentry) {
        window.Sentry.setUser(null);
      }
    }

    // Apply marketing scripts
    if (prefs.marketing) {
      // Enable marketing cookies
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
        });
      }
    } else {
      // Disable marketing cookies
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      }
    }

    // Apply functional preferences
    if (prefs.functional) {
      // Enable features like chat, remembering preferences
      localStorage.setItem('functional-cookies-enabled', 'true');
    } else {
      // Disable non-essential features
      localStorage.removeItem('functional-cookies-enabled');
    }
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };

    setPreferences(allAccepted);
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(allAccepted));
    applyCookiePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleAcceptSelected = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    applyCookiePreferences(preferences);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const rejected = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };

    setPreferences(rejected);
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(rejected));
    applyCookiePreferences(rejected);
    setShowBanner(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Can't disable necessary cookies

    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 md:p-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-2xl bg-background/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/80 border">
              <div className="flex items-start justify-between p-6 sm:p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Cookie className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Cookie Preferences</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      We use cookies to enhance your experience, analyze site traffic, and
                      personalize content. By clicking &quot;Accept All&quot;, you consent to our
                      use of cookies.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={handleAcceptAll}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        Accept All
                      </button>
                      <button
                        onClick={handleRejectAll}
                        className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        Reject All
                      </button>
                      <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="inline-flex items-center space-x-2 text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                      >
                        <span>Customize</span>
                        {showDetails ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <AnimatePresence>
                      {showDetails && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-6 space-y-4 overflow-hidden"
                        >
                          <div className="space-y-3">
                            {/* Necessary Cookies */}
                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                id="necessary"
                                checked={preferences.necessary}
                                disabled
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                              />
                              <div className="flex-1">
                                <label htmlFor="necessary" className="block text-sm font-medium">
                                  Necessary Cookies
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  Essential for the website to function properly. Cannot be
                                  disabled.
                                </p>
                              </div>
                            </div>

                            {/* Analytics Cookies */}
                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                id="analytics"
                                checked={preferences.analytics}
                                onChange={() => togglePreference('analytics')}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor="analytics"
                                  className="block text-sm font-medium cursor-pointer"
                                >
                                  Analytics Cookies
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  Help us understand how visitors interact with our website.
                                </p>
                              </div>
                            </div>

                            {/* Marketing Cookies */}
                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                id="marketing"
                                checked={preferences.marketing}
                                onChange={() => togglePreference('marketing')}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor="marketing"
                                  className="block text-sm font-medium cursor-pointer"
                                >
                                  Marketing Cookies
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  Used to deliver personalized advertisements.
                                </p>
                              </div>
                            </div>

                            {/* Functional Cookies */}
                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                id="functional"
                                checked={preferences.functional}
                                onChange={() => togglePreference('functional')}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor="functional"
                                  className="block text-sm font-medium cursor-pointer"
                                >
                                  Functional Cookies
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  Enable enhanced functionality and personalization.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <a
                              href="/privacy-policy"
                              className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                            >
                              Privacy Policy
                            </a>
                            <button
                              onClick={handleAcceptSelected}
                              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                              Save Preferences
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <button
                  onClick={() => setShowBanner(false)}
                  className="flex-shrink-0 rounded-lg p-1 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Close cookie banner"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Trust Badge */}
              <div className="border-t bg-muted/50 px-6 py-3 sm:px-8">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>
                    Your privacy is important to us. We comply with GDPR and CCPA regulations.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook to check cookie consent status
export const useCookieConsent = () => {
  const [hasConsented, setHasConsented] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    setHasConsented(!!consent);

    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  return { hasConsented, preferences };
};

// TypeScript declarations for global objects
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    Sentry?: any;
  }
}
