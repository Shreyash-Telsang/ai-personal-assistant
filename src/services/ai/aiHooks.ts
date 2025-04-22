import { useState, useEffect, useCallback } from 'react';
import { aiService } from './aiService';
import { useAssistantStore } from '../../store/assistantStore';

/**
 * Hook for processing user input through the AI service and
 * managing interaction with the assistant store
 */
export const useAIProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [contextData, setContextData] = useState<Record<string, any>>({});
  
  // Get assistant store functions
  const {
    messages,
    addUserMessage,
    addAssistantMessage,
    setIsProcessing: setStoreIsProcessing,
    context
  } = useAssistantStore();
  
  // Update context data when context changes
  useEffect(() => {
    setContextData({
      recentTopics: context.recentTopics,
      activeSessionType: context.activeSessionType,
      timeContext: context.timeContext
    });
  }, [context]);
  
  // Process user input through AI service
  const processInput = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    try {
      // Set processing state
      setIsProcessing(true);
      setStoreIsProcessing(true);
      
      // Add user message to store
      addUserMessage(text);
      
      // Simple response to redirect users to the ChatGPT Bot implementation
      addAssistantMessage(
        "I've transitioned to a new ChatGPT Bot implementation. Please continue your conversation in the ChatGPT Bot interface.",
        'general',
        {
          metadata: {
            intent: 'redirect',
            suggestedActions: ['Go to ChatGPT Bot']
          }
        }
      );

      return {
        intent: { category: 'general', intent: 'redirect', entities: [] },
        response: { 
          text: "I've transitioned to a new ChatGPT Bot implementation. Please continue your conversation in the ChatGPT Bot interface.",
          suggestedActions: ['Go to ChatGPT Bot'],
          isError: false
        }
      };

    } catch (error) {
      console.error('Error processing user input:', error);
      
      // Add error message to store
      addAssistantMessage(
        'Sorry, I encountered an error processing your request. Please try using the ChatGPT Bot interface instead.',
        'general',
        {
          metadata: {
            isError: true
          }
        }
      );
      
      return null;
    } finally {
      // Clear processing state
      setIsProcessing(false);
      setStoreIsProcessing(false);
    }
  }, [addUserMessage, addAssistantMessage, setStoreIsProcessing]);
  
  // Set API key
  const setApiKey = useCallback((key: string) => {
    aiService.setApiKey(key);
  }, []);
  
  // Set local processing preference
  const setUseLocalProcessing = useCallback((useLocal: boolean) => {
    aiService.setUseLocalProcessing(useLocal);
  }, []);
  
  return {
    isProcessing,
    processInput,
    setApiKey,
    setUseLocalProcessing
  };
};

export default useAIProcessor;
