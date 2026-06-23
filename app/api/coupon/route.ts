import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

interface VerifyCouponBody {
  code: string;
}

// verify coupon
export async function POST(request: NextRequest) {
  try {
    const { userId, has } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { code } = (await request.json()) as VerifyCouponBody;

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 },
      );
    }

    // Find the coupon by code (case-insensitive)
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: {
          equals: code.toUpperCase(),
          mode: "insensitive",
          // expiresAt: { gt: new Data() },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 404 },
      );
    }

    // Check if coupon has expired
    if (coupon.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Coupon has expired" },
        { status: 400 },
      );
    }

    if (coupon.forNewUser) {
      const userOrders = await prisma.order.findMany({
        where: { userId: userId },
      });
      if (userOrders.length > 0) {
        return NextResponse.json(
          { error: "Coupon valid for new users" },
          { status: 400 },
        );
      }
    }
    if (coupon.forMember) {
      const hasPlusPlan = has({ plan: "plus" });
      if (!hasPlusPlan) {
        return NextResponse.json(
          { error: "Coupon valid for Members only" },
          { status: 400 },
        );
      }
    }

    // Return coupon details
    return NextResponse.json({ coupon });
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
