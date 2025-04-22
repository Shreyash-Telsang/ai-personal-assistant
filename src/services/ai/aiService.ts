/**
 * Enhanced AI Service with ChatGPT-like capabilities
 * 
 * This service now supports:
 * 1. General knowledge questions - responds to any query like ChatGPT
 * 2. Code examples and programming help - detects programming questions
 * 3. Markdown & syntax highlighting - properly formats code responses
 * 4. Intelligent intent recognition - determines if user wants productivity help or general information
 * 
 * For full functionality, users need to set their OpenAI API key in Settings.
 * A fallback mode with limited capabilities is available for users without an API key.
 */

import { MessageCategory, AssistantIntent, EntityType, Message } from '../../store/assistantStore';
import { useAISettings } from './aiSettings';
import { useNoteStore } from '../../store/noteStore';
import { Citation } from '../../store/knowledgeStore';

// Define interfaces for NLP processing
interface IntentRecognitionResult {
  intent: AssistantIntent;
  confidence: number;
  category: MessageCategory;
  entities: ExtractedEntity[];
}

interface ExtractedEntity {
  type: EntityType;
  value: string;
  metadata?: Record<string, any>;
}

interface AIResponse {
  text: string;
  suggestedActions?: string[];
  relatedResources?: string[];
  isError?: boolean;
}

// Define interfaces for API responses
interface LocalNLPResult {
  intent: string;
  entities: Array<{
    entity: string;
    value: string;
    metadata?: Record<string, any>;
  }>;
  confidence: number;
}

// Main service class
class AIService {
  private isOnline: boolean = navigator.onLine;
  private isInitialized: boolean = false;
  private localNLPModel: any = null; // Reference to local model when loaded
  
  constructor() {
    // Listen for online/offline status changes
    window.addEventListener('online', () => this.isOnline = true);
    window.addEventListener('offline', () => this.isOnline = false);
    
    // Initialize local models
    this.initLocalModels();
  }
  
  // Method to directly set API key (for backward compatibility)
  public setApiKey(key: string): void {
    const settings = useAISettings.getState();
    settings.setApiKey(key);
  }
  
  // Method to directly set local processing flag (for backward compatibility)
  public setUseLocalProcessing(useLocal: boolean): void {
    const settings = useAISettings.getState();
    settings.setUseLocalProcessing(useLocal);
  }
  
  async initLocalModels() {
    // In a real implementation, this would load local models
    // For this demo, we'll just set a flag
    this.isInitialized = true;
    return Promise.resolve();
  }
  
  // Method to get the current API key from settings
  private getApiKey(): string | null {
    const settings = useAISettings.getState();
    return settings.apiKey;
  }
  
  // Method to check if we should use local processing
  private shouldUseLocalProcessing(): boolean {
    const settings = useAISettings.getState();
    return settings.useLocalProcessing;
  }
  
  async processUserInput(
    text: string,
    conversationHistory: Message[],
    contextData?: Record<string, any>
  ): Promise<{
    intent: IntentRecognitionResult,
    response: AIResponse
  }> {
    // Recognize intent
    const intentResult = await this.recognizeIntent(text, conversationHistory, contextData);
    
    // Generate response
    const response = await this.generateResponse(text, intentResult, conversationHistory, contextData);
    
    return {
      intent: intentResult,
      response
    };
  }
  
  async recognizeIntent(
    text: string,
    conversationHistory: Message[],
    contextData?: Record<string, any>
  ): Promise<IntentRecognitionResult> {
    // Try external API if online and API key is available
    const apiKey = this.getApiKey();
    if (this.isOnline && apiKey && !this.shouldUseLocalProcessing()) {
      try {
        return await this.recognizeIntentWithAPI(text, conversationHistory, contextData);
      } catch (error) {
        console.error('External API intent recognition failed:', error);
        // Fall back to local processing
      }
    }
    
    // Otherwise use local model
    return this.recognizeIntentLocally(text, contextData);
  }
  
  private async recognizeIntentWithAPI(
    text: string,
    conversationHistory: Message[],
    contextData?: Record<string, any>
  ): Promise<IntentRecognitionResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key not set');
    }

    try {
      // Get current settings
      const settings = useAISettings.getState();

      // Check for general knowledge or coding queries pattern
      const isGeneralQuery = this.isGeneralKnowledgeQuery(text);

      // If this is likely a general knowledge query, bypass complex intent recognition
      if (isGeneralQuery) {
        return {
          intent: 'general_query',
          confidence: 0.9,
          category: 'general',
          entities: []
        };
      }

      // Prepare the conversation history for the API
      const messages = [
        { role: 'system', content: 'You are an AI assistant that helps with task management, note-taking, focus sessions, and productivity. Your job is to understand user intent and extract relevant entities.' },
        ...conversationHistory.slice(-5).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: text }
      ];

      // Add a prompt to guide the model to analyze intent
      messages.push({
        role: 'user',
        content: `Please analyze my last message and determine: 
        1. The intent (create, update, delete, list, search, start, stop, help, settings, general_query)
        2. The category (task, note, focus, habit, learning, schedule, goal, general)
        3. Extract any relevant entities (task name, due date, priority, etc.)
        Format your response as a JSON object with intent, category, and entities properties.`
      });

      // Make the actual API call
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          messages,
          temperature: 0.3, // Lower temperature for more predictable responses for intent recognition
          max_tokens: 300
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Parse the response - we expect a JSON object
      let parsedResponse;
      try {
        const content = data.choices[0].message.content;
        // Extract JSON from response (in case it includes other text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not extract JSON from response');
        }
      } catch (err) {
        console.error('Error parsing API response:', err);
        throw new Error('Failed to parse API response');
      }

      // Make sure the response has the expected format
      if (!parsedResponse.intent || !parsedResponse.category) {
        throw new Error('API response missing required fields');
      }

      // Map to our expected format
      return {
        intent: parsedResponse.intent as AssistantIntent,
        confidence: 0.9, // API responses are typically high confidence
        category: parsedResponse.category as MessageCategory,
        entities: Array.isArray(parsedResponse.entities) 
          ? parsedResponse.entities.map((e: any) => ({
              type: e.type as EntityType,
              value: e.value,
              metadata: e.metadata
            }))
          : []
      };
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }
  
  private recognizeIntentLocally(
    text: string,
    contextData?: Record<string, any>
  ): Promise<IntentRecognitionResult> {
    return new Promise((resolve) => {
      // Simple rule-based NLP
      const lowerText = text.toLowerCase();
      let intent: AssistantIntent = 'help';
      let category: MessageCategory = 'general';
      let confidence = 0.7;
      let entities: ExtractedEntity[] = [];
      
      // Check for note creation pattern
      const noteCreationPattern = /^(?:can\s+you\s+|please\s+|)(create|make|add|take)\s+(?:a\s+|some\s+|)(?:new\s+|)notes?\s+(?:about|on|for|related to)\s+(.+)$/i;
      const noteMatch = text.match(noteCreationPattern);
      
      if (noteMatch && noteMatch[2]) {
        const noteTopic = noteMatch[2].trim();
        intent = 'create';
        category = 'note';
        confidence = 0.9;
        
        entities.push({
          type: 'note',
          value: noteTopic,
          metadata: {
            property: 'title',
            rawValue: noteTopic
          }
        });
        
        // Extract potential tags from the note topic
        const potentialTags = this.extractPotentialTags(noteTopic);
        if (potentialTags.length > 0) {
          entities.push({
            type: 'category',
            value: potentialTags.join(', '),
            metadata: {
              property: 'tags',
              tags: potentialTags
            }
          });
        }
        
        resolve({
          intent,
          category,
          confidence,
          entities
        });
        return;
      }
      
      // Known coding algorithm keywords
      const codingKeywords = [
        'binary search', 'search algorithm', 'algorithm', 'hello world', 
        'sorting', 'bubble sort', 'merge sort', 'quick sort', 
        'linked list', 'tree', 'graph', 'fibonacci', 'recursion',
        'traversal', 'data structure', 'dynamic programming',
        'write code for', 'code example', 'implementation',
        'programming', 'function for'
      ];
      
      // First check for exact coding queries
      const isCodingQuery = codingKeywords.some(keyword => lowerText.includes(keyword));
      if (isCodingQuery) {
        intent = 'general_query';
        category = 'general';
        confidence = 0.9;
        
        // Add the entire text as an entity for context
        entities.push({
          type: 'task',
          value: text.trim()
        });
        
        // Find which coding keywords were mentioned
        for (const keyword of codingKeywords) {
          if (lowerText.includes(keyword)) {
            entities.push({
              type: 'category',
              value: keyword
            });
          }
        }
        
        resolve({
          intent,
          category,
          confidence,
          entities
        });
        return;
      }
      
      // Then check for general knowledge queries
      if (this.isGeneralKnowledgeQuery(text)) {
        intent = 'general_query';
        category = 'general';
        confidence = 0.85;
        
        // Extract some entities from text for context
        const words = text.split(/\s+/);
        if (words.length > 0) {
          entities.push({
            type: 'task', // Using task as a generic entity type
            value: text.trim()
          });
        }
        
        // Check for code-related keywords
        if (lowerText.includes('code') || 
            lowerText.includes('program') || 
            lowerText.includes('function') || 
            lowerText.includes('hello world')) {
          entities.push({
            type: 'category',
            value: 'programming'
          });
        }
        
        resolve({
          intent,
          category,
          confidence,
          entities
        });
        return;
      }
      
      // Check for task-related intents
      if (lowerText.match(/add|create|new|make/i) && lowerText.match(/task|to-?do/i)) {
        intent = 'create';
        category = 'task';
        confidence = 0.85;
        entities = this.extractTaskEntities(text);
      } 
      // Check for note-related intents
      else if (lowerText.match(/add|create|new|make/i) && lowerText.match(/note/i)) {
        intent = 'create';
        category = 'note';
        confidence = 0.8;
        entities = this.extractNoteEntities(text);
      }
      // Check for list-related intents
      else if (lowerText.match(/show|list|view|display|get/i) && lowerText.match(/task|to-?do/i)) {
        intent = 'list';
        category = 'task';
        confidence = 0.8;
      }
      // Check for focus-related intents
      else if (lowerText.match(/start|begin|initiate/i) && lowerText.match(/focus|pomodoro|timer/i)) {
        intent = 'start';
        category = 'focus';
        confidence = 0.85;
        entities = this.extractTimerEntities(text);
      }
      // Check for travel-related intents
      else if (lowerText.match(/book|reserve|flight|trip|travel/i)) {
        intent = 'search';
        category = 'general'; // Using 'general' for travel-related queries
        confidence = 0.75;
      }
      // Check for habit-related intents
      else if (lowerText.match(/add|create|new|track/i) && lowerText.match(/habit/i)) {
        intent = 'create';
        category = 'habit';
        confidence = 0.8;
        entities = this.extractHabitEntities(text);
      }
      // Check for goal-related intents
      else if (lowerText.match(/add|create|set|new/i) && lowerText.match(/goal/i)) {
        intent = 'create';
        category = 'learning';
        confidence = 0.8;
        entities = this.extractGoalEntities(text);
      }
      
      // If we couldn't determine a specific intent
      if (intent === 'help') {
        // Try to categorize by topic
        if (lowerText.includes('task') || lowerText.includes('todo') || lowerText.includes('to-do')) {
          category = 'task';
        } else if (lowerText.includes('note') || lowerText.includes('write down')) {
          category = 'note';
        } else if (lowerText.includes('focus') || lowerText.includes('concentrate') || lowerText.includes('timer')) {
          category = 'focus';
        } else if (lowerText.includes('travel') || lowerText.includes('flight') || lowerText.includes('trip')) {
          category = 'general'; // Using 'general' for travel-related queries
        } else if (lowerText.includes('habit') || lowerText.includes('routine')) {
          category = 'habit';
        } else if (lowerText.includes('goal') || lowerText.includes('learn') || lowerText.includes('study')) {
          category = 'learning';
        }
      }
      
      resolve({
        intent,
        category,
        confidence,
        entities
      });
    });
  }
  
  // Response generation
  async generateResponse(
    text: string,
    intentResult: IntentRecognitionResult,
    conversationHistory: Message[],
    contextData?: Record<string, any>
  ): Promise<AIResponse> {
    // Try external API if online
    const apiKey = this.getApiKey();
    if (this.isOnline && apiKey && !this.shouldUseLocalProcessing()) {
      try {
        return await this.generateResponseWithAPI(text, intentResult, conversationHistory, contextData);
      } catch (error) {
        console.error('External API response generation failed:', error);
        // Fall back to local processing
      }
    }
    
    // Otherwise use local templates
    return this.generateResponseLocally(intentResult, contextData);
  }
  
  private async generateResponseWithAPI(
    text: string,
    intentResult: IntentRecognitionResult,
    conversationHistory: Message[],
    contextData?: Record<string, any>
  ): Promise<AIResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key not set');
    }

    try {
      // Get current settings
      const settings = useAISettings.getState();

      // Create a more helpful system prompt
      let systemPrompt = `You are an AI assistant integrated into a student productivity app.`;
      
      // Customize prompt based on detected intent
      if (intentResult.intent === 'general_query') {
        // Check if this is about a programming topic
        const isProgrammingQuery = intentResult.entities.some(e => 
          e.type === 'category' && 
          ['programming', 'algorithm', 'data structure', 'code', 'function'].includes(e.value.toLowerCase())
        );
        
        if (isProgrammingQuery || this.isCodeRelatedQuery(text)) {
          systemPrompt = `You are a helpful coding assistant that specializes in algorithms, data structures, and programming concepts.
Focus on providing detailed explanations with clear, well-commented code examples.
For algorithm questions, include:
1. A clear explanation of the algorithm's concept and how it works
2. Time and space complexity analysis
3. Step-by-step implementation in a common programming language
4. Well-commented code with thorough explanation
5. Example usage with sample input/output

When responding to questions about data structures, explain the concept, implementation details, operations, and use cases.
For general programming questions, provide comprehensive answers with relevant code snippets.
Use markdown formatting with proper code blocks and syntax highlighting.`;
        } else {
          systemPrompt = `You are a helpful AI assistant that provides accurate, educational responses to questions on any topic.
Your responses should be:
1. Comprehensive yet concise
2. Well-structured with markdown headings and lists when appropriate
3. Accurate and fact-based
4. Educational and informative
5. Engaging and easy to understand

If discussing academic subjects, provide context, examples, and relevant details without being excessively verbose.
Use markdown formatting to organize your responses clearly.`;
        }
      } else {
        // Default system prompt for productivity features
        systemPrompt = `You are an AI assistant integrated into a student productivity app.
You help with:
- Task management (creating, updating, listing tasks)
- Note-taking and knowledge management
- Focus sessions and time management
- Learning goals and habit tracking
- Study planning and scheduling
- General knowledge questions and coding help

You can respond to general questions about any topic, including coding, technology, science, history, etc.
For coding questions, provide code examples using markdown code blocks with appropriate syntax highlighting.
Keep responses concise, helpful, and focused. When suggesting actions, make them specific to the app's functionality.
You can use markdown formatting in your responses including code blocks with syntax highlighting.`;
      }

      // Special handling for general knowledge queries
      if (intentResult.intent === 'general_query') {
        // For general queries, use a simplified context with just the conversation history
        const messages = [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-5).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
          { role: 'user', content: text }
        ];

        // Make the API call for general query
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: settings.model,
            messages,
            temperature: settings.temperature,
            max_tokens: 1000
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Determine if this is a programming response and add appropriate actions
        if (this.isCodeRelatedQuery(text)) {
          return {
            text: content,
            suggestedActions: ['Save to Notes', 'Ask for explanation', 'See another algorithm']
          };
        } else {
          return {
            text: content,
            suggestedActions: ['Save to Notes', 'Ask follow-up', 'Learn more']
          };
        }
      }

      // For non-general queries, prepare context information if available
      let contextPrompt = '';
      if (contextData) {
        if (contextData.timeContext) {
          contextPrompt += `Current time of day: ${contextData.timeContext}. `;
        }
        if (contextData.activeSessionType) {
          contextPrompt += `User is currently in a ${contextData.activeSessionType} session. `;
        }
        if (contextData.recentTopics && contextData.recentTopics.length > 0) {
          contextPrompt += `Recent conversation topics: ${contextData.recentTopics.join(', ')}. `;
        }
      }

      // Prepare the intent information
      const intentPrompt = `The user's message has been analyzed with intent: ${intentResult.intent}, category: ${intentResult.category}.`;
      
      // Entities information
      const entitiesPrompt = intentResult.entities.length > 0 
        ? `Extracted entities: ${JSON.stringify(intentResult.entities)}.` 
        : 'No specific entities were extracted.';

      // Prepare the conversation history for the API
      const messages = [
        { role: 'system', content: systemPrompt },
        // Add context information if available
        ...(contextPrompt ? [{ role: 'system', content: contextPrompt }] : []),
        // Add intent information
        { role: 'system', content: `${intentPrompt} ${entitiesPrompt}` },
        // Last few messages from conversation history
        ...conversationHistory.slice(-5).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        // Current user message
        { role: 'user', content: text }
      ];

      // Make the actual API call
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          messages,
          temperature: settings.temperature, 
          max_tokens: 800
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Generate appropriate suggested actions based on intent and category
      const suggestedActions = this.getSuggestedActionsForIntent(
        intentResult.intent, 
        intentResult.category
      );

      return {
        text: content,
        suggestedActions
      };
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }
  
  private generateResponseLocally(
    intentResult: IntentRecognitionResult,
    contextData?: Record<string, any>
  ): AIResponse {
    const { intent, category, entities } = intentResult;
    
    // Handle note creation specifically
    if (intent === 'create' && category === 'note') {
      const noteTopic = entities.find(e => e.type === 'note')?.value || '';
      
      if (noteTopic) {
        // Generate note content based on the topic
        const noteContent = this.generateNoteContent(noteTopic);
        
        return {
          text: `# ${noteTopic}\n\n${noteContent}\n\nI've prepared this note about "${noteTopic}". Would you like me to save it to your notes?`,
          suggestedActions: ['Save to Notes', 'Edit before saving', 'Add tags']
        };
      }
    }
    
    // Handle general knowledge queries
    if (intent === 'general_query') {
      // Check for specific coding-related queries
      const codingRelatedEntities = entities.filter(e => 
        e.type === 'category' && 
        ['binary search', 'algorithm', 'hello world', 'sorting', 'linked list', 
         'tree', 'graph', 'fibonacci', 'traversal', 'code example'].includes(e.value)
      );
      
      if (codingRelatedEntities.length > 0) {
        // Use the first coding keyword we find to respond with appropriate code
        for (const entity of codingRelatedEntities) {
          // Direct matches to our predefined coding topics
          if (entity.value === 'binary search' || entity.value === 'search algorithm') {
            return this.getBinarySearchCode();
          } else if (entity.value === 'hello world') {
            return this.getHelloWorldCode();
          } else if (entity.value === 'sorting' || entity.value === 'bubble sort' || 
                     entity.value === 'merge sort' || entity.value === 'quick sort') {
            return this.getSortingAlgorithmsCode();
          } else if (entity.value === 'linked list') {
            return this.getLinkedListCode();
          } else if (entity.value === 'fibonacci') {
            return this.getFibonacciCode();
          } else if (entity.value === 'tree' || entity.value === 'traversal') {
            return this.getTreeTraversalCode();
          }
        }
        
        // If we didn't find an exact match but it's still coding related
        return this.getProgrammingResponse(entities);
      }
      
      // Non-coding general queries
      return {
        text: "I can see you're asking a general knowledge question. For the best experience with these types of questions, please add your OpenAI API key in the Settings. With an API key, I can provide detailed answers to virtually any question!\n\nIn the meantime, I'm here to help with your productivity tasks, notes, focus sessions, and study planning. What would you like help with?",
        suggestedActions: ['Add API key', 'Create a task', 'Start focus session']
      };
    }
    
    // Simple template-based responses
    switch (intent) {
      case 'create':
        if (category === 'task') {
          const taskName = entities.find(e => e.type === 'task')?.value || '';
          
          // Don't create empty tasks
          if (!taskName) {
            return {
              text: "What task would you like me to create? Please provide a name or description for the task.",
              suggestedActions: ['Work on report', 'Call clients', 'Study for exam']
            };
          }
          
          return {
            text: `I'll create a task "${taskName}". Would you like to add a due date or priority?`,
            suggestedActions: ['Add due date', 'Set high priority', 'Add to project']
          };
        } else if (category === 'note') {
          return {
            text: 'I\'ll create a new note for you. What would you like to include in it?',
            suggestedActions: ['Add content from clipboard', 'Add tags', 'Link to task']
          };
        } else if (category === 'habit') {
          const habitName = entities.find(e => e.type === 'habit')?.value || '';
          return {
            text: `I'll add "${habitName}" to your habit tracker. How often would you like to practice it?`,
            suggestedActions: ['Daily', 'Weekly', 'Custom schedule']
          };
        }
        break;
        
      case 'list':
        if (category === 'task') {
          return {
            text: 'Here are your current tasks. Would you like to filter them?',
            suggestedActions: ['Show high priority', 'Show due today', 'Show completed']
          };
        } else if (category === 'note') {
          return {
            text: 'Here are your recent notes. Would you like to filter or search them?',
            suggestedActions: ['Search by keyword', 'Filter by tag', 'Show pinned']
          };
        }
        break;
        
      case 'start':
        if (category === 'focus') {
          const duration = entities.find(e => e.type === 'focus_session')?.metadata?.duration || 25;
          return {
            text: `Starting a ${duration}-minute focus session. I'll notify you when it's time for a break.`,
            suggestedActions: ['Start now', 'Set custom duration', 'Cancel']
          };
        }
        break;
        
      case 'search':
        // Handle travel-related queries with search intent
        if (intent === 'search' && this.isRelatedToTravel(intentResult)) {
          return {
            text: "I can help you search for travel options. While I can't book flights directly, I can help you organize your travel plans. Would you like to create a travel task or note with details?",
            suggestedActions: ['Create travel task', 'Make travel note', 'Plan itinerary']
          };
        }
        break;
    }
    
    // Better fallback responses based on category
    switch (category) {
      case 'task':
        return {
          text: "I can help you manage your tasks. What would you like to do?",
          suggestedActions: ['Create a task', 'List my tasks', 'View high priority tasks']
        };
      case 'note':
        return {
          text: "I can help you with your notes. What would you like to do?",
          suggestedActions: ['Create a note', 'List my notes', 'Find recent notes']
        };
      case 'focus':
        return {
          text: "I can help you stay focused on your work. Would you like to start a focus session?",
          suggestedActions: ['Start 25 min session', 'Start 50 min session', 'Show focus stats']
        };
      default:
        // Check if the query is travel-related even if category is general
        if (this.isRelatedToTravel(intentResult)) {
          return {
            text: "I can help you organize travel plans by creating tasks and notes. Would you like me to help you plan your trip?",
            suggestedActions: ['Create travel task', 'Plan itinerary', 'Make packing list']
          };
        }
        
        return {
          text: "I'm your student success assistant. I can help with tasks, notes, focus sessions, and study planning. What would you like help with?",
          suggestedActions: ['Create a task', 'Start focus session', 'Create a note']
        };
    }
  }
  
  // Helper methods
  private mapIntentToCategory(intent: string): MessageCategory {
    const intentToCategoryMap: Record<string, MessageCategory> = {
      'create_task': 'task',
      'list_tasks': 'task',
      'delete_task': 'task',
      'create_note': 'note',
      'list_notes': 'note',
      'start_focus': 'focus',
      'create_habit': 'habit',
      'create_goal': 'learning',
      'general_help': 'general'
    };
    
    return intentToCategoryMap[intent] || 'general';
  }
  
  private extractTaskEntities(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    // Extract task title - simple regex pattern
    const titleMatch = text.match(/(?:add|create|new)\s+(?:a\s+)?(?:task|todo)(?:\s+to)?\s+(.+?)(?:\s+(?:due|with|for|by)|$)/i);
    if (titleMatch && titleMatch[1]) {
      entities.push({
        type: 'task',
        value: titleMatch[1].trim()
      });
    }
    
    // Extract due date
    const dueDateMatch = text.match(/(?:due|by)\s+(today|tomorrow|next week|next month|in \d+ days?)/i);
    if (dueDateMatch && dueDateMatch[1]) {
      entities.push({
        type: 'date',
        value: dueDateMatch[1],
        metadata: {
          property: 'dueDate',
          rawValue: dueDateMatch[1]
        }
      });
    }
    
    // Extract priority
    const priorityMatch = text.match(/(?:with|at)\s+(high|medium|low)\s+priority/i);
    if (priorityMatch && priorityMatch[1]) {
      entities.push({
        type: 'priority',
        value: priorityMatch[1].toLowerCase(),
        metadata: {
          property: 'priority'
        }
      });
    }
    
    return entities;
  }
  
  private extractNoteEntities(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    // Extract note title/content
    const contentMatch = text.match(/(?:add|create|new|make)\s+(?:a\s+)?note(?:\s+about)?\s+(.+?)(?:\s+(?:with|titled|called)|$)/i);
    if (contentMatch && contentMatch[1]) {
      entities.push({
        type: 'note',
        value: contentMatch[1].trim()
      });
    }
    
    // Extract tags
    const tagsMatch = text.match(/(?:with tags?|tagged with)\s+(.+?)(?:$|\.)/i);
    if (tagsMatch && tagsMatch[1]) {
      const tags = tagsMatch[1].split(/(?:,|\s+and\s+)/).map(tag => tag.trim());
      entities.push({
        type: 'category',
        value: tags.join(', '),
        metadata: {
          property: 'tags',
          tags
        }
      });
    }
    
    return entities;
  }
  
  private extractHabitEntities(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    // Extract habit name
    const nameMatch = text.match(/(?:add|create|track|new)\s+(?:a\s+)?habit(?:\s+to)?\s+(.+?)(?:\s+(?:every|daily|weekly|monthly|with|for|by)|$)/i);
    if (nameMatch && nameMatch[1]) {
      entities.push({
        type: 'habit',
        value: nameMatch[1].trim()
      });
    }
    
    // Extract frequency
    const frequencyMatch = text.match(/(?:every|each)\s+(day|week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    if (frequencyMatch && frequencyMatch[1]) {
      entities.push({
        type: 'time',
        value: frequencyMatch[1].toLowerCase(),
        metadata: {
          property: 'frequency'
        }
      });
    }
    
    return entities;
  }
  
  private extractGoalEntities(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    // Extract goal name
    const nameMatch = text.match(/(?:add|create|set|new)\s+(?:a\s+)?(?:learning\s+)?goal(?:\s+to)?\s+(.+?)(?:\s+(?:by|with|for|in)|$)/i);
    if (nameMatch && nameMatch[1]) {
      entities.push({
        type: 'goal',
        value: nameMatch[1].trim()
      });
    }
    
    // Extract target date
    const targetMatch = text.match(/(?:by|before|until)\s+(today|tomorrow|next week|next month|in \d+ days?|in \d+ weeks?|in \d+ months?)/i);
    if (targetMatch && targetMatch[1]) {
      entities.push({
        type: 'date',
        value: targetMatch[1],
        metadata: {
          property: 'targetDate',
          rawValue: targetMatch[1]
        }
      });
    }
    
    return entities;
  }
  
  private extractTimerEntities(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    // Extract duration
    const durationMatch = text.match(/(\d+)\s+(?:minute|min|minutes)/i);
    if (durationMatch && durationMatch[1]) {
      entities.push({
        type: 'focus_session',
        value: 'Pomodoro focus session',
        metadata: {
          type: 'focus',
          duration: parseInt(durationMatch[1])
        }
      });
    } else {
      // Default duration
      entities.push({
        type: 'focus_session',
        value: 'Pomodoro focus session',
        metadata: {
          type: 'focus',
          duration: 25 // Default Pomodoro length
        }
      });
    }
    
    return entities;
  }
  
  private getSuggestedActionsForIntent(intent: string, category: string): string[] {
    switch (intent) {
      case 'create_task':
        return ['Add more details', 'Set reminder', 'Add to calendar'];
      case 'create_note':
        return ['Save to Notes', 'Edit before saving', 'Add tags'];
      case 'set_timer':
        return ['Start now', 'Modify time', 'Cancel'];
      case 'general_query':
        if (category === 'programming' || category === 'technical') {
          return ['Save to Notes', 'Ask for examples', 'Simplify explanation'];
        } else if (category === 'academic') {
          return ['Save to Notes', 'Learn more', 'Quiz me on this'];
        } else {
          return ['Save to Notes', 'Ask follow-up', 'Learn more'];
        }
      default:
        return ['Ask follow-up', 'Save to Notes'];
    }
  }
  
  // Helper function to check if a query is related to travel
  private isRelatedToTravel(intentResult: IntentRecognitionResult): boolean {
    const travelKeywords = ['travel', 'flight', 'trip', 'book', 'vacation', 'hotel', 'itinerary'];
    // Look for travel-related terms in entities
    if (intentResult.entities.some(e => 
      travelKeywords.some(keyword => e.value.toLowerCase().includes(keyword))
    )) {
      return true;
    }
    
    // Check if this was a search intent with travel context
    return intentResult.intent === 'search' && intentResult.entities.length === 0 && intentResult.category === 'general';
  }

  // Helper function to detect if this is likely a general knowledge query
  private isGeneralKnowledgeQuery(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Check for programming/coding patterns
    if (lowerText.includes('code') || 
        lowerText.includes('program') || 
        lowerText.includes('function') || 
        lowerText.includes('algorithm') ||
        lowerText.includes('write') ||
        lowerText.includes('create') && (lowerText.includes('function') || lowerText.includes('class') || lowerText.includes('code'))) {
      return true;
    }
    
    // Check for question patterns that are likely general knowledge
    if (lowerText.startsWith('what') || 
        lowerText.startsWith('how') || 
        lowerText.startsWith('why') || 
        lowerText.startsWith('when') || 
        lowerText.startsWith('where') ||
        lowerText.startsWith('who') ||
        lowerText.startsWith('can you explain') ||
        lowerText.startsWith('can you tell me')) {
      return true;
    }
    
    // Check for instruction patterns
    if (lowerText.startsWith('tell me about') || 
        lowerText.startsWith('explain') ||
        lowerText.startsWith('define') ||
        lowerText.startsWith('give me')) {
      return true;
    }
    
    return false;
  }

  // Helper method to generate a programming response based on entities
  private getProgrammingResponse(entities: ExtractedEntity[]): AIResponse {
    // Extract the query text from the first entity (which should contain the full query)
    const queryText = entities.find(e => e.type === 'task')?.value || '';
    
    // Coding keywords to check for
    const codingKeywords = {
      'array': ['array', 'list', 'collection'],
      'search': ['search', 'find', 'locate'],
      'sort': ['sort', 'order', 'arrange'],
      'string': ['string', 'text', 'substring'],
      'tree': ['tree', 'binary tree', 'traversal'],
      'graph': ['graph', 'network', 'path'],
      'dynamic': ['dynamic', 'dp', 'optimization'],
      'hash': ['hash', 'map', 'dictionary'],
      'recursion': ['recursion', 'recursive', 'call itself']
    };
    
    // Determine what type of programming question it might be
    let detectedCategory = '';
    const lowerQuery = queryText.toLowerCase();
    
    for (const [category, keywords] of Object.entries(codingKeywords)) {
      if (keywords.some(word => lowerQuery.includes(word))) {
        detectedCategory = category;
        break;
      }
    }
    
    // Return appropriate response based on detected category
    switch (detectedCategory) {
      case 'search':
        return this.getBinarySearchCode();
      case 'sort':
        return this.getSortingAlgorithmsCode();
      case 'tree':
        return this.getTreeTraversalCode();
      case 'recursion':
        return this.getFibonacciCode();
      default:
        // Default code example if we can't determine a better match
        return this.getHelloWorldCode();
    }
  }
  
  // Code example generators for different algorithms
  private getBinarySearchCode(): AIResponse {
    return {
      text: `# Binary Search Implementation

Here's a binary search algorithm implementation in multiple languages:

\`\`\`javascript
// JavaScript Binary Search
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid; // Found the target at index mid
        }
        
        if (arr[mid] < target) {
            left = mid + 1; // Search the right half
        } else {
            right = mid - 1; // Search the left half
        }
    }
    
    return -1; // Target not found
}

// Example usage:
const sortedArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log(binarySearch(sortedArray, 7)); // Output: 6 (index of value 7)
\`\`\`

\`\`\`python
# Python Binary Search
def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid  # Found the target at index mid
        
        if arr[mid] < target:
            left = mid + 1  # Search the right half
        else:
            right = mid - 1  # Search the left half
    
    return -1  # Target not found

# Example usage:
sorted_array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
print(binary_search(sorted_array, 7))  # Output: 6 (index of value 7)
\`\`\`

\`\`\`java
// Java Binary Search
public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (arr[mid] == target) {
                return mid; // Found the target at index mid
            }
            
            if (arr[mid] < target) {
                left = mid + 1; // Search the right half
            } else {
                right = mid - 1; // Search the left half
            }
        }
        
        return -1; // Target not found
    }
    
    public static void main(String[] args) {
        int[] sortedArray = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        System.out.println(binarySearch(sortedArray, 7)); // Output: 6 (index of value 7)
    }
}
\`\`\`

Binary search has a time complexity of O(log n), making it very efficient for searching in sorted arrays.

For more detailed explanations or optimized implementations, please add your OpenAI API key in the Settings.`,
      suggestedActions: ['Implement merge sort', 'Implement linked list', 'Create a coding task']
    };
  }
  
  private getHelloWorldCode(): AIResponse {
    return {
      text: `Here's a simple "Hello World" program in several programming languages:

\`\`\`javascript
// JavaScript
console.log("Hello, World!");
\`\`\`

\`\`\`python
# Python
print("Hello, World!")
\`\`\`

\`\`\`java
// Java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

\`\`\`c
// C
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
\`\`\`

\`\`\`cpp
// C++
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
\`\`\`

For more programming examples and explanations, please add your OpenAI API key in the Settings.`,
      suggestedActions: ['Show another example', 'Create coding task', 'Learn about functions']
    };
  }
  
  private getSortingAlgorithmsCode(): AIResponse {
    return {
      text: `# Sorting Algorithms

Here are implementations of common sorting algorithms:

\`\`\`javascript
// JavaScript Bubble Sort
function bubbleSort(arr) {
    const n = arr.length;
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap elements
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    
    return arr;
}

// Example usage:
console.log(bubbleSort([5, 3, 8, 4, 2])); // Output: [2, 3, 4, 5, 8]
\`\`\`

\`\`\`python
# Python Merge Sort
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
        
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# Example usage:
print(merge_sort([5, 3, 8, 4, 2]))  # Output: [2, 3, 4, 5, 8]
\`\`\`

\`\`\`java
// Java Quick Sort
public class QuickSort {
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pivotIndex = partition(arr, low, high);
            
            quickSort(arr, low, pivotIndex - 1);
            quickSort(arr, pivotIndex + 1, high);
        }
    }
    
    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                
                // Swap elements
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        
        // Swap pivot element
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        
        return i + 1;
    }
    
    public static void main(String[] args) {
        int[] arr = {5, 3, 8, 4, 2};
        quickSort(arr, 0, arr.length - 1);
        
        for (int num : arr) {
            System.out.print(num + " ");
        }
        // Output: 2 3 4 5 8
    }
}
\`\`\`

For more sorting algorithms and optimized implementations, please add your OpenAI API key in the Settings.`,
      suggestedActions: ['Show binary search', 'Learn about time complexity', 'Create a coding task']
    };
  }
  
  private getLinkedListCode(): AIResponse {
    return {
      text: `# Linked List Implementation

Here's a simple linked list implementation in JavaScript:

\`\`\`javascript
// JavaScript Linked List
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }
    
    // Add a node to the end of the list
    append(data) {
        const newNode = new Node(data);
        
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        
        this.size++;
    }
    
    // Insert a node at a specific position
    insertAt(data, position) {
        if (position < 0 || position > this.size) {
            return false;
        }
        
        const newNode = new Node(data);
        
        if (position === 0) {
            newNode.next = this.head;
            this.head = newNode;
        } else {
            let current = this.head;
            let prev = null;
            let index = 0;
            
            while (index < position) {
                prev = current;
                current = current.next;
                index++;
            }
            
            newNode.next = current;
            prev.next = newNode;
        }
        
        this.size++;
        return true;
    }
    
    // Remove a node with specific data
    remove(data) {
        if (!this.head) {
            return null;
        }
        
        let current = this.head;
        let prev = null;
        
        // If head has the data to remove
        if (current.data === data) {
            this.head = current.next;
            this.size--;
            return current.data;
        }
        
        // Search for the data to remove
        while (current && current.data !== data) {
            prev = current;
            current = current.next;
        }
        
        // If data not found
        if (!current) {
            return null;
        }
        
        // Remove the node
        prev.next = current.next;
        this.size--;
        
        return current.data;
    }
    
    // Print the linked list
    printList() {
        let current = this.head;
        let result = '';
        
        while (current) {
            result += current.data + ' -> ';
            current = current.next;
        }
        
        result += 'null';
        return result;
    }
}

// Example usage:
const list = new LinkedList();
list.append(10);
list.append(20);
list.append(30);
list.insertAt(15, 1);
console.log(list.printList()); // Output: 10 -> 15 -> 20 -> 30 -> null
list.remove(20);
console.log(list.printList()); // Output: 10 -> 15 -> 30 -> null
\`\`\`

For more data structures and implementations in other languages, please add your OpenAI API key in the Settings.`,
      suggestedActions: ['Show binary search', 'Show tree implementation', 'Create a coding task']
    };
  }
  
  private getFibonacciCode(): AIResponse {
    return {
      text: `# Fibonacci Sequence Implementation

Here are several ways to compute the Fibonacci sequence:

\`\`\`javascript
// JavaScript - Recursive Fibonacci
function fibonacciRecursive(n) {
    if (n <= 1) {
        return n;
    }
    return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
}

// More efficient iterative approach
function fibonacciIterative(n) {
    if (n <= 1) {
        return n;
    }
    
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        const temp = a + b;
        a = b;
        b = temp;
    }
    
    return b;
}

// Example usage:
console.log(fibonacciIterative(10)); // Output: 55
\`\`\`

\`\`\`python
# Python - Dynamic Programming Approach
def fibonacci_dp(n):
    fib = [0, 1]
    
    for i in range(2, n + 1):
        fib.append(fib[i-1] + fib[i-2])
    
    return fib[n]

# Example usage:
print(fibonacci_dp(10))  # Output: 55
\`\`\`

\`\`\`java
// Java - Matrix Exponentiation (Fast)
public class FibonacciMatrix {
    public static long fibonacciMatrix(int n) {
        if (n <= 1) {
            return n;
        }
        
        long[][] F = {{1, 1}, {1, 0}};
        power(F, n - 1);
        
        return F[0][0];
    }
    
    private static void power(long[][] F, int n) {
        if (n <= 1) {
            return;
        }
        
        long[][] M = {{1, 1}, {1, 0}};
        
        power(F, n / 2);
        multiply(F, F);
        
        if (n % 2 != 0) {
            multiply(F, M);
        }
    }
    
    private static void multiply(long[][] F, long[][] M) {
        long a = F[0][0] * M[0][0] + F[0][1] * M[1][0];
        long b = F[0][0] * M[0][1] + F[0][1] * M[1][1];
        long c = F[1][0] * M[0][0] + F[1][1] * M[1][0];
        long d = F[1][0] * M[0][1] + F[1][1] * M[1][1];
        
        F[0][0] = a;
        F[0][1] = b;
        F[1][0] = c;
        F[1][1] = d;
    }
    
    public static void main(String[] args) {
        System.out.println(fibonacciMatrix(10));  // Output: 55
    }
}
\`\`\`

The Fibonacci sequence has many interesting properties and applications in computer science and mathematics.

For more algorithms and optimized implementations, please add your OpenAI API key in the Settings.`,
      suggestedActions: ['Show dynamic programming', 'Show recursion examples', 'Create a coding task']
    };
  }
  
  private getTreeTraversalCode(): AIResponse {
    return {
      text: `# Binary Tree Traversal Algorithms

Here's an implementation of binary tree traversals:

\`\`\`javascript
// JavaScript Binary Tree Traversals
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

// In-order traversal (Left -> Root -> Right)
function inOrderTraversal(root) {
    const result = [];
    
    function traverse(node) {
        if (node) {
            traverse(node.left);    // Visit left subtree
            result.push(node.val);  // Visit root
            traverse(node.right);   // Visit right subtree
        }
    }
    
    traverse(root);
    return result;
}

// Pre-order traversal (Root -> Left -> Right)
function preOrderTraversal(root) {
    const result = [];
    
    function traverse(node) {
        if (node) {
            result.push(node.val);  // Visit root
            traverse(node.left);    // Visit left subtree
            traverse(node.right);   // Visit right subtree
        }
    }
    
    traverse(root);
    return result;
}

// Post-order traversal (Left -> Right -> Root)
function postOrderTraversal(root) {
    const result = [];
    
    function traverse(node) {
        if (node) {
            traverse(node.left);    // Visit left subtree
            traverse(node.right);   // Visit right subtree
            result.push(node.val);  // Visit root
        }
    }
    
    traverse(root);
    return result;
}

// Level-order traversal (BFS)
function levelOrderTraversal(root) {
    if (!root) {
        return [];
    }
    
    const result = [];
    const queue = [root];
    
    while (queue.length > 0) {
        const node = queue.shift();
        result.push(node.val);
        
        if (node.left) {
            queue.push(node.left);
        }
        
        if (node.right) {
            queue.push(node.right);
        }
    }
    
    return result;
}

// Example usage:
const root = new TreeNode(1);
root.left = new TreeNode(2);
root.right = new TreeNode(3);
root.left.left = new TreeNode(4);
root.left.right = new TreeNode(5);

console.log('In-order:', inOrderTraversal(root));       // Output: [4, 2, 5, 1, 3]
console.log('Pre-order:', preOrderTraversal(root));     // Output: [1, 2, 4, 5, 3]
console.log('Post-order:', postOrderTraversal(root));   // Output: [4, 5, 2, 3, 1]
console.log('Level-order:', levelOrderTraversal(root)); // Output: [1, 2, 3, 4, 5]
\`\`\`

Tree traversals are fundamental algorithms used in many applications like processing syntax trees, XML parsing, and more.

For more tree algorithms and data structure implementations, please add your OpenAI API key in the Settings.`,
      suggestedActions: ['Show binary search', 'Show graph algorithms', 'Create a coding task']
    };
  }

  // Extract potential tags from a note topic
  private extractPotentialTags(topic: string): string[] {
    const commonCategories = [
      'Programming', 'Algorithm', 'Data Structure', 'Technology', 
      'Learning', 'Study', 'School', 'Computer Science', 'Research',
      'Personal', 'Work', 'Ideas', 'Important', 'Tutorial',
      'Theory', 'Concept', 'Definition', 'Reference'
    ];
    
    const potentialTags: string[] = [];
    const lowerTopic = topic.toLowerCase();
    
    // Check for programming languages
    const programmingLanguages = ['javascript', 'python', 'java', 'c++', 'c#', 'typescript', 'ruby', 'go'];
    for (const lang of programmingLanguages) {
      if (lowerTopic.includes(lang)) {
        potentialTags.push(lang.charAt(0).toUpperCase() + lang.slice(1));
        potentialTags.push('Programming');
        break;
      }
    }
    
    // Check for data structures
    const dataStructures = ['array', 'linked list', 'stack', 'queue', 'tree', 'graph', 'hash table', 'heap'];
    for (const ds of dataStructures) {
      if (lowerTopic.includes(ds)) {
        potentialTags.push('Data Structure');
        break;
      }
    }
    
    // Check for algorithms
    const algorithms = ['algorithm', 'sort', 'search', 'binary search', 'recursion', 'dynamic programming'];
    for (const algo of algorithms) {
      if (lowerTopic.includes(algo)) {
        potentialTags.push('Algorithm');
        break;
      }
    }
    
    // Check for general categories
    for (const category of commonCategories) {
      if (lowerTopic.includes(category.toLowerCase())) {
        potentialTags.push(category);
      }
    }
    
    // Remove duplicates and return
    const uniqueTags = new Set<string>(potentialTags);
    return Array.from(uniqueTags);
  }
  
  // Generate content for a note based on topic
  private generateNoteContent(topic: string): string {
    const lowerTopic = topic.toLowerCase();
    
    // Try to match the topic to our predefined content generators
    if (lowerTopic.includes('linked list') || lowerTopic.includes('linkedlist')) {
      return this.generateLinkedListTheory();
    } else if (lowerTopic.includes('binary search')) {
      return this.generateBinarySearchTheory();
    } else if (lowerTopic.includes('sorting') || lowerTopic.includes('sort algorithm')) {
      return this.generateSortingTheory();
    } else if (lowerTopic.includes('tree') || lowerTopic.includes('traversal')) {
      return this.generateTreeTheory();
    } else if (lowerTopic.includes('recursion') || lowerTopic.includes('recursive')) {
      return this.generateRecursionTheory();
    } else if (lowerTopic.includes('algorithm')) {
      return this.generateAlgorithmTheory();
    }
    
    // Generic note content for unknown topics
    return `This is a note about ${topic}. You can edit this content to add your own information, insights, and references about this topic.

## Key Points
- Add important points about ${topic} here
- Include definitions, concepts, and examples
- Note any questions or areas to explore further

## References
- [Add reference sources here]
- [Include links to helpful resources]

## Related Topics
- [List related topics that might be interesting to explore]

---
Note created with AI Task Assistant`;
  }
  
  // Theory content generators for different topics
  private generateLinkedListTheory(): string {
    return `## Linked List Theory

A linked list is a linear data structure where elements are stored in separate objects called nodes. Unlike arrays, linked list elements are not stored in contiguous memory locations.

### Key Characteristics
- **Dynamic Size**: Linked lists can grow or shrink during execution
- **Efficient Insertions/Deletions**: O(1) time complexity when position is known
- **Memory Usage**: Requires extra memory for pointers/references
- **Sequential Access**: No random access; must traverse from head

### Types of Linked Lists
1. **Singly Linked List**: Each node points to the next node
2. **Doubly Linked List**: Each node points to both next and previous nodes
3. **Circular Linked List**: Last node points back to first node

### Common Operations
- **Insertion**: Add a new node (at beginning, end, or middle)
- **Deletion**: Remove a node
- **Traversal**: Visit each node in the list
- **Search**: Find a node with a specific value

### Time Complexity
- Access: O(n)
- Search: O(n)
- Insertion: O(1) when position is known
- Deletion: O(1) when position is known

### Sample Implementation
\`\`\`javascript
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }
    
    // Add a node to the end
    append(data) {
        const newNode = new Node(data);
        
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        
        this.size++;
    }
}
\`\`\`

### Advantages
- Dynamic size allocation
- Efficient insertions and deletions
- No memory wastage (can use exactly as much memory as needed)

### Disadvantages
- Sequential access only (no random access)
- Extra memory needed for pointers
- Not cache-friendly due to non-contiguous memory allocation

### Common Applications
- Implementation of stacks and queues
- Symbol tables in compiler design
- Undo functionality in applications
- Next/previous navigation in media players and browsers
- Hash tables (for handling collisions)

### Variations and Advanced Concepts
- Skip Lists
- XOR Linked Lists
- Self-organizing lists
- Memory-efficient doubly linked lists`;
  }
  
  private generateBinarySearchTheory(): string {
    return `## Binary Search Theory

Binary search is an efficient algorithm for finding a target value within a sorted array. It works by repeatedly dividing the search interval in half.

### Key Characteristics
- **Prerequisite**: Array must be sorted
- **Divide and Conquer**: Eliminates half of the remaining elements each time
- **Efficient**: O(log n) time complexity
- **Comparison-based**: Uses comparisons to determine search direction

### Algorithm Steps
1. Find the middle element of the current search range
2. If the target equals the middle element, return the middle index
3. If the target is less than the middle element, search the left half
4. If the target is greater than the middle element, search the right half
5. Repeat until the element is found or the search range is empty

### Time Complexity
- **Best Case**: O(1) - target is the middle element
- **Average Case**: O(log n)
- **Worst Case**: O(log n)

### Space Complexity
- **Iterative Implementation**: O(1)
- **Recursive Implementation**: O(log n) due to call stack

### Sample Implementation
\`\`\`javascript
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid; // Target found
        }
        
        if (arr[mid] < target) {
            left = mid + 1; // Search right half
        } else {
            right = mid - 1; // Search left half
        }
    }
    
    return -1; // Target not found
}
\`\`\`

### Advantages
- Very efficient for large datasets
- Predictable performance (log n)
- Works well with large arrays that don't fit in cache

### Disadvantages
- Requires sorted data
- Not efficient for small datasets compared to linear search
- Not suitable for linked lists (no random access)

### Variations
- **Ternary Search**: Divides the array into three parts
- **Exponential Search**: Finds a range where element exists, then uses binary search
- **Interpolation Search**: Estimates position based on key values (like a phone book)
- **Fractional Cascading**: Optimizes multiple binary searches on the same data

### Applications
- Searching in databases
- Finding an element in a sorted array
- Implementation of logarithmic-time data structures
- System level applications and libraries
- Root finding algorithms in numerical analysis`;
  }
  
  private generateSortingTheory(): string {
    return `## Sorting Algorithms Theory

Sorting algorithms arrange elements in a specific order (usually ascending or descending). Different algorithms have different efficiency characteristics.

### Common Sorting Algorithms

#### Bubble Sort
- **Mechanism**: Repeatedly steps through the list, compares adjacent elements, and swaps them if needed
- **Time Complexity**: O(n²) average and worst case
- **Space Complexity**: O(1)
- **Stable**: Yes
- **Adaptive**: Yes (can be optimized for partially sorted arrays)

#### Selection Sort
- **Mechanism**: Divides the array into sorted and unsorted portions, repeatedly selects the minimum element from the unsorted portion
- **Time Complexity**: O(n²) for all cases
- **Space Complexity**: O(1)
- **Stable**: No (can be implemented as stable but not typically)
- **Adaptive**: No (always performs the same operations)

#### Insertion Sort
- **Mechanism**: Builds the sorted array one element at a time by inserting each element into its correct position
- **Time Complexity**: O(n²) average and worst case, O(n) best case
- **Space Complexity**: O(1)
- **Stable**: Yes
- **Adaptive**: Yes (efficient for small or partially sorted data)

#### Merge Sort
- **Mechanism**: Divides the array into halves, sorts them recursively, then merges the sorted halves
- **Time Complexity**: O(n log n) for all cases
- **Space Complexity**: O(n)
- **Stable**: Yes
- **Adaptive**: No (traditional implementation)

#### Quick Sort
- **Mechanism**: Selects a 'pivot' element and partitions the array around it, recursively sorting the partitions
- **Time Complexity**: O(n log n) average case, O(n²) worst case
- **Space Complexity**: O(log n) average case
- **Stable**: No (traditional implementation)
- **Adaptive**: No (can be made adaptive)

#### Heap Sort
- **Mechanism**: Builds a max heap, repeatedly extracts the maximum element
- **Time Complexity**: O(n log n) for all cases
- **Space Complexity**: O(1)
- **Stable**: No
- **Adaptive**: No

### Comparison of Sorting Algorithms

| Algorithm      | Best Case   | Average Case | Worst Case  | Space        | Stable | Adaptive |
|----------------|-------------|--------------|-------------|--------------|--------|----------|
| Bubble Sort    | O(n)        | O(n²)        | O(n²)       | O(1)         | Yes    | Yes      |
| Selection Sort | O(n²)       | O(n²)        | O(n²)       | O(1)         | No     | No       |
| Insertion Sort | O(n)        | O(n²)        | O(n²)       | O(1)         | Yes    | Yes      |
| Merge Sort     | O(n log n)  | O(n log n)   | O(n log n)  | O(n)         | Yes    | No       |
| Quick Sort     | O(n log n)  | O(n log n)   | O(n²)       | O(log n)     | No     | No       |
| Heap Sort      | O(n log n)  | O(n log n)   | O(n log n)  | O(1)         | No     | No       |

### Key Concepts

- **Stability**: A sorting algorithm is stable if it preserves the relative order of equal elements
- **Adaptivity**: An algorithm is adaptive if it takes advantage of existing order in the input
- **In-place Sorting**: Algorithms that use O(1) extra space
- **Internal vs External Sorting**: Whether all data fits in memory or requires external storage
- **Comparison vs Non-comparison Sorting**: Whether sorting is based on comparisons between elements

### Advanced Sorting Algorithms
- **Radix Sort**: Processes individual digits/characters
- **Counting Sort**: Uses counting of objects to sort
- **Bucket Sort**: Distributes elements into buckets, then sorts buckets
- **Tim Sort**: Hybrid of merge sort and insertion sort (used in Python and Java)
- **Intro Sort**: Hybrid of quick sort, heap sort, and insertion sort (used in C++ STL)

### Choosing the Right Algorithm
- Use **Insertion Sort** for small or nearly sorted datasets
- Use **Quick Sort** for average case efficiency when memory usage is a concern
- Use **Merge Sort** when stability is required and extra memory is available
- Use **Heap Sort** when worst-case performance is important and stability isn't required
- Use **Radix/Counting Sort** for specific data types with known ranges`;
  }
  
  private generateTreeTheory(): string {
    return `## Tree Data Structure Theory

A tree is a hierarchical data structure consisting of nodes connected by edges. Each tree has a root node, and every node (except the root) has a parent node and zero or more child nodes.

### Key Terminology
- **Root**: The topmost node of the tree
- **Node**: An element in the tree containing data and references to children
- **Edge**: Link between two nodes
- **Parent**: A node with children
- **Child**: A node connected to a parent node
- **Leaf**: A node with no children
- **Height**: The length of the longest path from root to a leaf
- **Depth**: The length of the path from the root to the node

### Types of Trees

#### Binary Trees
- Each node has at most two children (left and right)
- **Full Binary Tree**: Every node has 0 or 2 children
- **Complete Binary Tree**: All levels are filled except possibly the last
- **Perfect Binary Tree**: All internal nodes have two children and all leaves are at the same level
- **Balanced Binary Tree**: Height is O(log n)

#### Binary Search Trees (BST)
- Ordered binary tree where:
  - Left subtree contains only nodes with values less than the node's value
  - Right subtree contains only nodes with values greater than the node's value
- Allows for efficient searching, insertion, and deletion (O(log n) average case)

#### AVL Trees
- Self-balancing binary search tree
- The difference in height between left and right subtrees is at most 1
- Rebalances using rotations after insertions and deletions

#### Red-Black Trees
- Self-balancing binary search tree
- Each node is colored red or black
- Maintains balance through color changes and rotations
- Used in many standard libraries (e.g., Java TreeMap)

#### B-Trees
- Self-balancing search tree with multiple children per node
- Optimized for systems that read and write large blocks of data
- Commonly used in databases and file systems

#### Tries (Prefix Trees)
- Used to store associative data structures
- Each node represents a character of a key
- All children of a node have a common prefix

### Tree Traversal Methods

#### Depth-First Search (DFS)
- **Inorder**: Left, Root, Right - Gives sorted order in a BST
- **Preorder**: Root, Left, Right - Useful for creating a copy of the tree
- **Postorder**: Left, Right, Root - Useful for deleting the tree

#### Breadth-First Search (BFS)
- **Level Order**: Visits all nodes at each level before moving to the next level
- Implemented using a queue

### Sample Binary Search Tree Implementation
\`\`\`javascript
class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

class BinarySearchTree {
    constructor() {
        this.root = null;
    }
    
    insert(value) {
        const newNode = new TreeNode(value);
        
        if (!this.root) {
            this.root = newNode;
            return;
        }
        
        const insertHelper = (node, newNode) => {
            if (newNode.value < node.value) {
                if (node.left === null) {
                    node.left = newNode;
                } else {
                    insertHelper(node.left, newNode);
                }
            } else {
                if (node.right === null) {
                    node.right = newNode;
                } else {
                    insertHelper(node.right, newNode);
                }
            }
        };
        
        insertHelper(this.root, newNode);
    }
}
\`\`\`

### Applications
- Hierarchical data representation (file systems, XML/HTML DOM)
- Database indexing (B-trees and B+ trees)
- Syntax trees in compilers
- Priority queues (Heap)
- Routing algorithms
- Decision trees in machine learning
- Huffman coding in compression algorithms

### Advantages
- Hierarchical representation of data
- Efficient search, insert, delete operations (for balanced trees)
- Flexibility in structure and operations

### Disadvantages
- More complex implementation compared to arrays and linked lists
- Balancing overhead for self-balancing trees
- Memory overhead for pointers/references`;
  }
  
  private generateRecursionTheory(): string {
    return `## Recursion Theory

Recursion is a programming technique where a function calls itself to solve a problem by breaking it down into smaller, similar subproblems.

### Key Components of Recursion
1. **Base Case(s)**: Condition(s) that stop the recursion
2. **Recursive Case**: Where the function calls itself with modified parameters
3. **Progress Toward Base Case**: Each recursive call must move closer to the base case

### How Recursion Works
1. Function calls itself with a modified version of the original problem
2. The call stack keeps track of function calls
3. When the base case is reached, the function returns without making additional recursive calls
4. The call stack unwinds, with each instance returning its value to the caller

### Types of Recursion
- **Direct Recursion**: A function directly calls itself
- **Indirect Recursion**: Function A calls function B, which calls function A
- **Linear Recursion**: Each invocation makes at most one recursive call
- **Multiple Recursion**: Each invocation can make multiple recursive calls (e.g., binary recursion)
- **Tail Recursion**: Recursive call is the last operation in the function (can be optimized)

### Time and Space Complexity
- **Time Complexity**: Often expressed using recurrence relations
- **Space Complexity**: Includes the call stack (proportional to maximum depth of recursion)

### Classic Recursive Problems

#### Factorial
\`\`\`javascript
function factorial(n) {
    // Base case
    if (n === 0 || n === 1) {
        return 1;
    }
    
    // Recursive case
    return n * factorial(n-1);
}
\`\`\`

#### Fibonacci Sequence
\`\`\`javascript
function fibonacci(n) {
    // Base cases
    if (n <= 1) {
        return n;
    }
    
    // Recursive case
    return fibonacci(n-1) + fibonacci(n-2);
}
\`\`\`

#### Binary Search (Recursive)
\`\`\`javascript
function binarySearch(arr, target, left = 0, right = arr.length - 1) {
    // Base case: element not found
    if (left > right) {
        return -1;
    }
    
    const mid = Math.floor((left + right) / 2);
    
    // Base case: element found
    if (arr[mid] === target) {
        return mid;
    }
    
    // Recursive cases
    if (arr[mid] > target) {
        return binarySearch(arr, target, left, mid - 1);
    } else {
        return binarySearch(arr, target, mid + 1, right);
    }
}
\`\`\`

### Advantages of Recursion
- Makes code cleaner and easier to understand for some problems
- Natural solution for problems with recursive structure (e.g., tree traversal)
- Avoids complex loops and state tracking
- Divide-and-conquer approach simplifies complex problems

### Disadvantages of Recursion
- Call stack overhead
- Potential for stack overflow with deep recursion
- Often less efficient than iterative solutions
- Duplicate calculations in naive implementations (e.g., Fibonacci)

### Optimization Techniques
- **Memoization**: Storing results of expensive function calls
- **Tail Recursion Optimization**: Compiler optimizations for tail-recursive functions
- **Trampolining**: Technique to avoid call stack overflow
- **Converting to Iteration**: Transforming recursive algorithms to iterative ones

### When to Use Recursion
- When the problem has a recursive structure
- When the solution using recursion is clearer than iteration
- When the problem can be divided into similar subproblems
- When stack depth is manageable

### Common Recursive Algorithms
- Merge Sort and Quick Sort
- Tree and graph traversals
- Backtracking algorithms
- Divide and conquer strategies
- Dynamic programming (combining recursion with memoization)`;
  }
  
  private generateAlgorithmTheory(): string {
    return `## Algorithm Theory

An algorithm is a step-by-step procedure for solving a problem or accomplishing a task. It's a fundamental concept in computer science and mathematics.

### Key Characteristics of Algorithms
- **Finiteness**: An algorithm must terminate after a finite number of steps
- **Definiteness**: Each step must be precisely defined
- **Input**: An algorithm takes zero or more inputs
- **Output**: An algorithm produces one or more outputs
- **Effectiveness**: Each step must be basic enough to be carried out by a person using pencil and paper

### Algorithm Analysis
- **Time Complexity**: How runtime grows as input size increases
- **Space Complexity**: How memory usage grows as input size increases
- **Big O Notation**: Upper bound (worst-case) complexity
- **Big Omega (Ω)**: Lower bound (best-case) complexity
- **Big Theta (Θ)**: Tight bound (average-case) complexity

### Common Complexity Classes
- **O(1)**: Constant time - execution time independent of input size
- **O(log n)**: Logarithmic time - execution time grows logarithmically with input
- **O(n)**: Linear time - execution time grows linearly with input
- **O(n log n)**: Log-linear time - common in efficient sorting algorithms
- **O(n²)**: Quadratic time - often found in nested loops
- **O(2^n)**: Exponential time - often found in brute force algorithms
- **O(n!)**: Factorial time - often found in permutation algorithms

### Algorithm Design Paradigms

#### Divide and Conquer
- Break problems into smaller subproblems
- Solve subproblems recursively
- Combine solutions
- Examples: Merge Sort, Quick Sort, Binary Search

#### Dynamic Programming
- Break problems into overlapping subproblems
- Store solutions to subproblems in a table
- Examples: Fibonacci, Longest Common Subsequence, Knapsack Problem

#### Greedy Algorithms
- Make locally optimal choices
- Hope that these choices lead to a globally optimal solution
- Examples: Huffman Coding, Dijkstra's Algorithm, Minimum Spanning Tree

#### Backtracking
- Build solutions incrementally
- Abandon a partial solution when it cannot lead to a complete solution
- Examples: N-Queens Problem, Sudoku Solver, Maze Generation

#### Branch and Bound
- Systematic enumeration of candidate solutions
- Uses functions to estimate how promising a candidate solution is
- Examples: Traveling Salesman Problem, Knapsack Problem

### Important Categories of Algorithms

#### Searching Algorithms
- Linear Search: O(n)
- Binary Search: O(log n)
- Depth-First Search (DFS): O(V+E)
- Breadth-First Search (BFS): O(V+E)

#### Sorting Algorithms
- Merge Sort: O(n log n)
- Quick Sort: O(n log n) average, O(n²) worst
- Heap Sort: O(n log n)
- Bubble Sort: O(n²)
- Insertion Sort: O(n²)

#### Graph Algorithms
- Dijkstra's Algorithm: Shortest path
- Bellman-Ford Algorithm: Shortest path with negative edges
- Floyd-Warshall Algorithm: All pairs shortest paths
- Kruskal's and Prim's Algorithms: Minimum spanning tree
- Topological Sort: Linear ordering of directed graph

#### String Algorithms
- String Matching (Naive, KMP, Rabin-Karp)
- Regular Expression Matching
- Suffix Trees and Arrays

### P vs NP Problem
- **P**: Problems solvable in polynomial time
- **NP**: Problems verifiable in polynomial time
- **NP-Complete**: Hardest problems in NP
- **NP-Hard**: At least as hard as the hardest problems in NP

### Algorithm Correctness
- Proving algorithms correct using mathematical techniques
- Loop invariants
- Induction
- Formal verification

### Algorithm Efficiency
- Time-space tradeoff
- Average-case vs worst-case analysis
- Amortized analysis

### Real-world Applications
- Search engines (PageRank)
- Cryptography (RSA, SHA)
- Machine learning algorithms
- Database indexing and querying
- Network routing protocols
- Compression algorithms`;
  }

  // Helper function to save a note to the note store
  public saveNoteFromTopic(topic: string, content?: string): string {
    const noteStore = useNoteStore.getState();
    const noteContent = content || this.generateNoteContent(topic);
    
    // Extract potential tags
    const tags = this.extractPotentialTags(topic);
    
    // Create the note
    const noteId = noteStore.addNote({
      title: topic,
      content: noteContent,
      tags: tags,
      color: '#ffffff' // Default color
    });
    
    return noteId;
  }

  /**
   * Checks if the given text is related to coding or programming
   */
  private isCodeRelatedQuery(text: string): boolean {
    const codingTerms = [
      'code', 'algorithm', 'function', 'programming', 'javascript', 'typescript',
      'python', 'java', 'c\\+\\+', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'scala',
      'rust', 'golang', 'go lang', 'data structure', 'array', 'linked list', 'tree',
      'graph', 'stack', 'queue', 'sorting', 'searching', 'hash', 'big o', 'time complexity',
      'space complexity', 'inheritance', 'polymorphism', 'object-oriented', 'functional programming',
      'recursion', 'iteration', 'binary search', 'bubble sort', 'quick sort', 'merge sort',
      'heap sort', 'insertion sort', 'selection sort', 'binary tree', 'avl tree', 'red-black tree',
      'bfs', 'dfs', 'breadth-first', 'depth-first', 'dijkstra', 'dynamic programming'
    ];
    
    const pattern = new RegExp(codingTerms.join('|'), 'i');
    return pattern.test(text);
  }

  /**
   * Categorizes a message based on its content
   */
  public categorizeMessage(text: string): MessageCategory {
    // Basic pattern matching for common categories
    const patterns = {
      greeting: /^(hi|hello|hey|greetings|good (morning|afternoon|evening)|howdy)/i,
      task: /(create|add|make|schedule|remind me about) (a )?task|to.?do|checklist/i,
      calendar: /(schedule|appointment|meeting|event|calendar|remind me|on the|at)\s+(\d{1,2}(:\d{2})?(\s*[ap]\.?m\.?)?|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week)/i,
      timer: /(set|start|create)?\s*(a|the)?\s*(timer|pomodoro|focus session|countdown)/i,
      note: /(create|add|make|write|save|take) (a )?note|jot down|write down/i,
      programming: this.isCodeRelatedQuery(text) ? /./ : null,
      academic: /(study|research|paper|essay|thesis|assignment|homework|course|class|lecture|exam|test|quiz|grade)/i,
      productivity: /(focus|productive|efficiency|habit|routine|goal|progress|achievement)/i
    };

    // Check each pattern
    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern && pattern.test(text)) {
        return category as MessageCategory;
      }
    }

    // Default to general if no pattern matches
    return 'general';
  }

  /**
   * Detects intent from user message
   */
  public detectIntent(text: string): AssistantIntent {
    // Simple rule-based intent detection
    const lowerText = text.toLowerCase();
    
    // Task creation
    if (/create|add|make|new task|todo|to do|to-do|remind me to/i.test(text)) {
      return 'create';
    }
    
    // Note creation
    if (/create note|take note|save note|write down|jot down|remember this/i.test(text)) {
      return 'create';
    }
    
    // Timer/Focus mode
    if (/start timer|set timer|focus session|pomodoro|countdown/i.test(text)) {
      return 'start';
    }
    
    // Calendar/scheduling
    if (/schedule|appointment|meeting|event|calendar|remind me|on the|at/i.test(text) && 
        /\d{1,2}(:\d{2})?(\s*[ap]\.?m\.?)?|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week/i.test(text)) {
      return 'create';
    }
    
    // Help request
    if (/help|how do I|how to|what can you do|features|guide/i.test(text)) {
      return 'help';
    }
    
    // General query (default)
    return 'general_query';
  }

  // Smart Paper Outline Generation
  async generateSmartOutline(topic: string, description: string): Promise<OutlineStructure> {
    try {
      // This would typically call an AI API (e.g., OpenAI)
      // For now, we'll implement a rule-based approach
      const outline = await this.analyzeTopicAndGenerateStructure(topic, description);
      const enhancedOutline = await this.enhanceOutlineWithSubtopics(outline);
      return enhancedOutline;
    } catch (error) {
      console.error('Error generating smart outline:', error);
      throw error;
    }
  }

  private async analyzeTopicAndGenerateStructure(topic: string, description: string): Promise<OutlineStructure> {
    // Basic structure based on academic paper standards
    const baseStructure: OutlineStructure = {
      title: topic,
      sections: [
        {
          title: 'Introduction',
          content: await this.generateSectionContent('introduction', topic, description),
          subsections: [
            { title: 'Background', content: '' },
            { title: 'Problem Statement', content: '' },
            { title: 'Research Objectives', content: '' }
          ]
        },
        {
          title: 'Literature Review',
          content: await this.generateSectionContent('literature', topic, description),
          subsections: [
            { title: 'Current State of Research', content: '' },
            { title: 'Research Gaps', content: '' }
          ]
        },
        {
          title: 'Methodology',
          content: await this.generateSectionContent('methodology', topic, description),
          subsections: [
            { title: 'Research Design', content: '' },
            { title: 'Data Collection', content: '' },
            { title: 'Analysis Methods', content: '' }
          ]
        },
        {
          title: 'Expected Results',
          content: await this.generateSectionContent('results', topic, description),
          subsections: [
            { title: 'Data Analysis', content: '' },
            { title: 'Findings', content: '' }
          ]
        },
        {
          title: 'Discussion',
          content: await this.generateSectionContent('discussion', topic, description),
          subsections: [
            { title: 'Interpretation of Results', content: '' },
            { title: 'Implications', content: '' },
            { title: 'Limitations', content: '' }
          ]
        },
        {
          title: 'Conclusion',
          content: await this.generateSectionContent('conclusion', topic, description),
          subsections: [
            { title: 'Summary', content: '' },
            { title: 'Future Work', content: '' }
          ]
        }
      ]
    };

    return baseStructure;
  }

  private async generateSectionContent(
    sectionType: string,
    topic: string,
    description: string
  ): Promise<string> {
    // This would typically use an AI API to generate content
    // For now, we'll use templates
    const templates: { [key: string]: string } = {
      introduction: `This section will introduce ${topic} and provide necessary background information. Based on ${description}, we will explore...`,
      literature: `A comprehensive review of existing literature on ${topic}, focusing on...`,
      methodology: `The research methodology for studying ${topic}, including...`,
      results: `Expected findings and outcomes from the research on ${topic}...`,
      discussion: `Analysis and interpretation of the findings related to ${topic}...`,
      conclusion: `Summary of key findings about ${topic} and future research directions...`
    };

    return templates[sectionType] || '';
  }

  private async enhanceOutlineWithSubtopics(outline: OutlineStructure): Promise<OutlineStructure> {
    // This would typically use AI to suggest relevant subtopics
    // For now, we'll keep the existing structure
    return outline;
  }

  // Add keyword extraction capability
  async extractKeywords(text: string): Promise<string[]> {
    // This would typically use NLP/AI to extract keywords
    // For now, we'll use a simple frequency-based approach
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with']);
    
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      if (!stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    return Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  // Add citation analysis
  async analyzeCitations(citations: Citation[]): Promise<CitationAnalysis> {
    // This would typically use AI to analyze citation patterns
    const analysis: CitationAnalysis = {
      topAuthors: this.findTopAuthors(citations),
      yearDistribution: this.analyzeYearDistribution(citations),
      recommendedCitations: await this.findRelatedCitations(citations)
    };

    return analysis;
  }

  private findTopAuthors(citations: Citation[]): { author: string; count: number }[] {
    const authorCounts: { [key: string]: number } = {};
    citations.forEach(citation => {
      citation.authors.forEach(author => {
        authorCounts[author] = (authorCounts[author] || 0) + 1;
      });
    });

    return Object.entries(authorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([author, count]) => ({ author, count }));
  }

  private analyzeYearDistribution(citations: Citation[]): { year: number; count: number }[] {
    const yearCounts: { [key: number]: number } = {};
    citations.forEach(citation => {
      if (citation.year) {
        yearCounts[citation.year] = (yearCounts[citation.year] || 0) + 1;
      }
    });

    return Object.entries(yearCounts)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, count]) => ({ year: Number(year), count }));
  }

  private async findRelatedCitations(citations: Citation[]): Promise<Citation[]> {
    // This would typically use AI to find related papers
    // For now, return empty array
    return [];
  }
}

interface OutlineStructure {
  title: string;
  sections: {
    title: string;
    content: string;
    subsections: {
      title: string;
      content: string;
    }[];
  }[];
}

interface CitationAnalysis {
  topAuthors: { author: string; count: number }[];
  yearDistribution: { year: number; count: number }[];
  recommendedCitations: Citation[];
}

// Export a singleton instance
export const aiService = new AIService();
export default aiService; 