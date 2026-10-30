"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { Capabilities, Registry, Result } from "@/lib/api/types";
import { retainSnapshot, runGuard } from "./state";
export type Draft = Record<string, string>;
export const emptyDraft: Draft = {
  material: "polysilicon",
  temperature: "675",
  temperatureUnit: "degC",
  kinetics: "direct",
  ks: "",
  ksUnit: "m/s",
  A: "",
  AUnit: "m/s",
  Ea: "",
  EaUnit: "kJ/mol",
  hg: "",
  hgUnit: "m/s",
  concentration: "direct",
  Cg: "",
  pressure: "",
  pressureUnit: "Pa",
  y: "",
  Tg: "",
  beta: "",
  duration: "",
  durationUnit: "s",
  processPressure: "",
  processPressureUnit: "Pa",
  flow: "",
  flowT: "",
  flowP: "",
  flowPUnit: "Pa",
  gasLabel: "",
  sweep: "on",
  start: "600",
  stop: "750",
  count: "151",
  spatial: "off",
  radius: "",
  edge: "0",
  nr: "64",
  ntheta: "64",
  deltaT: "0",
  aC: "0",
  ah: "0",
  notes: "",
};
export const demoDraft: Draft = {
  ...emptyDraft,
  material: "synthetic",
  temperature: "650",
  ks: "2",
  A: "2",
  Ea: "50",
  hg: "3",
  Cg: "5",
  beta: "0.01",
  duration: "2",
  radius: "100",
  notes:
    "ARBITRARY MATHEMATICAL FIXTURE. Nonphysical magnitudes; not material/process data.",
};
type Context = {
  draft: Draft;
  setDraft: (value: Draft) => void;
  cap: Capabilities | null;
  registry: Registry | null;
  apiError: string;
  reload: () => void;
  saved: Result[];
  save: (r: Result) => void;
  replace: React.Dispatch<React.SetStateAction<Result[]>>;
  remove: (id: string) => void;
  last: Result | null;
  beginRun: () => number;
  acceptRun: (ticket: number, r: Result, key: string) => void;
  lastKey: string;
  theme: string;
  toggleTheme: () => void;
};
const Studio = createContext<Context | null>(null);
export function StudioProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState(emptyDraft),
    [cap, setCap] = useState<Capabilities | null>(null),
    [registry, setRegistry] = useState<Registry | null>(null),
    [apiError, setApiError] = useState(""),
    [revision, setRevision] = useState(0),
    [saved, setSaved] = useState<Result[]>([]),
    [last, setLast] = useState<Result | null>(null),
    [lastKey, setLastKey] = useState(""),
    [theme, setTheme] = useState("light");
  const guard = useRef(runGuard());
  useEffect(() => {
    const controller = new AbortController();
    Promise.all(
      ["/api/v1/capabilities", "/api/v1/parameters"].map(async (path) => {
        const r = await fetch(path, { signal: controller.signal });
        if (!r.ok)
          throw new Error(
            "Scientific service unavailable. Start the local backend and retry.",
          );
        return r.json();
      }),
    )
      .then(([c, r]) => {
        setCap(c);
        setRegistry(r);
        setApiError("");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setApiError(e.message);
      });
    return () => controller.abort();
  }, [revision]);
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
  };
  return (
    <Studio.Provider
      value={{
        draft,
        setDraft,
        cap,
        registry,
        apiError,
        reload: () => setRevision((x) => x + 1),
        saved,
        save: (r) => setSaved((s) => retainSnapshot(s, r)),
        replace: setSaved,
        remove: (id) => setSaved((s) => s.filter((r) => r.run_id !== id)),
        last,
        lastKey,
        beginRun: () => guard.current.begin(),
        acceptRun: (ticket, r, key) => {
          if (guard.current.current(ticket)) {
            setLast(r);
            setLastKey(key);
          }
        },
        theme,
        toggleTheme,
      }}
    >
      {children}
    </Studio.Provider>
  );
}
export function useStudio() {
  const value = useContext(Studio);
  if (!value) throw new Error("Missing studio provider");
  return value;
}
