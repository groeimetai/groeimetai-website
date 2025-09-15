'use client';

// Cloud Speech-to-Text fallback service for browsers that don't support Web Speech API
// Implements multiple providers for redundancy and better Dutch language support

export interface CloudSTTProvider {
  name: string;
  isAvailable: boolean;
  supportedLanguages: string[];
  maxDurationSeconds: number;
  supportsStreaming: boolean;
}

export interface CloudSTTOptions {
  language?: string;
  encoding?: 'webm' | 'ogg' | 'mp3' | 'wav';
  sampleRate?: number;
  enhancedModel?: boolean;
  profanityFilter?: boolean;
  enableAutomaticPunctuation?: boolean;
  provider?: 'google' | 'azure' | 'aws' | 'openai';
  customVocabulary?: string[];
}

export interface CloudSTTResult {
  transcript: string;
  confidence: number;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
  provider: string;
  language: string;
  duration: number;
}

export interface CloudSTTError {
  code: string;
  message: string;
  provider: string;
  retryable: boolean;
}

class CloudSpeechToTextService {
  private providers: CloudSTTProvider[] = [
    {
      name: 'google',
      isAvailable: true,
      supportedLanguages: ['nl-NL', 'nl-BE', 'nl'],
      maxDurationSeconds: 60,
      supportsStreaming: true,
    },
    {
      name: 'azure',
      isAvailable: true,
      supportedLanguages: ['nl-NL', 'nl-BE'],
      maxDurationSeconds: 300,
      supportsStreaming: true,
    },
    {
      name: 'openai',
      isAvailable: true,
      supportedLanguages: ['nl'],
      maxDurationSeconds: 25 * 60, // 25 minutes
      supportsStreaming: false,
    },
    {
      name: 'aws',
      isAvailable: true,
      supportedLanguages: ['nl-NL'],
      maxDurationSeconds: 240,
      supportsStreaming: true,
    },
  ];

  private apiEndpoint = '/api/speech-to-text';

  // Get available providers for a specific language
  getAvailableProviders(language: string = 'nl-NL'): CloudSTTProvider[] {
    return this.providers.filter(provider =>
      provider.isAvailable &&
      provider.supportedLanguages.some(lang =>
        lang === language || lang.startsWith(language.split('-')[0])
      )
    );
  }

  // Check if cloud STT is available as fallback
  isAvailable(): boolean {
    return this.providers.some(provider => provider.isAvailable);
  }

  // Convert audio blob to text using cloud services
  async transcribeAudio(
    audioBlob: Blob,
    options: CloudSTTOptions = {}
  ): Promise<CloudSTTResult> {
    const {
      language = 'nl-NL',
      encoding = 'webm',
      sampleRate = 44100,
      enhancedModel = true,
      profanityFilter = false,
      enableAutomaticPunctuation = true,
      provider = 'google',
      customVocabulary = this.getDefaultDutchVocabulary(),
    } = options;

    // Validate audio blob
    if (!audioBlob || audioBlob.size === 0) {
      throw this.createError(
        'INVALID_AUDIO',
        'Geen audio data ontvangen',
        provider,
        false
      );
    }

    // Check if provider supports the language
    const availableProviders = this.getAvailableProviders(language);
    let selectedProvider = availableProviders.find(p => p.name === provider);

    if (!selectedProvider) {
      selectedProvider = availableProviders[0];
      if (!selectedProvider) {
        throw this.createError(
          'NO_PROVIDER',
          `Geen beschikbare provider voor taal: ${language}`,
          provider,
          false
        );
      }
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('audio', audioBlob, `recording.${encoding}`);
    formData.append('language', language);
    formData.append('provider', selectedProvider.name);
    formData.append('sampleRate', sampleRate.toString());
    formData.append('enhancedModel', enhancedModel.toString());
    formData.append('profanityFilter', profanityFilter.toString());
    formData.append('enableAutomaticPunctuation', enableAutomaticPunctuation.toString());

    if (customVocabulary.length > 0) {
      formData.append('customVocabulary', JSON.stringify(customVocabulary));
    }

    try {
      const startTime = Date.now();

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle rate limiting
        if (response.status === 429) {
          throw this.createError(
            'RATE_LIMIT',
            'Te veel verzoeken. Probeer het later opnieuw.',
            selectedProvider.name,
            true
          );
        }

        // Handle authentication errors
        if (response.status === 401) {
          throw this.createError(
            'AUTH_ERROR',
            'Authenticatie fout bij spraakherkenning service.',
            selectedProvider.name,
            false
          );
        }

        // Handle quota exceeded
        if (response.status === 403) {
          throw this.createError(
            'QUOTA_EXCEEDED',
            'Dagelijkse limiet voor spraakherkenning bereikt.',
            selectedProvider.name,
            true
          );
        }

        throw this.createError(
          'API_ERROR',
          errorData.message || 'Onbekende fout bij spraakherkenning.',
          selectedProvider.name,
          response.status >= 500
        );
      }

      const result = await response.json();
      const duration = Date.now() - startTime;

      return {
        transcript: result.transcript || '',
        confidence: result.confidence || 0,
        alternatives: result.alternatives || [],
        provider: selectedProvider.name,
        language: language,
        duration: duration,
      };

    } catch (error) {
      if (error instanceof Error && error.name === 'CloudSTTError') {
        throw error;
      }

      // Network or other errors - try fallback provider if available
      const fallbackProviders = availableProviders.filter(p => p.name !== selectedProvider!.name);

      if (fallbackProviders.length > 0) {
        console.warn(`Provider ${selectedProvider.name} failed, trying fallback:`, error);

        return this.transcribeAudio(audioBlob, {
          ...options,
          provider: fallbackProviders[0].name as any,
        });
      }

      throw this.createError(
        'NETWORK_ERROR',
        'Netwerkfout bij spraakherkenning. Controleer uw internetverbinding.',
        selectedProvider.name,
        true
      );
    }
  }

  // Record audio and transcribe in real-time (if supported)
  async startStreamingTranscription(
    options: CloudSTTOptions = {}
  ): Promise<{
    stream: MediaStream;
    onResult: (result: Partial<CloudSTTResult>) => void;
    stop: () => void;
  }> {
    const {
      language = 'nl-NL',
      provider = 'google',
    } = options;

    // Check if streaming is supported
    const availableProviders = this.getAvailableProviders(language);
    const selectedProvider = availableProviders.find(p => p.name === provider && p.supportsStreaming);

    if (!selectedProvider) {
      throw this.createError(
        'STREAMING_NOT_SUPPORTED',
        'Real-time spraakherkenning wordt niet ondersteund.',
        provider,
        false
      );
    }

    // Get user media
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000, // Lower sample rate for streaming
      }
    });

    // This would require WebSocket implementation in the backend
    // For now, return a basic structure
    let isActive = true;

    return {
      stream,
      onResult: (callback) => {
        // Implementation would depend on WebSocket setup
        console.warn('Streaming transcription callback setup - requires WebSocket implementation');
      },
      stop: () => {
        isActive = false;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }

  // Get default Dutch vocabulary for better recognition
  private getDefaultDutchVocabulary(): string[] {
    return [
      // Company and service names
      'GroeimetAI',
      'groeimetai',
      'ServiceNow',
      'GenAI',

      // Technical terms
      'kunstmatige intelligentie',
      'machine learning',
      'automatisering',
      'digitalisering',
      'consultancy',
      'integratie',
      'orchestration',
      'multi-agent',
      'chatbot',
      'workflow',
      'API',
      'REST',
      'JSON',

      // Business terms
      'bedrijfsproces',
      'efficiency',
      'productiviteit',
      'kostenbesparing',
      'innovatie',
      'transformatie',
      'optimalisatie',
      'implementatie',

      // Common phrases
      'hoe kan ik helpen',
      'wat zijn de kosten',
      'wanneer kunnen we starten',
      'wat zijn de voordelen',
      'hoe lang duurt het',
      'welke services',
      'contact opnemen',
    ];
  }

  // Create standardized error
  private createError(
    code: string,
    message: string,
    provider: string,
    retryable: boolean
  ): CloudSTTError {
    const error = new Error(message) as any;
    error.name = 'CloudSTTError';
    error.code = code;
    error.provider = provider;
    error.retryable = retryable;
    return error;
  }

  // Test provider availability
  async testProvider(provider: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiEndpoint}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      });

      return response.ok;
    } catch (error) {
      console.warn(`Provider ${provider} test failed:`, error);
      return false;
    }
  }

  // Get provider status and capabilities
  async getProviderStatus(): Promise<{
    available: CloudSTTProvider[];
    errors: Array<{ provider: string; error: string }>;
  }> {
    const available: CloudSTTProvider[] = [];
    const errors: Array<{ provider: string; error: string }> = [];

    for (const provider of this.providers) {
      try {
        const isAvailable = await this.testProvider(provider.name);
        if (isAvailable) {
          available.push(provider);
        } else {
          errors.push({
            provider: provider.name,
            error: 'Service niet beschikbaar'
          });
        }
      } catch (error) {
        errors.push({
          provider: provider.name,
          error: error instanceof Error ? error.message : 'Onbekende fout'
        });
      }
    }

    return { available, errors };
  }
}

export const cloudSpeechToText = new CloudSpeechToTextService();
export default cloudSpeechToText;