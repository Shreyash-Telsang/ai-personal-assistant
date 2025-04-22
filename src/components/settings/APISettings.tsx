import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Switch,
  Alert,
  Tooltip,
  IconButton,
  InputAdornment
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useAISettings } from '../../services/ai/aiSettings';
import { useAIProcessor } from '../../services/ai/aiHooks';

const APISettings = () => {
  const {
    apiKey,
    useLocalProcessing,
    model,
    temperature,
    setApiKey,
    setUseLocalProcessing,
    setModel,
    setTemperature,
    resetSettings
  } = useAISettings();
  
  const { setApiKey: setApiKeyProcessor, setUseLocalProcessing: setUseLocalProcessor } = useAIProcessor();
  
  // Local state for form
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [apiStatus, setApiStatus] = useState<'none' | 'success' | 'error'>('none');
  const [statusMessage, setStatusMessage] = useState('');
  
  // Initialize form with current values
  useEffect(() => {
    if (apiKey) {
      setKeyInput(apiKey);
    }
  }, [apiKey]);
  
  // Available models
  const availableModels = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Balanced performance and cost' },
    { value: 'gpt-3.5-turbo-1106', label: 'GPT-3.5 Turbo (Latest)', description: 'Most recent version with improved capabilities' },
    { value: 'gpt-3.5-turbo-16k', label: 'GPT-3.5 Turbo 16K', description: 'Extended context window (16,384 tokens)' }
  ];
  
  // Temperature marks for slider
  const temperatureMarks = [
    { value: 0, label: 'Precise' },
    { value: 0.5, label: 'Balanced' },
    { value: 1, label: 'Creative' }
  ];
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate API key (basic check)
      if (keyInput && !keyInput.startsWith('sk-')) {
        setApiStatus('error');
        setStatusMessage('Invalid API key format. OpenAI keys typically start with "sk-"');
        return;
      }
      
      // Update API key in both settings and processor
      if (keyInput) {
        setApiKey(keyInput);
        setApiKeyProcessor(keyInput);
        setUseLocalProcessing(false);
        setUseLocalProcessor(false);
      } else {
        setUseLocalProcessing(true);
        setUseLocalProcessor(true);
      }
      
      setApiStatus('success');
      setStatusMessage('Settings updated successfully');
      
      // Clear status after a delay
      setTimeout(() => {
        setApiStatus('none');
        setStatusMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating API settings:', error);
      setApiStatus('error');
      setStatusMessage('Failed to update settings. Please try again.');
    }
  };
  
  // Handle local processing toggle
  const handleLocalProcessingToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const useLocal = event.target.checked;
    setUseLocalProcessing(useLocal);
    setUseLocalProcessor(useLocal);
  };
  
  // Handle reset
  const handleReset = () => {
    resetSettings();
    setKeyInput('');
    setApiStatus('success');
    setStatusMessage('Settings reset to defaults');
    setTimeout(() => {
      setApiStatus('none');
      setStatusMessage('');
    }, 3000);
  };
  
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          AI Assistant Configuration
        </Typography>
        
        <form onSubmit={handleSubmit}>
          {/* API Key Input */}
          <TextField
            fullWidth
            margin="normal"
            label="OpenAI API Key"
            variant="outlined"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            type={showKey ? 'text' : 'password'}
            placeholder="Enter your OpenAI API key (starts with sk-)"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Toggle visibility">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowKey(!showKey)}
                      edge="end"
                    >
                      {showKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Your API key is stored securely and only used for processing requests to OpenAI. It is never sent to our servers.">
                    <IconButton>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
          
          {/* Model Selection */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="model-select-label">Model</InputLabel>
            <Select
              labelId="model-select-label"
              value={model}
              label="Model"
              onChange={(e) => setModel(e.target.value)}
              disabled={useLocalProcessing}
            >
              {availableModels.map((modelOption) => (
                <MenuItem key={modelOption.value} value={modelOption.value}>
                  <Box>
                    <Typography variant="body1">{modelOption.label}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {modelOption.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Temperature Setting */}
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="body2" gutterBottom display="flex" alignItems="center">
              Response Temperature
              <Tooltip title="Controls randomness: Lower values are more focused and deterministic, higher values allow more creativity and variety">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Slider
              value={temperature}
              min={0}
              max={1}
              step={0.1}
              marks={temperatureMarks}
              onChange={(_, newValue) => setTemperature(newValue as number)}
              valueLabelDisplay="auto"
              disabled={useLocalProcessing}
            />
          </Box>
          
          {/* Local Processing Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={useLocalProcessing}
                onChange={handleLocalProcessingToggle}
              />
            }
            label={
              <Box display="flex" alignItems="center">
                <Typography>Use Local Processing</Typography>
                <Tooltip title="When enabled, requests will be processed locally without using the OpenAI API. This has limited capabilities but works offline and doesn't consume API tokens.">
                  <IconButton size="small">
                    <HelpOutlineIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />
          
          {/* Status Alert */}
          {apiStatus !== 'none' && (
            <Alert severity={apiStatus === 'success' ? 'success' : 'error'} sx={{ mt: 2 }}>
              {statusMessage}
            </Alert>
          )}
          
          {/* Action Buttons */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleReset}
            >
              Reset to Defaults
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Save Settings
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default APISettings;
