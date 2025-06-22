import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email } = body;

		if (!email) {
			return new NextResponse("Email is required", { status: 400 });
		}

		// Check if user exists
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			// Don't reveal if user exists or not for security
			return NextResponse.json({
				message:
					"If an account with that email exists, a password reset link has been sent.",
			});
		}

		// Generate reset token
		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

		// Delete any existing reset tokens for this user
		await prisma.passwordReset.deleteMany({
			where: { email },
		});

		// Create new reset token
		await prisma.passwordReset.create({
			data: {
				token,
				email,
				expiresAt,
			},
		});

		// In a real app, you would send an email here
		// For now, we'll just return the token (in production, remove this)
		const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

		// For development/testing purposes, log the reset URL
		console.log("Password reset URL:", resetUrl);

		return NextResponse.json({
			message:
				"If an account with that email exists, a password reset link has been sent.",
		});
	} catch (error) {
		console.error("Error in forgot password:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
