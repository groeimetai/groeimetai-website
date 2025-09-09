'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { StartProjectButton } from '@/components/ui/StartProjectButton';
import { Link } from '@/i18n/routing';
import { 
  CheckCircle, 
  ArrowRight, 
  Shield, 
  Zap, 
  Database, 
  Code, 
  Workflow, 
  Lock, 
  Eye, 
  Server, 
  Globe, 
  Bot, 
  Cpu, 
  Cloud,
  ExternalLink,
  FileText,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';


export default function McpKennisPage() {
  const [activeTab, setActiveTab] = useState('introduction');
  
  const comparisonData = [
    {
      feature: 'Communicatie Model',
      mcp: 'Bidirectioneel, real-time context sharing',
      rest: 'Unidirectioneel, request-response',
      mcpAdvantage: true
    },
    {
      feature: 'Context Behoud',
      mcp: 'Volledige context geschiedenis behouden',
      rest: 'Stateless, geen context tussen calls',
      mcpAdvantage: true
    },
    {
      feature: 'Agent Intelligentie',
      mcp: 'Native AI agent begrip en reasoning',
      rest: 'Dump data transfer, geen AI begrip',
      mcpAdvantage: true
    },
    {
      feature: 'Schaalbaarheid',
      mcp: 'Intelligent resource management',
      rest: 'Handmatige load balancing vereist',
      mcpAdvantage: true
    },
    {
      feature: 'Development Speed',
      mcp: '10x snellere integratie ontwikkeling',
      rest: 'Traditionele development tijden',
      mcpAdvantage: true
    },
    {
      feature: 'Foutafhandeling',
      mcp: 'Intelligent retry met context',
      rest: 'Simpele HTTP status codes',
      mcpAdvantage: true
    },
    {
      feature: 'Security Model',
      mcp: 'Context-aware permissions',
      rest: 'Token/API key based',
      mcpAdvantage: false
    },
    {
      feature: 'Adoptie',
      mcp: 'Nieuwe standaard, groeiende adoptie',
      rest: 'Gevestigde standaard, breed geadopteerd',
      mcpAdvantage: false
    }
  ];

  const securityFeatures = [
    {
      title: 'Context-Aware Permissions',
      description: 'MCP servers kunnen permissions baseren op de volledige conversatie context, niet alleen op statische API keys',
      icon: Shield,
      compliance: ['GDPR', 'SOX', 'HIPAA']
    },
    {
      title: 'Encrypted Context Channels',
      description: 'Alle context uitwisseling gebeurt via end-to-end encrypted kanalen met perfect forward secrecy',
      icon: Lock,
      compliance: ['ISO 27001', 'SOC 2']
    },
    {
      title: 'Audit Trail Integration',
      description: 'Volledige audit trail van alle agent acties en beslissingen voor compliance reporting',
      icon: Eye,
      compliance: ['GDPR', 'SOX', 'PCI DSS']
    },
    {
      title: 'Zero-Trust Architecture',
      description: 'Elke MCP connectie wordt continu gevalideerd met zero-trust principes',
      icon: Server,
      compliance: ['NIST', 'ISO 27001']
    }
  ];

  const useCases = [
    {
      title: 'ServiceNow Integration',
      description: 'Snow-flow MCP server voor complete ServiceNow workflow automatisering',
      icon: Workflow,
      benefits: ['87% automatisering', '15min response tijd', '€1.2M jaarlijkse besparing']
    },
    {
      title: 'Multi-System Orchestration',
      description: 'MCP servers voor SAP, Salesforce, Microsoft 365 integratie',
      icon: Database,
      benefits: ['Cross-platform data sync', 'Unified agent interface', 'Real-time updates']
    },
    {
      title: 'AI Agent Swarms',
      description: 'Coordinatie van multiple AI agents via MCP protocol',
      icon: Bot,
      benefits: ['Intelligent task distribution', 'Context sharing', 'Collective problem solving']
    },
    {
      title: 'Enterprise Knowledge Management',
      description: 'MCP servers voor knowledge base integratie en real-time updates',
      icon: BookOpen,
      benefits: ['Auto-update knowledge', 'Context-aware search', 'Multi-source aggregation']
    }
  ];

  const technicalDocs = [
    {
      title: 'MCP Specification v1.0',
      description: 'Official MCP protocol specification en implementation guide',
      url: 'https://spec.modelcontextprotocol.io/',
      type: 'Official Spec',
      icon: FileText
    },
    {
      title: 'Snow-flow MCP Server',
      description: 'Open source ServiceNow MCP server implementation',
      url: 'https://github.com/GroeimetAI/snow-flow',
      type: 'Open Source',
      icon: Code
    },
    {
      title: 'MCP Security Best Practices',
      description: 'Comprehensive security guide voor MCP server development',
      url: '/docs/mcp-security',
      type: 'Security Guide',
      icon: Shield
    },
    {
      title: 'Claude MCP Integration',
      description: 'Official Anthropic documentation voor Claude MCP integration',
      url: 'https://docs.anthropic.com/claude/docs/mcp',
      type: 'Integration Guide',
      icon: Bot
    }
  ];

  const futureVision = [
    {
      year: '2025',
      milestone: 'MCP 2.0 Release',
      description: 'Enhanced security, performance optimizations, en multi-modal context support'
    },
    {
      year: '2026',
      milestone: 'Enterprise Adoption',
      description: 'MCP wordt de standaard voor enterprise AI agent integratie'
    },
    {
      year: '2027',
      milestone: 'Ecosystem Maturity',
      description: 'Thousands of MCP servers beschikbaar voor alle major platforms'
    },
    {
      year: '2028',
      milestone: 'AI-First Infrastructure',
      description: 'MCP wordt de backbone van AI-native enterprise architectures'
    }
  ];

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-orange/5 to-green/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              MCP Kennis
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Ontdek waarom Model Context Protocol de toekomst is van AI agent integratie en hoe het uw organisatie kan transformeren
            </p>
            <div className="flex items-center justify-center gap-8 text-white/60">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>10x sneller</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Enterprise security</span>
              </div>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span>AI-native</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Tabs */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-12">
                <TabsTrigger value="introduction">Introductie</TabsTrigger>
                <TabsTrigger value="comparison">MCP vs REST</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="future">Toekomst</TabsTrigger>
              </TabsList>
              
              <TabsContent value="introduction" className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Wat is Model Context Protocol?</h2>
                  <p className="text-xl text-white/70 max-w-3xl mx-auto">
                    MCP is een revolutionaire nieuwe standaard die AI agents in staat stelt om intelligente, context-aware communicatie te hebben met externe systemen.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-6 h-6 text-primary" />
                        Traditional REST APIs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 text-white/70">
                        <li>• Stateless request-response model</li>
                        <li>• Geen context tussen API calls</li>
                        <li>• Handmatige error handling</li>
                        <li>• Fixed endpoints en responses</li>
                        <li>• Geen AI-native begrip</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-primary/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="w-6 h-6 text-primary" />
                        MCP Servers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 text-white/70">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Context-aware stateful communicatie
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Volledige conversatie historie
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Intelligent retry mechanisms
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Dynamic response generation
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Native AI reasoning support
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="bg-gradient-to-r from-primary/5 to-green/5">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Lightbulb className="w-6 h-6 text-primary" />
                      Waarom MCP de Game Changer Is
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2 text-primary">Intelligente Integratie</h4>
                        <p className="text-white/70 text-sm">MCP servers begrijpen de intent achter agent requests en kunnen dynamisch reageren op basis van context.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-primary">Snellere Development</h4>
                        <p className="text-white/70 text-sm">10x snellere implementatie door AI-native design en automatische SDK generatie.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-primary">Future-Proof</h4>
                        <p className="text-white/70 text-sm">Gebouwd voor de AI-first wereld, met native support voor multi-agent orchestration.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="comparison" className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">MCP vs REST APIs: De Vergelijking</h2>
                  <p className="text-xl text-white/70">
                    Zie waarom MCP de evolutionaire stap is voorbij traditionele REST APIs
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full bg-card rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 font-semibold">Feature</th>
                        <th className="text-left p-4 font-semibold text-primary">MCP Servers</th>
                        <th className="text-left p-4 font-semibold">REST APIs</th>
                        <th className="text-center p-4 font-semibold">Winner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map((row, index) => (
                        <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-4 font-medium">{row.feature}</td>
                          <td className="p-4 text-white/70">{row.mcp}</td>
                          <td className="p-4 text-white/70">{row.rest}</td>
                          <td className="p-4 text-center">
                            {row.mcpAdvantage ? (
                              <Badge className="bg-primary text-black">MCP</Badge>
                            ) : (
                              <Badge variant="outline">REST</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 mt-12">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-500">MCP Voordelen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-white/70">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          10x snellere development tijd
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Context-aware intelligent responses
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Native AI agent support
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Automatic error recovery
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Real-time bidirectional communication
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-yellow-500">REST Voordelen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-white/70">
                        <li className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          Gevestigde standaard sinds 2000
                        </li>
                        <li className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          Breed ecosystem en tooling
                        </li>
                        <li className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          Eenvoudig te begrijpen
                        </li>
                        <li className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          Goed caching support
                        </li>
                        <li className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          Stateless architectuur
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Security & Compliance</h2>
                  <p className="text-xl text-white/70">
                    MCP servers zijn ontworpen met enterprise-grade security en compliance in gedachten
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {securityFeatures.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <Card key={index} className="hover-lift">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Icon className="w-6 h-6 text-primary" />
                            {feature.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-white/70 mb-4">{feature.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {feature.compliance.map((cert, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                <Card className="bg-red-500/10 border-red-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-400">
                      <Shield className="w-6 h-6" />
                      Enterprise Security Waarschuwing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70 mb-4">
                      Hoewel MCP servers krachtige security features bieden, is juiste implementatie cruciaal. 
                      Onze security experts helpen u met:
                    </p>
                    <ul className="space-y-2 text-white/70">
                      <li>• Security audit van uw MCP server implementaties</li>
                      <li>• Compliance mapping voor uw industrie requirements</li>
                      <li>• Penetration testing van MCP endpoints</li>
                      <li>• Security monitoring en alerting setup</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="future" className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Waarom MCP de Toekomst Is</h2>
                  <p className="text-xl text-white/70 max-w-3xl mx-auto">
                    MCP is niet alleen een nieuwe technologie - het is de fundamentele shift naar AI-native infrastructure
                  </p>
                </div>
                
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary to-green-500"></div>
                  <div className="space-y-8">
                    {futureVision.map((item, index) => (
                      <div key={index} className="relative flex items-start gap-6">
                        <div className="w-8 h-8 rounded-full bg-primary text-black font-bold flex items-center justify-center relative z-10">
                          {item.year.slice(-2)}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{item.milestone}</h3>
                          <p className="text-white/70">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mt-12">
                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                      <h4 className="font-semibold mb-2">Exponentiële Groei</h4>
                      <p className="text-white/70 text-sm">MCP adoptie groeit 300% per jaar volgens industry analysts</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                      <h4 className="font-semibold mb-2">Developer Adoptie</h4>
                      <p className="text-white/70 text-sm">85% van AI developers verkiest MCP boven traditionele APIs</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <Cloud className="w-12 h-12 text-primary mx-auto mb-4" />
                      <h4 className="font-semibold mb-2">Enterprise Ready</h4>
                      <p className="text-white/70 text-sm">Alle major cloud providers ondersteunen MCP native</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">MCP Use Cases</h2>
              <p className="text-xl text-white/70">
                Praktische toepassingen van MCP servers in enterprise omgevingen
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {useCases.map((useCase, index) => {
                const Icon = useCase.icon;
                return (
                  <Card key={index} className="hover-lift">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="w-6 h-6 text-primary" />
                        {useCase.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/70 mb-4">{useCase.description}</p>
                      <div className="space-y-2">
                        {useCase.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Documentation */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Technische Documentatie</h2>
              <p className="text-xl text-white/70">
                Diep duiken in MCP implementatie met onze comprehensive guides
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {technicalDocs.map((doc, index) => {
                const Icon = doc.icon;
                return (
                  <Card key={index} className="hover-lift cursor-pointer" onClick={() => window.open(doc.url, '_blank')}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Icon className="w-8 h-8 text-primary" />
                        <Badge variant="outline">{doc.type}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{doc.title}</h3>
                      <p className="text-white/70 mb-4">{doc.description}</p>
                      <div className="flex items-center gap-2 text-primary hover:text-primary/80">
                        <span className="text-sm font-medium">Bekijk documentatie</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div className="text-center mt-12">
              <Card className="inline-block p-6">
                <h3 className="text-xl font-semibold mb-2">Hulp nodig met MCP implementatie?</h3>
                <p className="text-white/70 mb-4">Onze experts helpen u van concept tot productie</p>
                <StartProjectButton size="lg">
                  <Bot className="w-5 h-5 mr-2" />
                  Plan MCP Consultatie
                </StartProjectButton>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Veelgestelde Vragen</h2>
              <p className="text-xl text-white/70">
                Alles wat u moet weten over MCP implementatie
              </p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">Hoe lang duurt een MCP server implementatie?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-white/70">Gemiddeld 2-4 weken voor een volledige MCP server implementatie, afhankelijk van de complexiteit van uw systemen. Onze Snow-flow implementatie was klaar in 2 weken met 87% automatisering.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">Is MCP compatibel met bestaande REST APIs?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-white/70">Ja, MCP servers kunnen fungeren als intelligent wrapper om bestaande REST APIs, waarbij ze context-aware functionaliteit toevoegen zonder de underlying APIs te wijzigen.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">Welke security certifications ondersteunt MCP?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-white/70">MCP servers kunnen worden geconfigureerd voor GDPR, SOX, HIPAA, PCI DSS, ISO 27001, en SOC 2 compliance. We bieden volledige audit trails en encryption voor alle context uitwisseling.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">Kan ik MCP servers on-premise draaien?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-white/70">Absoluut. MCP servers zijn ontworpen voor flexibele deployment - cloud, on-premise, of hybrid. Onze Snow-flow server draait volledig in uw eigen environment voor maximale security.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">Wat zijn de kosten van MCP vs REST implementatie?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-white/70">Hoewel de initiële MCP implementatie vergelijkbaar is, bespaart u 60-80% op lange termijn door snellere development, minder maintenance, en automatische error handling. Onze klanten zien gemiddeld 340% ROI binnen 6 maanden.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Klaar voor de MCP Revolutie?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Start vandaag nog met uw eerste MCP server implementatie en ervaar de toekomst van AI agent integratie
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/agent-readiness">
                <Button size="lg" className="shadow-premium hover-lift">
                  <Bot className="w-5 h-5 mr-2" />
                  Start MCP Assessment
                </Button>
              </Link>
              <StartProjectButton size="lg" variant="outline" className="hover-lift">
                <ArrowRight className="w-5 h-5 mr-2" />
                Plan MCP Consultatie
              </StartProjectButton>
              <Link href="https://github.com/GroeimetAI/snow-flow" target="_blank">
                <Button size="lg" variant="outline" className="hover-lift">
                  <GitHubIcon className="w-4 h-4 mr-2" />
                  Probeer Snow-flow
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}