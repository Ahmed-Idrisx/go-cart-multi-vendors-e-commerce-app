import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// get all approved stores
export async function GET() {
  try {
    const { userId } = await auth();
    const isAdmin = await authAdmin(userId as string);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const stores = await prisma.store.findMany({
      where: { status: "approved" },
      include: { user: true },
    });
    return NextResponse.json({ stores });
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
