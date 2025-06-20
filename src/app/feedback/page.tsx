"use client";

import { useState } from "react";
import {
	Container,
	Typography,
	Box,
	TextField,
	Button,
	Rating,
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
	Alert,
	Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export default function Feedback() {
	const [rating, setRating] = useState<number | null>(0);
	const [feedbackType, setFeedbackType] = useState("general");
	const [comment, setComment] = useState("");
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSubmitted(false);

		if (!rating || !comment) {
			setError("Please provide both a rating and comment.");
			return;
		}

		try {
			// Here you would typically send the feedback to your backend
			// await fetch("/api/feedback", {
			//   method: "POST",
			//   headers: { "Content-Type": "application/json" },
			//   body: JSON.stringify({ rating, feedbackType, comment, email }),
			// });

			setSubmitted(true);
			setRating(0);
			setFeedbackType("general");
			setComment("");
			setEmail("");
		} catch (err) {
			setError("Failed to submit feedback. Please try again.");
		}
	};

	return (
		<Container
			maxWidth="md"
			sx={{ py: 4 }}>
			<Paper
				elevation={3}
				sx={{ p: 4 }}>
				<Box
					textAlign="center"
					mb={4}>
					<Typography
						variant="h3"
						component="h1"
						gutterBottom>
						We Value Your Feedback
					</Typography>
					<Typography
						variant="subtitle1"
						color="text.secondary">
						Help us improve MyDo by sharing your thoughts and suggestions
					</Typography>
				</Box>

				{submitted && (
					<Alert
						severity="success"
						sx={{ mb: 3 }}>
						Thank you for your feedback! We appreciate your input.
					</Alert>
				)}

				{error && (
					<Alert
						severity="error"
						sx={{ mb: 3 }}>
						{error}
					</Alert>
				)}

				<Box
					component="form"
					onSubmit={handleSubmit}>
					<Box mb={3}>
						<FormLabel component="legend">
							How would you rate your experience?
						</FormLabel>
						<Rating
							name="rating"
							value={rating}
							onChange={(_, newValue) => setRating(newValue)}
							size="large"
							sx={{ mt: 1 }}
						/>
					</Box>

					<FormControl
						component="fieldset"
						sx={{ mb: 3 }}>
						<FormLabel component="legend">
							What type of feedback do you have?
						</FormLabel>
						<RadioGroup
							value={feedbackType}
							onChange={(e) => setFeedbackType(e.target.value)}>
							<FormControlLabel
								value="general"
								control={<Radio />}
								label="General Feedback"
							/>
							<FormControlLabel
								value="bug"
								control={<Radio />}
								label="Bug Report"
							/>
							<FormControlLabel
								value="feature"
								control={<Radio />}
								label="Feature Request"
							/>
							<FormControlLabel
								value="other"
								control={<Radio />}
								label="Other"
							/>
						</RadioGroup>
					</FormControl>

					<TextField
						fullWidth
						label="Your Feedback"
						multiline
						rows={4}
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						sx={{ mb: 3 }}
						required
					/>

					<TextField
						fullWidth
						label="Email (optional)"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						helperText="We'll only use this to follow up if needed"
						sx={{ mb: 3 }}
					/>

					<Button
						type="submit"
						variant="contained"
						size="large"
						endIcon={<SendIcon />}
						fullWidth>
						Submit Feedback
					</Button>
				</Box>
			</Paper>
		</Container>
	);
}
