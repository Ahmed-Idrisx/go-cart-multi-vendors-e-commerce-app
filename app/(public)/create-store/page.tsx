import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import CreateStore from "../../../components/CreateStore";
import { redirect } from "next/navigation";

export default async function CreateStorePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  let status: string = "not registered";

  const store = await prisma.store.findFirst({
    where: { userId },
  });

  if (store) {
    status = store.status;
  }

  return <CreateStore initialStatus={status} />;
}
