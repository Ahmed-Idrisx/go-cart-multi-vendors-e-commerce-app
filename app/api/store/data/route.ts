import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Get store info and products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username")?.toLocaleLowerCase();

    if (!username) {
      return NextResponse.json({ error: "Missing Username" }, { status: 400 });
    }
    // get store info and inStock products with ratings
    const store = await prisma.store.findFirst({
      where: {
        username: username,
        isActive: true,
      },
      include: {
        Product: {
          include: {
            rating: true,
          },
        },
      },
    });
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    return NextResponse.json({ store });
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
