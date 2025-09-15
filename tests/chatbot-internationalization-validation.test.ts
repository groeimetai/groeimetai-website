/**
 * Chatbot Internationalization Validation Test
 * 
 * This test suite validates that the chatbot translation system
 * is properly implemented and working across both Dutch and English.
 */

import { describe, it, expect } from '@jest/globals';

describe('Chatbot Internationalization', () => {
  
  // Test translation structure
  describe('Translation Keys Structure', () => {
    it('should have all required Dutch chatbot translations', () => {
      const dutchTranslations = require('../src/translations/nl.json');
      
      // Interface translations
      expect(dutchTranslations.chatbot.interface.title).toBe('GroeimetAI Assistant');
      expect(dutchTranslations.chatbot.interface.subtitle).toBe('Altijd hier om te helpen');
      expect(dutchTranslations.chatbot.interface.initialMessage).toContain('Welkom bij GroeimetAI');
      expect(dutchTranslations.chatbot.interface.placeholderText).toBe('Typ uw bericht...');
      expect(dutchTranslations.chatbot.interface.placeholderVoice).toBe('Spreek of typ uw bericht...');
      
      // Voice translations
      expect(dutchTranslations.chatbot.voice.modeActive).toBe('Spraakmodus actief');
      expect(dutchTranslations.chatbot.voice.modeAvailable).toBe('Spraak invoer beschikbaar');
      
      // Widget translations
      expect(dutchTranslations.chatbot.widget.proactiveMessage).toContain('👋 Hulp nodig');
      expect(dutchTranslations.chatbot.widget.notNow).toBe('Niet nu');
      expect(dutchTranslations.chatbot.widget.letsChat).toBe('Laten we chatten');
      
      // Error messages
      expect(dutchTranslations.chatbot.errors.tooManyRequests).toContain('Te veel berichten');
      expect(dutchTranslations.chatbot.errors.connectionError).toContain('Mijn excuses');
    });

    it('should have all required English chatbot translations', () => {
      const englishTranslations = require('../src/translations/en.json');
      
      // Interface translations
      expect(englishTranslations.chatbot.interface.title).toBe('GroeimetAI Assistant');
      expect(englishTranslations.chatbot.interface.subtitle).toBe('Always here to help');
      expect(englishTranslations.chatbot.interface.initialMessage).toContain('Welcome to GroeimetAI');
      expect(englishTranslations.chatbot.interface.placeholderText).toBe('Type your message...');
      expect(englishTranslations.chatbot.interface.placeholderVoice).toBe('Speak or type your message...');
      
      // Voice translations
      expect(englishTranslations.chatbot.voice.modeActive).toBe('Voice mode active');
      expect(englishTranslations.chatbot.voice.modeAvailable).toBe('Voice input available');
      
      // Widget translations  
      expect(englishTranslations.chatbot.widget.proactiveMessage).toContain('👋 Need help');
      expect(englishTranslations.chatbot.widget.notNow).toBe('Not now');
      expect(englishTranslations.chatbot.widget.letsChat).toBe('Let\'s chat');
      
      // Error messages
      expect(englishTranslations.chatbot.errors.tooManyRequests).toContain('Too many messages');
      expect(englishTranslations.chatbot.errors.connectionError).toContain('Sorry, I\'m currently');
    });
  });

  // Test lead qualification translations
  describe('Lead Qualification Translations', () => {
    it('should have complete Dutch lead qualification texts', () => {
      const dutchTranslations = require('../src/translations/nl.json');
      const leadQual = dutchTranslations.chatbot.leadQualification;
      
      // Questions
      expect(leadQual.questions.email).toContain('e-mailadres');
      expect(leadQual.questions.company).toContain('bedrijf');
      expect(leadQual.questions.needs).toContain('AI-uitdagingen');
      expect(leadQual.questions.timeline).toContain('wanneer');
      expect(leadQual.questions.companySize).toContain('organisatie');
      
      // Responses  
      expect(leadQual.responses.rag).toContain('RAG implementatie');
      expect(leadQual.responses.llm).toContain('Taalmodellen');
      expect(leadQual.responses.automation).toContain('automatisering');
      expect(leadQual.responses.servicenow).toContain('ServiceNow');
      expect(leadQual.responses.consulting).toContain('strategie consulting');
    });

    it('should have complete English lead qualification texts', () => {
      const englishTranslations = require('../src/translations/en.json');
      const leadQual = englishTranslations.chatbot.leadQualification;
      
      // Questions
      expect(leadQual.questions.email).toContain('email address');
      expect(leadQual.questions.company).toContain('company');
      expect(leadQual.questions.needs).toContain('AI challenges');
      expect(leadQual.questions.timeline).toContain('When');
      expect(leadQual.questions.companySize).toContain('organization');
      
      // Responses
      expect(leadQual.responses.rag).toContain('RAG implementation');
      expect(leadQual.responses.llm).toContain('Language Models');
      expect(leadQual.responses.automation).toContain('automation');
      expect(leadQual.responses.servicenow).toContain('ServiceNow');
      expect(leadQual.responses.consulting).toContain('strategy consulting');
    });
  });

  // Test translation completeness
  describe('Translation Completeness', () => {
    it('should have matching structure between Dutch and English', () => {
      const dutchTranslations = require('../src/translations/nl.json');
      const englishTranslations = require('../src/translations/en.json');
      
      // Check that both have the same chatbot structure
      expect(typeof dutchTranslations.chatbot).toBe('object');
      expect(typeof englishTranslations.chatbot).toBe('object');
      
      // Check main sections exist in both
      const sections = ['interface', 'voice', 'widget', 'errors', 'leadQualification'];
      sections.forEach(section => {
        expect(dutchTranslations.chatbot[section]).toBeDefined();
        expect(englishTranslations.chatbot[section]).toBeDefined();
      });
      
      // Check interface keys match
      const interfaceKeys = Object.keys(dutchTranslations.chatbot.interface);
      const englishInterfaceKeys = Object.keys(englishTranslations.chatbot.interface);
      expect(interfaceKeys.sort()).toEqual(englishInterfaceKeys.sort());
    });

    it('should not have empty translation values', () => {
      const dutchTranslations = require('../src/translations/nl.json');
      const englishTranslations = require('../src/translations/en.json');
      
      // Function to check for empty values recursively
      const checkForEmptyValues = (obj: any, path: string = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === 'string') {
            expect(value.trim()).not.toBe('');
          } else if (typeof value === 'object' && value !== null) {
            checkForEmptyValues(value, currentPath);
          }
        }
      };
      
      checkForEmptyValues(dutchTranslations.chatbot, 'nl.chatbot');
      checkForEmptyValues(englishTranslations.chatbot, 'en.chatbot');
    });
  });

  // Test functionality
  describe('Component Integration', () => {
    it('should verify components use translation keys', () => {
      // Read the component files to check for translation usage
      const fs = require('fs');
      const path = require('path');
      
      const chatbotInterfaceFile = fs.readFileSync(
        path.join(__dirname, '../src/components/chatbot/ChatbotInterface.tsx'), 
        'utf8'
      );
      const chatbotWidgetFile = fs.readFileSync(
        path.join(__dirname, '../src/components/chatbot/ChatbotWidget.tsx'), 
        'utf8'
      );
      
      // Check that components import useTranslations
      expect(chatbotInterfaceFile).toContain("import { useTranslations } from 'next-intl'");
      expect(chatbotWidgetFile).toContain("import { useTranslations } from 'next-intl'");
      
      // Check that components use translation keys instead of hardcoded text
      expect(chatbotInterfaceFile).toContain("t('interface.title')");
      expect(chatbotInterfaceFile).toContain("t('interface.subtitle')");
      expect(chatbotInterfaceFile).toContain("t('interface.initialMessage')");
      expect(chatbotInterfaceFile).toContain("t('voice.modeActive')");
      expect(chatbotInterfaceFile).toContain("t('errors.tooManyRequests')");
      
      expect(chatbotWidgetFile).toContain("t('widget.proactiveMessage')");
      expect(chatbotWidgetFile).toContain("t('widget.notNow')");
      expect(chatbotWidgetFile).toContain("t('widget.letsChat')");
    });

    it('should verify no hardcoded English text remains in components', () => {
      const fs = require('fs');
      const path = require('path');
      
      const chatbotInterfaceFile = fs.readFileSync(
        path.join(__dirname, '../src/components/chatbot/ChatbotInterface.tsx'), 
        'utf8'
      );
      const chatbotWidgetFile = fs.readFileSync(
        path.join(__dirname, '../src/components/chatbot/ChatbotWidget.tsx'), 
        'utf8'
      );
      
      // Check that hardcoded English strings are removed
      expect(chatbotInterfaceFile).not.toContain('Always here to help');
      expect(chatbotInterfaceFile).not.toContain('Type your message...');
      expect(chatbotInterfaceFile).not.toContain('Voice mode active');
      expect(chatbotInterfaceFile).not.toContain('Powered by Gemini');
      
      expect(chatbotWidgetFile).not.toContain('Need help exploring our AI solutions');
      expect(chatbotWidgetFile).not.toContain('Not now');
      expect(chatbotWidgetFile).not.toContain("Let's chat");
      expect(chatbotWidgetFile).not.toContain('Chat met AI Assistent');
    });
  });
});

// Export for external use
export {};