"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
	Container,
	Typography,
	Box,
	Paper,
	Avatar,
	TextField,
	Button,
	Grid,
	IconButton,
	Alert,
	Divider,
	Chip,
	CircularProgress,
	Card,
	CardContent,
	LinearProgress,
} from "@mui/material";
import {
	Edit as EditIcon,
	Save as SaveIcon,
	Cancel as CancelIcon,
	PhotoCamera as PhotoCameraIcon,
	Email as EmailIcon,
	Person as PersonIcon,
	CalendarToday as CalendarIcon,
	Assignment as AssignmentIcon,
	CheckCircle as CheckCircleIcon,
	TrendingUp as TrendingUpIcon,
	Print as PrintIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Task } from "@prisma/client";
import PrintableTasks from "@/components/PrintableTasks";
import ReactDOMServer from "react-dom/server";

interface UserProfile {
	id: string;
	name: string;
	email: string;
	bio: string | null;
	avatar: string | null;
	createdAt: string;
	totalTasks: number;
	completedTasks: number;
	pendingTasks: number;
	inProgressTasks: number;
	overdueTasks: number;
}

export default function Profile() {
	const { data: session, update } = useSession();
	const router = useRouter();
	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [profile, setProfile] = useState<UserProfile>({
		id: "",
		name: "",
		email: "",
		bio: null,
		avatar: null,
		createdAt: "",
		totalTasks: 0,
		completedTasks: 0,
		pendingTasks: 0,
		inProgressTasks: 0,
		overdueTasks: 0,
	});
	const [tempProfile, setTempProfile] = useState<UserProfile>(profile);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const fetchUserProfile = async () => {
		try {
			const response = await fetch("/api/profile");
			if (response.ok) {
				const userData = await response.json();
				setProfile((prev) => ({
					...prev,
					...userData,
				}));
				setTempProfile((prev) => ({
					...prev,
					...userData,
				}));
			}
		} catch (error) {
			console.error("Error fetching user profile:", error);
		}
	};

	const fetchUserStats = async () => {
		try {
			const response = await fetch("/api/tasks");
			const fetchedTasks: Task[] = await response.json();
			setTasks(fetchedTasks);

			const stats = {
				total: fetchedTasks.length,
				completed: fetchedTasks.filter((t) => t.status === "COMPLETED").length,
				pending: fetchedTasks.filter((t) => t.status === "PENDING").length,
				inProgress: fetchedTasks.filter((t) => t.status === "IN_PROGRESS")
					.length,
				overdue: fetchedTasks.filter((t) => {
					const dueDate = new Date(t.dueDate);
					const now = new Date();
					const daysUntilDue = Math.ceil(
						(dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
					);
					return daysUntilDue < 0 && t.status !== "COMPLETED";
				}).length,
			};

			setProfile((prev) => ({
				...prev,
				totalTasks: stats.total,
				completedTasks: stats.completed,
				pendingTasks: stats.pending,
				inProgressTasks: stats.inProgress,
				overdueTasks: stats.overdue,
			}));
		} catch (error) {
			console.error("Error fetching user stats:", error);
		}
	};

	useEffect(() => {
		if (!session) {
			router.push("/login");
			return;
		}

		const loadProfileData = async () => {
			await fetchUserProfile();
			await fetchUserStats();
			setLoading(false);
		};

		loadProfileData();
	}, [session, router]);

	const handleEdit = () => {
		setTempProfile(profile);
		setIsEditing(true);
	};

	const handleCancel = () => {
		setTempProfile(profile);
		setIsEditing(false);
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const response = await fetch("/api/profile", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: tempProfile.name,
					bio: tempProfile.bio,
					avatar: tempProfile.avatar,
				}),
			});

			if (response.ok) {
				const updatedProfile = await response.json();
				setProfile((prev) => ({
					...prev,
					...updatedProfile,
				}));
				setIsEditing(false);
				setMessage({ type: "success", text: "Profile updated successfully!" });

				// Update session with new name
				await update({
					...session,
					user: {
						...session?.user,
						name: tempProfile.name,
					},
				});

				// Clear message after 3 seconds
				setTimeout(() => setMessage(null), 3000);
			} else {
				const error = await response.json();
				setMessage({
					type: "error",
					text: error.error || "Failed to update profile. Please try again.",
				});
			}
		} catch (error) {
			setMessage({
				type: "error",
				text: "Failed to update profile. Please try again.",
			});
		} finally {
			setSaving(false);
		}
	};

	const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				setMessage({
					type: "error",
					text: "Image size must be less than 5MB.",
				});
				return;
			}

			// Validate file type
			if (!file.type.startsWith("image/")) {
				setMessage({
					type: "error",
					text: "Please select a valid image file.",
				});
				return;
			}

			const reader = new FileReader();
			reader.onloadend = () => {
				setTempProfile({ ...tempProfile, avatar: reader.result as string });
			};
			reader.readAsDataURL(file);
		}
	};

	const handlePrint = () => {
		const printWindow = window.open("", "_blank");
		if (!printWindow) return;

		const printableComponent = (
			<PrintableTasks
				tasks={tasks}
				userProfile={{ name: profile.name, email: profile.email }}
				printDate={new Date()}
			/>
		);

		const printContent = ReactDOMServer.renderToString(printableComponent);

		printWindow.document.write(`
			<!DOCTYPE html>
			<html>
			<head>
				<title>MyDo - Task Report</title>
				<style>
					body {
						font-family: Arial, sans-serif;
					}
					@media print {
						body { margin: 20px; }
						@page {
							size: auto;
							margin: 20mm;
						}
					}
				</style>
			</head>
			<body>
				${printContent}
				<script>
					window.onload = function() {
						setTimeout(function() {
							window.print();
							window.close();
						}, 500); // Delay to ensure content loads
					};
				</script>
			</body>
			</html>
		`);
		printWindow.document.close();
	};

	const completionRate =
		profile.totalTasks > 0
			? (profile.completedTasks / profile.totalTasks) * 100
			: 0;

	if (!session) {
		return null;
	}

	if (loading) {
		return (
			<Container
				maxWidth="md"
				sx={{ py: 4 }}>
				<Box
					display="flex"
					justifyContent="center"
					alignItems="center"
					minHeight="400px">
					<CircularProgress />
				</Box>
			</Container>
		);
	}

	return (
		<Container
			maxWidth="md"
			sx={{ py: 4 }}>
			{message && (
				<Alert
					severity={message.type}
					sx={{ mb: 3 }}>
					{message.text}
				</Alert>
			)}

			<Paper
				elevation={3}
				sx={{ p: 4 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 3,
					}}>
					<Typography
						variant="h4"
						component="h1">
						Profile
					</Typography>
					<Box sx={{ display: "flex", gap: 1 }}>
						<Button
							variant="outlined"
							startIcon={<PrintIcon />}
							onClick={handlePrint}>
							Print Profile
						</Button>
						{!isEditing ? (
							<Button
								variant="outlined"
								startIcon={<EditIcon />}
								onClick={handleEdit}>
								Edit Profile
							</Button>
						) : (
							<Box>
								<Button
									variant="outlined"
									startIcon={<CancelIcon />}
									onClick={handleCancel}
									sx={{ mr: 1 }}
									disabled={saving}>
									Cancel
								</Button>
								<Button
									variant="contained"
									startIcon={
										saving ? <CircularProgress size={16} /> : <SaveIcon />
									}
									onClick={handleSave}
									disabled={saving}>
									{saving ? "Saving..." : "Save"}
								</Button>
							</Box>
						)}
					</Box>
				</Box>

				<Grid
					container
					spacing={4}>
					<Grid
						item
						xs={12}
						md={4}>
						<Box sx={{ textAlign: "center" }}>
							<Box sx={{ position: "relative", display: "inline-block" }}>
								<Avatar
									src={tempProfile.avatar || undefined}
									sx={{ width: 120, height: 120, mb: 2 }}>
									{tempProfile.name?.[0]?.toUpperCase()}
								</Avatar>
								{isEditing && (
									<label htmlFor="avatar-upload">
										<input
											accept="image/*"
											id="avatar-upload"
											type="file"
											style={{ display: "none" }}
											onChange={handleAvatarChange}
										/>
										<IconButton
											color="primary"
											aria-label="upload picture"
											component="span"
											sx={{
												position: "absolute",
												bottom: 0,
												right: 0,
												backgroundColor: "background.paper",
											}}>
											<PhotoCameraIcon />
										</IconButton>
									</label>
								)}
							</Box>
							<Typography
								variant="h6"
								gutterBottom>
								{tempProfile.name}
							</Typography>
							<Chip
								icon={<EmailIcon />}
								label={tempProfile.email}
								variant="outlined"
								size="small"
							/>
						</Box>
					</Grid>

					<Grid
						item
						xs={12}
						md={8}>
						<Grid
							container
							spacing={3}>
							<Grid
								item
								xs={12}>
								<TextField
									fullWidth
									label="Display Name"
									value={tempProfile.name}
									onChange={(e) =>
										setTempProfile({ ...tempProfile, name: e.target.value })
									}
									disabled={!isEditing}
									InputProps={{
										startAdornment: (
											<PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
										),
									}}
								/>
							</Grid>

							<Grid
								item
								xs={12}>
								<TextField
									fullWidth
									label="Email"
									value={tempProfile.email}
									disabled
									InputProps={{
										startAdornment: (
											<EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
										),
									}}
								/>
							</Grid>

							<Grid
								item
								xs={12}>
								<TextField
									fullWidth
									label="Bio"
									value={tempProfile.bio || ""}
									onChange={(e) =>
										setTempProfile({ ...tempProfile, bio: e.target.value })
									}
									disabled={!isEditing}
									multiline
									rows={3}
									placeholder="Tell us about yourself..."
								/>
							</Grid>

							<Grid
								item
								xs={12}>
								<TextField
									fullWidth
									label="Member Since"
									value={new Date(profile.createdAt).toLocaleDateString()}
									disabled
									InputProps={{
										startAdornment: (
											<CalendarIcon sx={{ mr: 1, color: "text.secondary" }} />
										),
									}}
								/>
							</Grid>
						</Grid>

						<Divider sx={{ my: 3 }} />

						<Typography
							variant="h6"
							gutterBottom>
							Task Statistics
						</Typography>

						{/* Progress Overview */}
						<Card
							elevation={1}
							sx={{ mb: 3, p: 2 }}>
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

						<Grid
							container
							spacing={2}>
							<Grid
								item
								xs={6}
								sm={3}>
								<Paper
									elevation={2}
									sx={{
										p: 2,
										textAlign: "center",
										background:
											"linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
										color: "white",
									}}>
									<AssignmentIcon sx={{ fontSize: 24, mb: 1 }} />
									<Typography variant="h5">{profile.totalTasks}</Typography>
									<Typography variant="caption">Total</Typography>
								</Paper>
							</Grid>
							<Grid
								item
								xs={6}
								sm={3}>
								<Paper
									elevation={2}
									sx={{
										p: 2,
										textAlign: "center",
										background:
											"linear-gradient(45deg, #FF9800 30%, #FFC107 90%)",
										color: "white",
									}}>
									<TrendingUpIcon sx={{ fontSize: 24, mb: 1 }} />
									<Typography variant="h5">{profile.pendingTasks}</Typography>
									<Typography variant="caption">Pending</Typography>
								</Paper>
							</Grid>
							<Grid
								item
								xs={6}
								sm={3}>
								<Paper
									elevation={2}
									sx={{
										p: 2,
										textAlign: "center",
										background:
											"linear-gradient(45deg, #9C27B0 30%, #E1BEE7 90%)",
										color: "white",
									}}>
									<TrendingUpIcon sx={{ fontSize: 24, mb: 1 }} />
									<Typography variant="h5">
										{profile.inProgressTasks}
									</Typography>
									<Typography variant="caption">In Progress</Typography>
								</Paper>
							</Grid>
							<Grid
								item
								xs={6}
								sm={3}>
								<Paper
									elevation={2}
									sx={{
										p: 2,
										textAlign: "center",
										background:
											"linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)",
										color: "white",
									}}>
									<CheckCircleIcon sx={{ fontSize: 24, mb: 1 }} />
									<Typography variant="h5">{profile.completedTasks}</Typography>
									<Typography variant="caption">Completed</Typography>
								</Paper>
							</Grid>
						</Grid>

						{profile.overdueTasks > 0 && (
							<Box sx={{ mt: 2 }}>
								<Paper
									elevation={2}
									sx={{
										p: 2,
										textAlign: "center",
										background:
											"linear-gradient(45deg, #F44336 30%, #FF5722 90%)",
										color: "white",
									}}>
									<Typography
										variant="h6"
										gutterBottom>
										⚠️ {profile.overdueTasks} Overdue Tasks
									</Typography>
									<Typography variant="body2">
										You have {profile.overdueTasks} task
										{profile.overdueTasks > 1 ? "s" : ""} that need attention.
									</Typography>
								</Paper>
							</Box>
						)}
					</Grid>
				</Grid>
			</Paper>
		</Container>
	);
}
