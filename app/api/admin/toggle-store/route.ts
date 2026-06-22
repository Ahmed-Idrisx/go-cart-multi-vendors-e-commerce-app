import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

interface ToggleStoreActiveBody {
  storeId: string;
}

// toggle store isActive
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const isAdmin = await authAdmin(userId as string);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { storeId } = (await request.json()) as ToggleStoreActiveBody;

    if (!storeId) {
      return NextResponse.json({ error: "missing storeId" }, { status: 400 });
    }

    // find the store
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return NextResponse.json({ error: "store not found" }, { status: 400 });
    }

    await prisma.store.update({
      where: { id: storeId },
      data: { isActive: !store.isActive },
    });

    return NextResponse.json({ message: "store updated successfully" });
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
