import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import type { Address } from "@prisma/client";

interface AddAddressBody {
  address: Omit<Address, "id" | "userId"> & { userId?: string };
}

// add new address
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { address } = (await request.json()) as AddAddressBody;
    if (!address) {
      return NextResponse.json({ error: "address not valid" }, { status: 400 });
    }
    address.userId = userId;

    const newAddress = await prisma.address.create({
      data: address as Address,
    });
    return NextResponse.json({
      newAddress,
      message: "Address added successfully",
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

// get all addresses for a user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
    });
    return NextResponse.json({ addresses });
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
