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
  AvatarGroup,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, AssignmentTurnedIn as TaskIcon } from '@mui/icons-material';
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
      setTasks(response.data.tasks || []);
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
                    borderRadius: 2,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#fff',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    {/* Title and Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: '#0F172A',
                          flex: 1,
                          mr: 1,
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
                          fontWeight: 500,
                          borderRadius: 1,
                        }}
                      />
                    </Box>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748B',
                        mb: 3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {task.description}
                    </Typography>

                    {/* Assigned Users */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#64748B',
                          display: 'block',
                          mb: 1,
                          fontWeight: 500,
                        }}
                      >
                        Assigned Users
                      </Typography>
                      <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                        {task.assigned_users && task.assigned_users.length > 0 ? (
                          task.assigned_users.map((u) => (
                            <Avatar
                              key={u.id}
                              sx={{
                                width: 28,
                                height: 28,
                                backgroundColor: '#06B6D4',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                              title={u.name}
                            >
                              {u.name.charAt(0).toUpperCase()}
                            </Avatar>
                          ))
                        ) : (
                          <Typography variant="caption" sx={{ color: '#CBD5E1' }}>
                            Unassigned
                          </Typography>
                        )}
                      </AvatarGroup>
                    </Box>

                    {/* Date */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#94A3B8',
                        display: 'block',
                      }}
                    >
                      Created: {new Date(task.created_at).toLocaleDateString()}
                    </Typography>
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
