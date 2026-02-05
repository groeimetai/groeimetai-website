'use client';

import { useTranslations } from 'next-intl';

// AI Provider configurations
const aiProviders = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chat.openai.com/',
    bgColor: '#74AA9C',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="white">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
      </svg>
    ),
  },
  {
    id: 'claude',
    name: 'Claude',
    url: 'https://claude.ai/new',
    bgColor: '#D97757',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
      </svg>
    ),
    // Claude star burst icon
    iconAlt: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="white">
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
        <path d="M12 6L13.2 10.8L18 12L13.2 13.2L12 18L10.8 13.2L6 12L10.8 10.8L12 6Z" fill="white" fillOpacity="0.6"/>
      </svg>
    ),
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    url: 'https://www.perplexity.ai/',
    bgColor: '#1A1A1A',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="white">
        <path d="M12 2L4 6v12l8 4 8-4V6l-8-4zm0 2.18l5.45 2.73L12 9.64 6.55 6.91 12 4.18zM6 8.27l5 2.5v7.96l-5-2.5V8.27zm12 7.96l-5 2.5V10.77l5-2.5v7.96z"/>
      </svg>
    ),
  },
  {
    id: 'gemini',
    name: 'Gemini',
    url: 'https://gemini.google.com/app',
    bgColor: '#FFFFFF',
    textColor: '#000',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <defs>
          <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4285F4"/>
            <stop offset="50%" stopColor="#9B72CB"/>
            <stop offset="100%" stopColor="#D96570"/>
          </linearGradient>
        </defs>
        <path fill="url(#geminiGrad)" d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
      </svg>
    ),
  },
  {
    id: 'cursor',
    name: 'Cursor',
    url: 'https://cursor.com/',
    bgColor: '#000000',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    ),
  },
];

interface AskAIProps {
  websiteUrl?: string;
}

export default function AskAI({ websiteUrl = 'https://groeimetai.io' }: AskAIProps) {
  const t = useTranslations('askAI');

  const getPromptUrl = (provider: typeof aiProviders[0]) => {
    const prompt = encodeURIComponent(
      t('prompt', { url: websiteUrl })
    );

    // Different providers have different URL structures for starting with a prompt
    switch (provider.id) {
      case 'chatgpt':
        return `https://chat.openai.com/?q=${prompt}`;
      case 'claude':
        return `https://claude.ai/new?q=${prompt}`;
      case 'perplexity':
        return `https://www.perplexity.ai/?q=${prompt}`;
      case 'gemini':
        return `https://gemini.google.com/app?q=${prompt}`;
      case 'cursor':
        // Cursor doesn't support URL prompts, just open the app
        return provider.url;
      default:
        return provider.url;
    }
  };

  return (
    <div className="py-8 border-t border-white/10">
      <h3 className="text-xl font-bold text-white mb-6">{t('title')}</h3>
      <div className="flex flex-wrap gap-4">
        {aiProviders.map((provider) => (
          <a
            key={provider.id}
            href={getPromptUrl(provider)}
            target="_blank"
            rel="noopener noreferrer"
            title={t('openWith', { provider: provider.name })}
            className="group relative w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
            style={{
              backgroundColor: provider.bgColor,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            {provider.icon}
            {/* Tooltip */}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-white/10 backdrop-blur-sm text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {provider.name}
            </span>
          </a>
        ))}
      </div>
      <p className="text-white/50 text-sm mt-4">
        {t('description')}
      </p>
    </div>
  );
}
