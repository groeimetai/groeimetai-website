import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../utils/errors.js';
import log from '../utils/logger.js';
import { cache } from '../utils/cache.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Model configurations
const modelConfigs = {
  'gemini-pro': {
    model: 'gemini-pro',
    maxTokens: 32768,
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
  },
  'gemini-pro-vision': {
    model: 'gemini-pro-vision',
    maxTokens: 16384,
    temperature: 0.4,
    topP: 0.8,
    topK: 32,
  },
};

/**
 * Gemini Service - handles all AI-powered features
 */
export const GeminiService = {
  /**
   * Generate AI consultation response
   */
  generateConsultationResponse: async (context, userQuery, options = {}) => {
    try {
      log.service('Gemini', 'generateConsultationResponse', { context, userQuery });

      const model = genAI.getGenerativeModel({
        model: modelConfigs['gemini-pro'].model,
      });

      const prompt = `
You are an AI consultant for GroeimetAI, specializing in AI solutions and digital transformation.

Context:
${JSON.stringify(context, null, 2)}

User Query:
${userQuery}

Please provide a professional, helpful, and detailed response that:
1. Directly addresses the user's query
2. Provides actionable insights and recommendations
3. Mentions relevant GroeimetAI services when appropriate
4. Maintains a consultative and professional tone
5. Includes specific examples or case studies when relevant

Response:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      return {
        content: response.text(),
        model: 'gemini-pro',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log.error('Gemini consultation generation failed', error);
      throw new AppError('Failed to generate AI response', 503);
    }
  },

  /**
   * Analyze document or image content
   */
  analyzeContent: async (content, contentType, analysisType = 'general') => {
    try {
      log.service('Gemini', 'analyzeContent', { contentType, analysisType });

      const model = genAI.getGenerativeModel({
        model:
          contentType === 'image'
            ? modelConfigs['gemini-pro-vision'].model
            : modelConfigs['gemini-pro'].model,
      });

      const analysisPrompts = {
        general:
          'Analyze this content and provide a comprehensive summary of key points, insights, and recommendations.',
        technical:
          'Provide a technical analysis of this content, including architecture, technologies, best practices, and potential improvements.',
        business:
          'Analyze this from a business perspective, including value proposition, market fit, ROI potential, and strategic recommendations.',
        requirements:
          'Extract and structure all requirements, user stories, and specifications from this content.',
      };

      const prompt = analysisPrompts[analysisType] || analysisPrompts.general;

      let result;
      if (contentType === 'image') {
        result = await model.generateContent([prompt, content]);
      } else {
        result = await model.generateContent(`${prompt}\n\nContent:\n${content}`);
      }

      const response = await result.response;

      return {
        analysis: response.text(),
        type: analysisType,
        model: contentType === 'image' ? 'gemini-pro-vision' : 'gemini-pro',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log.error('Gemini content analysis failed', error);
      throw new AppError('Failed to analyze content', 503);
    }
  },

  /**
   * Generate project proposal
   */
  generateProjectProposal: async (requirements, companyInfo) => {
    try {
      log.service('Gemini', 'generateProjectProposal', { requirements });

      const cacheKey = `proposal:${JSON.stringify(requirements)}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const model = genAI.getGenerativeModel({
        model: modelConfigs['gemini-pro'].model,
      });

      const prompt = `
Generate a comprehensive project proposal for GroeimetAI based on the following:

Client Requirements:
${JSON.stringify(requirements, null, 2)}

Company Information:
${JSON.stringify(companyInfo, null, 2)}

Create a professional proposal that includes:
1. Executive Summary
2. Project Understanding & Objectives
3. Proposed Solution Architecture
4. Technical Approach & Methodology
5. Implementation Timeline & Phases
6. Team Structure & Expertise
7. Deliverables & Milestones
8. Risk Assessment & Mitigation
9. Success Metrics & KPIs
10. Investment Estimate (provide ranges)

Format the response in a clear, structured manner suitable for a professional proposal document.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      const proposal = {
        content: response.text(),
        generatedAt: new Date().toISOString(),
        requirements,
        version: '1.0',
      };

      // Cache for 1 hour
      await cache.set(cacheKey, proposal, 3600);

      return proposal;
    } catch (error) {
      log.error('Gemini proposal generation failed', error);
      throw new AppError('Failed to generate proposal', 503);
    }
  },

  /**
   * Generate code snippets or technical solutions
   */
  generateTechnicalSolution: async (problem, constraints = {}) => {
    try {
      log.service('Gemini', 'generateTechnicalSolution', { problem, constraints });

      const model = genAI.getGenerativeModel({
        model: modelConfigs['gemini-pro'].model,
      });

      const prompt = `
As a senior technical architect at GroeimetAI, provide a solution for:

Problem:
${problem}

Constraints:
${JSON.stringify(constraints, null, 2)}

Provide:
1. Solution overview
2. Architecture design (if applicable)
3. Implementation code/pseudocode
4. Best practices and considerations
5. Performance and scalability notes
6. Security considerations
7. Testing approach
8. Deployment recommendations

Focus on production-ready, scalable solutions using modern best practices.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      return {
        solution: response.text(),
        problem,
        constraints,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log.error('Gemini technical solution generation failed', error);
      throw new AppError('Failed to generate technical solution', 503);
    }
  },

  /**
   * Analyze conversation sentiment and extract insights
   */
  analyzeConversation: async (messages) => {
    try {
      log.service('Gemini', 'analyzeConversation', { messageCount: messages.length });

      const model = genAI.getGenerativeModel({
        model: modelConfigs['gemini-pro'].model,
      });

      const conversationText = messages.map((m) => `${m.role}: ${m.content}`).join('\n');

      const prompt = `
Analyze this customer conversation and provide insights:

Conversation:
${conversationText}

Provide:
1. Overall sentiment (positive/neutral/negative with confidence score)
2. Key topics discussed
3. Customer pain points identified
4. Opportunities for GroeimetAI services
5. Recommended follow-up actions
6. Urgency level (low/medium/high)
7. Summary of customer needs
8. Potential objections or concerns

Format as structured JSON.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      try {
        return JSON.parse(response.text());
      } catch {
        // If JSON parsing fails, return structured object
        return {
          analysis: response.text(),
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      log.error('Gemini conversation analysis failed', error);
      throw new AppError('Failed to analyze conversation', 503);
    }
  },

  /**
   * Generate email templates
   */
  generateEmailTemplate: async (purpose, context) => {
    try {
      log.service('Gemini', 'generateEmailTemplate', { purpose, context });

      const model = genAI.getGenerativeModel({
        model: modelConfigs['gemini-pro'].model,
      });

      const prompt = `
Create a professional email template for GroeimetAI:

Purpose: ${purpose}
Context: ${JSON.stringify(context, null, 2)}

Requirements:
1. Professional tone aligned with GroeimetAI brand
2. Clear subject line
3. Engaging opening
4. Structured body with key points
5. Clear call-to-action
6. Professional closing
7. Include placeholders for personalization (e.g., {{firstName}}, {{companyName}})

Format the response with:
- Subject: [subject line]
- Body: [email body with proper formatting]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      return {
        template: response.text(),
        purpose,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log.error('Gemini email template generation failed', error);
      throw new AppError('Failed to generate email template', 503);
    }
  },

  /**
   * Validate API key
   */
  validateApiKey: async () => {
    try {
      const model = genAI.getGenerativeModel({
        model: modelConfigs['gemini-pro'].model,
      });

      const result = await model.generateContent('Hello, please respond with "API key is valid"');
      const response = await result.response;

      return {
        valid: response.text().includes('valid'),
        message: 'Gemini API key validated successfully',
      };
    } catch (error) {
      log.error('Gemini API key validation failed', error);
      return {
        valid: false,
        message: 'Invalid Gemini API key',
        error: error.message,
      };
    }
  },
};

// Export model configurations for reference
export { modelConfigs };
