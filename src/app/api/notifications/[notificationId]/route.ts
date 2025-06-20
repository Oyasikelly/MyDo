import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

interface RouteParams {
	params: {
		notificationId: string;
	};
}

export async function PATCH(request: Request, { params }: RouteParams) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const notification = await prisma.notification.update({
			where: { id: params.notificationId },
			data: { isRead: true },
		});

		return NextResponse.json(notification);
	} catch (error) {
		console.error("Error updating notification:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}

export async function DELETE(request: Request, { params }: RouteParams) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		await prisma.notification.delete({
			where: { id: params.notificationId },
		});

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		console.error("Error deleting notification:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
