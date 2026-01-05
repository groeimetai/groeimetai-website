'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// Types for Speech Recognition API
interface SpeechRecognitionResult {
  [index: number]: {
    transcript: string;
    confidence: number;
  };
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export interface VoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  confidenceThreshold?: number;
  autoStop?: boolean;
  autoStopTimeout?: number;
  pushToTalk?: boolean;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: Array<{ transcript: string; confidence: number }>;
}

export interface VoiceRecognitionState {
  isSupported: boolean;
  isListening: boolean;
  isRecording: boolean;
  error: string | null;
  transcript: string;
  interimTranscript: string;
  confidence: number;
  permission: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export interface VoiceRecognitionActions {
  startListening: () => Promise<void>;
  stopListening: () => void;
  clearTranscript: () => void;
  requestPermission: () => Promise<void>;
  setLanguage: (language: string) => void;
  togglePushToTalk: () => void;
}

const DEFAULT_OPTIONS: VoiceRecognitionOptions = {
  language: 'nl-NL', // Dutch (Netherlands) as default
  continuous: false,
  interimResults: true,
  maxAlternatives: 3,
  confidenceThreshold: 0.6,
  autoStop: true,
  autoStopTimeout: 3000, // 3 seconds of silence
  pushToTalk: false,
};

// Dutch language variants and dialects
const DUTCH_LANGUAGE_CODES = [
  'nl-NL', // Netherlands Dutch
  'nl-BE', // Belgian Dutch (Flemish)
  'nl',    // Generic Dutch
];

// Business/tech terms that should be recognized better in Dutch
const DUTCH_TECH_GRAMMAR = [
  'AI', 'kunstmatige intelligentie', 'machine learning', 'ServiceNow',
  'GenAI', 'chatbot', 'automatisering', 'digitalisering', 'consultancy',
  'GroeimetAI', 'groeimetai', 'multi-agent', 'orchestration', 'integratie',
];

export const useVoiceRecognition = (options: VoiceRecognitionOptions = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [state, setState] = useState<VoiceRecognitionState>({
    isSupported: false,
    isListening: false,
    isRecording: false,
    error: null,
    transcript: '',
    interimTranscript: '',
    confidence: 0,
    permission: 'unknown',
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Initialize speech recognition on mount
  useEffect(() => {
    const initializeSpeechRecognition = () => {
      if (typeof window === 'undefined') return;

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        setState(prev => ({ ...prev, isSupported: true }));
        recognitionRef.current = new SpeechRecognition();

        // Configure recognition
        if (recognitionRef.current) {
          recognitionRef.current.continuous = opts.continuous || false;
          recognitionRef.current.interimResults = opts.interimResults || true;
          recognitionRef.current.maxAlternatives = opts.maxAlternatives || 3;
          recognitionRef.current.lang = opts.language || 'nl-NL';
        }
      } else {
        setState(prev => ({
          ...prev,
          isSupported: false,
          error: 'Speech Recognition API wordt niet ondersteund in deze browser. Probeer Chrome, Edge of Safari.'
        }));
      }
    };

    initializeSpeechRecognition();
    checkMicrophonePermission();
  }, [opts.continuous, opts.interimResults, opts.maxAlternatives, opts.language]);

  // Check microphone permission
  const checkMicrophonePermission = async () => {
    if (typeof window === 'undefined' || !navigator.permissions) {
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setState(prev => ({ ...prev, permission: permission.state }));

      permission.onchange = () => {
        setState(prev => ({ ...prev, permission: permission.state }));
      };
    } catch (error) {
      console.warn('Unable to check microphone permission:', error);
    }
  };

  // Request microphone permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      setState(prev => ({ ...prev, permission: 'granted', error: null }));

      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error: any) {
      let errorMessage = 'Microphone toegang geweigerd.';

      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone toegang geweigerd. Schakel de microphone in via de browser instellingen.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Geen microphone gevonden. Controleer of een microphone is aangesloten.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Microphone is al in gebruik door een andere applicatie.';
      }

      setState(prev => ({
        ...prev,
        permission: 'denied',
        error: errorMessage
      }));
      return false;
    }
  }, []);

  // Setup audio context for voice activity detection
  const setupAudioContext = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        }
      });

      mediaStreamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      source.connect(analyserRef.current);

      return true;
    } catch (error) {
      console.error('Failed to setup audio context:', error);
      return false;
    }
  }, []);

  // Voice activity detection
  const detectVoiceActivity = useCallback(() => {
    if (!analyserRef.current) return false;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate RMS (Root Mean Square) for voice activity
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / bufferLength);

    // Threshold for voice activity (adjust based on testing)
    return rms > 10;
  }, []);

  // Auto-stop listening after silence
  const handleAutoStop = useCallback(() => {
    if (opts.autoStop && recognitionRef.current) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (state.isListening && !detectVoiceActivity()) {
          stopListening();
        }
      }, opts.autoStopTimeout || 3000);
    }
  }, [opts.autoStop, opts.autoStopTimeout, state.isListening]);

  // Setup speech recognition event handlers
  const setupRecognitionHandlers = useCallback(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.onstart = () => {
      setState(prev => ({
        ...prev,
        isListening: true,
        isRecording: true,
        error: null
      }));
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let bestConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0;

        if (result.isFinal) {
          finalTranscript += transcript;
          bestConfidence = Math.max(bestConfidence, confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      setState(prev => ({
        ...prev,
        transcript: prev.transcript + finalTranscript,
        interimTranscript,
        confidence: bestConfidence,
      }));

      // Reset auto-stop timer on speech
      if (finalTranscript || interimTranscript) {
        handleAutoStop();
      }
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'Spraakherkenning fout opgetreden.';

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'Geen spraak gedetecteerd. Probeer opnieuw te spreken.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone kon niet worden gebruikt.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone toegang geweigerd.';
          break;
        case 'network':
          errorMessage = 'Netwerkfout bij spraakherkenning.';
          break;
        case 'language-not-supported':
          errorMessage = 'Nederlandse spraakherkenning wordt niet ondersteund.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Spraakherkenning service niet beschikbaar.';
          break;
        default:
          errorMessage = `Spraakherkenning fout: ${event.error}`;
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isListening: false,
        isRecording: false,
      }));
    };

    recognitionRef.current.onend = () => {
      setState(prev => ({
        ...prev,
        isListening: false,
        isRecording: false,
      }));

      // Clean up audio context
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [handleAutoStop]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!recognitionRef.current || state.isListening) return;

    // Check permission first
    if (state.permission !== 'granted') {
      const permissionGranted = await requestPermission();
      if (!permissionGranted) {
        return;
      }
    }

    try {
      // Setup audio context for voice activity detection
      if (opts.autoStop) {
        await setupAudioContext();
      }

      // Clear any existing transcript
      setState(prev => ({
        ...prev,
        transcript: '',
        interimTranscript: '',
        error: null,
      }));

      // Setup event handlers
      setupRecognitionHandlers();

      // Try different Dutch language variants
      let started = false;
      for (const langCode of DUTCH_LANGUAGE_CODES) {
        if (started) break;

        try {
          recognitionRef.current.lang = langCode;
          recognitionRef.current.start();
          started = true;
        } catch (error) {
          console.warn(`Failed to start recognition with ${langCode}:`, error);
        }
      }

      if (!started) {
        throw new Error('Could not start speech recognition with any Dutch language variant');
      }

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: 'Spraakherkenning kon niet worden gestart: ' + (error.message || error),
        isListening: false,
        isRecording: false,
      }));
    }
  }, [
    state.isListening,
    state.permission,
    requestPermission,
    setupAudioContext,
    setupRecognitionHandlers,
    opts.autoStop
  ]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Clean up audio context
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [state.isListening]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      confidence: 0,
      error: null,
    }));
  }, []);

  // Set language
  const setLanguage = useCallback((language: string) => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, []);

  // Toggle push-to-talk mode
  const togglePushToTalk = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.continuous = !opts.pushToTalk;
    }
  }, [opts.pushToTalk]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [stopListening]);

  return {
    ...state,
    startListening,
    stopListening,
    clearTranscript,
    requestPermission,
    setLanguage,
    togglePushToTalk,
  };
};

export default useVoiceRecognition;