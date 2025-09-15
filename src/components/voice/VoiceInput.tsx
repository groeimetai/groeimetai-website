'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Volume2, VolumeX, AlertTriangle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceRecognition, VoiceRecognitionOptions } from '@/hooks/useVoiceRecognition';
import { VoiceRecordingButton } from './VoiceRecordingButton';
import { VoiceActivityIndicator } from './VoiceActivityIndicator';
import { cloudSpeechToText, CloudSTTOptions } from '@/services/cloudSpeechToText';

interface VoiceInputProps {
  onTranscript: (transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
  onStatusChange?: (isListening: boolean) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'minimal' | 'full' | 'compact';
  pushToTalk?: boolean;
  continuous?: boolean;
  autoSubmit?: boolean;
  showTranscript?: boolean;
  showSettings?: boolean;
  language?: string;
  disabled?: boolean;
}

interface VoiceSettings {
  pushToTalk: boolean;
  continuous: boolean;
  autoSubmit: boolean;
  sensitivity: number;
  language: string;
  useCloudFallback: boolean;
  noiseReduction: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onError,
  onStatusChange,
  placeholder = 'Druk op de microfoon om te spreken...',
  className,
  size = 'md',
  variant = 'full',
  pushToTalk: initialPushToTalk = false,
  continuous: initialContinuous = false,
  autoSubmit: initialAutoSubmit = true,
  showTranscript = true,
  showSettings = true,
  language: initialLanguage = 'nl-NL',
  disabled = false,
}) => {
  const [settings, setSettings] = useState<VoiceSettings>({
    pushToTalk: initialPushToTalk,
    continuous: initialContinuous,
    autoSubmit: initialAutoSubmit,
    sensitivity: 0.5,
    language: initialLanguage,
    useCloudFallback: true,
    noiseReduction: true,
  });

  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [isUsingCloudSTT, setIsUsingCloudSTT] = useState(false);
  const [cloudSTTStatus, setCloudSTTStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Voice recognition options
  const voiceOptions: VoiceRecognitionOptions = {
    language: settings.language,
    continuous: settings.continuous,
    interimResults: true,
    maxAlternatives: 3,
    confidenceThreshold: 0.6,
    autoStop: !settings.continuous,
    autoStopTimeout: 3000,
    pushToTalk: settings.pushToTalk,
  };

  const {
    isSupported,
    isListening,
    isRecording,
    error,
    transcript,
    interimTranscript,
    confidence,
    permission,
    startListening,
    stopListening,
    clearTranscript,
    requestPermission,
    setLanguage,
  } = useVoiceRecognition(voiceOptions);

  // Initialize cloud STT fallback if Web Speech API is not supported
  const shouldUseCloudSTT = !isSupported && settings.useCloudFallback;

  useEffect(() => {
    if (transcript && settings.autoSubmit) {
      onTranscript(transcript, confidence);
      clearTranscript();
    }
  }, [transcript, settings.autoSubmit, confidence, onTranscript, clearTranscript]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  useEffect(() => {
    onStatusChange?.(isListening || cloudSTTStatus === 'recording');
  }, [isListening, cloudSTTStatus, onStatusChange]);

  useEffect(() => {
    setLanguage(settings.language);
  }, [settings.language, setLanguage]);

  // Cloud STT recording functions
  const startCloudRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      onError?.('Microphone wordt niet ondersteund in deze browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: settings.noiseReduction,
          noiseSuppression: settings.noiseReduction,
          autoGainControl: true,
          sampleRate: 44100,
        }
      });

      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorderRef.current?.mimeType || 'audio/webm'
        });

        setRecordingBlob(audioBlob);
        await processCloudSTT(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setCloudSTTStatus('recording');

    } catch (error) {
      onError?.('Kon microphone niet activeren: ' + (error as Error).message);
    }
  };

  const stopCloudRecording = () => {
    if (mediaRecorderRef.current && cloudSTTStatus === 'recording') {
      mediaRecorderRef.current.stop();
      setCloudSTTStatus('processing');
    }
  };

  const processCloudSTT = async (audioBlob: Blob) => {
    try {
      setCloudSTTStatus('processing');

      const cloudOptions: CloudSTTOptions = {
        language: settings.language,
        encoding: audioBlob.type.includes('webm') ? 'webm' : 'ogg',
        enhancedModel: true,
        enableAutomaticPunctuation: true,
        profanityFilter: false,
        customVocabulary: [], // Could add business terms here
      };

      const result = await cloudSpeechToText.transcribeAudio(audioBlob, cloudOptions);

      if (result.transcript) {
        onTranscript(result.transcript, result.confidence);
      } else {
        onError?.('Geen spraak gedetecteerd.');
      }

    } catch (error: any) {
      console.error('Cloud STT error:', error);
      onError?.('Spraakherkenning fout: ' + error.message);
    } finally {
      setCloudSTTStatus('idle');
      setRecordingBlob(null);
    }
  };

  // Main voice input handlers
  const handleStartListening = async () => {
    if (disabled) return;

    if (shouldUseCloudSTT) {
      await startCloudRecording();
      setIsUsingCloudSTT(true);
    } else {
      await startListening();
      setIsUsingCloudSTT(false);
    }
  };

  const handleStopListening = () => {
    if (shouldUseCloudSTT && cloudSTTStatus === 'recording') {
      stopCloudRecording();
    } else if (isListening) {
      stopListening();
    }
  };

  const handleRequestPermission = async () => {
    if (shouldUseCloudSTT) {
      // For cloud STT, we just need basic microphone permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        onError?.('Microphone toegang geweigerd.');
      }
    } else {
      await requestPermission();
    }
  };

  // Settings handlers
  const handleSettingChange = (key: keyof VoiceSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleSettings = () => {
    setShowSettingsPanel(!showSettingsPanel);
  };

  // Render settings panel
  const renderSettingsPanel = () => {
    if (!showSettingsPanel) return null;

    return (
      <div className="absolute bottom-full left-0 right-0 mb-2 bg-black/90 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
        <h4 className="text-white font-medium mb-3">Voice Settings</h4>

        <div className="space-y-3">
          {/* Language Selection */}
          <div>
            <label className="block text-xs text-white/70 mb-1">Taal</label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded text-white text-xs p-2"
            >
              <option value="nl-NL">Nederlands (Nederland)</option>
              <option value="nl-BE">Nederlands (België)</option>
              <option value="nl">Nederlands (Algemeen)</option>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
            </select>
          </div>

          {/* Push to Talk */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.pushToTalk}
              onChange={(e) => handleSettingChange('pushToTalk', e.target.checked)}
              className="rounded"
            />
            <span className="text-xs text-white">Push to talk</span>
          </label>

          {/* Continuous Listening */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.continuous}
              onChange={(e) => handleSettingChange('continuous', e.target.checked)}
              className="rounded"
            />
            <span className="text-xs text-white">Continu luisteren</span>
          </label>

          {/* Auto Submit */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.autoSubmit}
              onChange={(e) => handleSettingChange('autoSubmit', e.target.checked)}
              className="rounded"
            />
            <span className="text-xs text-white">Auto verzenden</span>
          </label>

          {/* Cloud Fallback */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.useCloudFallback}
              onChange={(e) => handleSettingChange('useCloudFallback', e.target.checked)}
              className="rounded"
            />
            <span className="text-xs text-white">Cloud fallback</span>
          </label>

          {/* Noise Reduction */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.noiseReduction}
              onChange={(e) => handleSettingChange('noiseReduction', e.target.checked)}
              className="rounded"
            />
            <span className="text-xs text-white">Ruis onderdrukking</span>
          </label>

          {/* Sensitivity Slider */}
          <div>
            <label className="block text-xs text-white/70 mb-1">
              Gevoeligheid: {Math.round(settings.sensitivity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.sensitivity}
              onChange={(e) => handleSettingChange('sensitivity', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  };

  // Get current status
  const getCurrentStatus = () => {
    if (disabled) return 'Uitgeschakeld';
    if (cloudSTTStatus === 'processing') return 'Verwerken...';
    if (cloudSTTStatus === 'recording') return 'Opnemen...';
    if (isListening) return 'Luisteren...';
    if (!isSupported && !shouldUseCloudSTT) return 'Niet ondersteund';
    if (permission === 'denied') return 'Toegang geweigerd';
    if (permission !== 'granted') return 'Klik om te activeren';
    return 'Klaar voor spraak';
  };

  const isActiveListening = isListening || cloudSTTStatus === 'recording';
  const isProcessing = cloudSTTStatus === 'processing';

  return (
    <div className={cn('relative', className)}>
      {renderSettingsPanel()}

      <div className="flex items-center space-x-2">
        {/* Main Voice Button */}
        <VoiceRecordingButton
          isListening={isActiveListening}
          isRecording={isActiveListening}
          isSupported={isSupported || shouldUseCloudSTT}
          error={error}
          permission={permission}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
          onRequestPermission={handleRequestPermission}
          size={size}
          pushToTalk={settings.pushToTalk}
          disabled={disabled || isProcessing}
        />

        {/* Voice Activity Indicator */}
        {variant === 'full' && (
          <VoiceActivityIndicator
            isActive={isActiveListening}
            sensitivity={settings.sensitivity}
            size={size}
            type="linear"
            color="orange"
          />
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center space-x-2 text-orange">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Verwerken...</span>
          </div>
        )}

        {/* Settings Button */}
        {showSettings && variant === 'full' && (
          <button
            onClick={toggleSettings}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Voice instellingen"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status and Transcript Display */}
      {variant !== 'minimal' && (
        <div className="mt-2">
          {/* Status */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs text-white/60">{getCurrentStatus()}</span>
            {isUsingCloudSTT && (
              <span className="text-xs text-blue-400 bg-blue-400/20 px-2 py-0.5 rounded">
                Cloud STT
              </span>
            )}
            {error && (
              <AlertTriangle className="w-3 h-3 text-red-400" />
            )}
          </div>

          {/* Live Transcript */}
          {showTranscript && (transcript || interimTranscript) && (
            <div className="bg-white/10 rounded-lg p-2 text-sm text-white">
              <span className="text-white">{transcript}</span>
              <span className="text-white/60 italic">{interimTranscript}</span>
            </div>
          )}

          {/* Confidence Score */}
          {confidence > 0 && (
            <div className="text-xs text-white/60 mt-1">
              Betrouwbaarheid: {Math.round(confidence * 100)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceInput;