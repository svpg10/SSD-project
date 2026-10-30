import type { Metadata } from "next";
export const metadata: Metadata = { title: "Parameter library" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
