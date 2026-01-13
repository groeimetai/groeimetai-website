/**
 * Agent Core
 * Main orchestration logic for the Firestore-based chatbot agent
 * Uses Anthropic Claude Sonnet 4.5 with tool calling
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AgentContext, AgentResponse, ConversationMessage } from './types';
import { executeTool, authenticatedTools, guestTools } from './tools';
import { getSystemPrompt, getFallbackResponse } from './prompts/system';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model configuration
const MODEL = 'claude-sonnet-4-5-20250514';
const MAX_TOKENS = 1024;

/**
 * Maximum number of tool call iterations to prevent infinite loops
 */
const MAX_TOOL_ITERATIONS = 3;

/**
 * Convert conversation history to Anthropic format
 */
function formatHistory(
  history: ConversationMessage[]
): Anthropic.MessageParam[] {
  return history.map((msg) => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content,
  }));
}

/**
 * Detect topic from message for fallback responses
 */
function detectTopic(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('diensten') ||
    lowerMessage.includes('services') ||
    lowerMessage.includes('wat doen jullie')
  ) {
    return 'services';
  }
  if (lowerMessage.includes('contact') || lowerMessage.includes('bereik')) {
    return 'contact';
  }
  if (
    lowerMessage.includes('prijs') ||
    lowerMessage.includes('kosten') ||
    lowerMessage.includes('price') ||
    lowerMessage.includes('cost')
  ) {
    return 'prijzen';
  }
  if (lowerMessage.includes('multi-agent') || lowerMessage.includes('orchestration')) {
    return 'multi-agent';
  }

  return null;
}

/**
 * Extract text from Anthropic content blocks
 */
function extractText(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
}

/**
 * Run the agent with a message
 */
export async function runAgent(
  message: string,
  context: AgentContext,
  history: ConversationMessage[] = []
): Promise<AgentResponse> {
  const toolsUsed: string[] = [];

  try {
    // Get tools based on authentication status
    const tools = context.isAuthenticated ? authenticatedTools : guestTools;

    // Build system prompt
    const systemPrompt = getSystemPrompt(context);

    // Build messages array
    const messages: Anthropic.MessageParam[] = [
      ...formatHistory(history),
      { role: 'user', content: message },
    ];

    // Initial API call with tools
    let response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      tools,
      messages,
    });

    // Process tool calls iteratively
    let iterations = 0;
    const conversationMessages = [...messages];

    while (response.stop_reason === 'tool_use' && iterations < MAX_TOOL_ITERATIONS) {
      // Find tool use blocks
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      if (toolUseBlocks.length === 0) break;

      // Add assistant message with tool calls
      conversationMessages.push({
        role: 'assistant',
        content: response.content,
      });

      // Execute each tool and collect results
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolCall of toolUseBlocks) {
        console.log(`🔧 Executing tool: ${toolCall.name}`);
        toolsUsed.push(toolCall.name);

        const toolResult = await executeTool(
          toolCall.name,
          (toolCall.input as Record<string, unknown>) || {},
          context
        );

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }

      // Add tool results to conversation
      conversationMessages.push({
        role: 'user',
        content: toolResults,
      });

      // Continue conversation with tool results
      response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        tools,
        messages: conversationMessages,
      });

      iterations++;
    }

    // Get final text response
    const text = extractText(response.content);

    if (!text) {
      // No text response, use fallback
      const topic = detectTopic(message);
      return {
        text: getFallbackResponse(topic, context.locale),
        toolsUsed,
      };
    }

    // Truncate if too long
    const truncatedText = text.length > 2000 ? text.substring(0, 2000) + '...' : text;

    return {
      text: truncatedText,
      toolsUsed,
    };
  } catch (error) {
    console.error('Agent error:', error);

    // Check for specific Anthropic errors
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API Error: ${error.status} - ${error.message}`);

      // Handle rate limiting
      if (error.status === 429) {
        return {
          text:
            context.locale === 'nl'
              ? 'De chatbot is tijdelijk overbelast. Probeer het over een minuut opnieuw.'
              : 'The chatbot is temporarily overloaded. Please try again in a minute.',
          toolsUsed,
          error: 'Rate limited',
        };
      }
    }

    // Return fallback response
    const topic = detectTopic(message);
    return {
      text: getFallbackResponse(topic, context.locale),
      toolsUsed,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Simple agent run without tools (for quick responses)
 */
export async function runSimpleAgent(
  message: string,
  context: AgentContext,
  history: ConversationMessage[] = []
): Promise<AgentResponse> {
  try {
    const systemPrompt = getSystemPrompt(context);

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [
        ...formatHistory(history),
        { role: 'user', content: message },
      ],
    });

    const text = extractText(response.content);
    const truncatedText = text.length > 2000 ? text.substring(0, 2000) + '...' : text;

    return {
      text: truncatedText,
    };
  } catch (error) {
    console.error('Simple agent error:', error);

    const topic = detectTopic(message);
    return {
      text: getFallbackResponse(topic, context.locale),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
