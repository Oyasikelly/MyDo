"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
	Container,
	Box,
	Typography,
	TextField,
	Button,
	Paper,
	Alert,
} from "@mui/material";

export default function LoginPage() {
	const router = useRouter();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setLoading(true);

		const formData = new FormData(event.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				setError("Invalid email or password");
			} else {
				router.push("/");
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
						Sign In
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
							id="email"
							label="Email Address"
							name="email"
							autoComplete="email"
							autoFocus
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label="Password"
							type="password"
							id="password"
							autoComplete="current-password"
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
							disabled={loading}>
							{loading ? "Signing in..." : "Sign In"}
						</Button>
					</Box>

					<Box sx={{ textAlign: "center", mt: 2 }}>
						<Link
							href="/register"
							style={{ color: "#1976d2", textDecoration: "underline" }}>
							Don&apos;t have an account? Sign up
						</Link>
					</Box>
				</Paper>
			</Box>
		</Container>
	);
}
