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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CompleteIcon,
  PlayArrow as StartIcon,
  AssignmentTurnedIn as TaskIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/my-tasks/${user.id}`);
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

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      setUpdating(taskId);
      const response = await api.patch(`/tasks/${taskId}/status`, {
        status: newStatus,
      });
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? response.data.task : task))
      );
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', text: '#F59E0B' };
      case 'in_progress':
        return { bg: '#CFFAFE', text: '#06B6D4' };
      case 'completed':
        return { bg: '#DCFCE7', text: '#10B981' };
      default:
        return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const getStatusLabel = (status) => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1);
  };

  const getTaskStats = () => {
    const stats = {
      pending: tasks.filter((t) => t.status === 'pending').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    };
    return stats;
  };

  const stats = getTaskStats();

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 64px)', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: '#0F172A',
            }}
          >
            My Tasks
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Track and manage your assigned work
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Pending', value: stats.pending, color: '#F59E0B' },
            { label: 'In Progress', value: stats.in_progress, color: '#06B6D4' },
            { label: 'Completed', value: stats.completed, color: '#10B981' },
          ].map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card
                sx={{
                  border: '1px solid #E2E8F0',
                  borderLeft: `4px solid ${stat.color}`,
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h3"
                    sx={{
                      color: stat.color,
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

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
              No tasks assigned yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Check back soon for new assignments from your team lead.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {tasks.map((task) => {
              const statusColor = getStatusColor(task.status);
              const isCompleted = task.status === 'completed';

              return (
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
                      opacity: isCompleted ? 0.8 : 1,
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
                            textDecoration: isCompleted ? 'line-through' : 'none',
                          }}
                        >
                          {task.title}
                        </Typography>
                        <Chip
                          label={getStatusLabel(task.status)}
                          size="small"
                          sx={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
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

                      {/* Date */}
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#94A3B8',
                          display: 'block',
                        }}
                      >
                        📅 Created: {new Date(task.created_at).toLocaleDateString('en-US')}
                      </Typography>
                    </CardContent>

                    {/* Action Buttons */}
                    <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', display: 'flex', gap: 1 }}>
                      {task.status === 'pending' && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<StartIcon />}
                          onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          disabled={updating === task.id}
                          sx={{
                            background: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
                            flex: 1,
                          }}
                        >
                          Start
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CompleteIcon />}
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          disabled={updating === task.id}
                          sx={{
                            background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                            flex: 1,
                          }}
                        >
                          Complete
                        </Button>
                      )}
                      {task.status === 'completed' && (
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Chip
                            label="✓ Completed"
                            sx={{
                              backgroundColor: '#DCFCE7',
                              color: '#10B981',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
