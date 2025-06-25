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

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

async function registerPushNotifications(vapidPublicKey: string) {
	if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
	try {
		await navigator.serviceWorker.register("/sw.js");
		const registration = await navigator.serviceWorker.ready;

		const permission = await Notification.requestPermission();
		if (permission !== "granted") return;
		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
		});
		await fetch("/api/notifications/subscribe", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(subscription),
		});
	} catch (err) {
		console.error("Push registration failed:", err);
	}
}

function urlBase64ToUint8Array(base64String: string) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

export default function Notifications() {
	const { data: session } = useSession();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [cookieConsent, setCookieConsent] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		return document.cookie.includes("cookie_consent=true");
	});

	useEffect(() => {
		if (session?.user?.email) {
			fetchNotifications();
			if (cookieConsent) {
				registerPushNotifications(VAPID_PUBLIC_KEY);
			}
		}
	}, [session, cookieConsent]);

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

	const handleAcceptCookies = () => {
		document.cookie = "cookie_consent=true; path=/; max-age=31536000";
		setCookieConsent(true);
	};

	return (
		<>
			{/* Cookie Consent Banner */}
			{!cookieConsent && (
				<div
					style={{
						position: "fixed",
						bottom: 0,
						left: 0,
						width: "100%",
						background: "#222",
						color: "#fff",
						padding: "1rem",
						zIndex: 2000,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}>
					<span style={{ marginRight: "1rem" }}>
						We use cookies to enhance your experience. By accepting, you enable
						notifications and the best features of this app.
					</span>
					<button
						style={{
							background: "#4caf50",
							color: "#fff",
							border: "none",
							padding: "0.5rem 1rem",
							borderRadius: 4,
							cursor: "pointer",
						}}
						onClick={handleAcceptCookies}>
						Accept
					</button>
				</div>
			)}
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
