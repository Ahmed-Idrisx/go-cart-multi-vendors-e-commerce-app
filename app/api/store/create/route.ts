// create the store

import imagekit from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "you are not authorized" },
        { status: 401 },
      );
    }

    // get data from formData
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const userName = formData.get("username") as string;
    const description = formData.get("description") as string;
    const email = formData.get("email") as string;
    const contact = formData.get("contact") as string;
    const address = formData.get("address") as string;
    const image = formData.get("image") as File;

    if (
      !name ||
      !userName ||
      !description ||
      !email ||
      !contact ||
      !address ||
      !image
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }
    // check if the user already registered a store
    const store = await prisma.store.findUnique({
      where: {
        userId: userId,
      },
    });
    // if store is already registered, then send status of store
    if (store) {
      return NextResponse.json({ status: store.status });
    }

    // check if the username is already taken
    const isUserNameTaken = await prisma.store.findFirst({
      where: {
        username: userName.toLowerCase(),
      },
    });
    if (isUserNameTaken) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 },
      );
    }

    // upload image to imagekit
    const buffer = Buffer.from(await image.arrayBuffer());

    const response = await imagekit.upload({
      file: buffer,
      fileName: image.name,
      folder: "logos",
    });

    const optimizesImage = imagekit.url({
      path: response.filePath,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: "512" },
      ],
    });

    const newStore = await prisma.store.create({
      data: {
        userId,
        name,
        username: userName.toLowerCase(),
        description,
        email,
        contact,
        address,
        logo: optimizesImage,
      },
    });

    // link the store to the user
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        store: { connect: { id: newStore.id } },
      },
    });
    return NextResponse.json({ message: "Applied, waiting for approval" });
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

// check if the user already has a store, if yes then send the store status, if not then send null

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "you are not authorized" },
        { status: 401 },
      );
    }
    const store = await prisma.store.findFirst({
      where: {
        userId: userId,
      },
    });
    if (store) {
      return NextResponse.json({ status: store.status });
    }
    return NextResponse.json({ status: "not registered" });
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
