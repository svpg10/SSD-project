"use client";
import { useEffect, useRef, useState } from "react";
import type { Data, Layout, PlotlyHTMLElement } from "plotly.js";
import { useStudio } from "@/features/projects/store";
import { loadPlotly } from "./load-plotly";
export function Plot({
  data,
  title,
  xTitle,
  yTitle,
  polar = false,
}: {
  data: Data[];
  title: string;
  xTitle: string;
  yTitle: string;
  polar?: boolean;
}) {
  const el = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const { theme } = useStudio();
  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    loadPlotly()
      .then(async (Plotly) => {
        if (disposed || !el.current) return;
        const node = el.current;
        const colors = getComputedStyle(document.documentElement);
        const ink = colors.getPropertyValue('--color-text').trim(),
          grid = colors.getPropertyValue('--neutral-200').trim();
        const layout: Partial<Layout> = {
          autosize: true,
          height: 330,
          margin: { l: 72, r: 24, t: 24, b: 60 },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: {
            family: colors.getPropertyValue('--font-body').trim(),
            size: 14,
            color: ink,
          },
          xaxis: { title: { text: xTitle }, gridcolor: grid, zeroline: false },
          yaxis: { title: { text: yTitle }, gridcolor: grid, zeroline: false },
          showlegend: data.length > 1,
          legend: { orientation: "h", y: 1.16 },
          ...(polar
            ? {
                margin: { l: 24, r: 72, t: 24, b: 24 },
                polar: {
                  bgcolor: "transparent",
                  radialaxis: { visible: false },
                  angularaxis: { visible: false },
                },
                showlegend: false,
              }
            : {}),
        };
        await Plotly.newPlot(node, data, layout, {
          responsive: true,
          displayModeBar: false,
          scrollZoom: false,
        });
        if (disposed) {
          Plotly.purge(node);
          return;
        }
        const observer = new ResizeObserver(() => {
          if (
            !disposed &&
            node.isConnected &&
            node.getBoundingClientRect().width > 0
          )
            void Promise.resolve(
              Plotly.Plots.resize(node as unknown as PlotlyHTMLElement),
            ).catch(() => {});
        });
        observer.observe(node);
        cleanup = () => {
          observer.disconnect();
          Plotly.purge(node);
        };
      })
      .catch(() => {
        if (!disposed)
          setError(
            "Chart unavailable. All numerical data remains available in the table.",
          );
      });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [data, xTitle, yTitle, polar, theme]);
  return (
    <div
      className="plot-shell"
      role="img"
      aria-label={`${title}. Numerical values are available in the adjacent data table.`}
    >
      {error ? <p role="status">{error}</p> : <div ref={el} className="plot" />}
    </div>
  );
}
