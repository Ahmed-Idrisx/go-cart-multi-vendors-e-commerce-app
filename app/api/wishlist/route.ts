import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

interface ToggleWishlistBody {
  productId: string;
}

// Toggle product in/out of wishlist
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = (await request.json()) as ToggleWishlistBody;

    if (!productId) {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const wishlist = (user.wishlist as Record<string, boolean>) ?? {};

    const isAlreadyInWishlist = Boolean(wishlist[productId]);

    if (isAlreadyInWishlist) {
      delete wishlist[productId];
    } else {
      wishlist[productId] = true;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { wishlist },
    });

    return NextResponse.json({
      message: isAlreadyInWishlist
        ? "Removed from wishlist"
        : "Added to wishlist",
      inWishlist: !isAlreadyInWishlist,
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

//Get the user's wishlist
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ wishlist: user.wishlist });
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
