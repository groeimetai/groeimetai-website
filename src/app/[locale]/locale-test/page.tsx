import { useTranslations } from 'next-intl';

export default function LocaleTestPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('navigation');

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">Locale Test Page</h1>

        <div className="space-y-4 bg-gray-900 p-6 rounded-lg">
          <div className="flex justify-between">
            <span className="text-gray-400">URL Locale:</span>
            <span className="font-mono text-orange-500">{locale}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Translation Test (navigation.home):</span>
            <span className="font-mono text-orange-500">{t('home')}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Expected for Dutch:</span>
            <span className="font-mono text-gray-500">Home</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Expected for English:</span>
            <span className="font-mono text-gray-500">Home</span>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold">Test Links:</h2>
          <div className="space-x-4">
            <a href="/nl/locale-test" className="text-orange-500 hover:underline">
              Nederlands (/nl/locale-test)
            </a>
            <a href="/en/locale-test" className="text-orange-500 hover:underline">
              English (/en/locale-test)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
