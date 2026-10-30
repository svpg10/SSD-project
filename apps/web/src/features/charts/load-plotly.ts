import type * as Plotly from "plotly.js";
declare global {
  interface Window {
    Plotly?: typeof Plotly;
  }
}
let pending: Promise<typeof Plotly> | undefined;
export function loadPlotly(): Promise<typeof Plotly> {
  if (window.Plotly) return Promise.resolve(window.Plotly);
  if (!pending)
    pending = new Promise<typeof Plotly>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/vendor/plotly-strict.min.js";
      script.async = true;
      const nonce =
        document.querySelector<HTMLScriptElement>("script[nonce]")?.nonce;
      if (nonce) script.nonce = nonce;
      const timer = setTimeout(() => {
        script.remove();
        pending = undefined;
        reject(new Error("Plotly load timeout"));
      }, 20000);
      script.onload = () => {
        clearTimeout(timer);
        if (window.Plotly) resolve(window.Plotly);
        else {
          pending = undefined;
          reject(new Error("Plotly unavailable"));
        }
      };
      script.onerror = () => {
        clearTimeout(timer);
        script.remove();
        pending = undefined;
        reject(new Error("Plotly asset could not load"));
      };
      document.head.append(script);
    });
  return pending;
}
