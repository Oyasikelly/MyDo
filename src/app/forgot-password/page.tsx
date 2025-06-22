"use client";

import { useState } from "react";
import {
	Container,
	Paper,
	Typography,
	TextField,
	Button,
	Box,
	Alert,
	CircularProgress,
	Link,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		setMessage("");

		try {
			const response = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (response.ok) {
				setMessage(
					"Password reset link has been sent to your email. Please check your inbox and follow the instructions."
				);
				setEmail("");
			} else {
				setError(data.message || "Something went wrong. Please try again.");
			}
		} catch (error) {
			setError("Network error. Please check your connection and try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Container maxWidth="sm">
			<Box
				sx={{
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}>
				<Paper
					elevation={3}
					sx={{
						p: 4,
						width: "100%",
						borderRadius: 2,
					}}>
					<Box sx={{ mb: 3, textAlign: "center" }}>
						<Typography
							variant="h4"
							component="h1"
							gutterBottom>
							Forgot Password
						</Typography>
						<Typography
							variant="body1"
							color="text.secondary">
							Enter your email address and we'll send you a link to reset your
							password.
						</Typography>
					</Box>

					{message && (
						<Alert
							severity="success"
							sx={{ mb: 2 }}>
							{message}
						</Alert>
					)}

					{error && (
						<Alert
							severity="error"
							sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}

					<form onSubmit={handleSubmit}>
						<TextField
							fullWidth
							label="Email Address"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							margin="normal"
							variant="outlined"
							disabled={isLoading}
						/>

						<Button
							type="submit"
							fullWidth
							variant="contained"
							size="large"
							disabled={isLoading || !email}
							sx={{ mt: 3, mb: 2 }}>
							{isLoading ? (
								<CircularProgress
									size={24}
									color="inherit"
								/>
							) : (
								"Send Reset Link"
							)}
						</Button>
					</form>

					<Box sx={{ textAlign: "center", mt: 2 }}>
						<Link
							href="/login"
							sx={{
								display: "inline-flex",
								alignItems: "center",
								gap: 0.5,
								textDecoration: "none",
								"&:hover": {
									textDecoration: "underline",
								},
							}}>
							<ArrowBack fontSize="small" />
							Back to Login
						</Link>
					</Box>
				</Paper>
			</Box>
		</Container>
	);
}
