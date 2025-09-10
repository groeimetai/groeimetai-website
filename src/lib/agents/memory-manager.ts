import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { ConversationSummaryMemory } from 'langchain/memory';
import { ChatOpenAI } from '@langchain/openai';
import { Redis } from '@upstash/redis';

export class ConversationMemory {
  private memory: ConversationSummaryMemory;
  private redis: Redis | null = null;
  private userId: string;
  private sessionId: string;
  private memoryKey: string;
  private messages: BaseMessage[] = [];
  private maxMessages: number = 20;

  constructor(userId: string, sessionId: string) {
    this.userId = userId;
    this.sessionId = sessionId;
    this.memoryKey = `chat:${userId}:${sessionId}`;
    
    // Initialize Redis if configured
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    }

    // Initialize conversation summary memory
    const llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.memory = new ConversationSummaryMemory({
      llm,
      memoryKey: 'chat_history',
      returnMessages: true,
      maxTokenLimit: 2000,
    });
  }

  async addMessage(message: BaseMessage): Promise<void> {
    this.messages.push(message);
    
    // Keep only recent messages in memory
    if (this.messages.length > this.maxMessages) {
      // Summarize older messages
      const oldMessages = this.messages.slice(0, -10);
      const summary = await this.memory.predictNewSummary(
        oldMessages.map(m => m.content).join('\n'),
        ''
      );
      
      // Keep summary and recent messages
      this.messages = [
        new AIMessage(`Previous conversation summary: ${summary}`),
        ...this.messages.slice(-10),
      ];
    }

    // Save to Redis if available
    if (this.redis) {
      await this.saveToRedis();
    }
  }

  async getHistory(): Promise<BaseMessage[]> {
    // Try to load from Redis first
    if (this.redis) {
      await this.loadFromRedis();
    }
    
    return this.messages;
  }

  async getSummary(): Promise<string> {
    if (this.messages.length === 0) {
      return 'No conversation history';
    }
    
    const summary = await this.memory.predictNewSummary(
      this.messages.map(m => m.content).join('\n'),
      ''
    );
    
    return summary;
  }

  async clear(): Promise<void> {
    this.messages = [];
    await this.memory.clear();
    
    if (this.redis) {
      await this.redis.del(this.memoryKey);
    }
  }

  private async saveToRedis(): Promise<void> {
    if (!this.redis) return;
    
    try {
      const data = {
        messages: this.messages.map(m => ({
          type: m._getType(),
          content: m.content,
        })),
        timestamp: Date.now(),
      };
      
      // Set with 24 hour expiration
      await this.redis.set(this.memoryKey, JSON.stringify(data), {
        ex: 86400,
      });
    } catch (error) {
      console.error('Failed to save to Redis:', error);
    }
  }

  private async loadFromRedis(): Promise<void> {
    if (!this.redis) return;
    
    try {
      const data = await this.redis.get(this.memoryKey);
      
      if (data && typeof data === 'string') {
        const parsed = JSON.parse(data);
        this.messages = parsed.messages.map((m: any) => {
          return m.type === 'human' 
            ? new HumanMessage(m.content)
            : new AIMessage(m.content);
        });
      }
    } catch (error) {
      console.error('Failed to load from Redis:', error);
    }
  }

  // Get conversation context for specific topic
  async getTopicContext(topic: string): Promise<string> {
    const relevantMessages = this.messages.filter(m => 
      m.content.toLowerCase().includes(topic.toLowerCase())
    );
    
    if (relevantMessages.length === 0) {
      return '';
    }
    
    return relevantMessages
      .map(m => `${m._getType()}: ${m.content}`)
      .join('\n');
  }

  // Get user preferences and patterns
  async getUserPreferences(): Promise<{
    topics: string[];
    language: string;
    interests: string[];
  }> {
    const humanMessages = this.messages.filter(m => m._getType() === 'human');
    
    // Analyze topics discussed
    const topics = new Set<string>();
    const keywords = ['servicenow', 'ai', 'agent', 'multi-agent', 'rag', 'genai', 'consulting'];
    
    humanMessages.forEach(m => {
      keywords.forEach(keyword => {
        if (m.content.toLowerCase().includes(keyword)) {
          topics.add(keyword);
        }
      });
    });
    
    // Detect language preference
    const hasNL = humanMessages.some(m => 
      /\b(wat|hoe|kan|je|de|het|een|voor|met|van)\b/i.test(m.content)
    );
    
    return {
      topics: Array.from(topics),
      language: hasNL ? 'nl' : 'en',
      interests: Array.from(topics),
    };
  }
}