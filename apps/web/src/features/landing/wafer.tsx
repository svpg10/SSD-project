"use client";
import { useState } from "react";
import { Pause, Play, Rotate3D } from "lucide-react";

export function Wafer() {
  const [paused, setPaused] = useState(false);
  const [top, setTop] = useState(false);
  return (
    <div
      className={`wafer-exhibit ${paused ? "is-paused" : ""} ${top ? "is-top" : ""}`}
    >
      <div className="exhibit-label">
        <span className="status-dot" /> MATERIAL EXPLORER <span>01 / Si</span>
      </div>
      <div
        className="wafer-viewport"
        role="img"
        aria-label="Rotating three-dimensional conceptual silicon wafer with copper edge and a patterned surface"
      >
        <div className="wafer-floor" />
        <div className="wafer-assembly">
          <div className="wafer-spin">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className="wafer-layer"
                style={{ transform: `translateZ(${i - 6}px)` }}
              />
            ))}
            <div className="wafer-face">
              <div className="wafer-lattice" />
              <div className="wafer-center-ring" />
              <span className="wafer-notch" />
            </div>
            <div className="wafer-back" />
          </div>
          <div className="wafer-orbit" />
        </div>
        <span className="exhibit-callout callout-one">
          <span>01</span> Surface reaction <b>kₛ</b>
        </span>
        <span className="exhibit-callout callout-two">
          <span>02</span> Gas transport <b>hɡ</b>
        </span>
      </div>
      <div className="exhibit-bottom">
        <span>
          CONCEPTUAL 3D VIEW <small>Illustration, not simulation data</small>
        </span>
        <div className="exhibit-controls">
          <button
            type="button"
            onClick={() => setTop(!top)}
            aria-pressed={top}
            aria-label="Top view"
          >
            <Rotate3D size={17} />
            <span>Top view</span>
          </button>
          <button
            type="button"
            onClick={() => setPaused(!paused)}
            aria-pressed={paused}
            aria-label={paused ? "Resume rotation" : "Pause rotation"}
          >
            {paused ? <Play size={17} /> : <Pause size={17} />}
          </button>
        </div>
      </div>
    </div>
  );
}
