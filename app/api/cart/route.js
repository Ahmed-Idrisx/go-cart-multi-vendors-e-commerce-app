import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// update user cart
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { cart } = await request.json();
    if (!cart || typeof cart !== "object") {
      return NextResponse.json(
        { error: "Invalid cart payload" },
        { status: 400 },
      );
    }
    // save the cart to the user object
    await prisma.user.update({
      where: { id: userId },
      data: { cart: cart },
    });
    return NextResponse.json({ message: "Cart Updated" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 },
    );
  }
}

// GET /cart – fetch the user's cart
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ cart: user.cart });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 },
    );
  }
}
