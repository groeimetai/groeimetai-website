'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  marketingBadge,
  marketingField,
  marketingOrangePanel,
  marketingPanel,
  marketingPrimaryButton,
  marketingSelect,
  marketingTextarea,
} from '@/components/marketing/marketingStyles';
import {
  Phone, Mail, Calendar, Target, Rocket, MessageCircle,
  User, Building, Clock, ArrowRight, CheckCircle, Briefcase
} from 'lucide-react';
import Image from 'next/image';
import { blurDataURLs } from '@/lib/image-blurs';
import dynamic from 'next/dynamic';

const GoogleMapEmbed = dynamic(() => import('@/components/contact/GoogleMapEmbed'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-xl overflow-hidden relative bg-white/[0.03] border border-white/10 flex items-center justify-center">
      <div className="text-center p-6">
        <div className="w-8 h-8 border-2 border-white/30 border-t-[#FF9F43] rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-white/50 text-sm">Loading interactive map...</p>
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
      <div className="min-h-screen bg-[#120F0C] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-[#FF9F43] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#120F0C] text-[#F6F2E8]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_16%,rgba(255,142,73,0.28),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(255,199,142,0.14),transparent_22%),linear-gradient(180deg,#1E140F_0%,#120F0C_72%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(rgba(255,245,235,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,245,235,0.18) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
        <div className="container relative mx-auto px-4 pb-14 pt-20 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className={`${marketingBadge} items-center gap-2`}>
                <span className="h-2 w-2 rounded-full bg-[#F28A3F]" />
                Direct en nuchter contact
              </p>
              <h1 className="mt-6 max-w-4xl text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#F6F2E8] sm:mt-8 sm:text-5xl sm:leading-none sm:tracking-[-0.055em] lg:text-7xl">
                {t('header.title')} <span className="text-[#FFD8BF]">{t('header.highlight')}</span>
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[#DDC8BA] sm:mt-8 sm:text-xl sm:leading-8">
                {t('header.subtitle')}
              </p>
              <div className="mt-6 grid gap-3 sm:mt-10 sm:max-w-2xl sm:grid-cols-3">
                {[
                  'Geen hype of vaag intakeproces',
                  'Snel scherp waar de eerste winst zit',
                  'Technisch sterk als het daarna echt nodig is',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl bg-white/[0.04] px-4 py-3 text-sm leading-6 text-[#F3E4D8] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:rounded-[1.4rem] sm:py-4"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-5"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#1D120D] shadow-[0_35px_120px_rgba(0,0,0,0.35)] sm:rounded-[2.3rem]">
                <Image
                  src="/images/philippe-bontemps-FUfJGhpKITo-unsplash.jpg"
                  alt=""
                  width={1000}
                  height={900}
                  placeholder="blur"
                  blurDataURL={blurDataURLs['/images/philippe-bontemps-FUfJGhpKITo-unsplash.jpg']}
                  className="h-[260px] w-full object-cover sm:h-[420px]"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(15,10,8,0.78))]" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#E9C8B0]">Plan een gesprek</p>
                  <p className="mt-2 max-w-md text-xl font-semibold leading-tight tracking-[-0.04em] text-white sm:mt-3 sm:text-2xl">
                    Eerst helderheid. Daarna pas tooling, integraties of implementatie.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                <div className={marketingOrangePanel}>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#F8D6BE]">Rechtstreeks</p>
                  <div className="mt-5 space-y-3">
                    {[
                      { icon: User, content: t('directContact.name'), sub: t('directContact.role') },
                      { icon: Mail, content: t('directContact.email') },
                      { icon: Phone, content: t('directContact.phone') },
                    ].map((item) => (
                      <div key={item.content} className="flex items-start gap-3">
                        <item.icon className="mt-1 h-4 w-4 text-[#FFD1AE]" />
                        <div>
                          <p className="text-sm font-medium text-white">{item.content}</p>
                          {item.sub ? <p className="text-xs text-[#E6D7CC]">{item.sub}</p> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={marketingPanel}>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#C9A98D]">Praktisch</p>
                  <div className="mt-5 space-y-3 text-sm leading-6 text-[#D7D0C4]">
                    <div className="flex items-start gap-3">
                      <Clock className="mt-1 h-4 w-4 text-[#F28A3F]" />
                      <span>{t('directContact.hours')}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building className="mt-1 h-4 w-4 text-[#F28A3F]" />
                      <span>Apeldoorn, Nederland</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-4 w-4 text-[#F28A3F]" />
                      <span>Geschikt voor verkenning, debrief of een serieuze implementatiestart.</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative border-b border-white/10 bg-[linear-gradient(180deg,#17110D_0%,#120F0C_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_22%,rgba(242,138,63,0.1),transparent_24%)]" />
        <div className="container relative mx-auto px-4 py-12 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
              >
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B7C6A5]">Kies het soort gesprek</p>
                  <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#F6F2E8] sm:text-4xl">
                    {t('conversationTypes.title')}
                  </h2>
                </div>

                <div className="mt-6 space-y-4 sm:mt-10 sm:space-y-5">
                  {gespreksTypes.map((type, index) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;

                    return (
                      <motion.button
                        type="button"
                        key={type.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        viewport={{ once: true }}
                        onClick={() => setSelectedType(type.id)}
                        className={`block w-full cursor-pointer overflow-hidden rounded-2xl text-left transition-all duration-300 sm:rounded-[1.9rem] ${
                          isSelected ? marketingOrangePanel : marketingPanel
                        }`}
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 sm:rounded-2xl ${
                            isSelected
                              ? 'bg-[linear-gradient(135deg,#F28A3F,#E96A1C)] text-white shadow-[0_14px_30px_rgba(233,106,28,0.24)]'
                              : 'bg-white/[0.05] text-[#F6F2E8]'
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-white">{type.title}</h3>
                                <p className="text-sm text-[#C8C0B2]">{type.subtitle}</p>
                              </div>
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                                isSelected ? 'bg-white/10 text-[#FFE2CF]' : 'bg-white/[0.05] text-[#C9A98D]'
                              }`}>
                                {type.cta}
                              </span>
                            </div>
                            <ul className="mt-5 space-y-2.5">
                              {type.features.map((feature) => (
                                <li key={feature} className="flex gap-3 text-sm leading-6 text-[#D7D0C4]">
                                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#F28A3F]" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
              >
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#17110E] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:rounded-[2.1rem] sm:p-8">
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">{t('form.title')}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#C8C0B2]">
                    Beschrijf kort waar je vastloopt of wat je wilt verbeteren. Dan maken we het gesprek meteen nuttig.
                  </p>

                  <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="cname" className="text-sm text-[#DDC8BA]">{t('form.fields.name.label')} *</Label>
                        <Input
                          id="cname"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className={marketingField}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="ccompany" className="text-sm text-[#DDC8BA]">{t('form.fields.company.label')} *</Label>
                        <Input
                          id="ccompany"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          className={marketingField}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="cemail" className="text-sm text-[#DDC8BA]">{t('form.fields.email.label')} *</Label>
                        <Input
                          id="cemail"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className={marketingField}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cphone" className="text-sm text-[#DDC8BA]">{t('form.fields.phone.label')}</Label>
                        <Input
                          id="cphone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className={marketingField}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="serviceType" className="flex items-center gap-2 text-sm text-[#DDC8BA]">
                        <Briefcase className="h-4 w-4" />
                        {t('serviceType.label')}
                      </Label>
                      <select
                        id="serviceType"
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className={marketingSelect}
                      >
                        <option value="" className="bg-[#18110E]">{t('serviceType.placeholder')}</option>
                        {serviceTypes.map((service) => (
                          <option key={service.id} value={service.id} className="bg-[#18110E]">
                            {service.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-sm text-[#DDC8BA]">{t('form.fields.message.label')}</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        className={marketingTextarea}
                        placeholder={t('form.fields.message.placeholder')}
                        rows={5}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="date" className="text-sm text-[#DDC8BA]">{t('form.fields.preferredDate.label')}</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.preferredDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                          className={marketingField}
                        />
                      </div>
                      <div>
                        <Label htmlFor="time" className="text-sm text-[#DDC8BA]">{t('form.fields.preferredTime.label')}</Label>
                        <select
                          value={formData.preferredTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                          className={marketingSelect}
                        >
                          <option value="" className="bg-[#18110E]">{t('form.fields.preferredTime.placeholder')}</option>
                          <option value="morning" className="bg-[#18110E]">{t('form.fields.preferredTime.options.morning')}</option>
                          <option value="afternoon" className="bg-[#18110E]">{t('form.fields.preferredTime.options.afternoon')}</option>
                        </select>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className={`${marketingPrimaryButton} h-12 w-full`}
                      disabled={isSubmitting || isSuccess}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          Verzenden...
                        </>
                      ) : isSuccess ? (
                        <>
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Verzonden!
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-2 h-5 w-5" />
                          {t('form.submit')}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>

                    {isSuccess ? (
                      <div className="rounded-[1.4rem] border border-emerald-500/40 bg-emerald-500/15 p-4">
                        <p className="text-center text-sm font-medium text-emerald-300">
                          Uw aanvraag is succesvol ontvangen! We nemen binnen 24 uur contact met u op.
                        </p>
                      </div>
                    ) : (
                      <p className="text-center text-sm text-[#A7968A]">
                        {t('form.responseTime')}
                      </p>
                    )}
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-[#130F0D] py-12 sm:py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(242,138,63,0.1),transparent)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="max-w-3xl"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B7C6A5]">Locatie</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#F6F2E8] sm:text-3xl md:text-4xl">
                Bezoek ons kantoor of plan direct online afstemming.
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="mt-8 overflow-hidden rounded-2xl border border-white/10 sm:mt-10 sm:rounded-[2.1rem]"
            >
              <GoogleMapEmbed className="overflow-hidden" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"
            >
              <div className={marketingPanel}>
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">GroeimetAI</h3>
                <div className="mt-6 space-y-4 text-sm leading-6 text-[#D7D0C4]">
                  {[
                    { icon: Building, text: 'Apeldoorn, Nederland' },
                    { icon: Mail, text: 'info@groeimetai.io' },
                    { icon: Phone, text: '+31 6 81739018' },
                    { icon: Clock, text: 'Ma-Vr: 9:00-18:00' },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-[#F28A3F]" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>

                <Button asChild className={`mt-8 ${marketingPrimaryButton}`}>
                  <a
                    href="https://maps.google.com/?q=GroeimetAI+Apeldoorn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Open in Google Maps
                  </a>
                </Button>
              </div>

              <div className={marketingOrangePanel}>
                <p className="text-xs uppercase tracking-[0.2em] text-[#F8D6BE]">Waarom een gesprek werkt</p>
                <ul className="mt-6 space-y-4 text-sm leading-7 text-[#F5E8DE]">
                  {[
                    'We maken snel scherp waar AI wel en niet iets oplevert.',
                    'Je krijgt direct bruikbare input voor workflows, adoptie en implementatie.',
                    'We kunnen beoordelen of training genoeg is of dat tooling echt logisch wordt.',
                    'Snow-Flow en technische integraties komen pas op tafel als ze commercieel en operationeel kloppen.',
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <CheckCircle className="mt-1 h-4 w-4 flex-none text-[#FFD1AE]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
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
      <div className="min-h-screen bg-[#120F0C] flex items-center justify-center">
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
