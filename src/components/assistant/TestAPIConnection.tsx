import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress, 
  Paper, 
  Stack, 
  useTheme,
  useMediaQuery
} from '@mui/material';

const TestAPIConnection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    // Get the API key from environment variables
    const windowEnvKey = (window as any).env?.REACT_APP_GEMINI_API;
    const processEnvKey = process.env.REACT_APP_GEMINI_API;
    const key = windowEnvKey || processEnvKey;
    setApiKey(key || "Not found");
    console.log("Environment variables:", {
      fromWindowEnv: windowEnvKey,
      fromProcessEnv: processEnvKey,
      finalKey: key,
    });
  }, []);

  const testAPI = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    const API_KEY = (window as any).env?.REACT_APP_GEMINI_API || 
                    process.env.REACT_APP_GEMINI_API;
    
    if (!API_KEY) {
      setTestResult({
        success: false,
        message: "No API key found in environment variables. Please check .env.local file.",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: "Say hello" }]
            }
          ]
        }),
      });
      
      const data = await response.json();
      console.log("API Test Response:", data);
      
      if (data.candidates && data.candidates[0]?.content) {
        setTestResult({
          success: true,
          message: "API connection successful! Response: " + 
                   data.candidates[0].content.parts[0].text.slice(0, 100) + "...",
        });
      } else if (data.error) {
        setTestResult({
          success: false,
          message: `API Error: ${data.error.message || JSON.stringify(data.error)}`,
        });
      } else {
        setTestResult({
          success: false,
          message: "Unknown API response format: " + JSON.stringify(data).slice(0, 200),
        });
      }
    } catch (error) {
      console.error("Test API Error:", error);
      setTestResult({
        success: false,
        message: `Error connecting to API: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // New function to list available models
  const listAvailableModels = async () => {
    setIsLoadingModels(true);
    setAvailableModels([]);
    
    const API_KEY = (window as any).env?.REACT_APP_GEMINI_API || 
                    process.env.REACT_APP_GEMINI_API;
    
    if (!API_KEY) {
      setTestResult({
        success: false,
        message: "No API key found in environment variables. Please check .env.local file.",
      });
      setIsLoadingModels(false);
      return;
    }
    
    try {
      const url = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      console.log("Available Models:", data);
      
      if (data.models && Array.isArray(data.models)) {
        const modelNames = data.models.map((model: any) => model.name);
        setAvailableModels(modelNames);
        
        if (modelNames.length === 0) {
          setTestResult({
            success: false,
            message: "No models available for your API key. You may need to enable the Gemini API in Google Cloud Console.",
          });
        } else {
          setTestResult({
            success: true,
            message: `Found ${modelNames.length} available models. Try using one of these in your code.`,
          });
        }
      } else if (data.error) {
        setTestResult({
          success: false,
          message: `API Error when listing models: ${data.error.message || JSON.stringify(data.error)}`,
        });
      }
    } catch (error) {
      console.error("List Models Error:", error);
      setTestResult({
        success: false,
        message: `Error listing models: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsLoadingModels(false);
    }
  };

  return (
    <Paper 
      elevation={isMobile ? 0 : 1}
      sx={{ 
        p: { xs: 1.5, sm: 2, md: 3 }, 
        mt: { xs: 1, sm: 2 }, 
        maxWidth: '100%', 
        mx: 'auto',
        borderRadius: { xs: 1, sm: 2 },
        border: isMobile ? `1px solid ${theme.palette.divider}` : 'none',
      }}
    >
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{ 
          fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
          mb: { xs: 1, sm: 2 }
        }}
      >
        API Connection Tester
      </Typography>
      
      <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
        <Typography 
          variant="subtitle1"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          API Key from environment:
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            p: { xs: 0.75, sm: 1 }, 
            bgcolor: 'grey.100', 
            borderRadius: 1,
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            overflowX: 'auto'
          }}
        >
          {apiKey ? 
            apiKey.slice(0, 6) + '...' + apiKey.slice(-4) : 
            "Not found"
          }
        </Typography>
      </Box>
      
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={{ xs: 1, sm: 2 }} 
        sx={{ mb: { xs: 1.5, sm: 2 } }}
      >
        <Button 
          variant="contained" 
          onClick={testAPI} 
          disabled={isLoading}
          fullWidth={isMobile}
          size={isMobile ? "small" : "medium"}
        >
          {isLoading ? <CircularProgress size={isMobile ? 16 : 24} sx={{ mr: 1 }} /> : null}
          Test API Connection
        </Button>
        
        <Button 
          variant="outlined"
          onClick={listAvailableModels}
          disabled={isLoadingModels}
          fullWidth={isMobile}
          size={isMobile ? "small" : "medium"}
        >
          {isLoadingModels ? <CircularProgress size={isMobile ? 16 : 24} sx={{ mr: 1 }} /> : null}
          List Available Models
        </Button>
      </Stack>
      
      {testResult && (
        <Alert 
          severity={testResult.success ? 'success' : 'error'} 
          sx={{ 
            mt: { xs: 1, sm: 2 },
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            '& .MuiAlert-message': {
              overflow: 'auto',
              maxHeight: '150px'
            }
          }}
        >
          {testResult.message}
        </Alert>
      )}
      
      {availableModels.length > 0 && (
        <Box sx={{ mt: { xs: 1.5, sm: 2 } }}>
          <Typography 
            variant="subtitle1"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Available Models:
          </Typography>
          <Box 
            component="ul" 
            sx={{ 
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: { xs: 1, sm: 2 },
              maxHeight: { xs: '150px', sm: '200px' },
              overflow: 'auto',
              listStyle: 'none',
              m: 0
            }}
          >
            {availableModels.map((model, index) => (
              <li key={index}>
                <Typography 
                  variant="body2" 
                  fontFamily="monospace"
                  sx={{ 
                    mb: 0.5,
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    wordBreak: 'break-all'
                  }}
                >
                  {model}
                </Typography>
              </li>
            ))}
          </Box>
        </Box>
      )}
      
      <Box sx={{ mt: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 1,
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          Note: If the test fails, please check:
        </Typography>
        <Box 
          component="ol" 
          sx={{ 
            pl: { xs: 2.5, sm: 3 },
            m: 0,
            '& li': {
              mb: 0.5,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }
          }}
        >
          <li>Your API key is correctly set in .env.local file</li>
          <li>The API key format is correct</li>
          <li>You have restarted your development server after adding the API key</li>
          <li>Your internet connection is working</li>
        </Box>
      </Box>
    </Paper>
  );
};

export default TestAPIConnection; 