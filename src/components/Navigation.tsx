"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	IconButton,
	Menu,
	MenuItem,
	Box,
	Drawer,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Divider,
	useMediaQuery,
	useTheme as useMuiTheme,
	Avatar,
} from "@mui/material";
import {
	Menu as MenuIcon,
	AccountCircle,
	Settings as SettingsIcon,
	Help as HelpIcon,
	Feedback as FeedbackIcon,
	Dashboard as DashboardIcon,
	Assignment as AssignmentIcon,
	ExitToApp as ExitToAppIcon,
	Person as PersonIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Notifications from "./Notifications";
import Settings from "./Settings";

interface UserProfile {
	id: string;
	name: string;
	email: string;
	bio: string | null;
	avatar: string | null;
	createdAt: string;
}

export default function Navigation() {
	const { data: session } = useSession();
	const router = useRouter();
	const theme = useMuiTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	const [mobileOpen, setMobileOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

	useEffect(() => {
		const fetchUserProfile = async () => {
			if (session?.user?.email) {
				try {
					const response = await fetch("/api/profile");
					if (response.ok) {
						const profile = await response.json();
						setUserProfile(profile);
					}
				} catch (error) {
					console.error("Error fetching user profile:", error);
				}
			}
		};

		fetchUserProfile();
	}, [session]);

	const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const handleSignOut = async () => {
		await signOut();
		handleClose();
	};

	const menuItems = [
		{ text: "Dashboard", icon: <DashboardIcon />, path: "/" },
		{ text: "Tasks", icon: <AssignmentIcon />, path: "/tasks" },
		{ text: "Profile", icon: <PersonIcon />, path: "/profile" },
		{ text: "FAQ", icon: <HelpIcon />, path: "/faq" },
		{ text: "Feedback", icon: <FeedbackIcon />, path: "/feedback" },
	];

	const drawer = (
		<Box sx={{ width: 250 }}>
			{session && (
				<Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
					<Avatar
						src={userProfile?.avatar || undefined}
						sx={{ mr: 2 }}>
						{userProfile?.name?.[0] || session.user?.name?.[0]}
					</Avatar>
					<Typography variant="subtitle1">
						{userProfile?.name || session.user?.name}
					</Typography>
				</Box>
			)}
			<Divider />
			<List>
				{menuItems.map((item) => (
					<ListItem
						button
						key={item.text}
						onClick={() => {
							router.push(item.path);
							if (isMobile) handleDrawerToggle();
						}}>
						<ListItemIcon>{item.icon}</ListItemIcon>
						<ListItemText primary={item.text} />
					</ListItem>
				))}
				<Divider />
				<ListItem
					button
					onClick={() => {
						setSettingsOpen(true);
						if (isMobile) handleDrawerToggle();
					}}>
					<ListItemIcon>
						<SettingsIcon />
					</ListItemIcon>
					<ListItemText primary="Settings" />
				</ListItem>
				<ListItem
					button
					onClick={handleSignOut}>
					<ListItemIcon>
						<ExitToAppIcon />
					</ListItemIcon>
					<ListItemText primary="Sign Out" />
				</ListItem>
			</List>
		</Box>
	);

	return (
		<>
			<AppBar position="static">
				<Toolbar>
					{session && (
						<IconButton
							color="inherit"
							aria-label="open drawer"
							edge="start"
							onClick={handleDrawerToggle}
							sx={{ mr: 2, display: { md: "none" } }}>
							<MenuIcon />
						</IconButton>
					)}

					<Typography
						variant="h6"
						component={Link}
						href="/"
						sx={{
							flexGrow: 1,
							textDecoration: "none",
							color: "inherit",
							fontWeight: 700,
						}}>
						MyDo
					</Typography>

					{session ? (
						<Box sx={{ display: "flex", alignItems: "center" }}>
							{!isMobile && (
								<Box sx={{ display: "flex", gap: 1, mr: 2 }}>
									{menuItems.slice(0, 2).map((item) => (
										<Button
											key={item.text}
											color="inherit"
											startIcon={item.icon}
											component={Link}
											href={item.path}>
											{item.text}
										</Button>
									))}
								</Box>
							)}

							<Notifications />

							<IconButton
								onClick={handleMenu}
								color="inherit">
								<Avatar
									src={userProfile?.avatar || undefined}
									sx={{ width: 32, height: 32 }}>
									{userProfile?.name?.[0] || session.user?.name?.[0]}
								</Avatar>
							</IconButton>

							<Menu
								anchorEl={anchorEl}
								open={Boolean(anchorEl)}
								onClose={handleClose}>
								<MenuItem
									onClick={() => {
										router.push("/profile");
										handleClose();
									}}>
									Profile
								</MenuItem>
								<MenuItem
									onClick={() => {
										setSettingsOpen(true);
										handleClose();
									}}>
									Settings
								</MenuItem>
								<MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
							</Menu>
						</Box>
					) : (
						<Box>
							<Button
								color="inherit"
								component={Link}
								href="/login">
								Sign In
							</Button>
							<Button
								color="inherit"
								component={Link}
								href="/register">
								Sign Up
							</Button>
						</Box>
					)}
				</Toolbar>
			</AppBar>

			{session && (
				<Drawer
					variant={isMobile ? "temporary" : "permanent"}
					open={isMobile ? mobileOpen : true}
					onClose={handleDrawerToggle}
					ModalProps={{
						keepMounted: true, // Better mobile performance
					}}
					sx={{
						display: { xs: "block", md: "none" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: 250,
						},
					}}>
					{drawer}
				</Drawer>
			)}

			<Settings
				open={settingsOpen}
				onClose={() => setSettingsOpen(false)}
			/>
		</>
	);
}
