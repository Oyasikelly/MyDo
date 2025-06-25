"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Box,
	Typography,
	Chip,
	IconButton,
	Alert,
	CircularProgress,
	InputAdornment,
	Grid,
	Paper,
} from "@mui/material";
import {
	Close as CloseIcon,
	Add as AddIcon,
	Delete as DeleteIcon,
	CloudUpload as CloudUploadIcon,
	Image as ImageIcon,
} from "@mui/icons-material";
import { Task, Priority, Status, Frequency } from "@prisma/client";

interface TaskFormProps {
	open: boolean;
	onClose: () => void;
	onTaskAdded: () => void;
	task?: Task | null;
}

interface FormData {
	title: string;
	description: string;
	priority: Priority;
	status: Status;
	dueDate: string;
	dueTime: string;
	frequency: Frequency | null;
	tags: string[];
	attachments: File[];
}

export default function TaskForm({
	open,
	onClose,
	onTaskAdded,
	task,
}: TaskFormProps) {
	const { data: session } = useSession();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [tagInput, setTagInput] = useState("");
	const [formData, setFormData] = useState<FormData>({
		title: "",
		description: "",
		priority: "MEDIUM",
		status: "PENDING",
		dueDate: "",
		dueTime: "",
		frequency: null,
		tags: [],
		attachments: [],
	});

	useEffect(() => {
		if (task) {
			setFormData({
				title: task.title,
				description: task.description || "",
				priority: task.priority,
				status: task.status,
				dueDate: task.dueDate
					? new Date(task.dueDate).toISOString().split("T")[0]
					: "",
				dueTime: task.dueTime || "",
				frequency: task.frequency || null,
				tags: task.tags || [],
				attachments: [],
			});
		} else {
			setFormData({
				title: "",
				description: "",
				priority: "MEDIUM",
				status: "PENDING",
				dueDate: "",
				dueTime: "",
				frequency: null,
				tags: [],
				attachments: [],
			});
		}
		setError("");
		setSuccess("");
	}, [task, open]);

	const handleInputChange = (field: keyof FormData, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleTagAdd = () => {
		if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
			handleInputChange("tags", [...formData.tags, tagInput.trim()]);
			setTagInput("");
		}
	};

	const handleTagRemove = (tagToRemove: string) => {
		handleInputChange(
			"tags",
			formData.tags.filter((tag) => tag !== tagToRemove)
		);
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || []);
		handleInputChange("attachments", [...formData.attachments, ...files]);
	};

	const handleFileRemove = (index: number) => {
		handleInputChange(
			"attachments",
			formData.attachments.filter((_, i) => i !== index)
		);
	};

	const validateForm = () => {
		if (!formData.title.trim()) {
			setError("Title is required");
			return false;
		}
		if (!formData.dueDate) {
			setError("Due date is required");
			return false;
		}
		if (new Date(formData.dueDate) < new Date()) {
			setError("Due date cannot be in the past");
			return false;
		}
		return true;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const formDataToSend = new FormData();
			formDataToSend.append("title", formData.title);
			formDataToSend.append("description", formData.description);
			formDataToSend.append("priority", formData.priority);
			formDataToSend.append("status", formData.status);
			formDataToSend.append("dueDate", formData.dueDate);
			formDataToSend.append("dueTime", formData.dueTime);
			formDataToSend.append("frequency", formData.frequency || "");
			formDataToSend.append("tags", JSON.stringify(formData.tags));

			// Append files
			formData.attachments.forEach((file, index) => {
				formDataToSend.append(`attachment-${index}`, file);
			});

			const url = task ? `/api/tasks/${task.id}` : "/api/tasks";
			const method = task ? "PATCH" : "POST";

			const response = await fetch(url, {
				method,
				body: formDataToSend,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to save task");
			}

			setSuccess(
				task ? "Task updated successfully!" : "Task created successfully!"
			);
			setTimeout(() => {
				onTaskAdded();
				onClose();
			}, 1500);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	const handleKeyPress = (event: React.KeyboardEvent) => {
		if (event.key === "Enter" && event.target === event.currentTarget) {
			handleTagAdd();
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 2,
					background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
				},
			}}>
			<DialogTitle sx={{ pb: 1 }}>
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center">
					<Typography
						variant="h5"
						component="div">
						{task ? "Edit Task" : "Create New Task"}
					</Typography>
					<IconButton
						onClick={onClose}
						size="small">
						<CloseIcon />
					</IconButton>
				</Box>
			</DialogTitle>

			<DialogContent sx={{ pt: 2 }}>
				{error && (
					<Alert
						severity="error"
						sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}
				{success && (
					<Alert
						severity="success"
						sx={{ mb: 2 }}>
						{success}
					</Alert>
				)}

				<Grid
					container
					spacing={3}>
					<Grid
						item
						xs={12}>
						<TextField
							fullWidth
							label="Task Title"
							value={formData.title}
							onChange={(e) => handleInputChange("title", e.target.value)}
							required
							variant="outlined"
							sx={{ mb: 2 }}
						/>
					</Grid>

					<Grid
						item
						xs={12}>
						<TextField
							fullWidth
							label="Description"
							value={formData.description}
							onChange={(e) => handleInputChange("description", e.target.value)}
							multiline
							rows={3}
							variant="outlined"
							sx={{ mb: 2 }}
						/>
					</Grid>

					<Grid
						item
						xs={12}
						md={6}>
						<FormControl
							fullWidth
							sx={{ mb: 2 }}>
							<InputLabel>Priority</InputLabel>
							<Select
								value={formData.priority}
								label="Priority"
								onChange={(e) => handleInputChange("priority", e.target.value)}>
								<MenuItem value="LOW">
									<Box
										display="flex"
										alignItems="center"
										gap={1}>
										<Chip
											label="Low"
											size="small"
											color="success"
										/>
										Low Priority
									</Box>
								</MenuItem>
								<MenuItem value="MEDIUM">
									<Box
										display="flex"
										alignItems="center"
										gap={1}>
										<Chip
											label="Medium"
											size="small"
											color="warning"
										/>
										Medium Priority
									</Box>
								</MenuItem>
								<MenuItem value="HIGH">
									<Box
										display="flex"
										alignItems="center"
										gap={1}>
										<Chip
											label="High"
											size="small"
											color="error"
										/>
										High Priority
									</Box>
								</MenuItem>
							</Select>
						</FormControl>
					</Grid>

					<Grid
						item
						xs={12}
						md={6}>
						<FormControl
							fullWidth
							sx={{ mb: 2 }}>
							<InputLabel>Status</InputLabel>
							<Select
								value={formData.status}
								label="Status"
								onChange={(e) => handleInputChange("status", e.target.value)}>
								<MenuItem value="PENDING">Pending</MenuItem>
								<MenuItem value="IN_PROGRESS">In Progress</MenuItem>
								<MenuItem value="COMPLETED">Completed</MenuItem>
							</Select>
						</FormControl>
					</Grid>

					<Grid
						item
						xs={12}
						md={6}>
						<TextField
							fullWidth
							label="Due Date"
							type="date"
							value={formData.dueDate}
							onChange={(e) => handleInputChange("dueDate", e.target.value)}
							required
							variant="outlined"
							InputLabelProps={{ shrink: true }}
							sx={{ mb: 2 }}
						/>
					</Grid>

					<Grid
						item
						xs={12}
						md={6}>
						<TextField
							fullWidth
							label="Due Time"
							type="time"
							value={formData.dueTime}
							onChange={(e) => handleInputChange("dueTime", e.target.value)}
							variant="outlined"
							InputLabelProps={{ shrink: true }}
							sx={{ mb: 2 }}
						/>
					</Grid>

					<Grid
						item
						xs={12}
						md={6}>
						<FormControl fullWidth>
							<InputLabel>Frequency</InputLabel>
							<Select
								value={formData.frequency || ""}
								label="Frequency"
								onChange={(e) =>
									handleInputChange(
										"frequency",
										e.target.value as Frequency | null
									)
								}>
								<MenuItem value="">No Recurrence</MenuItem>
								<MenuItem value="DAILY">Daily</MenuItem>
								<MenuItem value="WEEKLY">Weekly</MenuItem>
								<MenuItem value="MONTHLY">Monthly</MenuItem>
								<MenuItem value="CUSTOM">Custom</MenuItem>
							</Select>
						</FormControl>
					</Grid>

					<Grid
						item
						xs={12}>
						<Typography
							variant="subtitle1"
							gutterBottom>
							Tags
						</Typography>
						<Box
							display="flex"
							gap={1}
							flexWrap="wrap"
							mb={2}>
							{formData.tags.map((tag, index) => (
								<Chip
									key={index}
									label={tag}
									onDelete={() => handleTagRemove(tag)}
									color="primary"
									variant="outlined"
								/>
							))}
						</Box>
						<Box
							display="flex"
							gap={1}>
							<TextField
								size="small"
								placeholder="Add a tag..."
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								onKeyPress={handleKeyPress}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton
												onClick={handleTagAdd}
												size="small">
												<AddIcon />
											</IconButton>
										</InputAdornment>
									),
								}}
							/>
						</Box>
					</Grid>

					<Grid
						item
						xs={12}>
						<Typography
							variant="subtitle1"
							gutterBottom>
							Attachments
						</Typography>
						<Box
							display="flex"
							gap={1}
							flexWrap="wrap"
							mb={2}>
							{formData.attachments.map((file, index) => (
								<Paper
									key={index}
									elevation={1}
									sx={{
										p: 1,
										display: "flex",
										alignItems: "center",
										gap: 1,
										minWidth: 200,
									}}>
									<ImageIcon color="primary" />
									<Typography
										variant="body2"
										sx={{ flex: 1, wordBreak: "break-all" }}>
										{file.name}
									</Typography>
									<IconButton
										size="small"
										onClick={() => handleFileRemove(index)}
										color="error">
										<DeleteIcon />
									</IconButton>
								</Paper>
							))}
						</Box>
						<Button
							variant="outlined"
							component="label"
							startIcon={<CloudUploadIcon />}>
							Upload Files
							<input
								type="file"
								multiple
								hidden
								onChange={handleFileUpload}
								accept="image/*,.pdf,.doc,.docx,.txt"
							/>
						</Button>
					</Grid>
				</Grid>
			</DialogContent>

			<DialogActions sx={{ p: 3, pt: 1 }}>
				<Button
					onClick={onClose}
					disabled={loading}>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					disabled={loading}
					startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}>
					{loading ? "Saving..." : task ? "Update Task" : "Create Task"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
