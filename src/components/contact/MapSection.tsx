'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface MapSectionProps {
  className?: string;
}

export default function MapSection({ className }: MapSectionProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (typeof google !== 'undefined' && mapRef.current && !mapInstanceRef.current) {
      initializeMap();
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (mapRef.current) {
        initializeMap();
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current) return;

    // GroeimetAI office location in Apeldoorn
    const officeLocation = { lat: 52.2112, lng: 5.9699 }; // Apeldoorn coordinates

    // Initialize map
    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center: officeLocation,
      zoom: 15,
      styles: [
        {
          featureType: 'all',
          elementType: 'all',
          stylers: [{ invert_lightness: true }, { saturation: -100 }, { lightness: 33 }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#1a1a1a' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#2a2a2a' }],
        },
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    // Add marker
    markerRef.current = new google.maps.Marker({
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
  };

  return (
    <div className={className}>
      <div 
        ref={mapRef} 
        className="w-full h-[400px] rounded-lg overflow-hidden relative bg-black/50"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange mx-auto mb-2" />
            <p className="text-white/60 text-sm">Loading map...</p>
          </div>
        </div>
      </div>
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-500">
            Map requires Google Maps API key. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment.
          </p>
        </div>
      )}
    </div>
  );
}