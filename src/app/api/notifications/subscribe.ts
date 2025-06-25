import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.email) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { endpoint, keys } = await request.json();
	if (!endpoint || !keys) {
		return NextResponse.json(
			{ error: "Missing subscription data" },
			{ status: 400 }
		);
	}

	const user = await prisma.user.findUnique({
		where: { email: session.user.email },
	});
	if (!user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	// Upsert subscription
	await prisma.pushSubscription.upsert({
		where: { endpoint },
		update: { keys, userId: user.id },
		create: { endpoint, keys, userId: user.id },
	});

	return NextResponse.json({ success: true });
}
