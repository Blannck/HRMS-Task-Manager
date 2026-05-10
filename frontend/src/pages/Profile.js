import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CloudUpload as UploadIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

export default function Profile() {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const userId = id || user?.id;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [photoLoadError, setPhotoLoadError] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch latest profile data on mount
  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setPageLoading(true);
      setPhotoLoadError(false);
      const response = await api.get(`/profile/${userId}`);
      const profileData = response.data.user;

      setName(profileData.name);
      setEmail(profileData.email);

      // Set profile photo URL from server
      if (profileData.profile_photo) {
        console.log('Profile photo URL:', profileData.profile_photo);
        setProfilePhotoPreview(profileData.profile_photo);
      } else {
        setProfilePhotoPreview('');
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setPageLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPhotoLoadError(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (password) {
        formData.append('password', password);
      }
      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
      }

      const response = await api.patch(`/profile/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update preview with the uploaded photo URL from server
      if (response.data.user.profile_photo) {
        setProfilePhotoPreview(response.data.user.profile_photo);
      }

      setSuccess('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
      setProfilePhoto(null);

      // Refresh profile to ensure we have latest data
      setTimeout(() => {
        fetchProfile();
        refreshUser(); // Also refresh the AuthContext user for navbar
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // Note: logout is now handled by AuthContext, import it if needed
    navigate('/login');
  };

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 64px)', py: 4 }}>
      <Container maxWidth="lg">
        {pageLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={() => navigate(-1)}
            startIcon={<BackIcon />}
            sx={{ color: '#64748B', '&:hover': { backgroundColor: '#F1F5F9' } }}
          >
            Back
          </Button>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#0F172A',
            }}
          >
            Profile Settings
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, gap: 4 }}>
          {/* Left: Photo Section */}
          <Card
            sx={{
              border: '1px solid #E2E8F0',
              borderRadius: 2,
              height: 'fit-content',
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              {/* Avatar */}
              <Box
                sx={{
                  position: 'relative',
                  width: 'fit-content',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <Avatar
                  src={profilePhotoPreview && !photoLoadError ? profilePhotoPreview : ''}
                  onError={() => setPhotoLoadError(true)}
                  sx={{
                    width: 120,
                    height: 120,
                    backgroundColor: '#06B6D4',
                    fontSize: '2rem',
                    fontWeight: 700,
                  }}
                >
                  {name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </Box>

              {/* Name */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#0F172A',
                  mb: 0.5,
                }}
              >
                {user?.name}
              </Typography>

              {/* Role */}
              <Box
                sx={{
                  display: 'inline-block',
                  backgroundColor: '#F1F5F9',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  mb: 3,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#0F172A',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                >
                  {user?.role}
                </Typography>
              </Box>

              {/* Upload Photo Button */}
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-input"
                type="file"
                onChange={handlePhotoChange}
              />
              <label htmlFor="photo-input">
                <Button
                  variant="contained"
                  component="span"
                  fullWidth
                  startIcon={<UploadIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
                    },
                  }}
                >
                  Change Photo
                </Button>
              </label>

              {profilePhoto && (
                <Typography
                  variant="caption"
                  sx={{
                    color: '#10B981',
                    display: 'block',
                    mt: 1,
                    fontWeight: 500,
                  }}
                >
                  ✓ Photo selected
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Right: Form Section */}
          <Card
            sx={{
              border: '1px solid #E2E8F0',
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  {success}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                {/* Account Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: '#0F172A',
                      mb: 2,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Account Information
                  </Typography>

                  <TextField
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </Box>

                {/* Password Section */}
                <Box sx={{ mb: 4, pb: 4, borderBottom: '1px solid #E2E8F0' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: '#0F172A',
                      mb: 2,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Change Password
                  </Typography>

                  <TextField
                    fullWidth
                    label="New Password (optional)"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Leave blank to keep current password"
                    sx={{ mb: 2 }}
                  />
                  {password && (
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  )}
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={handleLogout}
                    sx={{
                      color: '#EF4444',
                      borderColor: '#FEE2E2',
                      '&:hover': { borderColor: '#FECACA' },
                    }}
                  >
                    Logout
                  </Button>

                  <Button
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #020617 0%, #0F172A 100%)',
                      },
                    }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={18} sx={{ mr: 1 }} /> Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
