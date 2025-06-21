require("dotenv").config();

console.log("=== Environment Variables Test ===");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL ? "Set" : "Not set");
console.log(
	"NEXTAUTH_SECRET:",
	process.env.NEXTAUTH_SECRET ? "Set" : "Not set"
);

if (process.env.DATABASE_URL) {
	console.log("\n=== Database Connection Test ===");
	const { PrismaClient } = require("@prisma/client");

	const prisma = new PrismaClient();

	prisma
		.$connect()
		.then(() => {
			console.log("✅ Database connection successful!");
			return prisma.$disconnect();
		})
		.catch((error) => {
			console.log("❌ Database connection failed:");
			console.log("Error:", error.message);
			return prisma.$disconnect();
		});
} else {
	console.log("❌ DATABASE_URL not found in environment variables");
}
