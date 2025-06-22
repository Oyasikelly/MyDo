import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { token, password } = body;

		if (!token || !password) {
			return new NextResponse("Token and password are required", {
				status: 400,
			});
		}

		if (password.length < 6) {
			return new NextResponse("Password must be at least 6 characters long", {
				status: 400,
			});
		}

		// Find the reset token
		const resetToken = await prisma.passwordReset.findUnique({
			where: { token },
			include: { user: true },
		});

		if (!resetToken) {
			return new NextResponse("Invalid reset token", { status: 400 });
		}

		// Check if token is expired
		if (new Date() > resetToken.expiresAt) {
			// Delete expired token
			await prisma.passwordReset.delete({
				where: { token },
			});
			return new NextResponse("Reset token has expired", { status: 400 });
		}

		// Check if token has already been used
		if (resetToken.used) {
			return new NextResponse("Reset token has already been used", {
				status: 400,
			});
		}

		// Hash the new password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Update user password
		await prisma.user.update({
			where: { email: resetToken.email },
			data: { password: hashedPassword },
		});

		// Mark token as used
		await prisma.passwordReset.update({
			where: { token },
			data: { used: true },
		});

		// Delete all other reset tokens for this user
		await prisma.passwordReset.deleteMany({
			where: {
				email: resetToken.email,
				token: { not: token },
			},
		});

		return NextResponse.json({
			message: "Password reset successfully",
		});
	} catch (error) {
		console.error("Error resetting password:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
