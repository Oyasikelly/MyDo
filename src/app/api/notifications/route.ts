import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return new NextResponse("User not found", { status: 404 });
		}

		const notifications = await prisma.notification.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: "desc" },
			take: 50, // Limit to last 50 notifications
		});

		return NextResponse.json(notifications);
	} catch (error) {
		console.error("Error fetching notifications:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
