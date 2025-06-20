import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: {
				id: true,
				name: true,
				email: true,
				bio: true,
				avatar: true,
				createdAt: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json(user);
	} catch (error) {
		console.error("Error fetching profile:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { name, bio, avatar } = body;

		// Validate input
		if (name && typeof name !== "string") {
			return NextResponse.json(
				{ error: "Name must be a string" },
				{ status: 400 }
			);
		}

		if (bio && typeof bio !== "string") {
			return NextResponse.json(
				{ error: "Bio must be a string" },
				{ status: 400 }
			);
		}

		if (avatar && typeof avatar !== "string") {
			return NextResponse.json(
				{ error: "Avatar must be a string" },
				{ status: 400 }
			);
		}

		const updatedUser = await prisma.user.update({
			where: { email: session.user.email },
			data: {
				...(name !== undefined && { name }),
				...(bio !== undefined && { bio }),
				...(avatar !== undefined && { avatar }),
			},
			select: {
				id: true,
				name: true,
				email: true,
				bio: true,
				avatar: true,
				createdAt: true,
			},
		});

		return NextResponse.json(updatedUser);
	} catch (error) {
		console.error("Error updating profile:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
