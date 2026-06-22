import prisma from "@/lib/prisma";

const authSeller = async (userId: string): Promise<string | false> => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        store: true,
      },
    });

    if (user?.store) {
      if (user.store.status === "approved") {
        return user.store.id;
      } else {
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error("Error authenticating seller:", error);
    return false;
  }
};

export default authSeller;
