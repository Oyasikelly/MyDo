import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Status } from "@prisma/client";

interface RouteParams {
	params: {
		taskId: string;
	};
}

export async function GET(request: Request, { params }: RouteParams) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const task = await prisma.task.findUnique({
			where: { id: params.taskId },
		});

		if (!task) {
			return new NextResponse("Task not found", { status: 404 });
		}

		return NextResponse.json(task);
	} catch (error) {
		console.error("Error fetching task:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { taskId: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { taskId } = params;
		const body = await request.json();

		// Verify the task belongs to the current user
		const existingTask = await prisma.task.findFirst({
			where: {
				id: taskId,
				user: {
					email: session.user.email,
				},
			},
		});

		if (!existingTask) {
			return NextResponse.json({ error: "Task not found" }, { status: 404 });
		}

		// Update the task
		const updatedTask = await prisma.task.update({
			where: { id: taskId },
			data: body,
		});

		return NextResponse.json(updatedTask);
	} catch (error) {
		console.error("Error updating task:", error);
		return NextResponse.json(
			{ error: "Failed to update task" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { taskId: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { taskId } = params;

		// Verify the task belongs to the current user
		const existingTask = await prisma.task.findFirst({
			where: {
				id: taskId,
				user: {
					email: session.user.email,
				},
			},
		});

		if (!existingTask) {
			return NextResponse.json({ error: "Task not found" }, { status: 404 });
		}

		// Delete the task
		await prisma.task.delete({
			where: { id: taskId },
		});

		return NextResponse.json({ message: "Task deleted successfully" });
	} catch (error) {
		console.error("Error deleting task:", error);
		return NextResponse.json(
			{ error: "Failed to delete task" },
			{ status: 500 }
		);
	}
}
