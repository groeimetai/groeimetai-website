'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Phone, Mail, Calendar, Target, Rocket, MessageCircle,
  User, Building, Clock, ArrowRight, CheckCircle, Briefcase
} from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const GoogleMapEmbed = dynamic(() => import('@/components/contact/GoogleMapEmbed'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-xl overflow-hidden relative bg-white/[0.03] border border-white/10 flex items-center justify-center">
      <div className="text-center p-6">
        <div className="w-8 h-8 border-2 border-white/30 border-t-[#FF9F43] rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-white/55 text-sm">Loading interactive map...</p>
      </div>
    </div>
  )
});

// Wrapper component to handle URL params with Suspense
function ContactPageContent() {
  const t = useTranslations('contactPage');
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    preferredDate: '',
    preferredTime: ''
  });

  // Service type options for dropdown
  const serviceTypes = [
    { id: 'web', label: t('serviceType.options.web') },
    { id: 'aiStrategy', label: t('serviceType.options.aiStrategy') },
    { id: 'mcp', label: t('serviceType.options.mcp') },
    { id: 'voice', label: t('serviceType.options.voice') },
    { id: 'training', label: t('serviceType.options.training') },
    { id: 'agent-journey', label: t('serviceType.options.agentJourney') },
    { id: 'other', label: t('serviceType.options.other') }
  ];

  const gespreksTypes = [
    {
      id: 'verkennen',
      icon: MessageCircle,
      title: t('conversationTypes.exploratory.title'),
      subtitle: t('conversationTypes.exploratory.subtitle'),
      features: [
        t('conversationTypes.exploratory.features.0'),
        t('conversationTypes.exploratory.features.1'),
        t('conversationTypes.exploratory.features.2')
      ],
      cta: t('conversationTypes.exploratory.cta')
    },
    {
      id: 'debrief',
      icon: Target,
      title: t('conversationTypes.debrief.title'),
      subtitle: t('conversationTypes.debrief.subtitle'),
      features: [
        t('conversationTypes.debrief.features.0'),
        t('conversationTypes.debrief.features.1'),
        t('conversationTypes.debrief.features.2')
      ],
      cta: t('conversationTypes.debrief.cta')
    },
    {
      id: 'kickoff',
      icon: Rocket,
      title: t('conversationTypes.kickoff.title'),
      subtitle: t('conversationTypes.kickoff.subtitle'),
      features: [
        t('conversationTypes.kickoff.features.0'),
        t('conversationTypes.kickoff.features.1'),
        t('conversationTypes.kickoff.features.2')
      ],
      cta: t('conversationTypes.kickoff.cta')
    }
  ];

  useEffect(() => {
    setMounted(true);
    // Pre-fill service type from URL parameter
    const serviceParam = searchParams.get('service');
    if (serviceParam && serviceTypes.some(s => s.id === serviceParam)) {
      setSelectedService(serviceParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.company) {
      toast.error('Vul alstublieft alle verplichte velden in');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          conversationType: selectedType,
          serviceType: selectedService,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        toast.success('Uw aanvraag is succesvol verzonden!');

        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          message: '',
          preferredDate: '',
          preferredTime: ''
        });
        setSelectedType(null);
        setSelectedService('');

        setTimeout(() => {
          setIsSuccess(false);
        }, 5000);
      } else {
        toast.error(data.error || 'Er is een fout opgetreden. Probeer het opnieuw.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-[#FF9F43] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="pt-28 pb-20 sm:pt-32 sm:pb-28 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-[-0.02em]">
                {t('header.title')}{' '}
                <span
                  className="text-white px-3 py-1 sm:px-4 sm:py-2 inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                    boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.5)',
                  }}
                >
                  {t('header.highlight')}
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-white/75 max-w-3xl mx-auto leading-relaxed">
                {t('header.subtitle')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 sm:py-28 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left: Conversation Types */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 tracking-[-0.02em]">
                  {t('conversationTypes.title')}
                </h2>

                <div className="space-y-5">
                  {gespreksTypes.map((type, index) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;
                    return (
                      <motion.div
                        key={type.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        viewport={{ once: true }}
                        className={`group relative border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'border-[#F87315]/50 bg-[#F87315]/10'
                            : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                        }`}
                        onClick={() => setSelectedType(type.id)}
                      >
                        <div className="p-5 sm:p-6">
                          <div className="flex items-center mb-4">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 transition-all duration-300"
                              style={{
                                background: isSelected
                                  ? 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)'
                                  : 'rgba(255,255,255,0.05)'
                              }}
                            >
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{type.title}</h3>
                              <p className="text-white/55 text-sm">{type.subtitle}</p>
                            </div>
                          </div>

                          <ul className="space-y-2 mb-5">
                            {type.features.map((feature, idx) => (
                              <li key={idx} className="text-white/70 text-sm flex items-center">
                                <div className="w-1.5 h-1.5 rounded-full mr-3 bg-[#FF9F43]" />
                                {feature}
                              </li>
                            ))}
                          </ul>

                          <Button
                            className={`w-full rounded-lg transition-all duration-300 ${
                              isSelected
                                ? 'text-white border-0'
                                : 'border border-white/20 text-white hover:bg-white/10'
                            }`}
                            style={isSelected ? {
                              background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                              boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.4)'
                            } : {}}
                            variant={isSelected ? 'default' : 'outline'}
                          >
                            {type.cta}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Direct Contact */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white/[0.03] border border-white/10 mt-6 overflow-hidden hover:border-white/20 transition-all duration-300">
                    <CardContent className="p-5 sm:p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">{t('directContact.title')}</h3>
                      <div className="space-y-3">
                        {[
                          { icon: User, content: t('directContact.name'), sub: t('directContact.role') },
                          { icon: Mail, content: t('directContact.email') },
                          { icon: Phone, content: t('directContact.phone') },
                          { icon: Clock, content: t('directContact.hours'), muted: true }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center">
                            <item.icon className="w-4 h-4 mr-3 text-[#FF9F43]" />
                            <div>
                              <p className={item.muted ? 'text-white/70 text-sm' : 'text-white text-sm font-medium'}>{item.content}</p>
                              {item.sub && <p className="text-white/55 text-xs">{item.sub}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Right: Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/[0.05] backdrop-blur-sm border border-white/15 rounded-2xl overflow-hidden">
                  <CardContent className="p-6 sm:p-8">
                    <h3 className="text-xl font-semibold text-white mb-6">{t('form.title')}</h3>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cname" className="text-white/70 text-sm">{t('form.fields.name.label')} *</Label>
                          <Input
                            id="cname"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-white/[0.03] border-white/15 text-white mt-1.5 focus:border-[#FF9F43] transition-colors"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="ccompany" className="text-white/70 text-sm">{t('form.fields.company.label')} *</Label>
                          <Input
                            id="ccompany"
                            value={formData.company}
                            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                            className="bg-white/[0.03] border-white/15 text-white mt-1.5 focus:border-[#FF9F43] transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cemail" className="text-white/70 text-sm">{t('form.fields.email.label')} *</Label>
                          <Input
                            id="cemail"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-white/[0.03] border-white/15 text-white mt-1.5 focus:border-[#FF9F43] transition-colors"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cphone" className="text-white/70 text-sm">{t('form.fields.phone.label')}</Label>
                          <Input
                            id="cphone"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="bg-white/[0.03] border-white/15 text-white mt-1.5 focus:border-[#FF9F43] transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="serviceType" className="text-white/70 text-sm flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          {t('serviceType.label')}
                        </Label>
                        <select
                          id="serviceType"
                          value={selectedService}
                          onChange={(e) => setSelectedService(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/15 text-white rounded-md px-3 py-2 mt-1.5 focus:border-[#FF9F43] transition-colors"
                        >
                          <option value="" className="bg-black">{t('serviceType.placeholder')}</option>
                          {serviceTypes.map((service) => (
                            <option key={service.id} value={service.id} className="bg-black">
                              {service.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-white/70 text-sm">{t('form.fields.message.label')}</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                          className="bg-white/[0.03] border-white/15 text-white mt-1.5 focus:border-[#FF9F43] transition-colors resize-none"
                          placeholder={t('form.fields.message.placeholder')}
                          rows={4}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="date" className="text-white/70 text-sm">{t('form.fields.preferredDate.label')}</Label>
                          <Input
                            id="date"
                            type="date"
                            value={formData.preferredDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                            className="bg-white/[0.03] border-white/15 text-white mt-1.5 focus:border-[#FF9F43] transition-colors"
                          />
                        </div>
                        <div>
                          <Label htmlFor="time" className="text-white/70 text-sm">{t('form.fields.preferredTime.label')}</Label>
                          <select
                            value={formData.preferredTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                            className="w-full bg-white/[0.03] border border-white/15 text-white rounded-md px-3 py-2 mt-1.5 focus:border-[#FF9F43] transition-colors"
                          >
                            <option value="" className="bg-black">{t('form.fields.preferredTime.placeholder')}</option>
                            <option value="morning" className="bg-black">{t('form.fields.preferredTime.options.morning')}</option>
                            <option value="afternoon" className="bg-black">{t('form.fields.preferredTime.options.afternoon')}</option>
                          </select>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 text-white font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                          boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.5)',
                        }}
                        disabled={isSubmitting || isSuccess}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Verzenden...
                          </>
                        ) : isSuccess ? (
                          <>
                            <CheckCircle className="mr-2 w-5 h-5" />
                            Verzonden!
                          </>
                        ) : (
                          <>
                            <Calendar className="mr-2 w-5 h-5" />
                            {t('form.submit')}
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </>
                        )}
                      </Button>

                      {isSuccess ? (
                        <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-lg p-4">
                          <p className="text-emerald-400 text-sm text-center font-medium">
                            Uw aanvraag is succesvol ontvangen! We nemen binnen 24 uur contact met u op.
                          </p>
                        </div>
                      ) : (
                        <p className="text-white/50 text-sm text-center">
                          {t('form.responseTime')}
                        </p>
                      )}
                    </form>
                  </CardContent>
                </Card>

                {/* Atmosphere Image */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="mt-6"
                >
                  <div className="sfeer-image relative h-[280px] w-full rounded-xl overflow-hidden">
                    <Image
                      src="/images/philippe-bontemps-FUfJGhpKITo-unsplash.jpg"
                      alt=""
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 sm:py-28 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-[-0.02em]">
                Bezoek Ons Kantoor
              </h2>
            </motion.div>

            {/* Google Maps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <GoogleMapEmbed className="rounded-xl overflow-hidden" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/[0.03] border-white/10 rounded-2xl overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-white mb-5">GroeimetAI</h3>
                      <div className="space-y-3.5 text-white/75">
                        {[
                          { icon: Building, text: 'Apeldoorn, Nederland' },
                          { icon: Mail, text: 'info@groeimetai.io' },
                          { icon: Phone, text: '+31 6 12345678' },
                          { icon: Clock, text: 'Ma-Vr: 9:00-18:00' }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <item.icon className="w-5 h-5 text-[#FF9F43]" />
                            <span className="text-sm">{item.text}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        asChild
                        className="mt-6 h-11 rounded-lg text-white border-0 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                          boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.4)',
                        }}
                      >
                        <a
                          href="https://maps.google.com/?q=GroeimetAI+Apeldoorn"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Open in Google Maps
                        </a>
                      </Button>
                    </div>

                    <div className="bg-gradient-to-br from-[#F87315]/15 to-[#F87315]/5 rounded-xl p-6 border border-[#F87315]/20">
                      <h4 className="text-white font-semibold mb-4">Waarom een persoonlijk gesprek?</h4>
                      <ul className="space-y-2.5 text-white/75 text-sm">
                        {[
                          'Begrijp uw specifieke uitdagingen',
                          'Krijg direct bruikbare AI inzichten',
                          'Ontdek concrete implementatie mogelijkheden',
                          'Plan uw AI roadmap samen'
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Main export with Suspense boundary for useSearchParams
export default function SafeContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-[#FF9F43] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    }>
      <ContactPageContent />
    </Suspense>
  );
}
