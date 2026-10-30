"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <section className="panel panel-content" role="alert">
      <h1>This view could not be displayed.</h1>
      <p>Your exported project files are unaffected.</p>
      <button onClick={reset}>Retry view</button>
    </section>
  );
}
