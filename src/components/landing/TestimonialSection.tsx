'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export default function TestimonialSection() {
  return (
    <section className="py-16 relative" style={{ backgroundColor: '#080D14' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 relative">
              {/* Quote Icon */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#F87315' }}
                >
                  <Quote className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* ServiceNow Testimonial */}
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">SN</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-bold">ServiceNow Manager, AI Product Content</h4>
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-blue-400 text-sm">LinkedIn</span>
                    </div>
                    <p className="text-white/60 text-sm">Verified ServiceNow employee</p>
                  </div>
                </div>
                
                <blockquote className="text-white/90 leading-relaxed mb-4 italic">
                  "That someone could put this together so quickly not only shows how much talent is out there in the greater ServiceNow community, but also indicates how much <strong>the entire development process is now changing</strong>. Niels van der Werf is just one of thousands who are out there now putting AI tools to work, and we're still truly in the early days of applying this tech."
                </blockquote>
                
                <div className="flex items-center gap-2 text-blue-300 text-sm">
                  <span>📝</span>
                  <span>Over Snow-Flow: Claude + ServiceNow MCP integratie</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-6">
                Waarom <span style={{ color: '#F87315' }}>GroeimetAI</span>?
              </h3>

              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F87315' }}>
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Early adopters</p>
                      <p className="text-white/60 text-sm">We zien trends voordat ze mainstream worden</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F87315' }}>
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Open source first</p>
                      <p className="text-white/60 text-sm">Snow-flow is onze commitment aan transparantie</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F87315' }}>
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Praktisch</p>
                      <p className="text-white/60 text-sm">Geen consultancy fluff, maar werkende code</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F87315' }}>
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Samen bouwen</p>
                      <p className="text-white/60 text-sm">We leren en groeien met onze klanten</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F87315' }}>
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Nederlandse context</p>
                      <p className="text-white/60 text-sm">We begrijpen de lokale markt en regelgeving</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}