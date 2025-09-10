'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Add Google Maps types
declare global {
  interface Window {
    google: typeof google;
    initGoogleMap?: () => void;
  }
}

interface MapSectionProps {
  className?: string;
}

// Track if script is already loading/loaded
let isScriptLoading = false;
let isScriptLoaded = false;
const loadingCallbacks: (() => void)[] = [];

export default function MapSection({ className }: MapSectionProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasApiKey] = useState(() => typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Don't load map if no API key or not mounted
    if (!hasApiKey || !mounted) {
      return;
    }

    const loadGoogleMaps = () => {
      // Check if already loaded
      if (isScriptLoaded && typeof google !== 'undefined') {
        initializeMap();
        return;
      }

      // Check if already loading
      if (isScriptLoading) {
        loadingCallbacks.push(() => initializeMap());
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        if (typeof google !== 'undefined') {
          initializeMap();
        } else {
          loadingCallbacks.push(() => initializeMap());
        }
        return;
      }

      // Start loading
      isScriptLoading = true;

      // Create script with async loading
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&loading=async&libraries=marker&callback=initGoogleMap`;
      script.async = true;
      script.defer = true;
      
      // Global callback for Google Maps
      window.initGoogleMap = () => {
        isScriptLoaded = true;
        isScriptLoading = false;
        initializeMap();
        
        // Call any pending callbacks
        loadingCallbacks.forEach(cb => cb());
        loadingCallbacks.length = 0;
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();

    return () => {
      // Cleanup
      if (markerRef.current) {
        markerRef.current.map = null;
      }
    };
  }, [hasApiKey, mounted]);

  const initializeMap = async () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      // Wait for google to be fully loaded
      if (typeof google === 'undefined' || !google.maps) {
        console.warn('Google Maps not fully loaded yet');
        return;
      }

      // GroeimetAI office location in Apeldoorn
      const officeLocation = { lat: 52.2112, lng: 5.9699 }; // Apeldoorn coordinates

      // Initialize map with better options
      // Note: When using mapId, styles are controlled via Google Cloud Console
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: officeLocation,
        zoom: 15,
        mapId: 'groeimetai_dark_map', // Required for AdvancedMarkerElement
        disableDefaultUI: false,
        gestureHandling: 'cooperative', // Better mobile handling
        // Removed styles - when mapId is present, styles are controlled via Cloud Console
      });

      // Use AdvancedMarkerElement instead of deprecated Marker
      if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
        const markerDiv = document.createElement('div');
        markerDiv.innerHTML = `
          <div style="
            width: 24px;
            height: 24px;
            background: #FF6600;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
        `;

        markerRef.current = new google.maps.marker.AdvancedMarkerElement({
          map: mapInstanceRef.current,
          position: officeLocation,
          title: 'GroeimetAI Office',
          content: markerDiv,
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #000; padding: 10px;">
              <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold;">GroeimetAI</h3>
              <p style="margin: 0; font-size: 14px;">Apeldoorn, Nederland</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                <a href="https://maps.google.com/?q=GroeimetAI+Apeldoorn" target="_blank" style="color: #FF6600; text-decoration: none;">
                  Get directions →
                </a>
              </p>
            </div>
          `,
        });

        markerRef.current.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, markerRef.current);
        });
      } else {
        // Fallback to traditional marker if AdvancedMarkerElement not available
        const fallbackMarker = new google.maps.Marker({
          position: officeLocation,
          map: mapInstanceRef.current,
          title: 'GroeimetAI Office',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#FF6600',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #000; padding: 10px;">
              <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold;">GroeimetAI</h3>
              <p style="margin: 0; font-size: 14px;">Apeldoorn, Nederland</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                <a href="https://maps.google.com/?q=GroeimetAI+Apeldoorn" target="_blank" style="color: #FF6600; text-decoration: none;">
                  Get directions →
                </a>
              </p>
            </div>
          `,
        });

        fallbackMarker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, fallbackMarker);
        });
      }

      setIsMapLoaded(true);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  // Don't render if no API key or not mounted
  if (!hasApiKey) {
    return (
      <div className={className}>
        <div className="w-full h-[400px] rounded-lg overflow-hidden relative bg-black/20 border border-white/10 flex items-center justify-center">
          <div className="text-center p-6">
            <p className="text-white/60 text-sm mb-2">Map view not available</p>
            <p className="text-white/40 text-xs">Google Maps API key not configured</p>
          </div>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className={className}>
        <div className="w-full h-[400px] rounded-lg overflow-hidden relative bg-black/20 border border-white/10 flex items-center justify-center">
          <div className="text-center p-6">
            <Loader2 className="w-8 h-8 text-white/60 animate-spin mx-auto mb-2" />
            <p className="text-white/60 text-sm">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-lg overflow-hidden relative bg-black/50"
      >
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange mx-auto mb-2" />
              <p className="text-white/60 text-sm">Loading map...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}