"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ArrowBack, Visibility, VisibilityOff } from "@mui/icons-material";

function ResetPasswordContent() {
	const { data: session } = useSession();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isValidToken, setIsValidToken] = useState(false);
	const [isCheckingToken, setIsCheckingToken] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");

	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams?.get("token");

	useEffect(() => {
		if (token) {
			validateToken();
		} else {
			setError("Invalid reset link. Please request a new password reset.");
			setIsCheckingToken(false);
		}
	}, [token]);

	const validateToken = async () => {
		try {
			const response = await fetch("/api/auth/validate-reset-token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token }),
			});

			if (response.ok) {
				setIsValidToken(true);
			} else {
				setError(
					"This reset link is invalid or has expired. Please request a new one."
				);
			}
		} catch (error) {
			setError("Network error. Please check your connection and try again.");
		} finally {
			setIsCheckingToken(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters long.");
			return;
		}

		setIsLoading(true);
		setError("");
		setMessage("");

		try {
			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token, password }),
			});

			const data = await response.json();

			if (response.ok) {
				setMessage(
					"Password reset successfully! You can now log in with your new password."
				);
				setPassword("");
				setConfirmPassword("");
				setTimeout(() => {
					router.push("/login");
				}, 2000);
			} else {
				setError(data.message || "Something went wrong. Please try again.");
			}
		} catch (error) {
			setError("Network error. Please check your connection and try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (isCheckingToken) {
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
							textAlign: "center",
						}}>
						<CircularProgress sx={{ mb: 2 }} />
						<Typography>Validating reset link...</Typography>
					</Paper>
				</Box>
			</Container>
		);
	}

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
							Reset Password
						</Typography>
						<Typography
							variant="body1"
							color="text.secondary">
							Enter your new password below.
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

					{isValidToken && (
						<form onSubmit={handleSubmit}>
							<TextField
								fullWidth
								label="New Password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								margin="normal"
								variant="outlined"
								disabled={isLoading}
								InputProps={{
									endAdornment: (
										<Button
											onClick={() => setShowPassword(!showPassword)}
											sx={{ minWidth: "auto", p: 1 }}>
											{showPassword ? <VisibilityOff /> : <Visibility />}
										</Button>
									),
								}}
							/>

							<TextField
								fullWidth
								label="Confirm New Password"
								type={showConfirmPassword ? "text" : "password"}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								margin="normal"
								variant="outlined"
								disabled={isLoading}
								InputProps={{
									endAdornment: (
										<Button
											onClick={() =>
												setShowConfirmPassword(!showConfirmPassword)
											}
											sx={{ minWidth: "auto", p: 1 }}>
											{showConfirmPassword ? <VisibilityOff /> : <Visibility />}
										</Button>
									),
								}}
							/>

							<Button
								type="submit"
								fullWidth
								variant="contained"
								disabled={isLoading || !password || !confirmPassword}
								sx={{ mt: 3, mb: 2 }}>
								{isLoading ? (
									<CircularProgress
										size={24}
										color="inherit"
									/>
								) : (
									"Reset Password"
								)}
							</Button>
						</form>
					)}

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

export default function ResetPassword() {
	return (
		<Suspense
			fallback={
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
								textAlign: "center",
							}}>
							<CircularProgress sx={{ mb: 2 }} />
							<Typography>Loading...</Typography>
						</Paper>
					</Box>
				</Container>
			}>
			<ResetPasswordContent />
		</Suspense>
	);
}
