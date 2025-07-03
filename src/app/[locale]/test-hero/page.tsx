'use client';

import ParticleBackground from '@/components/landing/ParticleBackground';
import { useState, useEffect } from 'react';

export default function TestHeroPage() {
  const [fps, setFps] = useState(0);
  const [deviceInfo, setDeviceInfo] = useState('');

  useEffect(() => {
    // Device detection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasTouch = 'ontouchstart' in window;
    const pixelRatio = window.devicePixelRatio || 1;

    setDeviceInfo(
      `${isMobile ? 'Mobile' : 'Desktop'} | Touch: ${hasTouch ? 'Yes' : 'No'} | DPR: ${pixelRatio}`
    );

    // FPS counter
    let frameCount = 0;
    let lastTime = performance.now();

    const updateFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(updateFPS);
    };

    updateFPS();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <ParticleBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-8">
        <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Premium Hero Animation
        </h1>

        <p className="text-xl mb-8 text-center max-w-2xl opacity-90">
          Beweeg je muis over het scherm om de interactieve particle effecten te ervaren. Op touch
          devices, gebruik je vinger om te interageren.
        </p>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Features:</h3>
            <ul className="space-y-1 opacity-80">
              <li>✓ Mouse tracking & gravity</li>
              <li>✓ Smooth trail effect</li>
              <li>✓ Glow effect rond cursor</li>
              <li>✓ Parallax depth perception</li>
              <li>✓ Dynamic connections</li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Performance:</h3>
            <ul className="space-y-1 opacity-80">
              <li>
                FPS: <span className="font-mono text-green-400">{fps}</span>
              </li>
              <li>
                Device: <span className="font-mono text-blue-400">{deviceInfo}</span>
              </li>
              <li>✓ 60fps optimized</li>
              <li>✓ Touch support</li>
              <li>✓ Reduced motion support</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Reset Animation
          </button>

          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Terug
          </button>
        </div>
      </div>
    </div>
  );
}
