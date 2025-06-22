"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Snackbar, Alert, Button } from "@mui/material";
import { Wifi, WifiOff } from "@mui/icons-material";

export default function OnlineStatusDetector({
	children,
}: {
	children?: React.ReactNode;
}) {
	const { data: session } = useSession();
	const [isOnline, setIsOnline] = useState(true);
	const [wasOffline, setWasOffline] = useState(false);
	const [showNotification, setShowNotification] = useState(false);
	const [notificationMessage, setNotificationMessage] = useState("");

	useEffect(() => {
		// Register service worker
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker
				.register("/sw.js")
				.then((registration) => {
					console.log("Service Worker registered successfully:", registration);
				})
				.catch((error) => {
					console.log("Service Worker registration failed:", error);
				});
		}

		setIsOnline(navigator.onLine);

		const handleOnline = () => {
			setIsOnline(true);
			if (wasOffline && session?.user?.email) {
				handleBackOnline();
			}
		};

		const handleOffline = () => {
			setIsOnline(false);
			setWasOffline(true);
		};

		// Handle service worker messages
		const handleServiceWorkerMessage = (event: MessageEvent) => {
			if (event.data && event.data.type === "ONLINE_STATUS") {
				setIsOnline(event.data.isOnline);
				if (event.data.isOnline && wasOffline && session?.user?.email) {
					handleBackOnline();
				}
			}
		};

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);
		navigator.serviceWorker?.addEventListener(
			"message",
			handleServiceWorkerMessage
		);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
			navigator.serviceWorker?.removeEventListener(
				"message",
				handleServiceWorkerMessage
			);
		};
	}, [wasOffline, session]);

	const handleBackOnline = async () => {
		try {
			const response = await fetch("/api/notifications/check-missed", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});

			if (response.ok) {
				const data = await response.json();
				if (data.hasUpdates) {
					setNotificationMessage(
						`Welcome back! You have ${data.unreadCount} new notifications and ${data.pendingTasks} tasks due soon.`
					);
				} else {
					setNotificationMessage("You're back online! All caught up.");
				}
				setShowNotification(true);
			}
		} catch (error) {
			setNotificationMessage("You're back online!");
			setShowNotification(true);
		}
	};

	return (
		<>
			{/* Online/Offline indicator - positioned to avoid logo and navigation */}
			<div
				style={{
					position: "fixed",
					top: "80px", // Below the navigation bar
					right: "20px",
					zIndex: 1000,
					display: "flex",
					alignItems: "center",
					gap: "6px",
					padding: "6px 10px",
					borderRadius: "16px",
					backgroundColor: isOnline
						? "rgba(76, 175, 80, 0.9)"
						: "rgba(244, 67, 54, 0.9)",
					color: "white",
					fontSize: "11px",
					fontWeight: 500,
					backdropFilter: "blur(10px)",
					boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
					transition: "all 0.3s ease",
					border: "1px solid rgba(255,255,255,0.2)",
					pointerEvents: "none", // Prevents interference with other elements
				}}>
				{isOnline ? <Wifi fontSize="small" /> : <WifiOff fontSize="small" />}
				<span style={{ fontSize: "10px" }}>
					{isOnline ? "Online" : "Offline"}
				</span>
			</div>

			<Snackbar
				open={showNotification}
				autoHideDuration={6000}
				onClose={() => setShowNotification(false)}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}>
				<Alert
					onClose={() => setShowNotification(false)}
					severity="info"
					action={
						<Button
							color="inherit"
							size="small"
							onClick={() => window.location.reload()}>
							Refresh
						</Button>
					}
					sx={{ width: "100%" }}>
					{notificationMessage}
				</Alert>
			</Snackbar>

			{children}
		</>
	);
}
