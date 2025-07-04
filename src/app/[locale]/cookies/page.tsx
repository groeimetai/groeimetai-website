import { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/i18n/routing';
import {
  Cookie,
  Info,
  Shield,
  Settings,
  Globe,
  FileText,
  Mail,
  Phone,
  ExternalLink,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cookiebeleid - GroeimetAI',
  description:
    'Lees hoe GroeimetAI cookies gebruikt om uw ervaring te verbeteren en hoe u cookies kunt beheren.',
  openGraph: {
    title: 'Cookiebeleid - GroeimetAI',
    description: 'Transparantie over ons cookiegebruik in overeenstemming met de AVG/GDPR.',
  },
};

const sections = [
  {
    id: 'what-are-cookies',
    title: 'Wat zijn cookies?',
    icon: Cookie,
    content: `Cookies zijn kleine tekstbestanden die op uw computer of mobiele apparaat worden opgeslagen wanneer u een website bezoekt. Ze worden breed gebruikt om websites te laten werken of efficiënter te laten werken, evenals om informatie aan de eigenaren van de website te verstrekken.

    Cookies maken het mogelijk dat een website uw acties of voorkeuren in de loop van de tijd onthoudt. Ze kunnen informatie bevatten over uw taalkeuze, lettergrootte en andere voorkeuren, zodat u deze niet telkens opnieuw hoeft in te voeren wanneer u de website bezoekt of van de ene pagina naar de andere navigeert.`,
  },
  {
    id: 'how-we-use',
    title: 'Hoe wij cookies gebruiken',
    icon: Info,
    content: `GroeimetAI gebruikt cookies om:

    • De prestaties van onze website te verbeteren
    • Uw voorkeuren en instellingen te onthouden
    • U aan te melden en uw sessie veilig te houden
    • Het gebruik van onze website te analyseren en te begrijpen
    • Onze diensten te personaliseren
    • De effectiviteit van onze marketingcampagnes te meten
    • Fraude te voorkomen en de veiligheid te verbeteren

    Wij respecteren uw privacy en zullen cookies alleen gebruiken zoals beschreven in dit beleid en in overeenstemming met de AVG/GDPR en de Nederlandse Telecommunicatiewet.`,
  },
  {
    id: 'types-of-cookies',
    title: 'Soorten cookies die wij gebruiken',
    icon: Settings,
    content: `Wij gebruiken de volgende categorieën cookies op onze website:`,
  },
  {
    id: 'third-party',
    title: 'Cookies van derden',
    icon: Globe,
    content: `Sommige van onze pagina's kunnen cookies van derden bevatten. Deze worden geplaatst door externe dienstverleners die ons helpen onze website te analyseren, te beveiligen of functionaliteit te bieden.

    Belangrijke derde partijen waarvan wij cookies gebruiken:

    • Google Analytics - Voor websiteanalyse
    • Google reCAPTCHA - Voor beveiliging tegen spam
    • Stripe - Voor veilige betalingsverwerking
    • Intercom - Voor klantenservice chat

    Deze derden hebben hun eigen privacybeleid en cookiebeleid. Wij hebben geen controle over deze cookies en verwijzen u naar hun respectievelijke beleidsregels voor meer informatie.`,
  },
  {
    id: 'cookie-management',
    title: 'Cookies beheren en verwijderen',
    icon: Shield,
    content: `U heeft controle over cookies en kunt ze op verschillende manieren beheren:`,
  },
];

const cookieTypes = [
  {
    name: 'Noodzakelijke cookies',
    description:
      'Deze cookies zijn essentieel voor het functioneren van de website en kunnen niet worden uitgeschakeld.',
    examples: [
      'Authenticatie en beveiliging',
      'Winkelwagenfunctionaliteit',
      'Cookie-voorkeuren',
      'Fraudepreventie',
    ],
  },
  {
    name: 'Analytische cookies',
    description: 'Deze cookies helpen ons te begrijpen hoe bezoekers onze website gebruiken.',
    examples: [
      'Google Analytics tracking',
      'Prestatiemetingen',
      'A/B testing cookies',
      'Heatmap tracking',
    ],
  },
  {
    name: 'Functionele cookies',
    description: 'Deze cookies onthouden uw voorkeuren en personaliseren uw ervaring.',
    examples: [
      'Taalvoorkeuren',
      'Regio-instellingen',
      'UI-thema voorkeuren',
      'Laatst bekeken items',
    ],
  },
  {
    name: 'Marketing cookies',
    description:
      'Deze cookies worden gebruikt om de effectiviteit van advertenties te meten (alleen met toestemming).',
    examples: [
      'Conversie tracking',
      'Remarketing pixels',
      'Social media pixels',
      'Advertentie targeting',
    ],
  },
];

const cookieTable = [
  {
    name: '__groeimet_session',
    purpose: 'Beheert gebruikerssessie en authenticatie',
    type: 'Noodzakelijk',
    duration: 'Sessie',
  },
  {
    name: '__groeimet_csrf',
    purpose: 'Beveiligt tegen Cross-Site Request Forgery aanvallen',
    type: 'Noodzakelijk',
    duration: '24 uur',
  },
  {
    name: 'groeimet_cookie_consent',
    purpose: 'Slaat uw cookie-voorkeuren op',
    type: 'Noodzakelijk',
    duration: '1 jaar',
  },
  {
    name: 'groeimet_lang',
    purpose: 'Onthoudt uw taalvoorkeur',
    type: 'Functioneel',
    duration: '1 jaar',
  },
  {
    name: 'groeimet_theme',
    purpose: 'Onthoudt uw themavoorkeur (licht/donker)',
    type: 'Functioneel',
    duration: '1 jaar',
  },
  {
    name: '_ga',
    purpose: 'Google Analytics - Onderscheidt unieke gebruikers',
    type: 'Analytisch',
    duration: '2 jaar',
  },
  {
    name: '_gid',
    purpose: 'Google Analytics - Onderscheidt unieke gebruikers',
    type: 'Analytisch',
    duration: '24 uur',
  },
  {
    name: '_gat',
    purpose: 'Google Analytics - Beperkt verzoeksnelheid',
    type: 'Analytisch',
    duration: '1 minuut',
  },
  {
    name: 'intercom-session-*',
    purpose: 'Intercom chat sessie',
    type: 'Functioneel',
    duration: '7 dagen',
  },
  {
    name: '__stripe_mid',
    purpose: 'Stripe fraudepreventie',
    type: 'Noodzakelijk',
    duration: '1 jaar',
  },
];

const browserInstructions = [
  {
    browser: 'Google Chrome',
    url: 'https://support.google.com/chrome/answer/95647',
    steps: [
      'Klik op de drie puntjes rechtsboven',
      'Selecteer "Instellingen"',
      'Klik op "Privacy en beveiliging"',
      'Klik op "Cookies en andere sitegegevens"',
      'Pas uw voorkeuren aan',
    ],
  },
  {
    browser: 'Mozilla Firefox',
    url: 'https://support.mozilla.org/nl/kb/cookies-verwijderen-gegevens-wissen-websites-opgeslagen',
    steps: [
      'Klik op het menu-icoon',
      'Selecteer "Instellingen"',
      'Ga naar "Privacy & Beveiliging"',
      'Scroll naar "Cookies en sitegegevens"',
      'Beheer uw cookie-instellingen',
    ],
  },
  {
    browser: 'Microsoft Edge',
    url: 'https://support.microsoft.com/nl-nl/windows/cookies-in-microsoft-edge-verwijderen-63947406-40ac-c3b8-57b9-2a946a29ae09',
    steps: [
      'Klik op de drie puntjes rechtsboven',
      'Selecteer "Instellingen"',
      'Klik op "Privacy, zoeken en services"',
      'Onder "Browsing-gegevens wissen"',
      'Kies wat u wilt verwijderen',
    ],
  },
  {
    browser: 'Safari',
    url: 'https://support.apple.com/nl-nl/guide/safari/sfri11471/mac',
    steps: [
      'Open Safari-voorkeuren',
      'Klik op "Privacy"',
      'Klik op "Beheer websitegegevens"',
      'Selecteer websites en klik op "Verwijder"',
      'Of klik op "Verwijder alles"',
    ],
  },
];

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-600/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Cookie className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text">
              Cookiebeleid
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Transparantie over hoe wij cookies gebruiken
            </p>
            <p className="text-sm text-muted-foreground">Laatst bijgewerkt: 2 juli 2025</p>
          </div>
        </div>
      </section>

      {/* Cookie Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Quick Navigation */}
            <Card className="p-6 mb-12">
              <h2 className="text-xl font-semibold mb-4">Snelle navigatie</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {sections.map((section) => (
                  <Link
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <section.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm">{section.title}</span>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Cookie Sections */}
            <div className="space-y-12">
              {sections.map((section, index) => (
                <div key={section.id} id={section.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <section.icon className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-semibold">{section.title}</h2>
                  </div>

                  {section.id === 'types-of-cookies' ? (
                    <>
                      <p className="text-muted-foreground mb-8">{section.content}</p>
                      <div className="grid gap-6">
                        {cookieTypes.map((type) => (
                          <Card key={type.name} className="p-6">
                            <h3 className="text-lg font-semibold mb-2">{type.name}</h3>
                            <p className="text-muted-foreground mb-4">{type.description}</p>
                            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                              {type.examples.map((example, i) => (
                                <li key={i}>{example}</li>
                              ))}
                            </ul>
                          </Card>
                        ))}
                      </div>
                    </>
                  ) : section.id === 'cookie-management' ? (
                    <>
                      <p className="text-muted-foreground mb-6">{section.content}</p>

                      {/* Cookie Settings Button */}
                      <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-purple-600/5">
                        <h3 className="text-lg font-semibold mb-2">
                          Cookie-instellingen aanpassen
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          U kunt uw cookie-voorkeuren op elk moment aanpassen via onze
                          cookie-instellingen.
                        </p>
                        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                          Cookie-instellingen openen
                        </button>
                      </Card>

                      {/* Browser Instructions */}
                      <h3 className="text-lg font-semibold mb-4">Browser-specifieke instructies</h3>
                      <p className="text-muted-foreground mb-6">
                        U kunt cookies ook beheren via uw browserinstellingen. Hieronder vindt u
                        instructies voor populaire browsers:
                      </p>
                      <div className="grid gap-4">
                        {browserInstructions.map((instruction) => (
                          <Card key={instruction.browser} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold">{instruction.browser}</h4>
                              <a
                                href={instruction.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                Meer info
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                              {instruction.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </Card>
                        ))}
                      </div>

                      {/* Warning about disabling cookies */}
                      <Card className="p-4 mt-6 border-orange-500/20 bg-orange-500/5">
                        <p className="text-sm text-muted-foreground">
                          <strong>Let op:</strong> Het uitschakelen van cookies kan de
                          functionaliteit van onze website beperken. Sommige functies werken
                          mogelijk niet correct zonder cookies.
                        </p>
                      </Card>
                    </>
                  ) : (
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <p className="whitespace-pre-line">{section.content}</p>
                    </div>
                  )}

                  {index < sections.length - 1 && <Separator className="mt-8" />}
                </div>
              ))}
            </div>

            {/* Cookie Table */}
            <Separator className="my-12" />

            <div>
              <h2 className="text-2xl font-semibold mb-6">Cookie overzicht</h2>
              <p className="text-muted-foreground mb-6">
                Hieronder vindt u een gedetailleerd overzicht van alle cookies die wij gebruiken:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Cookie naam</th>
                      <th className="text-left p-4">Doel</th>
                      <th className="text-left p-4">Type</th>
                      <th className="text-left p-4">Bewaartermijn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cookieTable.map((cookie, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-4 font-mono text-sm">{cookie.name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{cookie.purpose}</td>
                        <td className="p-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              cookie.type === 'Noodzakelijk'
                                ? 'bg-green-500/10 text-green-500'
                                : cookie.type === 'Analytisch'
                                  ? 'bg-blue-500/10 text-blue-500'
                                  : 'bg-purple-500/10 text-purple-500'
                            }`}
                          >
                            {cookie.type}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{cookie.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Information */}
            <Separator className="my-12" />

            <div className="space-y-12">
              {/* Legal Basis */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">Wettelijke basis</h2>
                <p className="text-muted-foreground mb-4">
                  Ons gebruik van cookies is gebaseerd op:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong>Uw toestemming:</strong> Voor analytische en marketing cookies
                  </li>
                  <li>
                    <strong>Legitiem belang:</strong> Voor functionele cookies die de
                    gebruikerservaring verbeteren
                  </li>
                  <li>
                    <strong>Contractuele noodzaak:</strong> Voor essentiële cookies die nodig zijn
                    voor het leveren van onze diensten
                  </li>
                  <li>
                    <strong>Wettelijke verplichting:</strong> Voor cookies die nodig zijn voor
                    beveiliging en fraudepreventie
                  </li>
                </ul>
              </div>

              {/* Updates to Policy */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">Wijzigingen in dit cookiebeleid</h2>
                <p className="text-muted-foreground">
                  Wij kunnen dit cookiebeleid van tijd tot tijd bijwerken om wijzigingen in onze
                  praktijken of om andere operationele, wettelijke of regelgevende redenen weer te
                  geven. Wij zullen u op de hoogte stellen van belangrijke wijzigingen door een
                  kennisgeving op onze website te plaatsen.
                </p>
              </div>

              {/* Links to Other Policies */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">Gerelateerd beleid</h2>
                <p className="text-muted-foreground mb-4">
                  Voor meer informatie over hoe wij met uw gegevens omgaan, verwijzen wij u naar:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/privacy"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    Privacybeleid
                  </Link>
                  <Link
                    href="/terms"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    Algemene voorwaarden
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <Card className="p-8 mt-12 bg-gradient-to-br from-primary/5 to-purple-600/5">
              <h2 className="text-2xl font-semibold mb-4">
                Contact voor cookie-gerelateerde vragen
              </h2>
              <p className="text-muted-foreground mb-6">
                Als u vragen heeft over ons cookiebeleid of over hoe wij cookies gebruiken, neem dan
                contact met ons op:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <a href="mailto:privacy@groeimetai.io" className="text-primary hover:underline">
                    privacy@groeimetai.io
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <a href="tel:+31201234567" className="text-primary hover:underline">
                    +31 (6)81 739 018
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p>GroeimetAI</p>
                    <p className="text-sm text-muted-foreground">Amsterdam, Nederland</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="font-semibold mb-2">Autoriteit Persoonsgegevens</h3>
                <p className="text-sm text-muted-foreground">
                  U heeft het recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens
                  als u van mening bent dat wij cookies gebruiken op een manier die niet in
                  overeenstemming is met de wet.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
