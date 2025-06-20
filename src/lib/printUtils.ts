import React from "react";
import { renderToString } from "react-dom/server";
import PrintableTasks from "@/components/PrintableTasks";
import { Task } from "@prisma/client";

interface UserProfile {
	name: string;
	email: string;
}

export const printTasks = (tasks: Task[], userProfile: UserProfile) => {
	// Create the printable component
	const printContent = React.createElement(PrintableTasks, {
		tasks,
		userProfile,
		printDate: new Date(),
	});

	// Convert to HTML string
	const htmlContent = renderToString(printContent);

	// Create a new window for printing
	const printWindow = window.open("", "_blank");
	if (!printWindow) {
		alert("Please allow pop-ups to print your tasks");
		return;
	}

	// Write the complete HTML document
	printWindow.document.write(`
		<!DOCTYPE html>
		<html>
		<head>
			<title>MyDo - Task Report</title>
			<meta charset="utf-8">
			<style>
				@media print {
					body { 
						margin: 0; 
						padding: 20px;
						font-family: Arial, sans-serif;
					}
					.no-print { display: none !important; }
					@page {
						margin: 1in;
						size: A4;
					}
				}
				@media screen {
					body {
						font-family: Arial, sans-serif;
						margin: 20px;
						background-color: #f5f5f5;
					}
					.print-container {
						background-color: white;
						padding: 20px;
						border-radius: 8px;
						box-shadow: 0 2px 10px rgba(0,0,0,0.1);
						max-width: 800px;
						margin: 0 auto;
					}
				}
			</style>
		</head>
		<body>
			<div class="print-container">
				${htmlContent}
			</div>
			<div class="no-print" style="text-align: center; margin-top: 20px;">
				<button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background-color: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
					Print Report
				</button>
				<button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; background-color: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
					Close
				</button>
			</div>
			<script>
				// Auto-print when the page loads
				window.onload = function() {
					// Small delay to ensure styles are loaded
					setTimeout(function() {
						window.print();
					}, 500);
				};
				
				// Close window after printing
				window.onafterprint = function() {
					// Don't auto-close, let user decide
				};
			</script>
		</body>
		</html>
	`);

	printWindow.document.close();
};
