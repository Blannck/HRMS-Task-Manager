import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Menu as MenuIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

export default function NavigationBar() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [photoError, setPhotoError] = React.useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate(`/profile/${user?.id}`);
    handleMenuClose();
  };

  const handleDashboard = () => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/employee/dashboard');
    }
    handleMenuClose();
  };

  // Show navbar only when logged in
  if (!token || !user) {
    return null;
  }

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#fff',
        color: '#0F172A',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.25rem',
            background: 'linear-gradient(135deg, #0F172A 0%, #06B6D4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            cursor: 'pointer',
          }}
          onClick={() => handleDashboard()}
        >
          HRMS
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            {user?.name}
          </Typography>
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 0.5,
              border: '2px solid #E2E8F0',
              '&:hover': { backgroundColor: '#F1F5F9' },
            }}
          >
            <Avatar
              src={!photoError && user?.profile_photo ? user.profile_photo : ''}
              onError={() => setPhotoError(true)}
              sx={{
                width: 32,
                height: 32,
                backgroundColor: '#06B6D4',
                fontSize: '0.875rem',
                fontWeight: 700,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Box>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
          <MenuItem onClick={handleDashboard}>Dashboard</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
