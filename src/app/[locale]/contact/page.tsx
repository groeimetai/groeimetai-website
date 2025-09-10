'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Phone, Mail, Calendar, Target, Rocket, MessageCircle, 
  User, Building, Clock, ArrowRight, CheckCircle, Users
} from 'lucide-react';
import Image from 'next/image';
import MapSection from '@/components/contact/MapSection';

export default function ContactPage() {
  const t = useTranslations('contactPage');
  const [selectedType, setSelectedType] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
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
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        toast.success('Uw aanvraag is succesvol verzonden!');
        
        // Reset form
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
        
        // Show success message for 5 seconds
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative" style={{ backgroundColor: '#080D14' }}>
        
        <div className="relative container mx-auto px-4 py-32">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                {t('header.title')}{' '}
                <span
                  className="text-white px-4 py-2 inline-block"
                  style={{ background: 'linear-gradient(135deg, #F87315, #FF8533)' }}
                >
                  {t('header.highlight')}
                </span>
              </h1>
              <p className="text-xl text-white/90">
                {t('header.subtitle')}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Gesprek Types */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              

              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-8">{t('conversationTypes.title')}</h2>
              </div>
              
              <div className="space-y-6">
                {gespreksTypes.map((type, index) => {
                  return (
                    <motion.div
                      key={type.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`relative border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                        selectedType === type.id 
                          ? 'border-orange-500/50 bg-orange-500/10' 
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedType(type.id)}
                    >
                      
                      <div className="relative p-6">
                        <div className="flex items-center mb-4">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                            style={{ backgroundColor: selectedType === type.id ? '#F87315' : 'rgba(255,255,255,0.1)' }}
                          >
                            <type.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{type.title}</h3>
                            <p className="text-white/60">{type.subtitle}</p>
                          </div>
                        </div>

                        <ul className="space-y-2 mb-4">
                          {type.features.map((feature, idx) => (
                            <li key={idx} className="text-white/80 text-sm flex items-center">
                              <div className="w-1.5 h-1.5 rounded-full mr-3" style={{ backgroundColor: '#F87315' }}></div>
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <Button
                          className={`w-full transition-all duration-300 ${
                            selectedType === type.id
                              ? 'text-white'
                              : 'border border-white/20 text-white hover:bg-white/10'
                          }`}
                          style={selectedType === type.id ? { backgroundColor: '#F87315' } : {}}
                          variant={selectedType === type.id ? 'default' : 'outline'}
                        >
                          {type.cta}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Direct Contact */}
              <Card className="relative bg-white/5 border border-white/10 mt-8 overflow-hidden">
                <CardContent className="relative p-6">
                  <h3 className="text-lg font-bold text-white mb-4">{t('directContact.title')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                      <div>
                        <p className="text-white font-medium">{t('directContact.name')}</p>
                        <p className="text-white/60 text-sm">{t('directContact.role')}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                      <p className="text-white text-sm">{t('directContact.email')}</p>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                      <p className="text-white text-sm">{t('directContact.phone')}</p>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                      <p className="text-white/80 text-sm">{t('directContact.hours')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right: Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              
              <Card className="relative bg-white/10 border border-white/20 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-white mb-6">{t('form.title')}</h3>
                  
                  <form className="space-y-6 relative" onSubmit={handleSubmit}>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cname" className="text-white/80">{t('form.fields.name.label')} *</Label>
                        <Input
                          id="cname"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-white/5 border-white/20 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="ccompany" className="text-white/80">{t('form.fields.company.label')} *</Label>
                        <Input
                          id="ccompany"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          className="bg-white/5 border-white/20 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cemail" className="text-white/80">{t('form.fields.email.label')} *</Label>
                        <Input
                          id="cemail"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-white/5 border-white/20 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cphone" className="text-white/80">{t('form.fields.phone.label')}</Label>
                        <Input
                          id="cphone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-white/80">{t('form.fields.message.label')}</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder={t('form.fields.message.placeholder')}
                        rows={4}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date" className="text-white/80">{t('form.fields.preferredDate.label')}</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.preferredDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="time" className="text-white/80">{t('form.fields.preferredTime.label')}</Label>
                        <select
                          value={formData.preferredTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                          className="w-full bg-white/5 border border-white/20 text-white rounded-md px-3 py-2"
                        >
                          <option value="">{t('form.fields.preferredTime.placeholder')}</option>
                          <option value="morning">{t('form.fields.preferredTime.options.morning')}</option>
                          <option value="afternoon">{t('form.fields.preferredTime.options.afternoon')}</option>
                        </select>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full text-white font-semibold py-4"
                      style={{ backgroundColor: '#F87315' }}
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
                      <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                        <p className="text-green-400 text-sm text-center font-medium">
                          ✅ Uw aanvraag is succesvol ontvangen! We nemen binnen 24 uur contact met u op.
                        </p>
                      </div>
                    ) : (
                      <p className="text-white/60 text-sm text-center">
                        {t('form.responseTime')}
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>

              {/* Sfeer image onder het formulier */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-8"
              >
                <div className="sfeer-image" style={{ height: '100%', width: '100%', minHeight: '300px' }}>
                  <Image
                    src="/images/philippe-bontemps-FUfJGhpKITo-unsplash.jpg"
                    alt=""
                    width={600}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Google Maps Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Bezoek Ons Kantoor
              </h2>
              <p className="text-white/70">
                Gelegen in het hart van Apeldoorn, Nederland
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <MapSection className="mb-6" />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}