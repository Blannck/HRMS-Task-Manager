import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Mail as MailIcon,
  Shield as ShieldIcon,
  ArrowBack as BackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";
import api from "../api";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusConfirm, setStatusConfirm] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 = Employees, 1 = Admins
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term and active tab
    let filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Filter by role based on active tab
    if (activeTab === 0) {
      // Employees tab
      filtered = filtered.filter((u) => u.role === "employee");
    } else if (activeTab === 1) {
      // Admins tab
      filtered = filtered.filter((u) => u.role === "admin");
    }

    setFilteredUsers(filtered);
  }, [searchTerm, users, activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/users");
      const allUsers = response.data.employees || [];
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (err) {
      setError("Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (userData) => {
    setSelectedUser(userData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchTerm(""); // Clear search when switching tabs
  };

  const handleStatusToggleClick = (userData) => {
    if (user && user.id === userData.id) {
      alert("You cannot deactivate your own account!");
      return;
    }
    setStatusConfirm(userData);
  };

  const handleConfirmStatusToggle = async () => {
    if (!statusConfirm) return;

    try {
      setTogglingStatus(true);
      const newStatus = !statusConfirm.is_active;
      await api.patch(`/users/${statusConfirm.id}/toggle-status`);
      
      // Update the users list with the new status
      const updatedUsers = users.map((u) =>
        u.id === statusConfirm.id ? { ...u, is_active: newStatus } : u
      );
      setUsers(updatedUsers);
      setStatusConfirm(null);
      setTogglingStatus(false);
    } catch (err) {
      console.error("Error toggling user status:", err);
      alert("Failed to toggle user status");
      setTogglingStatus(false);
    }
  };

  const handleDeleteClick = (userData) => {
    setDeleteConfirm(userData);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      // Note: You'll need to implement a delete user endpoint in the backend
      await api.delete(`/users/${deleteConfirm.id}`);
      setUsers(users.filter((u) => u.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      // Show success message
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user");
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getAvatarColor = (index) => {
    const colors = [
      "#06B6D4", // cyan
      "#8B5CF6", // purple
      "#EC4899", // pink
      "#F59E0B", // amber
      "#10B981", // green
      "#3B82F6", // blue
    ];
    return colors[index % colors.length];
  };

  const getEmployeeCount = () =>
    users.filter((u) => u.role === "employee").length;
  const getAdminCount = () => users.filter((u) => u.role === "admin").length;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Back Button */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          onClick={() => navigate("/admin/dashboard")}
          startIcon={<BackIcon />}
          sx={{ color: "#64748B", "&:hover": { backgroundColor: "#F1F5F9" } }}
        >
          Back
        </Button>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <PeopleIcon sx={{ fontSize: 40, color: "#06B6D4" }} />
            <div>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#0F172A" }}
              >
                User Management
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
                View and manage all registered users
              </Typography>
            </div>
          </Box>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 12px 24px rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Typography
                    sx={{
                      color: "#94A3B8",
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    Total Users
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#0F172A" }}
                  >
                    {users.length}
                  </Typography>
                </div>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    backgroundColor: "#E0F2FE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PeopleIcon sx={{ color: "#06B6D4", fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 12px 24px rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Typography
                    sx={{
                      color: "#94A3B8",
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    Employees
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#0F172A" }}
                  >
                    {getEmployeeCount()}
                  </Typography>
                </div>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    backgroundColor: "#DBEAFE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Shield sx={{ color: "#3B82F6", fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 12px 24px rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Typography
                    sx={{
                      color: "#94A3B8",
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    Admins
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#0F172A" }}
                  >
                    {getAdminCount()}
                  </Typography>
                </div>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    backgroundColor: "#FEE2E2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShieldIcon sx={{ color: "#EF4444", fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94A3B8", mr: 1 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            backgroundColor: "#fff",
            borderRadius: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              },
            },
          }}
        />
      </Box>

      {/* Tabs for Employees and Admins */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: "2px solid #E2E8F0",
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#64748B",
              "&.Mui-selected": {
                color: "#06B6D4",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#06B6D4",
              height: 3,
            },
          }}
        >
          <Tab label={`Employees (${getEmployeeCount()})`} />
          <Tab label={`Admins (${getAdminCount()})`} />
        </Tabs>
      </Box>

      {/* Users Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#F8FAFC",
                borderBottom: "2px solid #E2E8F0",
              }}
            >
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#0F172A",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  py: 2,
                }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#0F172A",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  py: 2,
                }}
              >
                Email
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#0F172A",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  py: 2,
                }}
              >
                Role
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#0F172A",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  py: 2,
                  textAlign: "center",
                }}
              >
                Status
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#0F172A",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  py: 2,
                  textAlign: "center",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((userData, index) => (
                <TableRow
                  key={userData.id}
                  sx={{
                    borderBottom: "1px solid #E2E8F0",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#F8FAFC",
                    },
                    "&:last-child": {
                      borderBottom: "none",
                    },
                  }}
                >
                  {/* Name Cell */}
                  <TableCell sx={{ py: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={
                          userData.profile_photo ? userData.profile_photo : ""
                        }
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: getAvatarColor(index),
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        {getInitials(userData.name)}
                      </Avatar>
                      <div>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "#0F172A",
                            fontSize: "0.95rem",
                          }}
                        >
                          {userData.name}
                        </Typography>
                      </div>
                    </Box>
                  </TableCell>

                  {/* Email Cell */}
                  <TableCell sx={{ py: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <MailIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                      <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>
                        {userData.email}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Role Cell */}
                  <TableCell sx={{ py: 2.5 }}>
                    <Chip
                      label={
                        userData.role
                          ? userData.role.charAt(0).toUpperCase() +
                            userData.role.slice(1)
                          : "Employee"
                      }
                      icon={<ShieldIcon sx={{ fontSize: "1rem !important" }} />}
                      sx={{
                        backgroundColor:
                          userData.role === "admin" ? "#FEE2E2" : "#E0F2FE",
                        color:
                          userData.role === "admin" ? "#DC2626" : "#0369A1",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    />
                  </TableCell>

                  {/* Status Cell */}
                  <TableCell sx={{ py: 2.5, textAlign: "center" }}>
                    {userData.is_active ? (
                      <Chip
                        icon={
                          <CheckCircleIcon sx={{ fontSize: "1rem !important" }} />
                        }
                        label="Active"
                        sx={{
                          backgroundColor: "#DCFCE7",
                          color: "#166534",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                        }}
                      />
                    ) : (
                      <Chip
                        icon={
                          <CancelIcon sx={{ fontSize: "1rem !important" }} />
                        }
                        label="Inactive"
                        sx={{
                          backgroundColor: "#FEE2E2",
                          color: "#991B1B",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                        }}
                      />
                    )}
                  </TableCell>

                  {/* Actions Cell */}
                  <TableCell sx={{ py: 2.5, textAlign: "center" }}>
                    <Box
                      sx={{ display: "flex", gap: 1, justifyContent: "center" }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleViewDetails(userData)}
                        sx={{
                          borderColor: "#06B6D4",
                          color: "#06B6D4",
                          borderRadius: 1,
                          textTransform: "capitalize",
                          fontSize: "0.8rem",
                          "&:hover": {
                            borderColor: "#0891B2",
                            backgroundColor: "#E0F2FE",
                          },
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={
                          userData.is_active ? <CancelIcon /> : <CheckCircleIcon />
                        }
                        onClick={() => handleStatusToggleClick(userData)}
                        sx={{
                          borderColor: userData.is_active ? "#EF4444" : "#10B981",
                          color: userData.is_active ? "#EF4444" : "#10B981",
                          borderRadius: 1,
                          textTransform: "capitalize",
                          fontSize: "0.8rem",
                          "&:hover": {
                            borderColor: userData.is_active ? "#DC2626" : "#059669",
                            backgroundColor: userData.is_active ? "#FEE2E2" : "#DCFCE7",
                          },
                        }}
                      >
                        {userData.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} sx={{ py: 4, textAlign: "center" }}>
                  <Typography sx={{ color: "#94A3B8", fontSize: "0.9rem" }}>
                    No employees found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* User Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.3rem" }}
        >
          User Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedUser && (
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    backgroundColor: getAvatarColor(
                      users.indexOf(selectedUser),
                    ),
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "1.2rem",
                  }}
                >
                  {getInitials(selectedUser.name)}
                </Avatar>
                <div>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#0F172A",
                      fontSize: "1.1rem",
                    }}
                  >
                    {selectedUser.name}
                  </Typography>
                  <Chip
                    label={
                      selectedUser.role
                        ? selectedUser.role.charAt(0).toUpperCase() +
                          selectedUser.role.slice(1)
                        : "Employee"
                    }
                    icon={<ShieldIcon sx={{ fontSize: "1rem !important" }} />}
                    size="small"
                    sx={{
                      backgroundColor:
                        selectedUser.role === "admin" ? "#FEE2E2" : "#E0F2FE",
                      color:
                        selectedUser.role === "admin" ? "#DC2626" : "#0369A1",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      mt: 1,
                    }}
                  />
                </div>
              </Box>

              <Box
                sx={{
                  backgroundColor: "#F8FAFC",
                  p: 2,
                  borderRadius: 2,
                  mb: 2,
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      color: "#94A3B8",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    Email Address
                  </Typography>
                  <Typography
                    sx={{
                      color: "#0F172A",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                    }}
                  >
                    {selectedUser.email}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      color: "#94A3B8",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    Account Status
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {selectedUser.is_active ? (
                      <>
                        <CheckCircleIcon
                          sx={{ fontSize: "1.2rem", color: "#10B981" }}
                        />
                        <Typography
                          sx={{
                            color: "#10B981",
                            fontSize: "0.95rem",
                            fontWeight: 600,
                          }}
                        >
                          Active
                        </Typography>
                      </>
                    ) : (
                      <>
                        <CancelIcon
                          sx={{ fontSize: "1.2rem", color: "#DC2626" }}
                        />
                        <Typography
                          sx={{
                            color: "#DC2626",
                            fontSize: "0.95rem",
                            fontWeight: 600,
                          }}
                        >
                          Inactive
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>

                <Box sx={{ mb: 0 }}>
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      color: "#94A3B8",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    User ID
                  </Typography>
                  <Typography
                    sx={{
                      color: "#0F172A",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                    }}
                  >
                    {selectedUser.id}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ fontWeight: 700, color: "#DC2626", fontSize: "1.2rem" }}
        >
          Delete User
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{deleteConfirm?.name}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteConfirm(null)}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 1,
              backgroundColor: "#DC2626",
              "&:hover": {
                backgroundColor: "#B91C1C",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Toggle Confirmation Dialog */}
      <Dialog
        open={!!statusConfirm}
        onClose={() => setStatusConfirm(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: statusConfirm?.is_active ? "#DC2626" : "#10B981",
            fontSize: "1.2rem",
          }}
        >
          {statusConfirm?.is_active ? "Deactivate User" : "Activate User"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography>
            Are you sure you want to{" "}
            <strong>
              {statusConfirm?.is_active ? "deactivate" : "activate"}
            </strong>{" "}
            <strong>{statusConfirm?.name}</strong>?
          </Typography>
          {statusConfirm?.is_active && (
            <Typography sx={{ mt: 2, color: "#64748B", fontSize: "0.9rem" }}>
              Deactivated users will not be able to log in to the system.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setStatusConfirm(null)}
            variant="outlined"
            disabled={togglingStatus}
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmStatusToggle}
            variant="contained"
            disabled={togglingStatus}
            sx={{
              borderRadius: 1,
              backgroundColor: statusConfirm?.is_active ? "#DC2626" : "#10B981",
              "&:hover": {
                backgroundColor: statusConfirm?.is_active ? "#B91C1C" : "#059669",
              },
            }}
          >
            {togglingStatus
              ? "Processing..."
              : statusConfirm?.is_active
                ? "Deactivate"
                : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
