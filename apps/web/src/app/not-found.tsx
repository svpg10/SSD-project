import Link from "next/link";
export default function NotFound() {
  return (
    <section className="panel panel-content">
      <h1>Page not found.</h1>
      <p>
        <Link href="/workbench">Return to the workbench</Link>
      </p>
    </section>
  );
}
