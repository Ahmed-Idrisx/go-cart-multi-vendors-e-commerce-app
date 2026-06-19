import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
  title: "GoCart. - Store Dashboard",
  description: "GoCart. - Store Dashboard",
};

export default function RootAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <StoreLayout>{children}</StoreLayout>
    </>
  );
}
