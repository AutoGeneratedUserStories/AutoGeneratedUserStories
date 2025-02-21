import connectDB from "@/app/lib/connectDB";

export async function register() {
    await connectDB();
    console.log("✓ Connected to MongoDB");
}