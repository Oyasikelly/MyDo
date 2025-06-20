"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
	Container,
	Typography,
	Box,
	Grid,
	Paper,
	Tabs,
	Tab,
	Chip,
	Button,
	TextField,
	InputAdornment,
	useMediaQuery,
	useTheme as useMuiTheme,
	CircularProgress,
	Alert,
	Card,
	CardContent,
	CardActions,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Switch,
	FormControlLabel,
} from "@mui/material";
import {
	Add as AddIcon,
	Search as SearchIcon,
	FilterList as FilterIcon,
	Sort as SortIcon,
	ViewList as ViewListIcon,
	ViewModule as ViewModuleIcon,
	CalendarToday as CalendarIcon,
	Flag as FlagIcon,
	CheckCircle as CheckCircleIcon,
	Schedule as ScheduleIcon,
	TrendingUp as TrendingUpIcon,
	Assignment as AssignmentIcon,
	Print as PrintIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from "@mui/icons-material";
import TaskForm from "@/components/TaskForm";
import PrintableTasks from "@/components/PrintableTasks";
import { printTasks } from "@/lib/printUtils";
import { Task, Priority, Status, Frequency } from "@prisma/client";

interface TaskWithStats extends Task {
	daysUntilDue?: number;
	isOverdue?: boolean;
}

interface UserProfile {
	id: string;
	name: string;
	email: string;
	bio: string | null;
	avatar: string | null;
	createdAt: string;
}

export default function Tasks() {
	const { data: session } = useSession();
	const theme = useMuiTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	const [tasks, setTasks] = useState<TaskWithStats[]>([]);
	const [filteredTasks, setFilteredTasks] = useState<TaskWithStats[]>([]);
	const [loading, setLoading] = useState(true);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [activeTab, setActiveTab] = useState(0);
	const [searchTerm, setSearchTerm] = useState("");
	const [viewMode, setViewMode] = useState<"list" | "grid">("list");
	const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "createdAt">(
		"dueDate"
	);
	const [showFilters, setShowFilters] = useState(false);
	const [priorityFilter, setPriorityFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

	const fetchUserProfile = async () => {
		try {
			const response = await fetch("/api/profile");
			if (response.ok) {
				const profile = await response.json();
				setUserProfile(profile);
			}
		} catch (error) {
			console.error("Error fetching user profile:", error);
		}
	};

	const fetchTasks = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/tasks");
			const data = await response.json();

			// Add computed properties
			const tasksWithStats = data.map((task: Task) => {
				const dueDate = new Date(task.dueDate);
				const now = new Date();
				const daysUntilDue = Math.ceil(
					(dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
				);

				return {
					...task,
					daysUntilDue,
					isOverdue: daysUntilDue < 0 && task.status !== "COMPLETED",
				};
			});

			setTasks(tasksWithStats);
			setFilteredTasks(tasksWithStats);
		} catch (error) {
			console.error("Error fetching tasks:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (session) {
			fetchTasks();
			fetchUserProfile();
		}
	}, [session]);

	useEffect(() => {
		let filtered = tasks;

		// Apply search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(task) =>
					task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(task.description?.toLowerCase() || "").includes(
						searchTerm.toLowerCase()
					)
			);
		}

		// Apply status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter((task) => task.status === statusFilter);
		}

		// Apply priority filter
		if (priorityFilter !== "all") {
			filtered = filtered.filter((task) => task.priority === priorityFilter);
		}

		// Apply tab filter
		switch (activeTab) {
			case 1: // Pending
				filtered = filtered.filter((task) => task.status === "PENDING");
				break;
			case 2: // In Progress
				filtered = filtered.filter((task) => task.status === "IN_PROGRESS");
				break;
			case 3: // Completed
				filtered = filtered.filter((task) => task.status === "COMPLETED");
				break;
			case 4: // Overdue
				filtered = filtered.filter((task) => task.isOverdue);
				break;
		}

		// Apply sorting
		filtered.sort((a, b) => {
			switch (sortBy) {
				case "dueDate":
					return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
				case "priority":
					const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
					return (
						priorityOrder[b.priority as keyof typeof priorityOrder] -
						priorityOrder[a.priority as keyof typeof priorityOrder]
					);
				case "createdAt":
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
				default:
					return 0;
			}
		});

		setFilteredTasks(filtered);
	}, [tasks, searchTerm, activeTab, sortBy, priorityFilter, statusFilter]);

	const handleEdit = (task: Task) => {
		setEditingTask(task);
		setIsFormOpen(true);
	};

	const handleCloseForm = () => {
		setIsFormOpen(false);
		setEditingTask(null);
	};

	const handleStatusChange = async (taskId: string, newStatus: Status) => {
		try {
			await fetch(`/api/tasks/${taskId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: newStatus }),
			});
			await fetchTasks(); // Refresh tasks
		} catch (error) {
			console.error("Error updating task status:", error);
		}
	};

	const handleDelete = async (taskId: string) => {
		try {
			await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
			await fetchTasks(); // Refresh tasks
		} catch (error) {
			console.error("Error deleting task:", error);
		}
	};

	const handlePrint = () => {
		if (!userProfile) return;

		printTasks(tasks, {
			name: userProfile.name,
			email: userProfile.email,
		});
	};

	const getPriorityColor = (priority: Priority) => {
		switch (priority) {
			case "HIGH":
				return "error";
			case "MEDIUM":
				return "warning";
			case "LOW":
				return "success";
			default:
				return "default";
		}
	};

	const getStatusColor = (status: Status) => {
		switch (status) {
			case "COMPLETED":
				return "success";
			case "IN_PROGRESS":
				return "warning";
			case "PENDING":
				return "default";
			default:
				return "default";
		}
	};

	const getDaysText = (days: number) => {
		if (days < 0) return `${Math.abs(days)} days overdue`;
		if (days === 0) return "Due today";
		if (days === 1) return "Due tomorrow";
		return `Due in ${days} days`;
	};

	const stats = {
		total: tasks.length,
		pending: tasks.filter((t) => t.status === "PENDING").length,
		inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
		completed: tasks.filter((t) => t.status === "COMPLETED").length,
		overdue: tasks.filter((t) => t.isOverdue).length,
	};

	if (!session) {
		return (
			<Container
				maxWidth="lg"
				sx={{ py: 4 }}>
				<Alert severity="info">Please sign in to view your tasks.</Alert>
			</Container>
		);
	}

	return (
		<Container
			maxWidth="lg"
			sx={{ py: 4 }}>
			{/* Header */}
			<Box sx={{ mb: 4 }}>
				<Typography
					variant={isMobile ? "h4" : "h3"}
					gutterBottom>
					Task Management
				</Typography>
				<Typography
					variant="body1"
					color="text.secondary">
					Organize and track your tasks efficiently
				</Typography>
			</Box>

			{/* Stats Cards */}
			<Grid
				container
				spacing={2}
				sx={{ mb: 4 }}>
				<Grid
					item
					xs={6}
					md={2.4}>
					<Paper
						elevation={2}
						sx={{
							p: 2,
							textAlign: "center",
							background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
							color: "white",
						}}>
						<AssignmentIcon sx={{ fontSize: 40, mb: 1 }} />
						<Typography variant="h4">{stats.total}</Typography>
						<Typography variant="body2">Total</Typography>
					</Paper>
				</Grid>
				<Grid
					item
					xs={6}
					md={2.4}>
					<Paper
						elevation={2}
						sx={{
							p: 2,
							textAlign: "center",
							background: "linear-gradient(45deg, #FF9800 30%, #FFC107 90%)",
							color: "white",
						}}>
						<ScheduleIcon sx={{ fontSize: 40, mb: 1 }} />
						<Typography variant="h4">{stats.pending}</Typography>
						<Typography variant="body2">Pending</Typography>
					</Paper>
				</Grid>
				<Grid
					item
					xs={6}
					md={2.4}>
					<Paper
						elevation={2}
						sx={{
							p: 2,
							textAlign: "center",
							background: "linear-gradient(45deg, #9C27B0 30%, #E1BEE7 90%)",
							color: "white",
						}}>
						<TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
						<Typography variant="h4">{stats.inProgress}</Typography>
						<Typography variant="body2">In Progress</Typography>
					</Paper>
				</Grid>
				<Grid
					item
					xs={6}
					md={2.4}>
					<Paper
						elevation={2}
						sx={{
							p: 2,
							textAlign: "center",
							background: "linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)",
							color: "white",
						}}>
						<CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
						<Typography variant="h4">{stats.completed}</Typography>
						<Typography variant="body2">Completed</Typography>
					</Paper>
				</Grid>
				<Grid
					item
					xs={6}
					md={2.4}>
					<Paper
						elevation={2}
						sx={{
							p: 2,
							textAlign: "center",
							background: "linear-gradient(45deg, #F44336 30%, #FF5722 90%)",
							color: "white",
						}}>
						<FlagIcon sx={{ fontSize: 40, mb: 1 }} />
						<Typography variant="h4">{stats.overdue}</Typography>
						<Typography variant="body2">Overdue</Typography>
					</Paper>
				</Grid>
			</Grid>

			{/* Controls */}
			<Box sx={{ mb: 3 }}>
				<Grid
					container
					spacing={2}
					alignItems="center">
					<Grid
						item
						xs={12}
						md={4}>
						<TextField
							fullWidth
							placeholder="Search tasks..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
							}}
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={8}>
						<Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
							<Button
								variant="outlined"
								startIcon={<PrintIcon />}
								onClick={handlePrint}
								disabled={!userProfile}>
								Print Tasks
							</Button>
							<Button
								variant="outlined"
								startIcon={<FilterIcon />}
								onClick={() => setShowFilters(!showFilters)}>
								Filters
							</Button>
							<Button
								variant="outlined"
								startIcon={<SortIcon />}
								onClick={() =>
									setSortBy(sortBy === "dueDate" ? "priority" : "dueDate")
								}>
								Sort: {sortBy === "dueDate" ? "Due Date" : "Priority"}
							</Button>
							<IconButton
								onClick={() =>
									setViewMode(viewMode === "list" ? "grid" : "list")
								}>
								{viewMode === "list" ? <ViewModuleIcon /> : <ViewListIcon />}
							</IconButton>
							<Button
								variant="contained"
								startIcon={<AddIcon />}
								onClick={() => setIsFormOpen(true)}>
								Add Task
							</Button>
						</Box>
					</Grid>
				</Grid>

				{/* Filters */}
				{showFilters && (
					<Box
						sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
						<Grid
							container
							spacing={2}>
							<Grid
								item
								xs={12}
								md={6}>
								<FormControl fullWidth>
									<InputLabel>Priority</InputLabel>
									<Select
										value={priorityFilter}
										label="Priority"
										onChange={(e) => setPriorityFilter(e.target.value)}>
										<MenuItem value="all">All Priorities</MenuItem>
										<MenuItem value="HIGH">High</MenuItem>
										<MenuItem value="MEDIUM">Medium</MenuItem>
										<MenuItem value="LOW">Low</MenuItem>
									</Select>
								</FormControl>
							</Grid>
							<Grid
								item
								xs={12}
								md={6}>
								<FormControl fullWidth>
									<InputLabel>Status</InputLabel>
									<Select
										value={statusFilter}
										label="Status"
										onChange={(e) => setStatusFilter(e.target.value)}>
										<MenuItem value="all">All Statuses</MenuItem>
										<MenuItem value="PENDING">Pending</MenuItem>
										<MenuItem value="IN_PROGRESS">In Progress</MenuItem>
										<MenuItem value="COMPLETED">Completed</MenuItem>
									</Select>
								</FormControl>
							</Grid>
						</Grid>
					</Box>
				)}
			</Box>

			{/* Tabs */}
			<Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
				<Tabs
					value={activeTab}
					onChange={(_, newValue) => setActiveTab(newValue)}>
					<Tab label={`All (${stats.total})`} />
					<Tab label={`Pending (${stats.pending})`} />
					<Tab label={`In Progress (${stats.inProgress})`} />
					<Tab label={`Completed (${stats.completed})`} />
					<Tab label={`Overdue (${stats.overdue})`} />
				</Tabs>
			</Box>

			{/* Task List/Grid */}
			{loading ? (
				<Box
					display="flex"
					justifyContent="center"
					my={4}>
					<CircularProgress />
				</Box>
			) : filteredTasks.length === 0 ? (
				<Box
					textAlign="center"
					py={8}>
					<AssignmentIcon
						sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
					/>
					<Typography
						variant="h6"
						gutterBottom>
						No tasks found
					</Typography>
					<Typography
						variant="body1"
						color="text.secondary"
						mb={3}>
						{searchTerm || activeTab > 0
							? "Try adjusting your filters"
							: "Create your first task to get started"}
					</Typography>
					{!searchTerm && activeTab === 0 && (
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={() => setIsFormOpen(true)}>
							Add Your First Task
						</Button>
					)}
				</Box>
			) : viewMode === "grid" ? (
				<Grid
					container
					spacing={2}>
					{filteredTasks.map((task) => (
						<Grid
							item
							xs={12}
							sm={6}
							md={4}
							key={task.id}>
							<Card
								elevation={2}
								sx={{
									height: "100%",
									transition: "all 0.3s ease",
									"&:hover": {
										transform: "translateY(-4px)",
										boxShadow: 4,
									},
								}}>
								<CardContent>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "flex-start",
											mb: 1,
										}}>
										<Typography
											variant="h6"
											component="div"
											sx={{ fontWeight: 500, flex: 1 }}>
											{task.title}
										</Typography>
										<IconButton
											size="small"
											onClick={() =>
												handleStatusChange(
													task.id,
													task.status === "COMPLETED" ? "PENDING" : "COMPLETED"
												)
											}>
											<CheckCircleIcon
												color={
													task.status === "COMPLETED" ? "success" : "action"
												}
											/>
										</IconButton>
									</Box>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mb: 2 }}>
										{task.description}
									</Typography>
									<Box
										sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
										<Chip
											label={task.priority.toLowerCase()}
											size="small"
											color={getPriorityColor(task.priority)}
										/>
										<Chip
											label={task.status.toLowerCase()}
											size="small"
											color={getStatusColor(task.status)}
										/>
									</Box>
									<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
										<CalendarIcon
											sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
										/>
										<Typography
											variant="caption"
											color={task.isOverdue ? "error" : "text.secondary"}>
											{getDaysText(task.daysUntilDue || 0)}
										</Typography>
									</Box>
									{task.category && (
										<Chip
											label={task.category}
											size="small"
											variant="outlined"
											sx={{ mb: 2 }}
										/>
									)}
								</CardContent>
								<CardActions sx={{ justifyContent: "space-between" }}>
									<Box>
										<IconButton
											size="small"
											onClick={() => handleEdit(task)}>
											<EditIcon />
										</IconButton>
										<IconButton
											size="small"
											onClick={() => handleDelete(task.id)}>
											<DeleteIcon />
										</IconButton>
									</Box>
									<Box sx={{ display: "flex", gap: 1 }}>
										<IconButton
											size="small"
											onClick={() => handleStatusChange(task.id, "PENDING")}
											color={task.status === "PENDING" ? "primary" : "default"}>
											<ScheduleIcon />
										</IconButton>
										<IconButton
											size="small"
											onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
											color={
												task.status === "IN_PROGRESS" ? "primary" : "default"
											}>
											<TrendingUpIcon />
										</IconButton>
										<IconButton
											size="small"
											onClick={() => handleStatusChange(task.id, "COMPLETED")}
											color={
												task.status === "COMPLETED" ? "primary" : "default"
											}>
											<CheckCircleIcon />
										</IconButton>
									</Box>
								</CardActions>
							</Card>
						</Grid>
					))}
				</Grid>
			) : (
				<Box>
					{filteredTasks.map((task) => (
						<Paper
							key={task.id}
							elevation={1}
							sx={{
								p: 2,
								mb: 2,
								transition: "all 0.3s ease",
								"&:hover": {
									boxShadow: 2,
								},
							}}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-start",
								}}>
								<Box sx={{ flex: 1 }}>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 2,
											mb: 1,
										}}>
										<Typography
											variant="h6"
											sx={{
												textDecoration:
													task.status === "COMPLETED" ? "line-through" : "none",
												color:
													task.status === "COMPLETED"
														? "text.secondary"
														: "text.primary",
											}}>
											{task.title}
										</Typography>
										<Box sx={{ display: "flex", gap: 1 }}>
											<Chip
												label={task.priority.toLowerCase()}
												size="small"
												color={getPriorityColor(task.priority)}
											/>
											<Chip
												label={task.status.toLowerCase()}
												size="small"
												color={getStatusColor(task.status)}
											/>
										</Box>
									</Box>
									{task.description && (
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{
												textDecoration:
													task.status === "COMPLETED" ? "line-through" : "none",
												mb: 1,
											}}>
											{task.description}
										</Typography>
									)}
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 2,
											flexWrap: "wrap",
										}}>
										<Box sx={{ display: "flex", alignItems: "center" }}>
											<CalendarIcon
												sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
											/>
											<Typography
												variant="caption"
												color={task.isOverdue ? "error" : "text.secondary"}>
												{getDaysText(task.daysUntilDue || 0)}
											</Typography>
										</Box>
										{task.category && (
											<Chip
												label={task.category}
												size="small"
												variant="outlined"
											/>
										)}
									</Box>
								</Box>
								<Box sx={{ display: "flex", gap: 1 }}>
									<IconButton
										size="small"
										onClick={() => handleEdit(task)}>
										<EditIcon />
									</IconButton>
									<IconButton
										size="small"
										onClick={() => handleDelete(task.id)}>
										<DeleteIcon />
									</IconButton>
								</Box>
							</Box>
						</Paper>
					))}
				</Box>
			)}

			{/* Task Form Dialog */}
			<TaskForm
				open={isFormOpen}
				onClose={handleCloseForm}
				task={editingTask}
				onTaskAdded={() => {
					handleCloseForm();
					fetchTasks();
				}}
			/>
		</Container>
	);
}
