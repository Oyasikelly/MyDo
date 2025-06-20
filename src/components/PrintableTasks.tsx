import React from "react";
import { Task, Priority, Status, Frequency } from "@prisma/client";
import { format } from "date-fns";

interface PrintableTasksProps {
	tasks: Task[];
	userProfile: {
		name: string;
		email: string;
	};
	printDate: Date;
}

const PrintableTasks: React.FC<PrintableTasksProps> = ({
	tasks,
	userProfile,
	printDate,
}) => {
	const getPriorityColor = (priority: Priority) => {
		switch (priority) {
			case "HIGH":
				return "#f44336";
			case "MEDIUM":
				return "#ff9800";
			case "LOW":
				return "#4caf50";
			default:
				return "#757575";
		}
	};

	const getStatusText = (status: Status) => {
		switch (status) {
			case "PENDING":
				return "Pending";
			case "IN_PROGRESS":
				return "In Progress";
			case "COMPLETED":
				return "Completed";
			default:
				return status;
		}
	};

	const getStatusColor = (status: Status) => {
		switch (status) {
			case "COMPLETED":
				return "#4caf50";
			case "IN_PROGRESS":
				return "#2196f3";
			case "PENDING":
				return "#ff9800";
			default:
				return "#757575";
		}
	};

	const getFrequencyText = (frequency: Frequency | null) => {
		switch (frequency) {
			case "DAILY":
				return "Daily";
			case "WEEKLY":
				return "Weekly";
			case "MONTHLY":
				return "Monthly";
			case "CUSTOM":
				return "Custom";
			default:
				return "Once";
		}
	};

	const getDaysUntilDue = (dueDate: Date) => {
		const due = new Date(dueDate);
		const now = new Date();
		const diffTime = due.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const pendingTasks = tasks.filter((task) => task.status === "PENDING");
	const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS");
	const completedTasks = tasks.filter((task) => task.status === "COMPLETED");
	const overdueTasks = tasks.filter((task) => {
		const daysUntilDue = getDaysUntilDue(task.dueDate);
		return daysUntilDue < 0 && task.status !== "COMPLETED";
	});

	const renderTaskCard = (task: Task, isCompleted: boolean = false) => {
		const daysUntilDue = getDaysUntilDue(task.dueDate);
		const isOverdue = daysUntilDue < 0 && task.status !== "COMPLETED";

		return (
			<div
				key={task.id}
				style={{
					border: isOverdue ? "2px solid #f44336" : "1px solid #ddd",
					borderRadius: "8px",
					padding: "20px",
					marginBottom: "20px",
					backgroundColor: isCompleted
						? "#f8f8f8"
						: isOverdue
						? "#ffebee"
						: "#fafafa",
					boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
				}}>
				{/* Task Header with Title and Status */}
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						marginBottom: "15px",
						borderBottom: "1px solid #e0e0e0",
						paddingBottom: "10px",
					}}>
					<h3
						style={{
							margin: "0",
							fontSize: "18px",
							fontWeight: "bold",
							color: isCompleted ? "#666" : isOverdue ? "#d32f2f" : "#333",
							flex: "1",
							textDecoration: isCompleted ? "line-through" : "none",
						}}>
						{task.title}
					</h3>
					<div style={{ display: "flex", gap: "8px" }}>
						<span
							style={{
								backgroundColor: getPriorityColor(task.priority),
								color: "white",
								padding: "6px 12px",
								borderRadius: "6px",
								fontSize: "12px",
								fontWeight: "bold",
								textTransform: "uppercase",
							}}>
							{task.priority}
						</span>
						<span
							style={{
								backgroundColor: getStatusColor(task.status),
								color: "white",
								padding: "6px 12px",
								borderRadius: "6px",
								fontSize: "12px",
								fontWeight: "bold",
								textTransform: "uppercase",
							}}>
							{getStatusText(task.status)}
						</span>
					</div>
				</div>

				{/* Task Description */}
				{task.description && (
					<div style={{ marginBottom: "15px" }}>
						<h4
							style={{
								margin: "0 0 8px 0",
								fontSize: "14px",
								color: "#666",
								fontWeight: "bold",
							}}>
							Description:
						</h4>
						<p
							style={{
								margin: "0",
								fontSize: "14px",
								color: "#666",
								lineHeight: "1.5",
								textDecoration: isCompleted ? "line-through" : "none",
								padding: "10px",
								backgroundColor: "white",
								borderRadius: "4px",
								border: "1px solid #e0e0e0",
							}}>
							{task.description}
						</p>
					</div>
				)}

				{/* Task Dates */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "15px",
						marginBottom: "15px",
						padding: "10px",
						backgroundColor: "white",
						borderRadius: "4px",
						border: "1px solid #e0e0e0",
					}}>
					<div>
						<strong style={{ color: "#333", fontSize: "13px" }}>
							Due Date:
						</strong>
						<br />
						<span
							style={{
								color: isOverdue ? "#d32f2f" : "#666",
								fontSize: "13px",
								fontWeight: isOverdue ? "bold" : "normal",
							}}>
							{format(new Date(task.dueDate), "PPP")}
							{isOverdue && (
								<span
									style={{
										color: "#f44336",
										fontWeight: "bold",
										marginLeft: "5px",
									}}>
									({Math.abs(daysUntilDue)} day
									{Math.abs(daysUntilDue) > 1 ? "s" : ""} overdue)
								</span>
							)}
						</span>
					</div>
					<div>
						<strong style={{ color: "#333", fontSize: "13px" }}>
							Created:
						</strong>
						<br />
						<span style={{ color: "#666", fontSize: "13px" }}>
							{format(new Date(task.createdAt), "PPP")}
						</span>
					</div>
				</div>

				{/* Task Metadata */}
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
						gap: "8px",
						alignItems: "center",
						padding: "10px",
						backgroundColor: "white",
						borderRadius: "4px",
						border: "1px solid #e0e0e0",
					}}>
					{task.category && (
						<span
							style={{
								backgroundColor: "#e0e0e0",
								padding: "4px 8px",
								borderRadius: "4px",
								fontSize: "12px",
								color: "#666",
								fontWeight: "bold",
							}}>
							📁 {task.category}
						</span>
					)}

					{task.isRecurring && task.frequency && (
						<span
							style={{
								backgroundColor: "#e3f2fd",
								padding: "4px 8px",
								borderRadius: "4px",
								fontSize: "12px",
								color: "#1976d2",
								fontWeight: "bold",
							}}>
							🔄 {getFrequencyText(task.frequency)}
							{task.interval && task.interval > 1 && ` (${task.interval})`}
						</span>
					)}

					{task.tags && task.tags.length > 0 && (
						<>
							<span
								style={{ fontSize: "12px", color: "#666", fontWeight: "bold" }}>
								Tags:
							</span>
							{task.tags.map((tag, index) => (
								<span
									key={index}
									style={{
										backgroundColor: "#f0f0f0",
										padding: "4px 8px",
										borderRadius: "4px",
										fontSize: "12px",
										color: "#666",
										border: "1px solid #ddd",
									}}>
									🏷️ {tag}
								</span>
							))}
						</>
					)}
				</div>

				{/* Attachments Section - Placeholder for future implementation */}
				{/* 
				{task.attachments && task.attachments.length > 0 && (
					<div style={{ marginTop: "15px" }}>
						<h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#666", fontWeight: "bold" }}>
							📎 Attachments:
						</h4>
						<div style={{
							padding: "10px",
							backgroundColor: "white",
							borderRadius: "4px",
							border: "1px solid #e0e0e0",
						}}>
							{task.attachments.map((attachment, index) => (
								<div key={index} style={{
									display: "flex",
									alignItems: "center",
									gap: "8px",
									marginBottom: "5px",
									fontSize: "12px",
									color: "#666",
								}}>
									<span>📄 {attachment.name}</span>
									<span>({attachment.size})</span>
								</div>
							))}
						</div>
					</div>
				)}
				*/}

				{/* Task ID for reference */}
				<div
					style={{
						marginTop: "10px",
						fontSize: "10px",
						color: "#999",
						textAlign: "right",
						fontStyle: "italic",
					}}>
					Task ID: {task.id}
				</div>
			</div>
		);
	};

	return (
		<div
			style={{
				fontFamily: "Arial, sans-serif",
				maxWidth: "800px",
				margin: "0 auto",
				padding: "20px",
				backgroundColor: "white",
				color: "black",
			}}>
			{/* Header */}
			<div
				style={{
					textAlign: "center",
					borderBottom: "2px solid #333",
					paddingBottom: "20px",
					marginBottom: "30px",
				}}>
				<h1 style={{ margin: "0", color: "#1976d2", fontSize: "28px" }}>
					MyDo - Task Report
				</h1>
				<p style={{ margin: "10px 0 0 0", color: "#666" }}>
					Generated on {format(printDate, "PPP 'at' p")}
				</p>
			</div>

			{/* User Information */}
			<div
				style={{
					backgroundColor: "#f5f5f5",
					padding: "15px",
					borderRadius: "8px",
					marginBottom: "30px",
				}}>
				<h2 style={{ margin: "0 0 10px 0", fontSize: "20px", color: "#333" }}>
					User Information
				</h2>
				<p style={{ margin: "5px 0", fontSize: "14px" }}>
					<strong>Name:</strong> {userProfile.name}
				</p>
				<p style={{ margin: "5px 0", fontSize: "14px" }}>
					<strong>Email:</strong> {userProfile.email}
				</p>
			</div>

			{/* Summary */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
					gap: "15px",
					marginBottom: "30px",
				}}>
				<div
					style={{
						backgroundColor: "#e3f2fd",
						padding: "15px",
						borderRadius: "8px",
						textAlign: "center",
					}}>
					<h3
						style={{ margin: "0 0 5px 0", fontSize: "24px", color: "#1976d2" }}>
						{tasks.length}
					</h3>
					<p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
						Total Tasks
					</p>
				</div>
				<div
					style={{
						backgroundColor: "#fff3e0",
						padding: "15px",
						borderRadius: "8px",
						textAlign: "center",
					}}>
					<h3
						style={{ margin: "0 0 5px 0", fontSize: "24px", color: "#ff9800" }}>
						{pendingTasks.length}
					</h3>
					<p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
						Pending
					</p>
				</div>
				<div
					style={{
						backgroundColor: "#e8f5e8",
						padding: "15px",
						borderRadius: "8px",
						textAlign: "center",
					}}>
					<h3
						style={{ margin: "0 0 5px 0", fontSize: "24px", color: "#4caf50" }}>
						{completedTasks.length}
					</h3>
					<p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
						Completed
					</p>
				</div>
				{overdueTasks.length > 0 && (
					<div
						style={{
							backgroundColor: "#ffebee",
							padding: "15px",
							borderRadius: "8px",
							textAlign: "center",
						}}>
						<h3
							style={{
								margin: "0 0 5px 0",
								fontSize: "24px",
								color: "#f44336",
							}}>
							{overdueTasks.length}
						</h3>
						<p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
							Overdue
						</p>
					</div>
				)}
			</div>

			{/* Tasks by Status */}
			{/* Pending Tasks */}
			{pendingTasks.length > 0 && (
				<div style={{ marginBottom: "30px" }}>
					<h2
						style={{
							borderBottom: "2px solid #ff9800",
							paddingBottom: "10px",
							marginBottom: "20px",
							color: "#333",
							fontSize: "22px",
						}}>
						Pending Tasks ({pendingTasks.length})
					</h2>
					{pendingTasks.map((task) => renderTaskCard(task))}
				</div>
			)}

			{/* In Progress Tasks */}
			{inProgressTasks.length > 0 && (
				<div style={{ marginBottom: "30px" }}>
					<h2
						style={{
							borderBottom: "2px solid #2196f3",
							paddingBottom: "10px",
							marginBottom: "20px",
							color: "#333",
							fontSize: "22px",
						}}>
						In Progress Tasks ({inProgressTasks.length})
					</h2>
					{inProgressTasks.map((task) => renderTaskCard(task))}
				</div>
			)}

			{/* Completed Tasks */}
			{completedTasks.length > 0 && (
				<div style={{ marginBottom: "30px" }}>
					<h2
						style={{
							borderBottom: "2px solid #4caf50",
							paddingBottom: "10px",
							marginBottom: "20px",
							color: "#333",
							fontSize: "22px",
						}}>
						Completed Tasks ({completedTasks.length})
					</h2>
					{completedTasks.map((task) => renderTaskCard(task, true))}
				</div>
			)}

			{/* Overdue Tasks */}
			{overdueTasks.length > 0 && (
				<div style={{ marginBottom: "30px" }}>
					<h2
						style={{
							borderBottom: "2px solid #f44336",
							paddingBottom: "10px",
							marginBottom: "20px",
							color: "#333",
							fontSize: "22px",
						}}>
						⚠️ Overdue Tasks ({overdueTasks.length})
					</h2>
					{overdueTasks.map((task) => renderTaskCard(task))}
				</div>
			)}

			{/* Footer */}
			<div
				style={{
					marginTop: "40px",
					paddingTop: "20px",
					borderTop: "1px solid #ddd",
					textAlign: "center",
					fontSize: "12px",
					color: "#666",
				}}>
				<p style={{ margin: "0" }}>
					This report was generated by MyDo Task Management System
				</p>
				<p style={{ margin: "5px 0 0 0" }}>
					For more information, visit your MyDo dashboard
				</p>
			</div>
		</div>
	);
};

export default PrintableTasks;
