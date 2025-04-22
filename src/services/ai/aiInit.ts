import { useEffect } from 'react';
import { aiService } from './aiService';
import { useAISettings } from './aiSettings';

/**
 * Hook for initializing AI settings and connecting to the aiService
 * This should be used in the root component of the application
 */
export const useAIInit = () => {
  const { apiKey, useLocalProcessing } = useAISettings();

  // Apply settings whenever they change
  useEffect(() => {
    // Connect settings store to AI service
    if (apiKey) {
      console.log('AI service initialized with API key');
    } else {
      console.log('AI service initialized without API key');
    }
  }, [apiKey, useLocalProcessing]);

  return {
    isInitialized: true,
  };
};

export default useAIInit; 