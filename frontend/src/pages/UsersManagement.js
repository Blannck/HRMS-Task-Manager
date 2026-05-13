import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Mail as MailIcon,
  Security as ShieldIcon,
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
  const [activeTab, setActiveTab] = useState(0);
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
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Exclude the logged-in user from the list
    if (user && user.id) {
      filtered = filtered.filter((u) => String(u.id) !== String(user.id));
    }

    // Filter by role based on active tab
    if (activeTab === 0) {
      filtered = filtered.filter((u) => u.role === "employee");
    } else if (activeTab === 1) {
      filtered = filtered.filter((u) => u.role === "admin");
    }

    setFilteredUsers(filtered);
  }, [searchTerm, users, activeTab, user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/users");
      const allUsers = response.data.employees || [];
      setUsers(allUsers);
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
    setSearchTerm("");
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
      await api.delete(`/users/${deleteConfirm.id}`);
      setUsers(users.filter((u) => u.id !== deleteConfirm.id));
      setDeleteConfirm(null);
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
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
    ];
    return colors[index % colors.length];
  };

  const getEmployeeCount = () =>
    users.filter((u) => u.role === "employee" && u.id !== user?.id).length;
  const getAdminCount = () =>
    users.filter((u) => u.role === "admin" && u.id !== user?.id).length;

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{ py: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate("/admin/dashboard")}
            sx={{
              color: "#06B6D4",
              textTransform: "capitalize",
              fontSize: "1rem",
            }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#0F172A" }}>
              User Management
            </Typography>
            <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mt: 0.5 }}>
              Manage employees and admin accounts
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
          mb: 4,
        }}
      >
        <Card sx={{ backgroundColor: "#E0F2FE", border: "1px solid #BAE6FD" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <PeopleIcon sx={{ fontSize: 2.5, color: "#0369A1" }} />
              <Box>
                <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>
                  Total Employees
                </Typography>
                <Typography
                  sx={{ fontWeight: 700, fontSize: "1.5rem", color: "#0F172A" }}
                >
                  {getEmployeeCount()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ backgroundColor: "#FEE2E2", border: "1px solid #FECACA" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ShieldIcon sx={{ fontSize: 2.5, color: "#DC2626" }} />
              <Box>
                <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>
                  Total Admins
                </Typography>
                <Typography
                  sx={{ fontWeight: 700, fontSize: "1.5rem", color: "#0F172A" }}
                >
                  {getAdminCount()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          backgroundColor: "#F8FAFC",
          p: 2,
          borderRadius: 2,
        }}
      >
        <SearchIcon sx={{ color: "#94A3B8", my: "auto" }} />
        <TextField
          placeholder="Search users by name or email..."
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="standard"
          InputProps={{ disableUnderline: true }}
          sx={{ "& input": { fontSize: "0.95rem" } }}
        />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "#E2E8F0", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#06B6D4",
            },
            "& .MuiTab-root": {
              textTransform: "capitalize",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#64748B",
              "&.Mui-selected": {
                color: "#06B6D4",
              },
            },
          }}
        >
          <Tab label={`Employees (${getEmployeeCount()})`} />
          <Tab label={`Admins (${getAdminCount()})`} />
        </Tabs>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#0F172A",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  py: 2,
                }}
              >
                User
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
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 4, textAlign: "center" }}>
                  <Typography sx={{ color: "#94A3B8" }}>
                    No employees found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((userData, index) => (
                <TableRow
                  key={userData.id}
                  sx={{
                    borderBottom: "1px solid #E2E8F0",
                    "&:hover": { backgroundColor: "#F8FAFC" },
                  }}
                >
                  <TableCell sx={{ py: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {userData.profile_photo ? (
                        <Avatar
                          src={userData.profile_photo}
                          alt={userData.name}
                          sx={{ width: 40, height: 40 }}
                        />
                      ) : (
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: getAvatarColor(index),
                            fontWeight: 700,
                            color: "white",
                          }}
                        >
                          {getInitials(userData.name)}
                        </Avatar>
                      )}
                      <Typography sx={{ fontWeight: 600, color: "#0F172A" }}>
                        {userData.name}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ py: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <MailIcon sx={{ fontSize: "1rem", color: "#94A3B8" }} />
                      <Typography sx={{ fontSize: "0.9rem", color: "#64748B" }}>
                        {userData.email}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ py: 2.5 }}>
                    <Chip
                      label={
                        userData.role
                          ? userData.role.charAt(0).toUpperCase() +
                            userData.role.slice(1)
                          : "Employee"
                      }
                      icon={
                        <ShieldIcon sx={{ fontSize: "1rem !important" }} />
                      }
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

                  <TableCell sx={{ py: 2.5, textAlign: "center" }}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "center",
                      }}
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
                          userData.is_active ? (
                            <CancelIcon />
                          ) : (
                            <CheckCircleIcon />
                          )
                        }
                        onClick={() => handleStatusToggleClick(userData)}
                        sx={{
                          borderColor: userData.is_active
                            ? "#EF4444"
                            : "#10B981",
                          color: userData.is_active ? "#EF4444" : "#10B981",
                          borderRadius: 1,
                          textTransform: "capitalize",
                          fontSize: "0.8rem",
                          "&:hover": {
                            borderColor: userData.is_active
                              ? "#DC2626"
                              : "#059669",
                            backgroundColor: userData.is_active
                              ? "#FEE2E2"
                              : "#DCFCE7",
                          },
                        }}
                      >
                        {userData.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "#0F172A",
            fontSize: "1.3rem",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {selectedUser?.profile_photo ? (
            <Avatar
              src={selectedUser.profile_photo}
              alt={selectedUser?.name}
              sx={{ width: 50, height: 50 }}
            />
          ) : (
            <Avatar
              sx={{
                width: 50,
                height: 50,
                backgroundColor: "#06B6D4",
                fontWeight: 700,
                color: "white",
              }}
            >
              {getInitials(selectedUser?.name || "")}
            </Avatar>
          )}
          {selectedUser?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
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
                {selectedUser?.email}
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
                {selectedUser?.is_active ? (
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
                {selectedUser?.id}
              </Typography>
            </Box>
          </Box>
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
                backgroundColor: statusConfirm?.is_active
                  ? "#B91C1C"
                  : "#059669",
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
