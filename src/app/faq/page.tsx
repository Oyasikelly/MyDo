"use client";

import {
	Container,
	Typography,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const faqs = [
	{
		question: "What is MyDo?",
		answer:
			"MyDo is a modern task management application that helps you organize your daily activities, set reminders, and track your progress. With features like task categorization, recurring tasks, and notifications, MyDo makes it easy to stay on top of your responsibilities.",
	},
	{
		question: "How do I create a new task?",
		answer:
			"To create a new task, click the '+' button in the bottom right corner of your dashboard. Fill in the task details including title, description, priority, due date, and set up recurring options if needed. Click 'Save' to add the task to your list.",
	},
	{
		question: "Can I set recurring tasks?",
		answer:
			"Yes! When creating or editing a task, you can enable the recurring option and set the frequency (daily, weekly, monthly) and interval. MyDo will automatically create new instances of the task based on your settings.",
	},
	{
		question: "How do notifications work?",
		answer:
			"MyDo offers both email and push notifications. You can enable/disable these in your settings. You'll receive notifications for upcoming tasks, due dates, and important updates. The notification timing can be customized to your preferences.",
	},
	{
		question: "Can I customize the appearance?",
		answer:
			"Absolutely! MyDo offers various customization options including dark/light mode and different color schemes. You can adjust these settings by clicking the settings icon in the navigation bar.",
	},
	{
		question: "Is my data secure?",
		answer:
			"Yes, we take security seriously. All data is encrypted, and we use secure authentication methods to protect your account. Your tasks and personal information are only accessible to you.",
	},
	{
		question: "How do I share tasks with others?",
		answer:
			"Currently, task sharing is in development. Soon, you'll be able to collaborate with team members, family, or friends by sharing tasks and creating shared project spaces.",
	},
	{
		question: "What if I need help?",
		answer:
			"We're here to help! You can reach out through our feedback form, check our documentation, or contact support. We typically respond within 24 hours.",
	},
];

export default function FAQ() {
	return (
		<Container
			maxWidth="md"
			sx={{ py: 4 }}>
			<Box
				textAlign="center"
				mb={4}>
				<Typography
					variant="h3"
					component="h1"
					gutterBottom>
					Frequently Asked Questions
				</Typography>
				<Typography
					variant="subtitle1"
					color="text.secondary">
					Find answers to common questions about MyDo
				</Typography>
			</Box>

			<Box>
				{faqs.map((faq, index) => (
					<Accordion key={index}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Typography variant="h6">{faq.question}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Typography>{faq.answer}</Typography>
						</AccordionDetails>
					</Accordion>
				))}
			</Box>
		</Container>
	);
}
