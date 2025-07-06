'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Linkedin,
  Twitter,
  Github,
  Calendar,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import MapSection from '@/components/contact/MapSection';
import MeetingSchedulerModal from '@/components/meeting/MeetingSchedulerModal';

// Metadata needs to be exported from a server component
// This will be handled by creating a separate metadata export

// contactInfo will be defined inside the component to use translations

const socialLinks = [
  { icon: Linkedin, href: 'https://linkedin.com/company/groeimetai', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://twitter.com/groeimetai', label: 'Twitter' },
  { icon: Github, href: 'https://github.com/groeimetai', label: 'GitHub' },
];

export default function ContactPage() {
  const t = useTranslations('contact');
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);

  const contactInfo = [
    {
      icon: Mail,
      title: t('infoCards.email'),
      value: 'info@groeimetai.io',
      action: 'mailto:info@groeimetai.io',
    },
    {
      icon: Phone,
      title: t('infoCards.phone'),
      value: '+31 (6)81 739 018',
      action: 'tel:+31201234567',
    },
    {
      icon: MapPin,
      title: t('infoCards.address'),
      value: t('values.amsterdam'),
      action: '#',
    },
    {
      icon: Clock,
      title: t('infoCards.hours'),
      value: t('values.businessHours'),
      action: '#',
    },
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    message: '',
    privacy: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, service: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, privacy: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        service: '',
        message: '',
        privacy: false,
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-orange/5 to-green/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white px-8 py-4 inline-block"
              style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
            >
              {t('pageTitle')}
            </h1>
            <p className="text-xl text-white/80 mb-8">{t('pageDescription')}</p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-20 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {contactInfo.map((item, index) => (
              <Link key={index} href={item.action} className="block">
                <Card className="p-6 text-center hover-lift hover:shadow-premium transition-all">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="p-8">
                  <h2 className="text-2xl font-bold mb-6">{t('form.title')}</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">{t('form.nameLabel')}</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder={t('form.namePlaceholder')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">{t('form.emailLabel')}</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder={t('form.emailPlaceholder')}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="company">{t('form.companyLabel')}</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder={t('form.companyPlaceholder')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">{t('form.phoneLabel')}</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder={t('form.phonePlaceholder')}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="service">{t('form.serviceLabel')}</Label>
                      <Select value={formData.service} onValueChange={handleSelectChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.servicePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="genai-consultancy">
                            {t('form.services.genai')}
                          </SelectItem>
                          <SelectItem value="llm-integration">{t('form.services.llm')}</SelectItem>
                          <SelectItem value="rag-architecture">{t('form.services.rag')}</SelectItem>
                          <SelectItem value="servicenow-ai">
                            {t('form.services.servicenow')}
                          </SelectItem>
                          <SelectItem value="multi-agent">
                            {t('form.services.multiAgent')}
                          </SelectItem>
                          <SelectItem value="small-projects">{t('form.services.security')}</SelectItem>
                          <SelectItem value="other">{t('form.services.other')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="message">{t('form.messageLabel')}</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder={t('form.messagePlaceholder')}
                      />
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="privacy"
                        checked={formData.privacy}
                        onChange={(e) => handleCheckboxChange(e.target.checked)}
                        required
                      />
                      <Label htmlFor="privacy" className="text-sm text-muted-foreground">
                        {t.rich('form.privacyLabel', {
                          link: (chunks) => (
                            <Link href="/privacy" className="text-primary hover:underline">
                              {t('form.privacyLink')}
                            </Link>
                          ),
                        })}
                      </Label>
                    </div>

                    {submitStatus === 'success' && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-green-800 dark:text-green-200">
                          {t('form.successMessage')}
                        </p>
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-800 dark:text-red-200">{t('form.errorMessage')}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full shadow-premium hover-lift"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        t('form.sending')
                      ) : (
                        <>
                          {t('form.sendButton')}
                          <Send className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Additional Info */}
              <div className="space-y-6">
                {/* Direct Contact */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {t('additionalInfo.directContactTitle')}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t('additionalInfo.directContactDescription')}
                  </p>
                  <div className="space-y-3">
                    <a
                      href="tel:+31201234567"
                      className="flex items-center gap-3 text-primary hover:underline"
                    >
                      <Phone className="w-5 h-5" />
                      +31 (6)81 739 018
                    </a>
                    <a
                      href="mailto:info@groeimetai.io"
                      className="flex items-center gap-3 text-primary hover:underline"
                    >
                      <Mail className="w-5 h-5" />
                      info@groeimetai.io
                    </a>
                  </div>
                </Card>

                {/* Schedule Meeting */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {t('additionalInfo.scheduleMeetingTitle')}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t('additionalInfo.scheduleMeetingDescription')}
                  </p>
                  <Button 
                    className="w-full hover-lift" 
                    variant="outline"
                    onClick={() => setMeetingModalOpen(true)}
                  >
                    <Calendar className="mr-2 w-5 h-5" />
                    {t('additionalInfo.scheduleMeetingButton')}
                  </Button>
                </Card>

                {/* Social Links */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {t('additionalInfo.followUsTitle')}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t('additionalInfo.followUsDescription')}
                  </p>
                  <div className="flex gap-4">
                    {socialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                        aria-label={link.label}
                      >
                        <link.icon className="w-5 h-5 text-primary" />
                      </a>
                    ))}
                  </div>
                </Card>

                {/* Office Hours */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {t('additionalInfo.officeHoursTitle')}
                  </h3>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{t('additionalInfo.mondayFriday')}</span>
                      <span>9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('additionalInfo.saturday')}</span>
                      <span>{t('additionalInfo.onAppointment')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('additionalInfo.sunday')}</span>
                      <span>{t('additionalInfo.closed')}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">{t('location.title')}</h2>
            <MapSection className="shadow-lg" />
          </div>
        </div>
      </section>

      {/* Meeting Scheduler Modal */}
      <MeetingSchedulerModal 
        open={meetingModalOpen} 
        onOpenChange={setMeetingModalOpen} 
      />
    </main>
  );
}
