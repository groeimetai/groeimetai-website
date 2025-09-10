'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GoogleMapEmbedProps {
  className?: string;
}

export default function GoogleMapEmbed({ className }: GoogleMapEmbedProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [mounted, setMounted] = useState(false);

  const GROEIMETAI_LOCATION = {
    lat: 52.2112,
    lng: 5.9699,
    address: "Apeldoorn, Nederland"
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      return;
    }

    let isMounted = true;

    const initMap = async () => {
      try {
        // Check if Google Maps is already loaded
        if (typeof google !== 'undefined' && google.maps) {
          createMap();
          return;
        }

        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          if (isMounted) {
            createMap();
          }
        };

        script.onerror = () => {
          if (isMounted) {
            setHasError(true);
            setIsLoaded(false);
          }
        };

        document.head.appendChild(script);

        // Cleanup function
        return () => {
          isMounted = false;
          const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
          if (existingScript) {
            existingScript.remove();
          }
        };

      } catch (error) {
        console.error('Google Maps loading error:', error);
        if (isMounted) {
          setHasError(true);
        }
      }
    };

    const createMap = () => {
      if (!mapRef.current || !isMounted) return;

      try {
        // Create map without mapId to avoid styling conflicts
        const map = new google.maps.Map(mapRef.current, {
          center: GROEIMETAI_LOCATION,
          zoom: 15,
          // Remove mapId to allow custom styling
          styles: [
            {
              featureType: 'all',
              elementType: 'geometry',
              stylers: [{ color: '#1a1a1a' }]
            },
            {
              featureType: 'all',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#ffffff' }]
            },
            {
              featureType: 'all',
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#1a1a1a' }]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#0a0a0a' }]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#2a2a2a' }]
            },
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          disableDefaultUI: false,
          gestureHandling: 'cooperative',
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: true,
          rotateControl: false,
          fullscreenControl: true
        });

        // Add custom marker
        const marker = new google.maps.Marker({
          position: GROEIMETAI_LOCATION,
          map: map,
          title: 'GroeimetAI',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#F87315',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          }
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #000; padding: 15px; font-family: system-ui, sans-serif;">
              <div style="margin-bottom: 10px;">
                <img src="https://groeimetai.io/groeimet-ai-logo.svg" alt="GroeimetAI" style="height: 25px; width: auto;" />
              </div>
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #F87315;">GroeimetAI</h3>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">AI Infrastructure Specialists</p>
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280;">
                <strong>📍 Locatie:</strong> Apeldoorn, Nederland<br>
                <strong>📧 Email:</strong> info@groeimetai.com<br>
                <strong>📞 Telefoon:</strong> +31 6 12345678
              </p>
              <a href="https://maps.google.com/?q=GroeimetAI+Apeldoorn" target="_blank" 
                 style="display: inline-block; background: #F87315; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 12px;">
                🗺️ Routebeschrijving →
              </a>
            </div>
          `
        });

        // Show info window on marker click
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        // Auto-open info window after 2 seconds
        setTimeout(() => {
          if (isMounted) {
            infoWindow.open(map, marker);
          }
        }, 2000);

        if (isMounted) {
          setIsLoaded(true);
          setHasError(false);
        }

      } catch (mapError) {
        console.error('Google Maps creation error:', mapError);
        if (isMounted) {
          setHasError(true);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [mounted]);

  // Don't render until mounted
  if (!mounted) {
    return (
      <div className={className}>
        <div className="w-full h-[400px] rounded-lg overflow-hidden relative bg-black/20 border border-white/10 flex items-center justify-center">
          <div className="text-center p-6">
            <Loader2 className="w-8 h-8 text-white/60 animate-spin mx-auto mb-2" />
            <p className="text-white/60 text-sm">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // No API key fallback
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className={className}>
        <div className="w-full h-[400px] rounded-lg overflow-hidden relative bg-black/20 border border-white/10">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <MapPin className="w-12 h-12 text-orange mb-4" />
            <h3 className="text-white font-semibold mb-2">GroeimetAI Kantoor</h3>
            <p className="text-white/70 mb-4">Apeldoorn, Nederland</p>
            <Button asChild className="bg-orange text-white">
              <a 
                href="https://maps.google.com/?q=GroeimetAI+Apeldoorn" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Google Maps
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Error fallback
  if (hasError) {
    return (
      <div className={className}>
        <div className="w-full h-[400px] rounded-lg overflow-hidden relative bg-black/20 border border-white/10">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <MapPin className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-white/60 text-sm mb-4">Map could not be loaded</p>
            <Button asChild variant="outline" className="border-white/20 text-white">
              <a 
                href="https://maps.google.com/?q=GroeimetAI+Apeldoorn" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Google Maps
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-white/10">
        {/* Loading overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
              <p className="text-white/70 text-sm">Loading interactive map...</p>
            </div>
          </div>
        )}
        
        {/* Map container */}
        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ 
            background: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)', 
            borderRadius: '0.5rem' 
          }}
        />

        {/* Map overlay info */}
        {isLoaded && (
          <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange" />
              <div>
                <p className="text-white font-medium text-sm">GroeimetAI</p>
                <p className="text-white/60 text-xs">Apeldoorn, Nederland</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}