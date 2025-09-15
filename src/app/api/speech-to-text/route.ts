import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
function checkRateLimit(clientId: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = clientId;

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Get client identifier for rate limiting
function getClientId(request: NextRequest): string {
  // Use IP address or user session
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return `speech-to-text:${ip}`;
}

// Validate audio file
function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 25 * 1024 * 1024; // 25MB (OpenAI Whisper limit)
  const allowedTypes = [
    'audio/webm',
    'audio/ogg',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/m4a',
    'audio/mp4',
    'audio/flac',
  ];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Audio bestand is te groot. Maximum 25MB toegestaan.',
    };
  }

  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(webm|ogg|mp3|wav|m4a|mp4|flac)$/i)) {
    return {
      valid: false,
      error: 'Niet ondersteund audio formaat. Gebruik WebM, OGG, MP3, WAV, M4A, MP4 of FLAC.',
    };
  }

  return { valid: true };
}

// Enhanced Dutch vocabulary for better recognition
const DUTCH_VOCABULARY = [
  // Company and service names
  'GroeimetAI', 'groeimetai', 'ServiceNow', 'GenAI', 'Azure', 'ChatGPT', 'Claude',

  // Technical terms
  'kunstmatige intelligentie', 'machine learning', 'deep learning', 'neural networks',
  'automatisering', 'digitalisering', 'consultancy', 'integratie', 'orchestration',
  'multi-agent', 'chatbot', 'workflow', 'API', 'REST', 'JSON', 'microservices',
  'cloud computing', 'DevOps', 'CI/CD', 'containers', 'Kubernetes', 'Docker',

  // Business terms
  'bedrijfsproces', 'bedrijfsprocessen', 'efficiency', 'productiviteit', 'kostenbesparing',
  'innovatie', 'transformatie', 'optimalisatie', 'implementatie', 'migratie',
  'governance', 'compliance', 'security', 'beveiliging', 'privacy', 'GDPR',

  // ServiceNow specific
  'incident management', 'change management', 'service catalog', 'CMDB',
  'workflow automation', 'service portal', 'knowledge management',

  // Common Dutch business phrases
  'hoe kan ik helpen', 'wat zijn de kosten', 'kosten besparen', 'wanneer kunnen we starten',
  'wat zijn de voordelen', 'hoe lang duurt het', 'welke services', 'contact opnemen',
  'offerte aanvragen', 'demo aanvragen', 'meer informatie', 'projectplanning',
  'implementatietijd', 'ondersteuning', 'training', 'maintenance', 'licenties',
];

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientId = getClientId(request);
    if (!checkRateLimit(clientId, 10, 60000)) { // 10 requests per minute
      return NextResponse.json(
        { error: 'Te veel verzoeken. Probeer het over een minuut opnieuw.' },
        { status: 429 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'nl';
    const provider = formData.get('provider') as string || 'openai';

    // Validate required fields
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Geen audio bestand ontvangen.' },
        { status: 400 }
      );
    }

    // Validate audio file
    const validation = validateAudioFile(audioFile);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // For now, we'll focus on OpenAI Whisper implementation
    if (provider !== 'openai') {
      return NextResponse.json(
        { error: `Provider '${provider}' is nog niet geïmplementeerd. Gebruik 'openai'.` },
        { status: 400 }
      );
    }

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'Spraakherkenning service is niet geconfigureerd.' },
        { status: 500 }
      );
    }

    // Save audio file temporarily
    const tempId = randomUUID();
    const tempPath = join(tmpdir(), `speech-${tempId}.webm`);

    try {
      const arrayBuffer = await audioFile.arrayBuffer();
      await writeFile(tempPath, Buffer.from(arrayBuffer));

      // Create file for OpenAI API
      const file = await openai.audio.transcriptions.create({
        file: {
          name: audioFile.name,
          type: audioFile.type,
          // @ts-ignore - OpenAI client expects this format
          stream: () => require('fs').createReadStream(tempPath),
        } as any,
        model: 'whisper-1',
        language: language.startsWith('nl') ? 'nl' : language,
        prompt: DUTCH_VOCABULARY.join(', '), // Provide context for better recognition
        response_format: 'verbose_json',
        temperature: 0.2, // Lower temperature for more consistent results
      });

      // Clean up temp file
      await unlink(tempPath).catch(console.warn);

      // Process response
      const transcript = file.text?.trim() || '';
      const confidence = 0.85; // Whisper doesn't provide confidence scores

      if (!transcript) {
        return NextResponse.json(
          { error: 'Geen spraak gedetecteerd in het audio bestand.' },
          { status: 400 }
        );
      }

      // Enhanced response with alternatives (simulated for Whisper)
      const alternatives = [
        { transcript, confidence },
        // Could add variations or corrections here
      ];

      return NextResponse.json({
        transcript,
        confidence,
        alternatives,
        provider: 'openai',
        language: language,
        duration: file.duration || 0,
        success: true,
      });

    } catch (apiError: any) {
      // Clean up temp file on error
      await unlink(tempPath).catch(() => {});

      console.error('OpenAI API error:', apiError);

      // Handle specific OpenAI errors
      if (apiError.status === 401) {
        return NextResponse.json(
          { error: 'API authenticatie fout. Neem contact op met de beheerder.' },
          { status: 500 }
        );
      }

      if (apiError.status === 429) {
        return NextResponse.json(
          { error: 'OpenAI API limiet bereikt. Probeer het later opnieuw.' },
          { status: 429 }
        );
      }

      if (apiError.status === 413) {
        return NextResponse.json(
          { error: 'Audio bestand is te groot voor verwerking.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Spraakherkenning service tijdelijk niet beschikbaar.' },
        { status: 503 }
      );
    }

  } catch (error: any) {
    console.error('Speech-to-text error:', error);

    return NextResponse.json(
      { error: 'Onverwachte fout bij spraakherkenning.' },
      { status: 500 }
    );
  }
}

// Test endpoint for provider availability
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider') || 'openai';

  if (provider === 'openai') {
    const hasApiKey = !!process.env.OPENAI_API_KEY;

    return NextResponse.json({
      provider: 'openai',
      available: hasApiKey,
      capabilities: {
        languages: ['nl', 'nl-NL', 'nl-BE', 'en', 'en-US'],
        maxDurationSeconds: 25 * 60, // 25 minutes
        supportedFormats: ['webm', 'ogg', 'mp3', 'wav', 'm4a', 'mp4', 'flac'],
        streaming: false,
        confidence: false, // Whisper doesn't provide confidence scores
      },
      status: hasApiKey ? 'ready' : 'not_configured',
    });
  }

  return NextResponse.json(
    { error: `Provider '${provider}' niet ondersteund.` },
    { status: 400 }
  );
}

// Test endpoint
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}