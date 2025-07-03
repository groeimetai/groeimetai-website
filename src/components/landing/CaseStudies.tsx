'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Code, Zap, Brain, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const caseStudies = [
  {
    id: 1,
    title: 'Global Bank AI Transformation',
    client: 'Fortune 500 Financial Institution',
    industry: 'Finance',
    challenge: 'Legacy systems causing 48-hour processing delays for loan applications',
    solution:
      'Implemented multi-agent AI system with RAG architecture for intelligent document processing',
    results: [
      { metric: '95%', label: 'Reduction in processing time' },
      { metric: '3.2x', label: 'Increase in application volume' },
      { metric: '$12M', label: 'Annual cost savings' },
    ],
    image: '/images/case-study-finance.jpg',
    gradient: 'from-blue-600 to-purple-600',
  },
  {
    id: 2,
    title: 'Healthcare Provider Digital Evolution',
    client: 'Regional Healthcare Network',
    industry: 'Healthcare',
    challenge: 'Disconnected patient data across 23 facilities causing care coordination issues',
    solution:
      'ServiceNow integration with AI-powered patient data unification and predictive analytics',
    results: [
      { metric: '87%', label: 'Improvement in care coordination' },
      { metric: '60%', label: 'Reduction in admin tasks' },
      { metric: '4.8/5', label: 'Patient satisfaction score' },
    ],
    image: '/images/case-study-healthcare.jpg',
    gradient: 'from-green-600 to-teal-600',
  },
  {
    id: 3,
    title: 'E-commerce Giant Performance Boost',
    client: 'Leading Online Retailer',
    industry: 'Retail',
    challenge: 'Customer service overwhelmed with 50,000+ daily inquiries',
    solution: 'GenAI-powered customer service agents with real-time inventory integration',
    results: [
      { metric: '78%', label: 'Automated query resolution' },
      { metric: '4x', label: 'Customer service capacity' },
      { metric: '23%', label: 'Increase in sales conversion' },
    ],
    image: '/images/case-study-retail.jpg',
    gradient: 'from-orange-600 to-red-600',
  },
];

export default function CaseStudies() {
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-4">Proven Results</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real-world transformations powered by our AI and ServiceNow expertise
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={`/case-studies/${study.id}`}>
                <div className="group h-full bg-card rounded-2xl overflow-hidden shadow-premium hover-lift transition-all duration-300">
                  {/* Image placeholder with gradient */}
                  <div
                    className={`h-48 bg-gradient-to-br ${study.gradient} relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                        {study.industry}
                      </span>
                    </div>
                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <ArrowUpRight className="w-8 h-8 text-white transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 group-hover:gradient-text transition-all duration-300">
                      {study.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{study.client}</p>

                    {/* Challenge */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Challenge</h4>
                      <p className="text-sm">{study.challenge}</p>
                    </div>

                    {/* Results preview */}
                    <div className="space-y-3">
                      {study.results.map((result, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{result.label}</span>
                          <span className="text-lg font-semibold gradient-text">
                            {result.metric}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-6 pt-6 border-t border-border">
                      <span className="text-sm font-medium text-primary group-hover:underline">
                        Read full case study →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex justify-center mb-4">
                <Code className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold mb-2">10x</h3>
              <p className="text-white/80">More code output</p>
            </div>
            <div>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold mb-2">95%</h3>
              <p className="text-white/80">First-time accuracy</p>
            </div>
            <div>
              <div className="flex justify-center mb-4">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold mb-2">∞</h3>
              <p className="text-white/80">Creative solutions</p>
            </div>
            <div>
              <div className="flex justify-center mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold mb-2">24/7</h3>
              <p className="text-white/80">Continuous delivery</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
