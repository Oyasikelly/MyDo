import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const body = await request.json();
		const { lastOnlineTime } = body;

		// Get user ID
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return new NextResponse("User not found", { status: 404 });
		}

		// Get unread notifications count
		const unreadNotifications = await prisma.notification.count({
			where: {
				userId: user.id,
				isRead: false,
			},
		});

		// Get pending tasks count (due within 24 hours)
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);

		const pendingTasks = await prisma.task.count({
			where: {
				userId: user.id,
				status: "PENDING",
				dueDate: {
					lte: tomorrow,
				},
			},
		});

		// Check if there are any updates since last online
		let hasUpdates = false;
		if (lastOnlineTime) {
			const lastOnline = new Date(lastOnlineTime);

			// Check for new notifications since last online
			const newNotifications = await prisma.notification.count({
				where: {
					userId: user.id,
					createdAt: {
						gt: lastOnline,
					},
				},
			});

			// Check for task updates since last online
			const updatedTasks = await prisma.task.count({
				where: {
					userId: user.id,
					updatedAt: {
						gt: lastOnline,
					},
				},
			});

			hasUpdates = newNotifications > 0 || updatedTasks > 0;
		} else {
			// If no lastOnlineTime provided, check if there are any unread notifications
			hasUpdates = unreadNotifications > 0;
		}

		return NextResponse.json({
			hasUpdates,
			unreadCount: unreadNotifications,
			pendingTasks,
			message: hasUpdates
				? `You have ${unreadNotifications} unread notifications and ${pendingTasks} tasks due soon.`
				: "All caught up!",
		});
	} catch (error) {
		console.error("Error checking missed notifications:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
