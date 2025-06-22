"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
	Container,
	Typography,
	Box,
	Paper,
	Card,
	CardContent,
	Grid,
	Button,
	IconButton,
	Chip,
	useMediaQuery,
	useTheme as useMuiTheme,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Alert,
	CircularProgress,
} from "@mui/material";
import {
	ArrowBack as ArrowBackIcon,
	ArrowForward as ArrowForwardIcon,
	Today as TodayIcon,
	Add as AddIcon,
	CheckCircle as CheckCircleIcon,
	Schedule as ScheduleIcon,
	Flag as FlagIcon,
	Assignment as AssignmentIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { Task, Priority, Status } from "@prisma/client";
import TaskForm from "@/components/TaskForm";

interface CalendarDay {
	date: Date;
	tasks: Task[];
	isCurrentMonth: boolean;
	isToday: boolean;
}

export default function Calendar() {
	const { data: session } = useSession();
	const theme = useMuiTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	const [currentDate, setCurrentDate] = useState(new Date());
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);

	const fetchTasks = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/tasks");
			const data = await response.json();
			setTasks(data);
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

	const getDaysInMonth = (date: Date): CalendarDay[] => {
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const startDate = new Date(firstDay);
		startDate.setDate(startDate.getDate() - firstDay.getDay());

		const days: CalendarDay[] = [];
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (let i = 0; i < 42; i++) {
			const currentDate = new Date(startDate);
			currentDate.setDate(startDate.getDate() + i);

			const dayTasks = tasks.filter((task) => {
				const taskDate = new Date(task.dueDate);
				return taskDate.toDateString() === currentDate.toDateString();
			});

			days.push({
				date: currentDate,
				tasks: dayTasks,
				isCurrentMonth: currentDate.getMonth() === month,
				isToday: currentDate.toDateString() === today.toDateString(),
			});
		}

		return days;
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

	const formatDate = (date: Date) => {
		return date.toLocaleDateString("en-US", {
			month: "long",
			year: "numeric",
		});
	};

	const goToPreviousMonth = () => {
		setCurrentDate(
			new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
		);
	};

	const goToNextMonth = () => {
		setCurrentDate(
			new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
		);
	};

	const goToToday = () => {
		setCurrentDate(new Date());
	};

	const handleDateClick = (date: Date) => {
		setSelectedDate(date);
		setIsTaskFormOpen(true);
	};

	const handleTaskClick = (task: Task) => {
		setSelectedTask(task);
		setIsTaskFormOpen(true);
	};

	const calendarDays = getDaysInMonth(currentDate);
	const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	if (!session) {
		return (
			<Container
				maxWidth="lg"
				sx={{ py: 4 }}>
				<Alert severity="info">Please sign in to view your calendar.</Alert>
			</Container>
		);
	}

	return (
		<Container
			maxWidth="xl"
			sx={{ py: 4 }}>
			{/* Header */}
			<Box sx={{ mb: 4 }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
					<Button
						component={Link}
						href="/"
						startIcon={<ArrowBackIcon />}
						variant="outlined">
						Back to Dashboard
					</Button>
					<Typography
						variant={isMobile ? "h4" : "h3"}
						sx={{ flex: 1 }}>
						Task Calendar
					</Typography>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => setIsTaskFormOpen(true)}
						sx={{
							background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
							boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
						}}>
						Add Task
					</Button>
				</Box>

				{/* Calendar Navigation */}
				<Paper
					elevation={2}
					sx={{ p: 2, mb: 3 }}>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
						}}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
							<IconButton onClick={goToPreviousMonth}>
								<ArrowBackIcon />
							</IconButton>
							<Typography
								variant="h5"
								fontWeight="bold">
								{formatDate(currentDate)}
							</Typography>
							<IconButton onClick={goToNextMonth}>
								<ArrowForwardIcon />
							</IconButton>
						</Box>
						<Button
							variant="outlined"
							startIcon={<TodayIcon />}
							onClick={goToToday}>
							Today
						</Button>
					</Box>
				</Paper>
			</Box>

			{/* Calendar Grid */}
			{loading ? (
				<Box
					display="flex"
					justifyContent="center"
					my={4}>
					<CircularProgress />
				</Box>
			) : (
				<Paper
					elevation={2}
					sx={{ p: 2 }}>
					{/* Week Days Header */}
					<Grid
						container
						sx={{ mb: 1 }}>
						{weekDays.map((day) => (
							<Grid
								item
								xs
								key={day}>
								<Box
									sx={{
										p: 1,
										textAlign: "center",
										fontWeight: "bold",
										color: "text.secondary",
									}}>
									{day}
								</Box>
							</Grid>
						))}
					</Grid>

					{/* Calendar Days */}
					<Grid
						container
						spacing={1}>
						{calendarDays.map((day, index) => (
							<Grid
								item
								xs
								key={index}>
								<Card
									elevation={day.isToday ? 4 : 1}
									sx={{
										minHeight: 120,
										cursor: "pointer",
										border: day.isToday ? "2px solid" : "none",
										borderColor: "primary.main",
										bgcolor: day.isToday ? "primary.50" : "background.paper",
										opacity: day.isCurrentMonth ? 1 : 0.5,
										"&:hover": {
											bgcolor: day.isCurrentMonth
												? "action.hover"
												: "background.paper",
										},
									}}
									onClick={() => handleDateClick(day.date)}>
									<CardContent sx={{ p: 1 }}>
										<Typography
											variant="body2"
											sx={{
												fontWeight: day.isToday ? "bold" : "normal",
												color: day.isToday ? "primary.main" : "text.primary",
												mb: 1,
											}}>
											{day.date.getDate()}
										</Typography>

										{/* Tasks for this day */}
										<Box
											sx={{
												display: "flex",
												flexDirection: "column",
												gap: 0.5,
											}}>
											{day.tasks.slice(0, 3).map((task) => (
												<Box
													key={task.id}
													sx={{
														p: 0.5,
														bgcolor: "background.default",
														borderRadius: 1,
														border: "1px solid",
														borderColor: "divider",
														cursor: "pointer",
														"&:hover": {
															bgcolor: "action.hover",
														},
													}}
													onClick={(e) => {
														e.stopPropagation();
														handleTaskClick(task);
													}}>
													<Typography
														variant="caption"
														sx={{
															fontWeight: "bold",
															display: "block",
															textDecoration:
																task.status === "COMPLETED"
																	? "line-through"
																	: "none",
														}}>
														{task.title.length > 15
															? task.title.substring(0, 15) + "..."
															: task.title}
													</Typography>
													<Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
														<Chip
															label={task.priority.toLowerCase()}
															size="small"
															color={getPriorityColor(task.priority)}
															sx={{ height: 16, fontSize: "0.6rem" }}
														/>
														<Chip
															label={task.status.toLowerCase()}
															size="small"
															color={getStatusColor(task.status)}
															sx={{ height: 16, fontSize: "0.6rem" }}
														/>
													</Box>
												</Box>
											))}
											{day.tasks.length > 3 && (
												<Typography
													variant="caption"
													color="text.secondary">
													+{day.tasks.length - 3} more
												</Typography>
											)}
										</Box>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>
				</Paper>
			)}

			{/* Task Form */}
			<TaskForm
				open={isTaskFormOpen}
				onClose={() => {
					setIsTaskFormOpen(false);
					setSelectedTask(null);
					setSelectedDate(null);
				}}
				onTaskAdded={() => {
					fetchTasks();
					setIsTaskFormOpen(false);
					setSelectedTask(null);
					setSelectedDate(null);
				}}
				task={selectedTask}
			/>
		</Container>
	);
}
