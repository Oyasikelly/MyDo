import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "MyDo - Task Management Made Simple",
	description: "A modern task management application with powerful features",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			className={inter.variable}>
			<head>
				<link
					rel="preconnect"
					href="https://fonts.googleapis.com"
				/>
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin=""
				/>
			</head>
			<body className={inter.className}>
				<AuthProvider>
					<ThemeProvider>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								minHeight: "100vh",
							}}>
							<Navigation />
							<main style={{ flex: 1 }}>{children}</main>
							<Footer />
						</div>
					</ThemeProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
