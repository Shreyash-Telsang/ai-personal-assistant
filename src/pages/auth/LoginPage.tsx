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
  Grid,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
} from '@mui/icons-material';
import { useUserStore } from '../../store/userStore';
import { v4 as uuidv4 } from 'uuid';
import GridWrapper from '../../utils/GridWrapper';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, setError, error } = useUserStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    
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
    
    return isValid;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // In a real app, this would make an API call to authenticate
    // For this demo, we're simulating a successful login
    const mockUser = {
      id: uuidv4(),
      name: 'Demo User',
      email: email,
      preferences: {
        productivityStyle: 'pomodoro' as const,
        assistantTone: 'casual' as const,
        notificationsEnabled: true,
      },
    };
    
    // Simulate authentication delay
    setTimeout(() => {
      login(mockUser);
      navigate('/');
    }, 1000);
  };

  const handleGoogleLogin = () => {
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

  const handleFacebookLogin = () => {
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
              Login to your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
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
              autoComplete="current-password"
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
            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              Sign In
            </Button>
            
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
                  onClick={handleGoogleLogin}
                >
                  Google
                </Button>
              </GridWrapper>
              <GridWrapper item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FacebookIcon />}
                  onClick={handleFacebookLogin}
                >
                  Facebook
                </Button>
              </GridWrapper>
            </Grid>
          </form>

          <Box mt={3} textAlign="center">
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link component={RouterLink} to="/signup" variant="body2">
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 