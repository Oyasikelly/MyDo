"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Container,
	Box,
	Typography,
	TextField,
	Button,
	Paper,
	Alert,
	Link,
} from "@mui/material";
import NextLink from "next/link";

export default function RegisterPage() {
	const router = useRouter();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setLoading(true);

		const formData = new FormData(event.currentTarget);
		const name = formData.get("name") as string;
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name,
					email,
					password,
				}),
			});

			if (response.ok) {
				router.push("/login");
			} else {
				const data = await response.json();
				setError(data.message || "Registration failed");
			}
		} catch (error) {
			setError("An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container
			component="main"
			maxWidth="xs">
			<Box
				sx={{
					marginTop: 8,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}>
				<Paper
					elevation={3}
					sx={{
						padding: 4,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						width: "100%",
					}}>
					<Typography
						component="h1"
						variant="h5">
						Create Account
					</Typography>

					{error && (
						<Alert
							severity="error"
							sx={{ mt: 2, width: "100%" }}>
							{error}
						</Alert>
					)}

					<Box
						component="form"
						onSubmit={handleSubmit}
						sx={{ mt: 1, width: "100%" }}>
						<TextField
							margin="normal"
							required
							fullWidth
							id="name"
							label="Full Name"
							name="name"
							autoComplete="name"
							autoFocus
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							id="email"
							label="Email Address"
							name="email"
							autoComplete="email"
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label="Password"
							type="password"
							id="password"
							autoComplete="new-password"
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="confirmPassword"
							label="Confirm Password"
							type="password"
							id="confirmPassword"
							autoComplete="new-password"
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
							disabled={loading}>
							{loading ? "Creating Account..." : "Create Account"}
						</Button>
						<Box sx={{ textAlign: "center", mt: 2 }}>
							<Link
								href="/login"
								style={{ color: "#1976d2", textDecoration: "underline" }}>
								Already have an account? Sign in
							</Link>
						</Box>
					</Box>
				</Paper>
			</Box>
		</Container>
	);
}
