import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

interface ToggleStockBody {
  productId: string;
}

// toggle stock of a product
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { productId } = (await request.json()) as ToggleStockBody;

    if (!productId) {
      return NextResponse.json(
        { error: "missing details: productId" },
        { status: 400 },
      );
    }

    const storeId = await authSeller(userId as string);

    if (!storeId) {
      return NextResponse.json(
        { error: "You are not authorized to update stock" },
        { status: 401 },
      );
    }

    // check if product exists and belongs to the store
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId: storeId,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or not owned by the store" },
        { status: 404 },
      );
    }
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        inStock: !product.inStock,
      },
    });
    return NextResponse.json({
      message: "Product stock updated successfully",
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
