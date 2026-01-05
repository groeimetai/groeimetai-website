import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <span className="text-9xl font-bold text-gray-200">404</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pagina niet gevonden
        </h1>
        <p className="text-gray-600 mb-8">
          De pagina die je zoekt bestaat niet of is verplaatst. Controleer de URL
          of ga terug naar de homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Naar homepage
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Contact opnemen
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Misschien zoek je:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/services"
              className="text-sm text-blue-600 hover:underline"
            >
              Onze diensten
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/about"
              className="text-sm text-blue-600 hover:underline"
            >
              Over ons
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/pricing"
              className="text-sm text-blue-600 hover:underline"
            >
              Prijzen
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/blog" className="text-sm text-blue-600 hover:underline">
              Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
