import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Box,
  Stepper,
  Step,
  StepLabel,
  Grid,
  InputAdornment,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useUserStore } from '../../store/userStore';
import { v4 as uuidv4 } from 'uuid';
import GridWrapper from '../../utils/GridWrapper';

const steps = ['Account Details', 'Personal Information', 'Preferences'];

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUserStore();
  
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [productivityStyle, setProductivityStyle] = useState<'pomodoro' | 'deepWork' | 'timeBlocking'>('pomodoro');
  const [assistantTone, setAssistantTone] = useState<'casual' | 'professional' | 'fun'>('casual');
  
  // Form validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [nameError, setNameError] = useState('');

  const validateAccountDetails = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email address is invalid');
      isValid = false;
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    
    return isValid;
  };

  const validatePersonalInfo = () => {
    let isValid = true;
    setNameError('');
    
    if (!name) {
      setNameError('Name is required');
      isValid = false;
    }
    
    return isValid;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateAccountDetails()) {
      return;
    }
    
    if (activeStep === 1 && !validatePersonalInfo()) {
      return;
    }
    
    if (activeStep === steps.length - 1) {
      // Complete signup
      const mockUser = {
        id: uuidv4(),
        name,
        email,
        preferences: {
          productivityStyle,
          assistantTone,
          notificationsEnabled: true,
        },
      };
      
      // Simulate account creation delay
      setTimeout(() => {
        login(mockUser);
        navigate('/');
      }, 1000);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleGoogleSignup = () => {
    // In a real app, this would trigger Google OAuth
    const mockUser = {
      id: uuidv4(),
      name: 'Google User',
      email: 'google.user@example.com',
      photoURL: 'https://via.placeholder.com/150',
      preferences: {
        productivityStyle: 'pomodoro' as const,
        assistantTone: 'casual' as const,
        notificationsEnabled: true,
      },
    };
    
    login(mockUser);
    navigate('/');
  };

  const handleFacebookSignup = () => {
    // In a real app, this would trigger Facebook OAuth
    const mockUser = {
      id: uuidv4(),
      name: 'Facebook User',
      email: 'facebook.user@example.com',
      photoURL: 'https://via.placeholder.com/150',
      preferences: {
        productivityStyle: 'deepWork' as const,
        assistantTone: 'professional' as const,
        notificationsEnabled: true,
      },
    };
    
    login(mockUser);
    navigate('/');
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!emailError}
              helperText={emailError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
            />
            
            <Box sx={{ mt: 2, mb: 2 }}>
              <Divider>
                <Typography variant="body2" color="textSecondary">
                  OR
                </Typography>
              </Divider>
            </Box>

            <Grid container spacing={2}>
              <GridWrapper item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleSignup}
                >
                  Google
                </Button>
              </GridWrapper>
              <GridWrapper item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FacebookIcon />}
                  onClick={handleFacebookSignup}
                >
                  Facebook
                </Button>
              </GridWrapper>
            </Grid>
          </>
        );
      case 1:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!nameError}
              helperText={nameError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              We'll personalize your experience based on this information.
            </Typography>
          </>
        );
      case 2:
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel id="productivity-style-label">Productivity Style</InputLabel>
              <Select
                labelId="productivity-style-label"
                id="productivity-style"
                value={productivityStyle}
                label="Productivity Style"
                onChange={(e: SelectChangeEvent<string>) => 
                  setProductivityStyle(e.target.value as 'pomodoro' | 'deepWork' | 'timeBlocking')
                }
              >
                <MenuItem value="pomodoro">Pomodoro Technique</MenuItem>
                <MenuItem value="deepWork">Deep Work</MenuItem>
                <MenuItem value="timeBlocking">Time Blocking</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="assistant-tone-label">AI Assistant Tone</InputLabel>
              <Select
                labelId="assistant-tone-label"
                id="assistant-tone"
                value={assistantTone}
                label="AI Assistant Tone"
                onChange={(e: SelectChangeEvent<string>) => 
                  setAssistantTone(e.target.value as 'casual' | 'professional' | 'fun')
                }
              >
                <MenuItem value="casual">Casual</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="fun">Fun</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              These preferences can be changed later in your account settings.
            </Typography>
          </>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Box textAlign="center" mb={3}>
            <Typography component="h1" variant="h4" fontWeight="bold">
              AI Task Assistant
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Create your account
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={activeStep === steps.length - 1 ? undefined : <ArrowForwardIcon />}
            >
              {activeStep === steps.length - 1 ? 'Sign Up' : 'Next'}
            </Button>
          </Box>

          <Box mt={3} textAlign="center">
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" variant="body2">
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignupPage; 