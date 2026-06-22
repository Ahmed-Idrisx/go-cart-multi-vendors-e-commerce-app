import imagekit from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// add a new product to the store
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const storeId = await authSeller(userId as string);
    if (!storeId) {
      return NextResponse.json(
        { error: "You are not authorized to add products" },
        { status: 401 },
      );
    }
    // get data from formData
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const mrp = Number(formData.get("mrp"));
    const price = Number(formData.get("price"));
    const category = formData.get("category") as string;
    const images = formData.getAll("images") as File[];

    if (
      !name ||
      !description ||
      !mrp ||
      !price ||
      !category ||
      images.length < 1
    ) {
      return NextResponse.json(
        { error: "Missing Product Details. All fields are required" },
        { status: 400 },
      );
    }

    // upload images to imagekit
    const imagesUrl = await Promise.all(
      images.map(async (image) => {
        const buffer = Buffer.from(await image.arrayBuffer());
        // upload buffer to ImageKit
        const response = await imagekit.upload({
          file: buffer,
          fileName: image.name,
          folder: "products",
        });

        const url = imagekit.url({
          path: response.filePath,
          transformation: [
            { quality: "auto" },
            { format: "webp" },
            { width: "1024" },
          ],
        });
        return url;
      }),
    );

    await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        category,
        images: imagesUrl,
        storeId,
      },
    });

    return NextResponse.json({ message: "Product added successfully" });
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

// get all products of the seller

export async function GET() {
  try {
    const { userId } = await auth();
    const storeId = await authSeller(userId as string);
    if (!storeId) {
      return NextResponse.json(
        { error: "You are not authorized to view products" },
        { status: 401 },
      );
    }
    const products = await prisma.product.findMany({
      where: {
        storeId,
      },
    });
    return NextResponse.json({ products });
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
