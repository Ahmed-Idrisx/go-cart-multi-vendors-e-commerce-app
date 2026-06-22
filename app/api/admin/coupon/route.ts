import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { auth } from "@clerk/nextjs/server";
import type { Coupon } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface AddCouponBody {
  coupon: Coupon;
}

// Add new coupon
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const isAdmin = await authAdmin(userId as string);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { coupon } = (await request.json()) as AddCouponBody;
    coupon.code = coupon.code.toUpperCase();

    await prisma.coupon
      .create({
        data: coupon,
      })
      .then(async (coupon) => {
        // Run Inngest Scheduler Function to delete coupon on expire
        await inngest.send({
          name: "app/coupon.expired",
          data: {
            code: coupon.code,
            expires_at: coupon.expiresAt,
          },
        });
      });

    return NextResponse.json({ message: "coupon added successfully" });
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

// Delete coupon /api/admin/coupon?code=couponCode
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    const isAdmin = await authAdmin(userId as string);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "missing code" }, { status: 400 });
    }

    await prisma.coupon.delete({
      where: { code },
    });

    return NextResponse.json({ message: "coupon deleted successfully" });
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

// Get All Coupons
export async function GET() {
  try {
    const { userId } = await auth();
    const isAdmin = await authAdmin(userId as string);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ coupons });
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
