import { NextRequest, NextResponse } from "next/server";
import * as PrismaPkg from "@prisma/client";
import bcrypt from "bcryptjs";

// Some Prisma client builds may export differently in deployed environments.
// Resolve the constructor at runtime to avoid TypeScript import errors on build servers.
const PrismaClientCtor: any =
  (PrismaPkg as any).PrismaClient ?? (PrismaPkg as any).default;
let prisma: any = null;

export async function POST(request: NextRequest) {
  try {
    if (!PrismaClientCtor) {
      console.error(
        "Prisma client constructor not found on runtime imports",
        PrismaPkg
      );
      return NextResponse.json(
        {
          error:
            "Prisma client constructor not found (server misconfiguration)",
        },
        { status: 500 }
      );
    }

    prisma = new PrismaClientCtor();
    const { name, email, password, confirmPassword } = await request.json();

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Return success (don't send password back)
    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Emit detailed error to server logs for debugging
    console.error("Signup error:", error, {
      name: (error as any)?.name,
      code: (error as any)?.code,
      message: (error as any)?.message,
      stack: (error as any)?.stack?.toString?.(),
    });

    // Return error message for quick debugging (remove in production)
    return NextResponse.json(
      { error: (error as any)?.message || "Failed to create account" },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
