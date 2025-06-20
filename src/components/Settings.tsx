"use client";

import { useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Box,
	Typography,
	Switch,
	FormControlLabel,
	ToggleButton,
	ToggleButtonGroup,
	Avatar,
	IconButton,
	TextField,
	Grid,
} from "@mui/material";
import { useTheme } from "./providers/ThemeProvider";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { Circle as CircleIcon } from "@mui/icons-material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

interface SettingsProps {
	open: boolean;
	onClose: () => void;
}

export default function Settings({ open, onClose }: SettingsProps) {
	const { mode, colorScheme, toggleTheme, setColorScheme } = useTheme();
	const [emailNotifications, setEmailNotifications] = useState(true);
	const [pushNotifications, setPushNotifications] = useState(true);
	const [avatar, setAvatar] = useState<string | null>(null);
	const [name, setName] = useState("");
	const [bio, setBio] = useState("");

	const handleColorChange = (
		event: React.MouseEvent<HTMLElement>,
		newColor: string
	) => {
		if (newColor !== null) {
			setColorScheme(newColor as "blue" | "purple" | "green" | "orange");
		}
	};

	const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setAvatar(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth>
			<DialogTitle>Settings</DialogTitle>
			<DialogContent>
				<Box sx={{ mb: 3 }}>
					<Typography
						variant="h6"
						gutterBottom>
						Profile
					</Typography>
					<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
						<Avatar
							src={avatar || undefined}
							sx={{ width: 80, height: 80, mr: 2 }}
						/>
						<label htmlFor="icon-button-file">
							<input
								accept="image/*"
								id="icon-button-file"
								type="file"
								style={{ display: "none" }}
								onChange={handleAvatarChange}
							/>
							<IconButton
								color="primary"
								aria-label="upload picture"
								component="span">
								<PhotoCamera />
							</IconButton>
						</label>
					</Box>
					<TextField
						fullWidth
						label="Display Name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						margin="normal"
					/>
					<TextField
						fullWidth
						label="Bio"
						value={bio}
						onChange={(e) => setBio(e.target.value)}
						margin="normal"
						multiline
						rows={3}
					/>
				</Box>

				<Box sx={{ mb: 3 }}>
					<Typography
						variant="h6"
						gutterBottom>
						Appearance
					</Typography>
					<Grid
						container
						spacing={2}
						alignItems="center">
						<Grid item>
							<IconButton
								onClick={toggleTheme}
								color="inherit">
								{mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
							</IconButton>
						</Grid>
						<Grid item>
							<Typography>
								{mode === "light" ? "Light Mode" : "Dark Mode"}
							</Typography>
						</Grid>
					</Grid>
					<Box sx={{ mt: 2 }}>
						<Typography gutterBottom>Color Scheme</Typography>
						<ToggleButtonGroup
							value={colorScheme}
							exclusive
							onChange={handleColorChange}
							aria-label="color scheme">
							<ToggleButton
								value="blue"
								aria-label="blue">
								<CircleIcon sx={{ color: "#1976d2" }} />
							</ToggleButton>
							<ToggleButton
								value="purple"
								aria-label="purple">
								<CircleIcon sx={{ color: "#7b1fa2" }} />
							</ToggleButton>
							<ToggleButton
								value="green"
								aria-label="green">
								<CircleIcon sx={{ color: "#2e7d32" }} />
							</ToggleButton>
							<ToggleButton
								value="orange"
								aria-label="orange">
								<CircleIcon sx={{ color: "#ed6c02" }} />
							</ToggleButton>
						</ToggleButtonGroup>
					</Box>
				</Box>

				<Box>
					<Typography
						variant="h6"
						gutterBottom>
						Notifications
					</Typography>
					<FormControlLabel
						control={
							<Switch
								checked={emailNotifications}
								onChange={(e) => setEmailNotifications(e.target.checked)}
							/>
						}
						label="Email Notifications"
					/>
					<FormControlLabel
						control={
							<Switch
								checked={pushNotifications}
								onChange={(e) => setPushNotifications(e.target.checked)}
							/>
						}
						label="Push Notifications"
					/>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					onClick={onClose}
					variant="contained"
					color="primary">
					Save Changes
				</Button>
			</DialogActions>
		</Dialog>
	);
}
