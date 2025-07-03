'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { createBrochureDocument } from './BrochureTemplate';
import { useTranslations } from 'next-intl';

interface BrochureDownloadButtonProps {
  locale: 'en' | 'nl';
}

export function BrochureDownloadButton({ locale }: BrochureDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const t = useTranslations('serviceDetails');
  
  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      
      // Import translations
      const translations = await import(`@/translations/${locale}.json`);
      
      // Create the document
      const document = createBrochureDocument(locale, translations.default);
      
      // Generate the PDF blob
      const blob = await pdf(document).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `GroeimetAI_Brochure_${locale.toUpperCase()}.pdf`;
      
      // Trigger download
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Er is een fout opgetreden bij het genereren van de brochure. Probeer het opnieuw.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Button 
      size="lg" 
      variant="outline" 
      className="hover-lift"
      onClick={handleDownload}
      disabled={isGenerating}
    >
      <Download className="mr-2 w-5 h-5" />
      {isGenerating ? 'Genereren...' : t('downloadBrochure')}
    </Button>
  );
}