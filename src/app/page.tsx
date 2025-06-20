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
} from "@mui/icons-material";
import Link from "next/link";
import TaskList from "@/components/TaskList";
import { Task, Status } from "@prisma/client";

interface TaskStats {
	total: number;
	pending: number;
	inProgress: number;
	completed: number;
	overdue: number;
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
	});

	const fetchTaskStats = async () => {
		try {
			const response = await fetch("/api/tasks");
			const tasks: Task[] = await response.json();

			const stats = {
				total: tasks.length,
				pending: tasks.filter((t) => t.status === "PENDING").length,
				inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
				completed: tasks.filter((t) => t.status === "COMPLETED").length,
				overdue: tasks.filter((t) => {
					const dueDate = new Date(t.dueDate);
					const now = new Date();
					const daysUntilDue = Math.ceil(
						(dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
					);
					return daysUntilDue < 0 && t.status !== "COMPLETED";
				}).length,
			};

			setTaskStats(stats);
			setRecentTasks(tasks.slice(0, 5)); // Get 5 most recent tasks
		} catch (error) {
			console.error("Error fetching task stats:", error);
		}
	};

	useEffect(() => {
		if (session) {
			fetchTaskStats();
		}
	}, [session]);

	const completionRate =
		taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;

	const features = [
		{
			icon: <TrendingUpIcon sx={{ fontSize: 40, color: "primary.main" }} />,
			title: "Smart Organization",
			description:
				"Organize tasks by priority, status, and due dates with intelligent sorting.",
		},
		{
			icon: <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />,
			title: "Progress Tracking",
			description:
				"Track your progress with real-time statistics and completion rates.",
		},
		{
			icon: <ScheduleIcon sx={{ fontSize: 40, color: "warning.main" }} />,
			title: "Deadline Management",
			description:
				"Never miss a deadline with smart notifications and overdue tracking.",
		},
		{
			icon: <AssignmentIcon sx={{ fontSize: 40, color: "info.main" }} />,
			title: "Flexible Workflows",
			description:
				"Customize your workflow with tags, attachments, and recurring tasks.",
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
						gutterBottom>
						Welcome to MyDo
					</Typography>
					<Typography
						variant="h5"
						color="text.secondary"
						paragraph>
						Your personal task management companion
					</Typography>
					<Typography
						variant="body1"
						color="text.secondary"
						sx={{ mb: 4, maxWidth: 600, mx: "auto" }}>
						Organize your life, boost productivity, and achieve your goals with
						our intuitive task management platform.
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
							startIcon={<PersonIcon />}>
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

				{/* Features Section */}
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
											boxShadow: 4,
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
			maxWidth="lg"
			sx={{ py: 4 }}>
			{/* Welcome Section */}
			<Box sx={{ mb: 4 }}>
				<Typography
					variant={isMobile ? "h4" : "h3"}
					gutterBottom>
					Welcome back, {session.user?.name || "User"}! 👋
				</Typography>
				<Typography
					variant="body1"
					color="text.secondary">
					Let's make today productive. Here's what's happening with your tasks.
				</Typography>
			</Box>

			{/* Quick Stats */}
			<Grid
				container
				spacing={3}
				sx={{ mb: 4 }}>
				<Grid
					item
					xs={12}
					md={8}>
					<Paper
						elevation={2}
						sx={{ p: 3 }}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								mb: 2,
							}}>
							<Typography variant="h6">Task Overview</Typography>
							<Button
								component={Link}
								href="/tasks"
								variant="outlined"
								size="small"
								endIcon={<ArrowForwardIcon />}>
								View All
							</Button>
						</Box>
						<Grid
							container
							spacing={2}>
							<Grid
								item
								xs={6}
								sm={3}>
								<Box textAlign="center">
									<Typography
										variant="h4"
										color="primary.main">
										{taskStats.total}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary">
										Total Tasks
									</Typography>
								</Box>
							</Grid>
							<Grid
								item
								xs={6}
								sm={3}>
								<Box textAlign="center">
									<Typography
										variant="h4"
										color="warning.main">
										{taskStats.pending}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary">
										Pending
									</Typography>
								</Box>
							</Grid>
							<Grid
								item
								xs={6}
								sm={3}>
								<Box textAlign="center">
									<Typography
										variant="h4"
										color="success.main">
										{taskStats.completed}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary">
										Completed
									</Typography>
								</Box>
							</Grid>
							<Grid
								item
								xs={6}
								sm={3}>
								<Box textAlign="center">
									<Typography
										variant="h4"
										color="error.main">
										{taskStats.overdue}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary">
										Overdue
									</Typography>
								</Box>
							</Grid>
						</Grid>

						{/* Progress Bar */}
						<Box sx={{ mt: 3 }}>
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
						</Box>
					</Paper>
				</Grid>

				<Grid
					item
					xs={12}
					md={4}>
					<Paper
						elevation={2}
						sx={{ p: 3, height: "100%" }}>
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
								component={Link}
								href="/tasks">
								Add New Task
							</Button>
							<Button
								variant="outlined"
								startIcon={<CalendarIcon />}
								fullWidth
								component={Link}
								href="/tasks">
								View Calendar
							</Button>
							<Button
								variant="outlined"
								startIcon={<StarIcon />}
								fullWidth
								component={Link}
								href="/profile">
								View Profile
							</Button>
						</Box>
					</Paper>
				</Grid>
			</Grid>

			{/* Recent Tasks */}
			<Box sx={{ mb: 4 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 2,
					}}>
					<Typography variant="h6">Recent Tasks</Typography>
					<Button
						component={Link}
						href="/tasks"
						variant="text"
						endIcon={<ArrowForwardIcon />}>
						View All Tasks
					</Button>
				</Box>
				<TaskList
					showStats={false}
					maxTasks={5}
				/>
			</Box>

			{/* Quick Tips */}
			<Paper
				elevation={1}
				sx={{ p: 3, bgcolor: "primary.50" }}>
				<Typography
					variant="h6"
					gutterBottom>
					💡 Pro Tips
				</Typography>
				<Grid
					container
					spacing={2}>
					<Grid
						item
						xs={12}
						md={4}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<CheckCircleIcon color="success" />
							<Typography variant="body2">
								Use tags to organize related tasks
							</Typography>
						</Box>
					</Grid>
					<Grid
						item
						xs={12}
						md={4}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<ScheduleIcon color="warning" />
							<Typography variant="body2">
								Set realistic due dates for better planning
							</Typography>
						</Box>
					</Grid>
					<Grid
						item
						xs={12}
						md={4}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<TrendingUpIcon color="primary" />
							<Typography variant="body2">
								Review your progress regularly
							</Typography>
						</Box>
					</Grid>
				</Grid>
			</Paper>
		</Container>
	);
}
