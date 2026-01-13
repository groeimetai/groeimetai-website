'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Download, ArrowRight, CheckCircle, AlertTriangle, Zap, Shield,
  Globe, Code, Database, Users, FileText, Target, Eye, Brain, X, TrendingUp
} from 'lucide-react';

export default function McpGuidePage() {
  const handleDownloadPDF = () => {
    // Implementation for PDF generation/download
    window.open('/api/download/mcp-guide', '_blank');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#080D14' }}>
      {/* Hero Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                <span
                  className="text-white px-4 py-2 inline-block"
                  style={{ background: 'linear-gradient(135deg, #F87315, #FF8533)' }}
                >
                  MCP Guide
                </span>
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto mb-4">
                Van API naar Agent-Ready: De Praktische Gids
              </p>
              <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
                Alles wat je moet weten over het agent-ready maken van jouw systemen
              </p>
              
              <Button
                onClick={handleDownloadPDF}
                size="lg"
                className="text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                style={{ 
                  backgroundColor: '#F87315',
                  boxShadow: '0 10px 25px -5px rgba(248, 115, 21, 0.25)'
                }}
              >
                <Download className="mr-2 w-5 h-5" />
                Download Complete Guide (PDF)
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Guide Content Preview */}
      <section className="py-20" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-16">

            {/* Chapter 1: The Agent Revolution */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 border border-white/10 rounded-xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: '#F87315' }}>
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">De Agent Revolutie</h2>
              </div>
              
              <div className="space-y-4 text-white/80 leading-relaxed">
                <p>
                  <strong className="text-white">2025 wordt het jaar van AI agents.</strong> Niet chatbots die vragen beantwoorden, 
                  maar autonome systemen die taken uitvoeren, beslissingen nemen, en processen automatiseren.
                </p>
                <p>
                  Deze agents hebben één ding nodig: <span style={{ color: '#F87315' }}>toegang tot jouw bedrijfssystemen.</span> 
                  Ze moeten tickets kunnen aanmaken, data kunnen opvragen, workflows kunnen triggeren.
                </p>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <p className="text-white/90">
                    <strong>Het probleem:</strong> Jouw APIs zijn gemaakt voor mensen, niet voor agents. 
                    Agents "zien" ze niet, begrijpen ze niet, kunnen er niet mee werken.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Chapter 2: APIs vs Agents */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 border border-white/10 rounded-xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: '#F87315' }}>
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">Waarom APIs Niet Genoeg Zijn</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">REST APIs - Voor Mensen</h3>
                  <ul className="space-y-2 text-white/80 text-sm">
                    <li className="flex items-center">
                      <X className="w-4 h-4 mr-3 text-red-400" />
                      Handmatige documentatie
                    </li>
                    <li className="flex items-center">
                      <X className="w-4 h-4 mr-3 text-red-400" />
                      Geen auto-discovery
                    </li>
                    <li className="flex items-center">
                      <X className="w-4 h-4 mr-3 text-red-400" />
                      Complex authentication
                    </li>
                    <li className="flex items-center">
                      <X className="w-4 h-4 mr-3 text-red-400" />
                      Per agent custom integratie
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">MCP Servers - Voor Agents</h3>
                  <ul className="space-y-2 text-white/80 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                      Self-describing interfaces
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                      Automatische discovery
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                      Built-in security
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                      Universal agent compatibility
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                <p className="text-white/90 leading-relaxed">
                  <strong>De kern:</strong> APIs zijn perfect voor wat ze doen. MCP is een extra laag die 
                  agents helpt om APIs te ontdekken, begrijpen en gebruiken - automatisch.
                </p>
              </div>
            </motion.div>

            {/* Chapter 3: The Business Case */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 border border-white/10 rounded-xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: '#F87315' }}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">De Business Case voor Agent-Ready</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">70%</div>
                  <div className="text-white/60 text-sm">Minder handmatig werk</div>
                  <p className="text-white/80 text-xs mt-2">Agents nemen routine taken over</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">24/7</div>
                  <div className="text-white/60 text-sm">Beschikbaarheid</div>
                  <p className="text-white/80 text-xs mt-2">Geen wacht- of kantooruren</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">85%</div>
                  <div className="text-white/60 text-sm">Snellere afhandeling</div>
                  <p className="text-white/80 text-xs mt-2">Van uren naar minuten</p>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                <h4 className="text-lg font-bold text-white mb-3">Concrete Voorbeelden:</h4>
                <ul className="space-y-2 text-white/80 text-sm">
                  <li>• <strong>Klantenservice:</strong> Agent beantwoordt 80% van de vragen instant</li>
                  <li>• <strong>HR proces:</strong> Verlofaanvragen automatisch verwerkt en goedgekeurd</li>
                  <li>• <strong>Voorraad:</strong> Automatische herbestelling bij lage stock</li>
                  <li>• <strong>Rapportage:</strong> Agents genereren wekelijkse overzichten</li>
                </ul>
              </div>
            </motion.div>

            {/* Chapter 4: Getting Started */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 border border-white/10 rounded-xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: '#F87315' }}>
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">Hoe Begin Je?</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F87315' }}>
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Inventory</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Welke systemen heb je? Welke APIs bestaan er al? 
                    Wat zijn je automatisering prioriteiten?
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F87315' }}>
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Pilot</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Start klein. Kies één systeem, één use case. 
                    Bewijs de waarde voordat je verder schaalt.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F87315' }}>
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Scale</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Uitrollen naar andere systemen. 
                    Multi-agent orchestration. Complete automatisering.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Chapter 5: Security & Compliance */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 border border-white/10 rounded-xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: '#F87315' }}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">Security & Compliance</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Veiligheids Principes</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-1" style={{ color: '#F87315' }} />
                      <div>
                        <p className="text-white font-medium">Least Privilege Access</p>
                        <p className="text-white/70 text-sm">Agents krijgen alleen toegang tot wat ze nodig hebben</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-1" style={{ color: '#F87315' }} />
                      <div>
                        <p className="text-white font-medium">Audit Trails</p>
                        <p className="text-white/70 text-sm">Elke agent actie wordt gelogd en traceerbaar</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-1" style={{ color: '#F87315' }} />
                      <div>
                        <p className="text-white font-medium">Token-based Auth</p>
                        <p className="text-white/70 text-sm">Geen wachtwoorden, alleen tijdelijke toegangstokens</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-1" style={{ color: '#F87315' }} />
                      <div>
                        <p className="text-white font-medium">Rate Limiting</p>
                        <p className="text-white/70 text-sm">Agents kunnen geen systemen overbelasten</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-3 mt-1 text-yellow-400" />
                    <div>
                      <p className="text-white font-medium mb-2">GDPR & Compliance</p>
                      <p className="text-white/80 text-sm">
                        Agent toegang valt onder bestaande data governance. 
                        Geen nieuwe privacy risico's, alleen gecontroleerde automatisering.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Chapter 6: Implementation Strategies */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 border border-white/10 rounded-xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: '#F87315' }}>
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">Implementatie Strategieën</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Voor Verschillende Bedrijfsgroottes:</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-bold px-2 py-1 rounded" style={{ backgroundColor: '#F87315', color: 'white' }}>
                          Klein MKB
                        </span>
                        <span className="text-white/70 text-sm ml-3">5-50 medewerkers</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        Start met je grootste pijnpunt. Vaak customer service of planning. 
                        Eén systeem agent-ready maken kan al 20-30% tijd besparen.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-bold px-2 py-1 rounded" style={{ backgroundColor: '#F87315', color: 'white' }}>
                          Middelgroot
                        </span>
                        <span className="text-white/70 text-sm ml-3">50-250 medewerkers</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        Focus op systeem integratie. CRM + ERP + Planning = agent ecosysteem. 
                        Hier ligt de grootste ROI in cross-system automatisering.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-bold px-2 py-1 rounded" style={{ backgroundColor: '#F87315', color: 'white' }}>
                          Enterprise
                        </span>
                        <span className="text-white/70 text-sm ml-3">250+ medewerkers</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        Gefaseerde rollout. Start met pilot departementen. 
                        Scale naar enterprise-wide agent infrastructure.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Chapter 7: Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 border border-white/10 rounded-xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: '#F87315' }}>
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">Jouw Next Steps</h2>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-white mb-3">Assessment</h4>
                    <p className="text-white/80 text-sm mb-4">
                      Ontdek jouw huidige Agent Readiness. Gratis tool, 5 minuten, 
                      direct inzicht in mogelijkheden.
                    </p>
                    <Button
                      className="w-full text-white"
                      style={{ backgroundColor: '#F87315' }}
                    >
                      Start Assessment
                    </Button>
                  </div>

                  <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-white mb-3">Gratis Consult</h4>
                    <p className="text-white/80 text-sm mb-4">
                      30-minuten gesprek met agent infrastructure specialist. 
                      Geen sales pitch, alleen concrete inzichten.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10"
                    >
                      Plan Gesprek
                    </Button>
                  </div>
                </div>

                <div className="text-center pt-6 border-t border-white/10">
                  <p className="text-white/70 mb-4">
                    <strong>Ready voor Agent Season 2025?</strong>
                  </p>
                  <p className="text-sm text-white/60">
                    De agent economie wacht niet. Start vandaag met je Agent Readiness journey.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-8"
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                Download de Complete{' '}
                <span style={{ color: '#F87315' }}>MCP Guide</span>
              </h2>
              <p className="text-xl text-white/80 mb-8">
                12 pagina's praktische inzichten, checklists en implementatie tips. 
                Perfect om te delen met je team.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleDownloadPDF}
                  size="lg"
                  className="text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  style={{ 
                    backgroundColor: '#F87315',
                    boxShadow: '0 10px 25px -5px rgba(248, 115, 21, 0.25)'
                  }}
                >
                  <Download className="mr-2 w-5 h-5" />
                  Download Complete Guide
                  <FileText className="ml-2 w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                >
                  Start Agent Assessment
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              <div className="mt-6 text-sm text-white/60">
                Geen email vereist • Direct download • 2.1MB PDF
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}