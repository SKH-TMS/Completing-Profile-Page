import { NextResponse } from "next/server";
import { getToken, verifyToken } from "../../../../utils/token";
import { MongoClient } from "mongodb";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";
const uri = process.env.MONGODB_URI!;
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = global._mongoClientPromise;
}

async function getDatabase() {
  const client = await clientPromise;
  return client.db("team_manager_db");
}

export async function POST(req: Request) {
  try {
    console.log("🔍 Token verification started...");

    await connectToDatabase(); // Connect to MongoDB using Mongoose

    const token = getToken(req); // Extract token from request

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "No token provided",
        },
        { status: 401 }
      );
    }
    // Verify and decode the token
    const decodedUser = verifyToken(token);

    if (!decodedUser || !decodedUser.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 403 }
      );
    }
    const user = await User.findOne({ email: decodedUser.email });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }
    let userType = "User";
    return NextResponse.json({
      success: true,
      message: "Token valid",
      user: {
        email: user.email,
        firstName: user.firstname,
        lastName: user.lastname,
        profilePic: user.profilepic || "/default-profile.png", // Ensure consistency across APIs
        contact: user.contact || "",
        userType,
      },
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({
      success: false,
      message: "Error verifying token",
    });
  }
}
