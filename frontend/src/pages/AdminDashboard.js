import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { Add as AddIcon, AssignmentTurnedIn as TaskIcon, People as PeopleIcon } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

export default function AdminDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      const tasksData = response.data.tasks || [];
      // Sort tasks from newest to oldest by created_at
      const sortedTasks = tasksData.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA; // Newest first
      });
      setTasks(sortedTasks);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'in_progress':
        return '#06B6D4';
      case 'completed':
        return '#10B981';
      default:
        return '#64748B';
    }
  };

  const getStatusLabel = (status) => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1);
  };

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 64px)', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: '#0F172A',
              }}
            >
              Task Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Manage and assign tasks to your team
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/admin/users')}
              sx={{
                borderColor: '#06B6D4',
                color: '#06B6D4',
                '&:hover': {
                  borderColor: '#0891B2',
                  backgroundColor: '#E0F2FE',
                },
              }}
            >
              Manage Users
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/create-task')}
              sx={{
                background: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
                },
              }}
            >
              Create Task
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : tasks.length === 0 ? (
          <Card
            sx={{
              backgroundColor: '#fff',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
              py: 6,
            }}
          >
            <TaskIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#0F172A', mb: 1 }}>
              No tasks yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
              Create your first task to get started managing your team's workload.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/create-task')}
              sx={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              }}
            >
              Create First Task
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {tasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    border: 'none',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    '&:hover': {
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
                      transform: 'translateY(-6px)',
                    },
                  }}
                >
                  {/* Status Bar */}
                  <Box
                    sx={{
                      height: 4,
                      backgroundColor: getStatusColor(task.status),
                      width: '100%',
                    }}
                  />

                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                    {/* Title and Status Badge */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5, gap: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: '#0F172A',
                          flex: 1,
                          lineHeight: 1.3,
                          fontSize: '1.1rem',
                        }}
                      >
                        {task.title}
                      </Typography>
                      <Chip
                        label={getStatusLabel(task.status)}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(task.status),
                          color: '#fff',
                          fontWeight: 600,
                          borderRadius: 1,
                          textTransform: 'capitalize',
                          fontSize: '0.75rem',
                          height: 24,
                          minWidth: 60,
                        }}
                      />
                    </Box>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748B',
                        mb: 2.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.5,
                        fontSize: '0.95rem',
                      }}
                    >
                      {task.description}
                    </Typography>

                    {/* Divider */}
                    <Divider sx={{ my: 2.5, backgroundColor: '#E2E8F0' }} />

                    {/* Assigned Employees Section */}
                    <Box sx={{ mb: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#475569',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          👥 Assigned Employees ({task.assigned_users?.length || 0})
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {task.assigned_users && task.assigned_users.length > 0 ? (
                          task.assigned_users.map((u) => (
                            <Box
                              key={u.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.2,
                                p: 1.2,
                                backgroundColor: '#F8FAFC',
                                borderRadius: 1.5,
                                border: '1px solid #E2E8F0',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: '#F1F5F9',
                                  borderColor: '#CBD5E1',
                                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                                },
                              }}
                            >
                              <Avatar
                                src={u.profile_photo ? u.profile_photo : ''}
                                sx={{
                                  width: 36,
                                  height: 36,
                                  backgroundColor: '#06B6D4',
                                  color: '#fff',
                                  fontSize: '0.9rem',
                                  fontWeight: 700,
                                  flexShrink: 0,
                                  boxShadow: '0 2px 8px rgba(6, 182, 212, 0.2)',
                                }}
                              >
                                {u.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: '#0F172A',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontSize: '0.95rem',
                                  }}
                                >
                                  {u.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#94A3B8',
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontSize: '0.8rem',
                                  }}
                                >
                                  {u.email}
                                </Typography>
                              </Box>
                            </Box>
                          ))
                        ) : (
                          <Box
                            sx={{
                              p: 1.5,
                              backgroundColor: '#FEF3C7',
                              borderRadius: 1.5,
                              border: '1px solid #FCD34D',
                              textAlign: 'center',
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#92400E',
                                fontWeight: 500,
                                fontSize: '0.85rem',
                              }}
                            >
                              ⚠️ No employees assigned yet
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* Date Footer */}
                    <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #E2E8F0' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#CBD5E1',
                          display: 'block',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                        }}
                      >
                        📅 Created {new Date(task.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
