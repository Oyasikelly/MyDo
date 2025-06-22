import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { token } = body;

		if (!token) {
			return new NextResponse("Token is required", { status: 400 });
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

		return NextResponse.json({
			message: "Token is valid",
			email: resetToken.email,
		});
	} catch (error) {
		console.error("Error validating reset token:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
