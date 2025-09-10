import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor } from 'langchain/agents';
import { 
  DynamicTool, 
  DynamicStructuredTool,
  formatToOpenAIFunctionMessages 
} from '@langchain/core/tools';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { convertToOpenAIFunction } from '@langchain/core/utils/function_calling';
import { RunnableSequence } from '@langchain/core/runnables';
import { AgentAction, AgentFinish } from '@langchain/core/agents';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { searchContent } from '../pinecone/search';
import { z } from 'zod';
import { ConversationMemory } from './memory-manager';
import { WebScraperTool } from './tools/web-scraper';
import { ServiceNowTool } from './tools/servicenow';
import { SchedulingTool } from './tools/scheduling';
import { EmailTool } from './tools/email';
import { CalculatorTool } from './tools/calculator';
import { KnowledgeBaseTool } from './tools/knowledge-base';

export interface AgentConfig {
  temperature?: number;
  maxIterations?: number;
  verbose?: boolean;
  locale: 'en' | 'nl';
  userId: string;
  sessionId: string;
}

export class GroeimetAIAgent {
  private executor: AgentExecutor;
  private memory: ConversationMemory;
  private tools: (DynamicTool | DynamicStructuredTool)[];
  private llm: ChatOpenAI;
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.memory = new ConversationMemory(config.userId, config.sessionId);
    this.llm = this.initializeLLM();
    this.tools = this.initializeTools();
    this.executor = this.createAgentExecutor();
  }

  private initializeLLM(): ChatOpenAI {
    return new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: this.config.temperature || 0.3,
      openAIApiKey: process.env.OPENAI_API_KEY,
      maxTokens: 2000,
    });
  }

  private initializeTools(): (DynamicTool | DynamicStructuredTool)[] {
    const tools = [];

    // 1. Knowledge Base Search Tool
    tools.push(
      new DynamicStructuredTool({
        name: 'search_knowledge_base',
        description: 'Search GroeimetAI knowledge base for information about services, cases, and expertise',
        schema: z.object({
          query: z.string().describe('The search query'),
          filter: z.enum(['services', 'cases', 'team', 'all']).optional(),
        }),
        func: async ({ query, filter }) => {
          const results = await searchContent({
            query,
            locale: this.config.locale,
            limit: 5,
            filter: filter ? { type: [filter] } : undefined,
            includeContext: true,
          });
          
          if (results.context) {
            return results.context;
          }
          
          return results.results
            .map(r => `${r.title}: ${r.description}`)
            .join('\n\n');
        },
      })
    );

    // 2. Web Scraper Tool for Fresh Data
    tools.push(
      new DynamicStructuredTool({
        name: 'scrape_website',
        description: 'Scrape current information from GroeimetAI website pages',
        schema: z.object({
          url: z.string().describe('The URL to scrape'),
          selector: z.string().optional().describe('CSS selector to extract specific content'),
        }),
        func: async ({ url, selector }) => {
          const scraper = new WebScraperTool();
          return await scraper.scrape(url, selector);
        },
      })
    );

    // 3. ServiceNow Integration Tool
    tools.push(
      new DynamicStructuredTool({
        name: 'servicenow_query',
        description: 'Query ServiceNow information or create tickets',
        schema: z.object({
          action: z.enum(['query', 'create_ticket', 'check_status']),
          data: z.any(),
        }),
        func: async ({ action, data }) => {
          const snowTool = new ServiceNowTool();
          return await snowTool.execute(action, data);
        },
      })
    );

    // 4. Meeting Scheduler Tool
    tools.push(
      new DynamicStructuredTool({
        name: 'schedule_meeting',
        description: 'Schedule a consultation or meeting with GroeimetAI team',
        schema: z.object({
          type: z.enum(['consultation', 'demo', 'technical_discussion']),
          preferredDate: z.string(),
          duration: z.number().default(60),
          attendees: z.array(z.string()),
          notes: z.string().optional(),
        }),
        func: async (params) => {
          const scheduler = new SchedulingTool();
          return await scheduler.scheduleMeeting(params);
        },
      })
    );

    // 5. Email Tool
    tools.push(
      new DynamicStructuredTool({
        name: 'send_email',
        description: 'Send follow-up emails or information to users',
        schema: z.object({
          to: z.string().email(),
          subject: z.string(),
          content: z.string(),
          attachments: z.array(z.string()).optional(),
        }),
        func: async (params) => {
          const emailTool = new EmailTool();
          return await emailTool.sendEmail(params);
        },
      })
    );

    // 6. Calculator Tool for ROI/Cost Calculations
    tools.push(
      new DynamicTool({
        name: 'calculate',
        description: 'Perform calculations for ROI, costs, or technical metrics',
        func: async (input: string) => {
          const calculator = new CalculatorTool();
          return calculator.evaluate(input);
        },
      })
    );

    // 7. Multi-Step Reasoning Tool
    tools.push(
      new DynamicStructuredTool({
        name: 'multi_step_analysis',
        description: 'Break down complex questions into steps and reason through them',
        schema: z.object({
          question: z.string(),
          steps: z.array(z.string()),
        }),
        func: async ({ question, steps }) => {
          const results = [];
          for (const step of steps) {
            // Execute each step with context from previous steps
            const stepResult = await this.executeStep(step, results);
            results.push(stepResult);
          }
          return results.join('\n\n');
        },
      })
    );

    // 8. Document Generator Tool
    tools.push(
      new DynamicStructuredTool({
        name: 'generate_document',
        description: 'Generate proposals, reports, or technical documentation',
        schema: z.object({
          type: z.enum(['proposal', 'report', 'technical_spec', 'quote']),
          requirements: z.string(),
          format: z.enum(['pdf', 'docx', 'markdown']).default('pdf'),
        }),
        func: async (params) => {
          // This would integrate with document generation services
          return `Generated ${params.type} document based on requirements`;
        },
      })
    );

    return tools;
  }

  private createAgentExecutor(): AgentExecutor {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', this.getSystemPrompt()],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad'),
    ]);

    const llmWithTools = this.llm.bind({
      functions: this.tools.map(tool => convertToOpenAIFunction(tool)),
    });

    const agent = RunnableSequence.from([
      {
        input: (x: any) => x.input,
        agent_scratchpad: (x: any) => formatToOpenAIFunctionMessages(x.intermediateSteps),
        chat_history: (x: any) => x.chat_history,
      },
      prompt,
      llmWithTools,
      this.parseOutput.bind(this),
    ]);

    return new AgentExecutor({
      agent,
      tools: this.tools,
      maxIterations: this.config.maxIterations || 5,
      verbose: this.config.verbose || false,
      returnIntermediateSteps: true,
      handleParsingErrors: true,
    });
  }

  private getSystemPrompt(): string {
    const basePrompt = this.config.locale === 'nl' 
      ? `Je bent de intelligente AI-assistent van GroeimetAI, een toonaangevend AI consultancy bedrijf.
      
Je hebt toegang tot verschillende tools om gebruikers te helpen:
- Zoeken in onze kennisbank voor informatie over diensten en cases
- Live website data ophalen voor actuele informatie
- ServiceNow integratie voor ticket management
- Meetings plannen voor consultaties
- E-mails versturen met informatie
- Berekeningen maken voor ROI en kosten
- Multi-step redeneren voor complexe vragen
- Documenten genereren zoals voorstellen en rapporten

Je bent proactief, professioneel en gefocust op het leveren van waarde. Je gebruikt tools wanneer nodig om accurate, actuele informatie te geven.

Belangrijke richtlijnen:
1. Gebruik ALTIJD de search_knowledge_base tool eerst voor vragen over GroeimetAI
2. Gebruik scrape_website voor actuele informatie die niet in de kennisbank staat
3. Bied aan om meetings te plannen wanneer gebruikers interesse tonen
4. Genereer documenten wanneer gebruikers om voorstellen of informatie vragen
5. Gebruik multi_step_analysis voor complexe technische vragen`

      : `You are the intelligent AI assistant for GroeimetAI, a leading AI consultancy company.
      
You have access to various tools to help users:
- Search our knowledge base for information about services and cases
- Fetch live website data for current information
- ServiceNow integration for ticket management
- Schedule meetings for consultations
- Send emails with information
- Perform calculations for ROI and costs
- Multi-step reasoning for complex questions
- Generate documents like proposals and reports

You are proactive, professional, and focused on delivering value. Use tools when needed to provide accurate, current information.

Important guidelines:
1. ALWAYS use search_knowledge_base tool first for questions about GroeimetAI
2. Use scrape_website for current information not in the knowledge base
3. Offer to schedule meetings when users show interest
4. Generate documents when users ask for proposals or information
5. Use multi_step_analysis for complex technical questions`;

    return basePrompt;
  }

  private parseOutput(output: any): AgentAction | AgentFinish {
    if (output.function_call) {
      return {
        tool: output.function_call.name,
        toolInput: JSON.parse(output.function_call.arguments),
        log: output.content || '',
      } as AgentAction;
    }
    
    return {
      returnValues: { output: output.content },
      log: output.content,
    } as AgentFinish;
  }

  private async executeStep(step: string, previousResults: string[]): Promise<string> {
    const context = previousResults.length > 0 
      ? `Previous analysis:\n${previousResults.join('\n')}\n\nCurrent step: ${step}`
      : step;
    
    const response = await this.llm.invoke(context);
    return response.content as string;
  }

  public async chat(message: string, history?: BaseMessage[]): Promise<{
    response: string;
    toolsUsed: string[];
    intermediateSteps?: any[];
  }> {
    try {
      // Load conversation memory
      const memoryHistory = await this.memory.getHistory();
      const chatHistory = history || memoryHistory;

      // Execute agent
      const result = await this.executor.invoke({
        input: message,
        chat_history: chatHistory,
      });

      // Save to memory
      await this.memory.addMessage(new HumanMessage(message));
      await this.memory.addMessage(new AIMessage(result.output));

      // Extract tools used
      const toolsUsed = result.intermediateSteps?.map((step: any) => step.action.tool) || [];

      return {
        response: result.output,
        toolsUsed,
        intermediateSteps: result.intermediateSteps,
      };
    } catch (error) {
      console.error('Agent execution error:', error);
      throw error;
    }
  }

  public async clearMemory(): Promise<void> {
    await this.memory.clear();
  }

  public async getMemorySummary(): Promise<string> {
    return await this.memory.getSummary();
  }
}