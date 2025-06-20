"use client";

import { useState, useEffect } from "react";
import {
	Badge,
	IconButton,
	Menu,
	MenuItem,
	Typography,
	Box,
	List,
	ListItem,
	ListItemText,
	Divider,
} from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { useSession } from "next-auth/react";

interface Notification {
	id: string;
	title: string;
	message: string;
	createdAt: string;
	isRead: boolean;
}

export default function Notifications() {
	const { data: session } = useSession();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		if (session?.user?.email) {
			fetchNotifications();
		}
	}, [session]);

	const fetchNotifications = async () => {
		try {
			const response = await fetch("/api/notifications");
			const data = await response.json();
			setNotifications(data);
			setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
		} catch (error) {
			console.error("Error fetching notifications:", error);
		}
	};

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleNotificationClick = async (notificationId: string) => {
		try {
			await fetch(`/api/notifications/${notificationId}`, {
				method: "PATCH",
			});
			fetchNotifications();
		} catch (error) {
			console.error("Error marking notification as read:", error);
		}
	};

	return (
		<>
			<IconButton
				color="inherit"
				onClick={handleClick}
				sx={{ ml: 2 }}>
				<Badge
					badgeContent={unreadCount}
					color="error">
					<NotificationsIcon />
				</Badge>
			</IconButton>

			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleClose}
				PaperProps={{
					sx: { width: 360, maxHeight: 400 },
				}}>
				<Box sx={{ p: 2 }}>
					<Typography variant="h6">Notifications</Typography>
				</Box>
				<Divider />
				<List sx={{ p: 0 }}>
					{notifications.length === 0 ? (
						<ListItem>
							<ListItemText
								primary="No notifications"
								sx={{ textAlign: "center" }}
							/>
						</ListItem>
					) : (
						notifications.map((notification) => (
							<ListItem
								key={notification.id}
								button
								onClick={() => handleNotificationClick(notification.id)}
								sx={{
									bgcolor: notification.isRead ? "inherit" : "action.hover",
								}}>
								<ListItemText
									primary={notification.title}
									secondary={
										<>
											<Typography
												component="span"
												variant="body2"
												color="text.primary">
												{notification.message}
											</Typography>
											<br />
											<Typography
												component="span"
												variant="caption"
												color="text.secondary">
												{new Date(notification.createdAt).toLocaleString()}
											</Typography>
										</>
									}
								/>
							</ListItem>
						))
					)}
				</List>
			</Menu>
		</>
	);
}
