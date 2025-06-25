import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Task, Priority, Status, Frequency } from "@prisma/client";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

// GET /api/tasks - Get all tasks for the current user
export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const tasks = await prisma.task.findMany({
			where: {
				user: {
					email: session.user.email,
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(tasks);
	} catch (error) {
		console.error("Error fetching tasks:", error);
		return NextResponse.json(
			{ error: "Failed to fetch tasks" },
			{ status: 500 }
		);
	}
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const formData = await request.formData();
		const title = formData.get("title") as string;
		const description = formData.get("description") as string;
		const priority = formData.get("priority") as Priority;
		const status = formData.get("status") as Status;
		const dueDate = formData.get("dueDate") as string;
		const dueTime = formData.get("dueTime") as string;
		const frequency = formData.get("frequency") as Frequency;
		const tags = JSON.parse((formData.get("tags") as string) || "[]");

		if (!title || !dueDate) {
			return NextResponse.json(
				{ error: "Title and due date are required" },
				{ status: 400 }
			);
		}

		// Get user ID
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Create task
		const task = await prisma.task.create({
			data: {
				title,
				description,
				priority,
				status,
				dueDate: new Date(dueDate),
				dueTime,
				frequency,
				tags,
				userId: user.id,
			},
		});

		// Handle file uploads if any (store file names in description for now)
		const attachments: string[] = [];
		Array.from(formData.entries()).forEach(([key, value]) => {
			if (key.startsWith("attachment-") && value instanceof File) {
				// In a real application, you would upload the file to a storage service
				// For now, we'll store the file name in the description
				attachments.push(value.name);
			}
		});

		if (attachments.length > 0) {
			const updatedDescription = task.description
				? `${task.description}\n\nAttachments: ${attachments.join(", ")}`
				: `Attachments: ${attachments.join(", ")}`;

			await prisma.task.update({
				where: { id: task.id },
				data: { description: updatedDescription },
			});
		}

		return NextResponse.json(task, { status: 201 });
	} catch (error) {
		console.error("Error creating task:", error);
		return NextResponse.json(
			{ error: "Failed to create task" },
			{ status: 500 }
		);
	}
}
