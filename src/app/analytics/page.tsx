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
	useMediaQuery,
	useTheme as useMuiTheme,
	Alert,
	CircularProgress,
	LinearProgress,
	Chip,
	Divider,
} from "@mui/material";
import {
	ArrowBack as ArrowBackIcon,
	TrendingUp as TrendingUpIcon,
	CheckCircle as CheckCircleIcon,
	Schedule as ScheduleIcon,
	Assignment as AssignmentIcon,
	Flag as FlagIcon,
	CalendarToday as CalendarIcon,
	Star as StarIcon,
	AccessTime as AccessTimeIcon,
	Today as TodayIcon,
	Upcoming as UpcomingIcon,
	Done as DoneIcon,
	PriorityHigh as PriorityHighIcon,
	Analytics as AnalyticsIcon,
	Timeline as TimelineIcon,
	Insights as InsightsIcon,
	EmojiEvents as TrophyIcon,
	LocalFireDepartment as FireIcon,
	Psychology as BrainIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { Task, Priority, Status } from "@prisma/client";

interface TaskStats {
	total: number;
	pending: number;
	inProgress: number;
	completed: number;
	overdue: number;
	today: number;
	upcoming: number;
	highPriority: number;
	mediumPriority: number;
	lowPriority: number;
}

interface WeeklyData {
	week: string;
	completed: number;
	created: number;
}

export default function Analytics() {
	const { data: session } = useSession();
	const theme = useMuiTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [taskStats, setTaskStats] = useState<TaskStats>({
		total: 0,
		pending: 0,
		inProgress: 0,
		completed: 0,
		overdue: 0,
		today: 0,
		upcoming: 0,
		highPriority: 0,
		mediumPriority: 0,
		lowPriority: 0,
	});

	const fetchTasks = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/tasks");
			const data = await response.json();
			setTasks(data);
			calculateStats(data);
		} catch (error) {
			console.error("Error fetching tasks:", error);
		} finally {
			setLoading(false);
		}
	};

	const calculateStats = (taskData: Task[]) => {
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const stats = {
			total: taskData.length,
			pending: taskData.filter((t) => t.status === "PENDING").length,
			inProgress: taskData.filter((t) => t.status === "IN_PROGRESS").length,
			completed: taskData.filter((t) => t.status === "COMPLETED").length,
			overdue: taskData.filter((t) => {
				const dueDate = new Date(t.dueDate);
				return dueDate < today && t.status !== "COMPLETED";
			}).length,
			today: taskData.filter((t) => {
				const dueDate = new Date(t.dueDate);
				return dueDate.toDateString() === today.toDateString();
			}).length,
			upcoming: taskData.filter((t) => {
				const dueDate = new Date(t.dueDate);
				return dueDate >= tomorrow && t.status !== "COMPLETED";
			}).length,
			highPriority: taskData.filter((t) => t.priority === "HIGH").length,
			mediumPriority: taskData.filter((t) => t.priority === "MEDIUM").length,
			lowPriority: taskData.filter((t) => t.priority === "LOW").length,
		};

		setTaskStats(stats);
	};

	useEffect(() => {
		if (session) {
			fetchTasks();
		}
	}, [session]);

	const completionRate =
		taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;
	const productivityScore =
		taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;

	const getWeeklyData = (): WeeklyData[] => {
		const weeks: WeeklyData[] = [];
		const today = new Date();

		for (let i = 3; i >= 0; i--) {
			const weekStart = new Date(today);
			weekStart.setDate(today.getDate() - (today.getDay() + 7 * i));
			weekStart.setHours(0, 0, 0, 0);

			const weekEnd = new Date(weekStart);
			weekEnd.setDate(weekStart.getDate() + 6);
			weekEnd.setHours(23, 59, 59, 999);

			const weekTasks = tasks.filter((task) => {
				const taskDate = new Date(task.dueDate);
				return taskDate >= weekStart && taskDate <= weekEnd;
			});

			const completed = weekTasks.filter(
				(task) => task.status === "COMPLETED"
			).length;
			const created = weekTasks.length;

			weeks.push({
				week: `Week ${4 - i}`,
				completed,
				created,
			});
		}

		return weeks;
	};

	const getProductivityInsights = () => {
		if (taskStats.total === 0)
			return "No tasks yet. Start by creating your first task!";

		if (completionRate >= 80)
			return "Excellent productivity! You're completing most of your tasks.";
		if (completionRate >= 60)
			return "Good progress! You're maintaining a healthy completion rate.";
		if (completionRate >= 40)
			return "You're making progress. Consider focusing on high-priority tasks.";
		return "You might want to review your task management approach. Start with smaller, achievable tasks.";
	};

	const getPriorityInsights = () => {
		if (
			taskStats.highPriority >
			taskStats.mediumPriority + taskStats.lowPriority
		) {
			return "You have many high-priority tasks. Consider delegating or breaking them down.";
		}
		if (
			taskStats.lowPriority >
			taskStats.highPriority + taskStats.mediumPriority
		) {
			return "Most tasks are low priority. You might want to focus on more important items.";
		}
		return "Good balance of task priorities. Keep up the balanced approach!";
	};

	const weeklyData = getWeeklyData();

	if (!session) {
		return (
			<Container
				maxWidth="lg"
				sx={{ py: 4 }}>
				<Alert severity="info">Please sign in to view your analytics.</Alert>
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
						Task Analytics
					</Typography>
					<AnalyticsIcon sx={{ fontSize: 40, color: "primary.main" }} />
				</Box>
			</Box>

			{loading ? (
				<Box
					display="flex"
					justifyContent="center"
					my={4}>
					<CircularProgress />
				</Box>
			) : (
				<Grid
					container
					spacing={3}>
					{/* Key Metrics */}
					<Grid
						item
						xs={12}>
						<Typography
							variant="h5"
							gutterBottom>
							Key Performance Metrics
						</Typography>
						<Grid
							container
							spacing={2}>
							<Grid
								item
								xs={12}
								sm={6}
								md={3}>
								<Card
									elevation={2}
									sx={{ p: 2, textAlign: "center" }}>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											mb: 1,
										}}>
										<TrophyIcon color="primary" />
									</Box>
									<Typography
										variant="h4"
										color="primary.main"
										fontWeight="bold">
										{productivityScore.toFixed(0)}%
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary">
										Productivity Score
									</Typography>
								</Card>
							</Grid>
							<Grid
								item
								xs={12}
								sm={6}
								md={3}>
								<Card
									elevation={2}
									sx={{ p: 2, textAlign: "center" }}>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											mb: 1,
										}}>
										<CheckCircleIcon color="success" />
									</Box>
									<Typography
										variant="h4"
										color="success.main"
										fontWeight="bold">
										{taskStats.completed}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary">
										Tasks Completed
									</Typography>
								</Card>
							</Grid>
							<Grid
								item
								xs={12}
								sm={6}
								md={3}>
								<Card
									elevation={2}
									sx={{ p: 2, textAlign: "center" }}>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											mb: 1,
										}}>
										<FireIcon color="warning" />
									</Box>
									<Typography
										variant="h4"
										color="warning.main"
										fontWeight="bold">
										{taskStats.inProgress}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary">
										In Progress
									</Typography>
								</Card>
							</Grid>
							<Grid
								item
								xs={12}
								sm={6}
								md={3}>
								<Card
									elevation={2}
									sx={{ p: 2, textAlign: "center" }}>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											mb: 1,
										}}>
										<FlagIcon color="error" />
									</Box>
									<Typography
										variant="h4"
										color="error.main"
										fontWeight="bold">
										{taskStats.overdue}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary">
										Overdue
									</Typography>
								</Card>
							</Grid>
						</Grid>
					</Grid>

					{/* Progress Overview */}
					<Grid
						item
						xs={12}
						md={6}>
						<Card
							elevation={2}
							sx={{ p: 3 }}>
							<Typography
								variant="h6"
								gutterBottom>
								Progress Overview
							</Typography>
							<Box sx={{ mb: 3 }}>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										mb: 1,
									}}>
									<Typography variant="body2">Completion Rate</Typography>
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
							</Box>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									mb: 1,
								}}>
								<Typography variant="body2">Total Tasks</Typography>
								<Typography
									variant="body2"
									fontWeight="bold">
									{taskStats.total}
								</Typography>
							</Box>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									mb: 1,
								}}>
								<Typography variant="body2">Pending</Typography>
								<Typography
									variant="body2"
									fontWeight="bold">
									{taskStats.pending}
								</Typography>
							</Box>
							<Box sx={{ display: "flex", justifyContent: "space-between" }}>
								<Typography variant="body2">Overdue</Typography>
								<Typography
									variant="body2"
									fontWeight="bold"
									color="error.main">
									{taskStats.overdue}
								</Typography>
							</Box>
						</Card>
					</Grid>

					{/* Priority Distribution */}
					<Grid
						item
						xs={12}
						md={6}>
						<Card
							elevation={2}
							sx={{ p: 3 }}>
							<Typography
								variant="h6"
								gutterBottom>
								Priority Distribution
							</Typography>
							<Box sx={{ mb: 2 }}>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										mb: 1,
									}}>
									<Typography variant="body2">High Priority</Typography>
									<Typography
										variant="body2"
										fontWeight="bold"
										color="error.main">
										{taskStats.highPriority}
									</Typography>
								</Box>
								<LinearProgress
									variant="determinate"
									value={
										taskStats.total > 0
											? (taskStats.highPriority / taskStats.total) * 100
											: 0
									}
									color="error"
									sx={{ height: 6, borderRadius: 3 }}
								/>
							</Box>
							<Box sx={{ mb: 2 }}>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										mb: 1,
									}}>
									<Typography variant="body2">Medium Priority</Typography>
									<Typography
										variant="body2"
										fontWeight="bold"
										color="warning.main">
										{taskStats.mediumPriority}
									</Typography>
								</Box>
								<LinearProgress
									variant="determinate"
									value={
										taskStats.total > 0
											? (taskStats.mediumPriority / taskStats.total) * 100
											: 0
									}
									color="warning"
									sx={{ height: 6, borderRadius: 3 }}
								/>
							</Box>
							<Box>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										mb: 1,
									}}>
									<Typography variant="body2">Low Priority</Typography>
									<Typography
										variant="body2"
										fontWeight="bold"
										color="success.main">
										{taskStats.lowPriority}
									</Typography>
								</Box>
								<LinearProgress
									variant="determinate"
									value={
										taskStats.total > 0
											? (taskStats.lowPriority / taskStats.total) * 100
											: 0
									}
									color="success"
									sx={{ height: 6, borderRadius: 3 }}
								/>
							</Box>
						</Card>
					</Grid>

					{/* Weekly Progress */}
					<Grid
						item
						xs={12}>
						<Card
							elevation={2}
							sx={{ p: 3 }}>
							<Typography
								variant="h6"
								gutterBottom>
								Weekly Progress (Last 4 Weeks)
							</Typography>
							<Grid
								container
								spacing={2}>
								{weeklyData.map((week, index) => (
									<Grid
										item
										xs={12}
										sm={6}
										md={3}
										key={index}>
										<Paper
											elevation={1}
											sx={{ p: 2, textAlign: "center" }}>
											<Typography
												variant="subtitle1"
												fontWeight="bold"
												gutterBottom>
												{week.week}
											</Typography>
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-around",
												}}>
												<Box>
													<Typography
														variant="h6"
														color="success.main">
														{week.completed}
													</Typography>
													<Typography
														variant="caption"
														color="text.secondary">
														Completed
													</Typography>
												</Box>
												<Box>
													<Typography
														variant="h6"
														color="primary.main">
														{week.created}
													</Typography>
													<Typography
														variant="caption"
														color="text.secondary">
														Created
													</Typography>
												</Box>
											</Box>
										</Paper>
									</Grid>
								))}
							</Grid>
						</Card>
					</Grid>

					{/* Insights */}
					<Grid
						item
						xs={12}>
						<Card
							elevation={2}
							sx={{ p: 3, bgcolor: "primary.50" }}>
							<Typography
								variant="h6"
								gutterBottom>
								💡 Productivity Insights
							</Typography>
							<Grid
								container
								spacing={2}>
								<Grid
									item
									xs={12}
									md={6}>
									<Box
										sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
										<Typography
											variant="subtitle2"
											color="primary.main"
											gutterBottom>
											Overall Performance
										</Typography>
										<Typography variant="body2">
											{getProductivityInsights()}
										</Typography>
									</Box>
								</Grid>
								<Grid
									item
									xs={12}
									md={6}>
									<Box
										sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
										<Typography
											variant="subtitle2"
											color="primary.main"
											gutterBottom>
											Priority Management
										</Typography>
										<Typography variant="body2">
											{getPriorityInsights()}
										</Typography>
									</Box>
								</Grid>
							</Grid>
						</Card>
					</Grid>
				</Grid>
			)}
		</Container>
	);
}
