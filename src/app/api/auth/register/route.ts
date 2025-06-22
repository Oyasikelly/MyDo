import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { name, email, password } = body;

		if (!name || !email || !password) {
			return new NextResponse("Missing required fields", { status: 400 });
		}

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return new NextResponse("User already exists", { status: 400 });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create user
		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
			},
		});

		// Remove password from response
		const { password: _, ...userWithoutPassword } = user;

		return NextResponse.json(userWithoutPassword);
	} catch (error) {
		console.error("Error registering user:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
