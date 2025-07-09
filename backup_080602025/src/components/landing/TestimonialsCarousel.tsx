'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'CEO',
    company: 'Global Banking Corporation',
    content:
      'GroeimetAI helped us reimagine our entire digital strategy. Their strategic insights led to a 40% increase in customer engagement and €15M in new revenue streams within the first year.',
    image: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    role: 'Chief Digital Officer',
    company: 'European Retail Group',
    content:
      'The partnership with GroeimetAI transformed our competitive position. Their advisory team guided us through a complex AI transformation that positioned us as industry leaders.',
    image: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: 3,
    name: 'Emma Thompson',
    role: 'Managing Director',
    company: 'Healthcare Innovation Fund',
    content:
      "GroeimetAI's strategic approach to AI adoption delivered exceptional value. They helped us identify and capture opportunities we didn't even know existed, resulting in 3x portfolio growth.",
    image: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Board Chairman',
    company: 'Manufacturing Excellence Group',
    content:
      'Working with GroeimetAI was transformative for our business. Their executive advisory team brought clarity to our AI strategy and delivered measurable impact across all business units.',
    image: 'https://i.pravatar.cc/150?img=4',
  },
];

export default function TestimonialsCarousel() {
  const t = useTranslations('testimonials');
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-4">{t('title')}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t('subtitle')}</p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Main testimonial card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="bg-card rounded-2xl p-8 md:p-12 shadow-premium"
              >
                {/* Quote icon */}
                <div className="mb-6">
                  <Quote className="w-12 h-12 text-primary/20" />
                </div>

                {/* Testimonial content */}
                <p className="text-lg md:text-xl leading-relaxed mb-8 text-foreground/90">
                  &quot;{testimonials[currentIndex].content}&quot;
                </p>

                {/* Author info */}
                <div className="flex items-center gap-4">
                  <Image
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-lg">{testimonials[currentIndex].name}</h4>
                    <p className="text-muted-foreground">
                      {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-16">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevTestimonial}
                className="hover-lift shadow-premium bg-background"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-16">
              <Button
                variant="ghost"
                size="icon"
                onClick={nextTestimonial}
                className="hover-lift shadow-premium bg-background"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 text-center"
        >
          <p className="text-sm text-muted-foreground mb-8">Trusted by industry leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[
              'TechCorp',
              'Global Finance',
              'Healthcare Plus',
              'Retail Dynamics',
              'Innovation Labs',
            ].map((company) => (
              <div
                key={company}
                className="text-2xl font-bold text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors"
              >
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
