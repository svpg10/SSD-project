import Image from "next/image";
import { ScenarioForm } from "@/features/scenario/form";
import { Results } from "@/features/results/results";
export const metadata = { title: "Workbench" };
export default function Workbench() {
  return (
    <>
      <div className="page-heading workbench-heading">
        <div>
          <span className="eyebrow">THE STUDIO / YOUR NEXT EXPLORATION</span>
          <h1>From inputs to insight.</h1>
          <p>Set the conditions. Follow the science.</p>
        </div>
        <div className="workbench-object">
          <Image
            src="/images/wafer.webp"
            width={160}
            height={120}
            alt="Conceptual silicon wafer render"
          />
          <span className="window-label">
            600–750°C<small>PS-64 STUDY WINDOW</small>
          </span>
        </div>
      </div>
      <div className="workbench">
        <ScenarioForm />
        <Results />
      </div>
    </>
  );
}
