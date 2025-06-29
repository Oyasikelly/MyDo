import { prisma } from "./prisma";
import { Task, NotificationType } from "@prisma/client";

export class NotificationService {
	static async createTaskNotification(task: Task) {
		try {
			// Create in-app notification
			await prisma.notification.create({
				data: {
					type: NotificationType.IN_APP,
					title: "New Task Created",
					message: `Task "${task.title}" has been created`,
					userId: task.userId,
					taskId: task.id,
				},
			});

			// If the task has a due date, schedule a reminder
			if (task.dueDate) {
				const reminderTime = new Date(task.dueDate);
				reminderTime.setHours(reminderTime.getHours() - 24); // 24 hours before due date

				if (reminderTime > new Date()) {
					await prisma.notification.create({
						data: {
							type: NotificationType.IN_APP,
							title: "Task Reminder",
							message: `Task "${task.title}" is due tomorrow`,
							userId: task.userId,
							taskId: task.id,
						},
					});
				}
			}

			// Handle recurring tasks
			if (task.isRecurring && task.frequency && task.interval) {
				const nextDueDate = this.calculateNextDueDate(
					task.dueDate,
					task.frequency,
					task.interval
				);

				if (nextDueDate) {
					await prisma.task.create({
						data: {
							...task,
							id: undefined, // Let Prisma generate a new ID
							dueDate: nextDueDate,
							status: "PENDING",
						},
					});
				}
			}
		} catch (error) {
			console.error("Error creating task notification:", error);
		}
	}

	static async createOnlineStatusNotification(
		userId: string,
		isOnline: boolean
	) {
		try {
			if (isOnline) {
				// Create a welcome back notification
				await prisma.notification.create({
					data: {
						type: NotificationType.IN_APP,
						title: "Welcome Back!",
						message: "You're back online. Check for any missed updates.",
						userId: userId,
					},
				});
			}
		} catch (error) {
			console.error("Error creating online status notification:", error);
		}
	}

	static async getMissedUpdates(userId: string, lastOnlineTime?: Date) {
		try {
			const whereClause: any = { userId };

			if (lastOnlineTime) {
				whereClause.createdAt = { gt: lastOnlineTime };
			}

			const newNotifications = await prisma.notification.count({
				where: whereClause,
			});

			const updatedTasks = await prisma.task.count({
				where: {
					userId,
					updatedAt: lastOnlineTime ? { gt: lastOnlineTime } : undefined,
				},
			});

			return {
				newNotifications,
				updatedTasks,
				hasUpdates: newNotifications > 0 || updatedTasks > 0,
			};
		} catch (error) {
			console.error("Error getting missed updates:", error);
			return { newNotifications: 0, updatedTasks: 0, hasUpdates: false };
		}
	}

	private static calculateNextDueDate(
		currentDueDate: Date,
		frequency: string,
		interval: number
	): Date | null {
		const date = new Date(currentDueDate);

		switch (frequency) {
			case "DAILY":
				date.setDate(date.getDate() + interval);
				break;
			case "WEEKLY":
				date.setDate(date.getDate() + interval * 7);
				break;
			case "MONTHLY":
				date.setMonth(date.getMonth() + interval);
				break;
			default:
				return null;
		}

		return date;
	}

	static async markNotificationAsRead(notificationId: string) {
		try {
			await prisma.notification.update({
				where: { id: notificationId },
				data: { isRead: true },
			});
		} catch (error) {
			console.error("Error marking notification as read:", error);
		}
	}

	static async getUnreadNotifications(userId: string) {
		try {
			return await prisma.notification.findMany({
				where: {
					userId,
					isRead: false,
				},
				orderBy: {
					createdAt: "desc",
				},
			});
		} catch (error) {
			console.error("Error fetching unread notifications:", error);
			return [];
		}
	}
}
