import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Auth Seller
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "you are not authorized" },
        { status: 401 },
      );
    }
    const isSeller = await authSeller(userId as string);
    if (!isSeller) {
      return NextResponse.json(
        { error: "You are not authorized to view this page" },
        { status: 401 },
      );
    }
    const storeInfo = await prisma.store.findUnique({
      where: {
        userId: userId,
      },
    });

    return NextResponse.json({ isSeller, storeInfo });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code: string }).code
        : undefined;
    return NextResponse.json({ error: code || message }, { status: 400 });
  }
}
