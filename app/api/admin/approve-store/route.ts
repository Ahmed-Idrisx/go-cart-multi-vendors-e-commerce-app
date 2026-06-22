import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type StoreApprovalStatus = "approved" | "rejected";

interface UpdateStoreStatusBody {
  storeId: string;
  status: StoreApprovalStatus;
}

// Approve / Reject Seller
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const isAdmin = await authAdmin(userId as string);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { storeId, status } = (await request.json()) as UpdateStoreStatusBody;

    if (status === "approved") {
      await prisma.store.update({
        where: { id: storeId },
        data: { status: "approved", isActive: true },
      });
    } else if (status === "rejected") {
      await prisma.store.update({
        where: { id: storeId },
        data: { status: "rejected" },
      });
    }
    return NextResponse.json({ message: `${status} successfully` });
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

// get all pending and rejected stores
export async function GET() {
  try {
    const { userId } = await auth();
    const isAdmin = await authAdmin(userId as string);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const stores = await prisma.store.findMany({
      where: { status: { in: ["pending", "rejected"] } },
      include: { user: true },
    });
    return NextResponse.json(stores);
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
