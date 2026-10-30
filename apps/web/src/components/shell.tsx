"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SlidersHorizontal,
  ChartNoAxesCombined,
  Library,
  BookOpen,
  Info,
  Moon,
  Sun,
  ArrowUpRight,
  Layers3,
} from "lucide-react";
import { useStudio } from "@/features/projects/store";
import { Button } from "./ui/button";
const links = [
  ["/workbench", "Workbench", SlidersHorizontal],
  ["/compare", "Compare studies", ChartNoAxesCombined],
  ["/parameters", "Parameter library", Library],
  ["/learn", "Learn the model", BookOpen],
  ["/about/model", "Model & assumptions", Info],
] as const;
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { theme, toggleTheme } = useStudio();
  const landing = path === "/";
  return (
    <>
      <a href="#main" className="skip">
        Skip to content
      </a>
      <header className={`topbar ${landing ? "landing-topbar" : ""}`}>
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Layers3 size={22} />
          </span>
          CVD<span>Studio</span>
        </Link>
        {landing ? (
          <nav className="marketing-nav" aria-label="Main navigation">
            <Link href="/workbench">The studio</Link>
            <Link href="/learn">The science</Link>
            <Link href="/parameters">Materials</Link>
          </nav>
        ) : (
          <span className="top-caption">
            WORKSPACE <span>/</span>{" "}
            {links.find(([href]) => href === path)?.[1] || "CVD STUDIO"}
          </span>
        )}
        <div className="top-actions">
          <span className="version">PS-64 / v1</span>
          <Button
            variant="ghost"
            onClick={toggleTheme}
            aria-label={`Use ${theme === "light" ? "dark" : "light"} theme`}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
          {landing && (
            <Link className="button primary nav-cta" href="/workbench">
              Open studio <ArrowUpRight size={16} />
            </Link>
          )}
        </div>
      </header>
      {landing ? (
        <main id="main" tabIndex={-1} className="landing-main">
          {children}
        </main>
      ) : (
        <div className="app-frame">
          <aside className="sidebar">
            <Link href="/" className="sidebar-home">
              <Layers3 size={20} />
              <span>
                THE STUDIO<small>Thin-film exploration</small>
              </span>
            </Link>
            <div className="nav-label">YOUR WORKSPACE</div>
            <nav aria-label="Main navigation">
              {links.map(([href, label, Icon]) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={path === href ? "page" : undefined}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
            <div className="sidebar-specimen" aria-hidden="true">
              <div className="sidebar-wafer" />
              <span>
                SILICON / Si<small>Materials in perspective.</small>
              </span>
            </div>
            <div className="sidebar-note">
              <span className="status-dot" />
              <strong>Local workspace</strong>
              <p>
                Studies stay in this tab.
                <br />
                Download a project to keep your work.
              </p>
            </div>
            <div className="sidebar-bottom">
              <span>PS-64 · LPCVD</span>
              <small>Experimental validation pending</small>
            </div>
          </aside>
          <main id="main" tabIndex={-1}>
            {children}
          </main>
        </div>
      )}
    </>
  );
}
