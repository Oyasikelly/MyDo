"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
	Container,
	Typography,
	Box,
	Button,
	Fab,
	CircularProgress,
	Grid,
	Card,
	CardContent,
	Paper,
	useMediaQuery,
	useTheme as useMuiTheme,
	Chip,
	Avatar,
	LinearProgress,
	IconButton,
	Divider,
	Badge,
	Tooltip,
} from "@mui/material";
import {
	Add as AddIcon,
	TrendingUp as TrendingUpIcon,
	CheckCircle as CheckCircleIcon,
	Schedule as ScheduleIcon,
	Assignment as AssignmentIcon,
	Flag as FlagIcon,
	ArrowForward as ArrowForwardIcon,
	Person as PersonIcon,
	CalendarToday as CalendarIcon,
	Star as StarIcon,
	AccessTime as AccessTimeIcon,
	Today as TodayIcon,
	Upcoming as UpcomingIcon,
	Done as DoneIcon,
	PriorityHigh as PriorityHighIcon,
	Notifications as NotificationsIcon,
	Dashboard as DashboardIcon,
	Analytics as AnalyticsIcon,
	Settings as SettingsIcon,
	Help as HelpIcon,
	EmojiEvents as TrophyIcon,
	LocalFireDepartment as FireIcon,
	Psychology as BrainIcon,
	Speed as SpeedIcon,
	Lightbulb as LightbulbIcon,
	FilterList as FilterIcon,
	Search as SearchIcon,
	Print as PrintIcon,
	Share as ShareIcon,
	Archive as ArchiveIcon,
	RestoreFromTrash as RestoreIcon,
	Assessment as AssessmentIcon,
	Timeline as TimelineIcon,
	Insights as InsightsIcon,
} from "@mui/icons-material";
import Link from "next/link";
import TaskList from "@/components/TaskList";
import { Task, Status, Priority } from "@prisma/client";
import TaskForm from "@/components/TaskForm";

interface TaskStats {
	total: number;
	pending: number;
	inProgress: number;
	completed: number;
	overdue: number;
	today: number;
	upcoming: number;
	highPriority: number;
}

export default function Home() {
	const { data: session } = useSession();
	const theme = useMuiTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	const [recentTasks, setRecentTasks] = useState<Task[]>([]);
	const [taskStats, setTaskStats] = useState<TaskStats>({
		total: 0,
		pending: 0,
		inProgress: 0,
		completed: 0,
		overdue: 0,
		today: 0,
		upcoming: 0,
		highPriority: 0,
	});
	const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

	const completionRate =
		taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;

	const fetchTaskStats = async () => {
		try {
			const response = await fetch("/api/tasks");
			const tasks: Task[] = await response.json();

			const today = new Date();
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);

			const stats = {
				total: tasks.length,
				pending: tasks.filter((t) => t.status === "PENDING").length,
				inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
				completed: tasks.filter((t) => t.status === "COMPLETED").length,
				overdue: tasks.filter((t) => {
					const dueDate = new Date(t.dueDate);
					return dueDate < today && t.status !== "COMPLETED";
				}).length,
				today: tasks.filter((t) => {
					const dueDate = new Date(t.dueDate);
					return dueDate.toDateString() === today.toDateString();
				}).length,
				upcoming: tasks.filter((t) => {
					const dueDate = new Date(t.dueDate);
					return dueDate >= tomorrow && t.status !== "COMPLETED";
				}).length,
				highPriority: tasks.filter((t) => t.priority === "HIGH").length,
			};

			setTaskStats(stats);
			setRecentTasks(tasks.slice(0, 5));
		} catch (error) {
			console.error("Error fetching task stats:", error);
		}
	};

	useEffect(() => {
		if (session) {
			fetchTaskStats();
		}
	}, [session]);

	const getMotivationalMessage = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning! Ready to conquer the day?";
		if (hour < 17) return "Good afternoon! Keep up the great work!";
		return "Good evening! Time to wrap up and plan for tomorrow!";
	};

	const getProductivityScore = () => {
		if (taskStats.total === 0) return 0;
		const score = (taskStats.completed / taskStats.total) * 100;
		return Math.min(score + taskStats.inProgress * 10, 100);
	};

	const features = [
		{
			icon: <BrainIcon sx={{ fontSize: 40, color: "primary.main" }} />,
			title: "Smart Organization",
			description:
				"AI-powered task organization with intelligent prioritization.",
			color: "primary.main",
		},
		{
			icon: <TrophyIcon sx={{ fontSize: 40, color: "success.main" }} />,
			title: "Achievement Tracking",
			description:
				"Track your progress and celebrate milestones with gamification.",
			color: "success.main",
		},
		{
			icon: <FireIcon sx={{ fontSize: 40, color: "warning.main" }} />,
			title: "Productivity Boost",
			description: "Stay focused with time tracking and productivity insights.",
			color: "warning.main",
		},
		{
			icon: <AnalyticsIcon sx={{ fontSize: 40, color: "info.main" }} />,
			title: "Advanced Analytics",
			description: "Get detailed insights into your productivity patterns.",
			color: "info.main",
		},
	];

	if (!session) {
		return (
			<Container
				maxWidth="lg"
				sx={{ py: 4 }}>
				<Box
					textAlign="center"
					py={8}>
					<Typography
						variant={isMobile ? "h3" : "h2"}
						gutterBottom
						sx={{
							background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
							backgroundClip: "text",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							fontWeight: "bold",
						}}>
						Welcome to MyDo
					</Typography>
					<Typography
						variant="h5"
						color="text.secondary"
						paragraph>
						Your AI-powered task management companion
					</Typography>
					<Typography
						variant="body1"
						color="text.secondary"
						sx={{ mb: 4, maxWidth: 600, mx: "auto" }}>
						Transform your productivity with intelligent task organization, time
						tracking, and personalized insights. Achieve more, stress less.
					</Typography>
					<Box
						sx={{
							display: "flex",
							gap: 2,
							justifyContent: "center",
							flexWrap: "wrap",
						}}>
						<Button
							component={Link}
							href="/login"
							variant="contained"
							size="large"
							startIcon={<PersonIcon />}
							sx={{
								background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
								boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
							}}>
							Get Started
						</Button>
						<Button
							component={Link}
							href="/register"
							variant="outlined"
							size="large">
							Create Account
						</Button>
					</Box>
				</Box>

				<Box sx={{ py: 8 }}>
					<Typography
						variant="h4"
						textAlign="center"
						gutterBottom>
						Why Choose MyDo?
					</Typography>
					<Grid
						container
						spacing={4}
						sx={{ mt: 2 }}>
						{features.map((feature, index) => (
							<Grid
								item
								xs={12}
								sm={6}
								md={3}
								key={index}>
								<Card
									elevation={2}
									sx={{
										height: "100%",
										p: 3,
										textAlign: "center",
										transition: "all 0.3s ease",
										"&:hover": {
											transform: "translateY(-8px)",
											boxShadow: 8,
											borderLeft: `4px solid ${feature.color}`,
										},
									}}>
									<Box sx={{ mb: 2 }}>{feature.icon}</Box>
									<Typography
										variant="h6"
										gutterBottom>
										{feature.title}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary">
										{feature.description}
									</Typography>
								</Card>
							</Grid>
						))}
					</Grid>
				</Box>
			</Container>
		);
	}

	return (
		<Container
			maxWidth="xl"
			sx={{ py: 4 }}>
			{/* Hero Section */}
			<Box sx={{ mb: 6 }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
					<Avatar
						sx={{
							width: 60,
							height: 60,
							bgcolor: "primary.main",
							fontSize: "1.5rem",
						}}>
						{session.user?.name?.charAt(0) || "U"}
					</Avatar>
					<Box>
						<Typography
							variant={isMobile ? "h4" : "h3"}
							gutterBottom>
							{getMotivationalMessage()}
						</Typography>
						<Typography
							variant="h6"
							color="text.secondary">
							{session.user?.name || "User"}
						</Typography>
					</Box>
				</Box>
			</Box>

			{/* Main Dashboard Grid */}
			<Grid
				container
				spacing={3}>
				{/* Left Column - Stats & Quick Actions */}
				<Grid
					item
					xs={12}
					lg={8}>
					<Grid
						container
						spacing={3}>
						{/* Productivity Score Card */}
						<Grid
							item
							xs={12}>
							<Card
								elevation={3}
								sx={{
									p: 3,
									background:
										"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
									color: "white",
									position: "relative",
									overflow: "hidden",
								}}>
								<Box sx={{ position: "relative", zIndex: 2 }}>
									<Typography
										variant="h6"
										gutterBottom>
										Productivity Score
									</Typography>
									<Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
										<Box sx={{ position: "relative" }}>
											<CircularProgress
												variant="determinate"
												value={getProductivityScore()}
												size={80}
												thickness={4}
												sx={{ color: "white" }}
											/>
											<Box
												sx={{
													position: "absolute",
													top: "50%",
													left: "50%",
													transform: "translate(-50%, -50%)",
												}}>
												<Typography
													variant="h6"
													fontWeight="bold">
													{getProductivityScore().toFixed(0)}%
												</Typography>
											</Box>
										</Box>
										<Box>
											<Typography
												variant="body1"
												sx={{ mb: 1 }}>
												You're doing great! Keep up the momentum.
											</Typography>
											<Chip
												label={`${taskStats.completed} tasks completed`}
												sx={{
													bgcolor: "rgba(255,255,255,0.2)",
													color: "white",
												}}
											/>
										</Box>
									</Box>
								</Box>
							</Card>
						</Grid>

						{/* Task Overview Cards */}
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
									<TodayIcon color="primary" />
								</Box>
								<Typography
									variant="h4"
									color="primary.main"
									fontWeight="bold">
									{taskStats.today}
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary">
									Today's Tasks
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
									<UpcomingIcon color="warning" />
								</Box>
								<Typography
									variant="h4"
									color="warning.main"
									fontWeight="bold">
									{taskStats.upcoming}
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary">
									Upcoming
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
									<PriorityHighIcon color="error" />
								</Box>
								<Typography
									variant="h4"
									color="error.main"
									fontWeight="bold">
									{taskStats.highPriority}
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary">
									High Priority
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
									<DoneIcon color="success" />
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
									Completed
								</Typography>
							</Card>
						</Grid>

						{/* Recent Tasks */}
						<Grid
							item
							xs={12}>
							<Card
								elevation={2}
								sx={{ p: 3 }}>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										mb: 3,
									}}>
									<Typography variant="h6">Recent Tasks</Typography>
									<Button
										component={Link}
										href="/tasks"
										variant="outlined"
										size="small"
										endIcon={<ArrowForwardIcon />}>
										View All
									</Button>
								</Box>
								<TaskList
									showStats={false}
									maxTasks={5}
								/>
							</Card>
						</Grid>
					</Grid>
				</Grid>

				{/* Right Column - Quick Actions & Insights */}
				<Grid
					item
					xs={12}
					lg={4}>
					<Grid
						container
						spacing={3}>
						{/* Quick Actions */}
						<Grid
							item
							xs={12}>
							<Card
								elevation={2}
								sx={{ p: 3 }}>
								<Typography
									variant="h6"
									gutterBottom>
									Quick Actions
								</Typography>
								<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
									<Button
										variant="contained"
										startIcon={<AddIcon />}
										fullWidth
										onClick={() => setIsTaskFormOpen(true)}
										sx={{
											background:
												"linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
											boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
										}}>
										Add New Task
									</Button>
									<Button
										variant="outlined"
										startIcon={<CalendarIcon />}
										fullWidth
										component={Link}
										href="/calendar">
										View Calendar
									</Button>
									<Button
										variant="outlined"
										startIcon={<AnalyticsIcon />}
										fullWidth
										component={Link}
										href="/analytics">
										View Analytics
									</Button>
								</Box>
							</Card>
						</Grid>

						{/* Progress Overview */}
						<Grid
							item
							xs={12}>
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
									<Typography variant="body2">In Progress</Typography>
									<Typography
										variant="body2"
										fontWeight="bold">
										{taskStats.inProgress}
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

						{/* Quick Tips */}
						<Grid
							item
							xs={12}>
							<Card
								elevation={2}
								sx={{ p: 3, bgcolor: "primary.50" }}>
								<Typography
									variant="h6"
									gutterBottom>
									💡 Pro Tips
								</Typography>
								<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
									<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
										<CheckCircleIcon
											color="success"
											fontSize="small"
										/>
										<Typography variant="body2">
											Use time tracking for better planning
										</Typography>
									</Box>
									<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
										<ScheduleIcon
											color="warning"
											fontSize="small"
										/>
										<Typography variant="body2">
											Set realistic time estimates
										</Typography>
									</Box>
									<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
										<TrendingUpIcon
											color="primary"
											fontSize="small"
										/>
										<Typography variant="body2">
											Review your productivity patterns
										</Typography>
									</Box>
								</Box>
							</Card>
						</Grid>
					</Grid>
				</Grid>
			</Grid>

			{/* Floating Action Button */}
			<Fab
				color="primary"
				aria-label="add task"
				sx={{
					position: "fixed",
					bottom: 16,
					right: 16,
					background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
					boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
				}}
				onClick={() => setIsTaskFormOpen(true)}>
				<AddIcon />
			</Fab>

			{/* Task Form */}
			<TaskForm
				open={isTaskFormOpen}
				onClose={() => setIsTaskFormOpen(false)}
				onTaskAdded={() => {
					fetchTaskStats();
					setIsTaskFormOpen(false);
				}}
			/>
		</Container>
	);
}
