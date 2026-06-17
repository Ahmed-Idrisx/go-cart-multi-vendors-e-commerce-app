"use client";

import { getStore } from "@/store/store";
import { Provider } from "react-redux";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={getStore()}>{children}</Provider>;
}
