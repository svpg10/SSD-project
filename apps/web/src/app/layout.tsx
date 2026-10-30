import type { Metadata } from "next";
import "@fontsource/ibm-plex-mono/400.css";
import "../styles/fonts.css";
import "./globals.css";
import "../styles/redesign.css";
import { StudioProvider } from "@/features/projects/store";
import { Shell } from "@/components/shell";
export const metadata: Metadata = {
  title: {default:"CVD Studio · Scientific workbench",template:"%s · CVD Studio"},
  icons:{icon:'/icon.svg'},
  description:
    "Explore precursor flux, deposition regimes and prescribed radial fields with transparent assumptions.",
};
export const dynamic = "force-dynamic";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StudioProvider>
          <Shell>{children}</Shell>
        </StudioProvider>
      </body>
    </html>
  );
}
