import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createBrochureDocument } from '@/components/BrochureTemplate';

export async function GET(request: NextRequest) {
  try {
    // Get locale from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const localeIndex = pathParts.indexOf('brochure') + 1;
    const locale = (pathParts[localeIndex] as 'en' | 'nl') || 'en';
    
    // Validate locale
    if (!['en', 'nl'].includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      );
    }
    
    // Import the correct translations
    const translations = await import(`@/translations/${locale}.json`);
    
    // Generate the PDF
    const document = createBrochureDocument(locale, translations.default);
    const pdfBuffer = await renderToBuffer(document);
    
    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="GroeimetAI_Brochure_${locale.toUpperCase()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}