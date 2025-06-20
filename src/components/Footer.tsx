"use client";

import {
	Box,
	Container,
	Grid,
	Typography,
	Link,
	IconButton,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import NextLink from "next/link";

export default function Footer() {
	const currentYear = new Date().getFullYear();

	const linkStyle = {
		textDecoration: "none",
		transition: "all 0.3s ease",
		"&:hover": {
			color: "primary.main",
			transform: "translateX(4px)",
		},
	};

	const iconStyle = {
		transition: "all 0.3s ease",
		"&:hover": {
			transform: "scale(1.2)",
			backgroundColor: "rgba(25, 118, 210, 0.1)",
		},
	};

	return (
		<Box
			component="footer"
			sx={{
				py: 3,
				px: 2,
				mt: "auto",
				backgroundColor: (theme) =>
					theme.palette.mode === "light"
						? theme.palette.grey[200]
						: theme.palette.grey[800],
			}}>
			<Container maxWidth="lg">
				<Grid
					container
					spacing={4}>
					<Grid
						item
						xs={12}
						sm={4}>
						<Typography
							variant="h6"
							color="text.primary"
							gutterBottom>
							MyDo
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary">
							Organize your life, one task at a time.
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={4}>
						<Typography
							variant="h6"
							color="text.primary"
							gutterBottom>
							Quick Links
						</Typography>
						<Link
							href="/faq"
							color="text.secondary"
							display="block"
							component={NextLink}
							sx={linkStyle}>
							FAQ
						</Link>
						<Link
							href="/feedback"
							color="text.secondary"
							display="block"
							component={NextLink}
							sx={linkStyle}>
							Feedback
						</Link>
						<Link
							href="/privacy"
							color="text.secondary"
							display="block"
							component={NextLink}
							sx={linkStyle}>
							Privacy Policy
						</Link>
						<Link
							href="/terms"
							color="text.secondary"
							display="block"
							component={NextLink}
							sx={linkStyle}>
							Terms of Service
						</Link>
					</Grid>
					<Grid
						item
						xs={12}
						sm={4}>
						<Typography
							variant="h6"
							color="text.primary"
							gutterBottom>
							Connect With Us
						</Typography>
						<Box>
							<IconButton
								color="primary"
								aria-label="GitHub"
								sx={iconStyle}>
								<GitHubIcon />
							</IconButton>
							<IconButton
								color="primary"
								aria-label="LinkedIn"
								sx={iconStyle}>
								<LinkedInIcon />
							</IconButton>
							<IconButton
								color="primary"
								aria-label="Twitter"
								sx={iconStyle}>
								<TwitterIcon />
							</IconButton>
						</Box>
					</Grid>
				</Grid>
				<Box mt={3}>
					<Typography
						variant="body2"
						color="text.secondary"
						align="center">
						© {currentYear} MyDo. All rights reserved.
					</Typography>
				</Box>
			</Container>
		</Box>
	);
}
