import {green, bold} from "picocolors";
import connectDB from "@/app/lib/connectDB";

export async function register() {
    await connectDB();
    console.log(" " + green(bold('✓')) +" Connected to MongoDB");
}