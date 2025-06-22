"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	IconButton,
	Checkbox,
	Typography,
	Box,
	Chip,
	Paper,
	Grid,
	Button,
	TextField,
	InputAdornment,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Alert,
	CircularProgress,
	useMediaQuery,
	useTheme as useMuiTheme,
	Card,
	CardContent,
	LinearProgress,
} from "@mui/material";
import {
	Delete as DeleteIcon,
	Edit as EditIcon,
	Search as SearchIcon,
	FilterList as FilterIcon,
	Add as AddIcon,
	CheckCircle as CheckCircleIcon,
	Schedule as ScheduleIcon,
	TrendingUp as TrendingUpIcon,
	Assignment as AssignmentIcon,
	Flag as FlagIcon,
	CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import TaskForm from "./TaskForm";
import { Task, Priority, Status } from "@prisma/client";

interface TaskWithStats extends Task {
	daysUntilDue?: number;
	isOverdue?: boolean;
}

interface TaskListProps {
	showStats?: boolean;
	maxTasks?: number;
	filterStatus?: Status;
}

export default function TaskList({
	showStats = true,
	maxTasks,
	filterStatus,
}: TaskListProps) {
	const { data: session } = useSession();
	const theme = useMuiTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	const [tasks, setTasks] = useState<TaskWithStats[]>([]);
	const [filteredTasks, setFilteredTasks] = useState<TaskWithStats[]>([]);
	const [loading, setLoading] = useState(true);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [priorityFilter, setPriorityFilter] = useState<string>("all");
	const [showFilters, setShowFilters] = useState(false);

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

		// Apply priority filter
		if (priorityFilter !== "all") {
			filtered = filtered.filter((task) => task.priority === priorityFilter);
		}

		// Apply status filter from props
		if (filterStatus) {
			filtered = filtered.filter((task) => task.status === filterStatus);
		}

		// Apply max tasks limit
		if (maxTasks) {
			filtered = filtered.slice(0, maxTasks);
		}

		// Sort by due date
		filtered.sort(
			(a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
		);

		setFilteredTasks(filtered);
	}, [tasks, searchTerm, priorityFilter, filterStatus, maxTasks]);

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

	const completionRate =
		stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

	if (!session) {
		return (
			<Box sx={{ p: 2 }}>
				<Alert severity="info">Please sign in to view your tasks.</Alert>
			</Box>
		);
	}

	return (
		<Box>
			{/* Stats Section */}
			{showStats && (
				<Box sx={{ mb: 3 }}>
					<Typography
						variant="h6"
						gutterBottom>
						Task Overview
					</Typography>
					<Grid
						container
						spacing={2}
						sx={{ mb: 2 }}>
						<Grid
							item
							xs={6}
							md={2.4}>
							<Card
								elevation={2}
								sx={{ p: 2, textAlign: "center" }}>
								<AssignmentIcon
									sx={{ fontSize: 30, color: "primary.main", mb: 1 }}
								/>
								<Typography variant="h4">{stats.total}</Typography>
								<Typography
									variant="body2"
									color="text.secondary">
									Total
								</Typography>
							</Card>
						</Grid>
						<Grid
							item
							xs={6}
							md={2.4}>
							<Card
								elevation={2}
								sx={{ p: 2, textAlign: "center" }}>
								<ScheduleIcon
									sx={{ fontSize: 30, color: "warning.main", mb: 1 }}
								/>
								<Typography variant="h4">{stats.pending}</Typography>
								<Typography
									variant="body2"
									color="text.secondary">
									Pending
								</Typography>
							</Card>
						</Grid>
						<Grid
							item
							xs={6}
							md={2.4}>
							<Card
								elevation={2}
								sx={{ p: 2, textAlign: "center" }}>
								<TrendingUpIcon
									sx={{ fontSize: 30, color: "info.main", mb: 1 }}
								/>
								<Typography variant="h4">{stats.inProgress}</Typography>
								<Typography
									variant="body2"
									color="text.secondary">
									In Progress
								</Typography>
							</Card>
						</Grid>
						<Grid
							item
							xs={6}
							md={2.4}>
							<Card
								elevation={2}
								sx={{ p: 2, textAlign: "center" }}>
								<CheckCircleIcon
									sx={{ fontSize: 30, color: "success.main", mb: 1 }}
								/>
								<Typography variant="h4">{stats.completed}</Typography>
								<Typography
									variant="body2"
									color="text.secondary">
									Completed
								</Typography>
							</Card>
						</Grid>
						<Grid
							item
							xs={6}
							md={2.4}>
							<Card
								elevation={2}
								sx={{ p: 2, textAlign: "center" }}>
								<FlagIcon sx={{ fontSize: 30, color: "error.main", mb: 1 }} />
								<Typography variant="h4">{stats.overdue}</Typography>
								<Typography
									variant="body2"
									color="text.secondary">
									Overdue
								</Typography>
							</Card>
						</Grid>
					</Grid>

					{/* Progress Bar */}
					<Card
						elevation={1}
						sx={{ p: 2 }}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								mb: 1,
							}}>
							<Typography
								variant="body2"
								color="text.secondary">
								Completion Rate
							</Typography>
							<Typography
								variant="body2"
								fontWeight="bold">
								{completionRate.toFixed(1)}%
							</Typography>
						</Box>
						<LinearProgress
							variant="determinate"
							value={completionRate}
							sx={{ height: 8, borderRadius: 4 }}
						/>
					</Card>
				</Box>
			)}

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
								startIcon={<FilterIcon />}
								onClick={() => setShowFilters(!showFilters)}>
								Filters
							</Button>
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
						<FormControl fullWidth>
							<InputLabel>Priority Filter</InputLabel>
							<Select
								value={priorityFilter}
								label="Priority Filter"
								onChange={(e) => setPriorityFilter(e.target.value)}>
								<MenuItem value="all">All Priorities</MenuItem>
								<MenuItem value="HIGH">High</MenuItem>
								<MenuItem value="MEDIUM">Medium</MenuItem>
								<MenuItem value="LOW">Low</MenuItem>
							</Select>
						</FormControl>
					</Box>
				)}
			</Box>

			{/* Task List */}
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
						{searchTerm || priorityFilter !== "all"
							? "Try adjusting your filters"
							: "Create your first task to get started"}
					</Typography>
					{!searchTerm && priorityFilter === "all" && (
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={() => setIsFormOpen(true)}>
							Add Your First Task
						</Button>
					)}
				</Box>
			) : (
				<Paper elevation={1}>
					<List>
						{filteredTasks.map((task) => (
							<ListItem
								key={task.id}
								sx={{
									borderBottom: "1px solid",
									borderColor: "divider",
									"&:last-child": { borderBottom: "none" },
									transition: "all 0.3s ease",
									"&:hover": {
										bgcolor: "action.hover",
									},
								}}>
								<Checkbox
									checked={task.status === "COMPLETED"}
									onChange={() =>
										handleStatusChange(
											task.id,
											task.status === "COMPLETED" ? "PENDING" : "COMPLETED"
										)
									}
									color="primary"
								/>
								<ListItemText
									primary={
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 1,
												mb: 1,
											}}>
											<Typography
												variant="h6"
												component="div"
												sx={{
													textDecoration:
														task.status === "COMPLETED"
															? "line-through"
															: "none",
													color:
														task.status === "COMPLETED"
															? "text.secondary"
															: "text.primary",
												}}>
												{task.title}
											</Typography>
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
									}
									secondary={
										<Box>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{
													textDecoration:
														task.status === "COMPLETED"
															? "line-through"
															: "none",
													mb: 1,
												}}>
												{task.description}
											</Typography>
											<Box
												sx={{ display: "flex", alignItems: "center", gap: 2 }}>
												<Box sx={{ display: "flex", alignItems: "center" }}>
													<CalendarIcon
														sx={{
															fontSize: 16,
															mr: 0.5,
															color: "text.secondary",
														}}
													/>
													<Typography
														variant="caption"
														color={task.isOverdue ? "error" : "text.secondary"}>
														{getDaysText(task.daysUntilDue || 0)}
													</Typography>
												</Box>
												{task.tags && task.tags.length > 0 && (
													<Box sx={{ display: "flex", gap: 0.5 }}>
														{task.tags.slice(0, 2).map((tag, index) => (
															<Chip
																key={index}
																label={tag}
																size="small"
																variant="outlined"
																sx={{ fontSize: "0.7rem" }}
															/>
														))}
														{task.tags.length > 2 && (
															<Chip
																label={`+${task.tags.length - 2}`}
																size="small"
																variant="outlined"
																sx={{ fontSize: "0.7rem" }}
															/>
														)}
													</Box>
												)}
											</Box>
										</Box>
									}
								/>
								<ListItemSecondaryAction>
									<Box sx={{ display: "flex", gap: 1 }}>
										<IconButton
											edge="end"
											onClick={() => handleEdit(task)}
											size="small">
											<EditIcon />
										</IconButton>
										<IconButton
											edge="end"
											onClick={() => handleDelete(task.id)}
											size="small"
											color="error">
											<DeleteIcon />
										</IconButton>
									</Box>
								</ListItemSecondaryAction>
							</ListItem>
						))}
					</List>
				</Paper>
			)}

			<TaskForm
				open={isFormOpen}
				onClose={handleCloseForm}
				onTaskAdded={fetchTasks}
				task={editingTask}
			/>
		</Box>
	);
}
