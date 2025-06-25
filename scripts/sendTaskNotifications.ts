import { prisma } from "../src/lib/prisma";
import { NotificationType, Status } from "@prisma/client";
import { NotificationService } from "../src/lib/notificationService";
import { sendEmail } from "../src/lib/emailService";
import webpush from "web-push";

const MS_IN_HOUR = 60 * 60 * 1000;
const MS_IN_DAY = 24 * MS_IN_HOUR;

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
	throw new Error("VAPID keys are not set in environment variables.");
}

webpush.setVapidDetails(
	"mailto:your-email@example.com",
	VAPID_PUBLIC_KEY,
	VAPID_PRIVATE_KEY
);

async function sendPushToUser(userId: string, message: string) {
	const subs = await prisma.pushSubscription.findMany({ where: { userId } });
	for (const sub of subs) {
		try {
			const keys =
				typeof sub.keys === "string" ? JSON.parse(sub.keys) : sub.keys;
			await webpush.sendNotification(
				{
					endpoint: sub.endpoint,
					keys: {
						p256dh: keys.p256dh,
						auth: keys.auth,
					},
				},
				message
			);
		} catch (err) {
			console.error("Push notification error:", err);
		}
	}
}

async function sendNotifications() {
	const now = new Date();
	const soon = new Date(now.getTime() + MS_IN_DAY);

	// Find all tasks that are overdue or due in next 24h and not completed
	const tasks = await prisma.task.findMany({
		where: {
			status: { not: Status.COMPLETED },
			OR: [
				{ dueDate: { lt: now } }, // Overdue
				{ dueDate: { gte: now, lte: soon } }, // Due soon
			],
		},
		include: { user: true },
	});

	for (const task of tasks) {
		console.log("Processing task:", task.title, "for user:", task.user.email);
		// Overdue notification
		if (task.dueDate < now) {
			const alreadyNotified = await prisma.notification.findFirst({
				where: {
					taskId: task.id,
					userId: task.userId,
					type: NotificationType.IN_APP,
					title: "Task Overdue",
				},
			});
			if (!alreadyNotified) {
				await prisma.notification.create({
					data: {
						type: NotificationType.IN_APP,
						title: "Task Overdue",
						message: `Task "${task.title}" is overdue!`,
						userId: task.userId,
						taskId: task.id,
					},
				});
				// Send email
				if (task.user.email) {
					try {
						console.log("Attempting to send email to", task.user.email);
						await sendEmail({
							to: task.user.email,
							subject: `Task Overdue: ${task.title}`,
							text: `Your task "${
								task.title
							}" was due on ${task.dueDate.toLocaleString()} and is now overdue. Please take action.`,
						});
						console.log("Email sent to", task.user.email);
					} catch (err) {
						console.error("Error sending email to", task.user.email, err);
					}
					// Send push notification
					await sendPushToUser(
						task.userId,
						`Task \"${task.title}\" is overdue!`
					);
					console.log(
						`Email/Push: Sent overdue notification to ${task.user.email} for task ${task.title}`
					);
				}
			}
		}
		// Due soon notification (within 24h)
		else if (task.dueDate >= now && task.dueDate <= soon) {
			const alreadyNotified = await prisma.notification.findFirst({
				where: {
					taskId: task.id,
					userId: task.userId,
					type: NotificationType.IN_APP,
					title: "Task Due Soon",
				},
			});
			if (!alreadyNotified) {
				await prisma.notification.create({
					data: {
						type: NotificationType.IN_APP,
						title: "Task Due Soon",
						message: `Task "${task.title}" is due soon!`,
						userId: task.userId,
						taskId: task.id,
					},
				});
				// Send email
				if (task.user.email) {
					await sendEmail({
						to: task.user.email,
						subject: `Task Due Soon: ${task.title}`,
						text: `Your task "${
							task.title
						}" is due on ${task.dueDate.toLocaleString()}. Please be prepared.`,
					});
				}
				// Send push notification
				await sendPushToUser(
					task.userId,
					`Task \"${task.title}\" is due soon!`
				);
				console.log(
					`Email/Push: Sent due soon notification to ${task.user.email} for task ${task.title}`
				);
			}
		}
	}
}

sendNotifications()
	.then(() => {
		console.log("Task notifications processed.");
		process.exit(0);
	})
	.catch((err) => {
		console.error("Error sending task notifications:", err);
		process.exit(1);
	});
