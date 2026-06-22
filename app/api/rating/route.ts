import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

interface AddRatingBody {
  orderId: string;
  productId: string;
  rating: number;
  review: string;
}

// Add new rating
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { orderId, productId, rating, review } =
      (await request.json()) as AddRatingBody;
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: userId as string },
    });
    if (!order) {
      return NextResponse.json({ error: "Order Not Found" }, { status: 404 });
    }
    const isAlreadyRated = await prisma.rating.findFirst({
      where: { productId, orderId },
    });
    if (isAlreadyRated) {
      return NextResponse.json(
        { error: "Product Already Rated" },
        { status: 404 },
      );
    }
    const response = await prisma.rating.create({
      data: { userId: userId as string, orderId, productId, rating, review },
    });
    return NextResponse.json({
      message: "Rating added successfully",
      rating: response,
    });
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

// get all rating for a user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 404 });
    }
    const ratings = await prisma.rating.findMany({
      where: { userId },
    });
    return NextResponse.json({ ratings });
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
