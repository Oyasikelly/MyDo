require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

// Use DATABASE_URL from .env file
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.log("❌ DATABASE_URL not found in .env file");
	process.exit(1);
}

console.log("=== Testing with .env DATABASE_URL ===");
console.log(
	"Testing connection to:",
	DATABASE_URL.replace(/:[^:@]*@/, ":****@")
);

// Create Prisma client with DATABASE_URL from .env
const prisma = new PrismaClient();

async function testConnection() {
	try {
		console.log("Attempting to connect...");
		await prisma.$connect();
		console.log("✅ Database connection successful!");

		// Test a simple query
		console.log("Testing a simple query...");
		const result = await prisma.$queryRaw`SELECT 1 as test`;
		console.log("✅ Query test successful:", result);
	} catch (error) {
		console.log("❌ Database connection failed:");
		console.log("Error:", error.message);
		console.log("Error code:", error.code);
		console.log("Full error:", error);
	} finally {
		await prisma.$disconnect();
	}
}

testConnection();
