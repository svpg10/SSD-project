import type { Scenario, Capabilities } from "@/lib/api/types";
import type { Draft } from "@/features/projects/store";
import { emptyDraft } from "@/features/projects/store";
// Restore display inputs only; imported result values never become a computed result.
export function fromRequest(r: Scenario): Draft {
  const d: Draft = {
    ...emptyDraft,
    material: r.material,
    temperature: String(r.temperature.value),
    temperatureUnit: r.temperature.unit,
    kinetics: r.kinetics.mode,
    hg: String(r.mass_transfer_coefficient.value),
    hgUnit: r.mass_transfer_coefficient.unit,
    concentration: r.concentration.mode,
    beta: r.growth_conversion === null ? "" : String(r.growth_conversion.value),
    duration: r.duration === null ? "" : String(r.duration.value),
    durationUnit: r.duration?.unit ?? "s",
    notes: r.notes,
    parameterReferences: JSON.stringify(r.parameter_references),
  };
  if (r.kinetics.mode === "direct") {
    d.ks = String(r.kinetics.ks.value);
    d.ksUnit = r.kinetics.ks.unit;
  } else {
    d.A = String(r.kinetics.A.value);
    d.AUnit = r.kinetics.A.unit;
    d.Ea = String(r.kinetics.Ea.value);
    d.EaUnit = r.kinetics.Ea.unit;
  }
  if (r.concentration.mode === "direct")
    d.Cg = String(r.concentration.Cg.value);
  else {
    d.pressure = String(r.concentration.total_pressure.value);
    d.pressureUnit = r.concentration.total_pressure.unit;
    d.y = String(r.concentration.mole_fraction);
    d.Tg = String(r.concentration.gas_temperature.value);
  }
  if (r.process_pressure) {
    d.processPressure = String(r.process_pressure.value);
    d.processPressureUnit = r.process_pressure.unit;
  }
  if (r.flow) {
    d.flow = String(r.flow.value);
    d.flowT = String(r.flow.standard_temperature.value);
    d.flowP = String(r.flow.standard_pressure.value);
    d.flowPUnit = r.flow.standard_pressure.unit;
    d.gasLabel = r.flow.gas_label;
  }
  d.sweep = r.sweep ? "on" : "off";
  if (r.sweep) {
    d.start = String(
      r.sweep.start.value - (r.sweep.start.unit === "K" ? 273.15 : 0),
    );
    d.stop = String(
      r.sweep.stop.value - (r.sweep.stop.unit === "K" ? 273.15 : 0),
    );
    d.count = String(r.sweep.count);
  }
  d.spatial = r.spatial ? "on" : "off";
  if (r.spatial) {
    const s = r.spatial;
    d.radius = String(s.radius.value * (s.radius.unit === "m" ? 1000 : 1));
    d.edge = String(
      s.edge_exclusion.value * (s.edge_exclusion.unit === "m" ? 1000 : 1),
    );
    d.nr = String(s.nr);
    d.ntheta = String(s.ntheta);
    d.deltaT = String(s.delta_T_edge_K);
    d.aC = String(s.concentration_edge_fraction);
    d.ah = String(s.transport_edge_fraction);
  }
  return d;
}
export function makeRequest(d: Draft, cap: Capabilities): Scenario {
  const q = (key: string, unit: string) => ({ value: Number(d[key]), unit });
  return {
    schema_version: "1.0.0",
    request_id: crypto.randomUUID(),
    material: d.material as Scenario["material"],
    basis: d.material === "synthetic" ? "synthetic" : "user_supplied",
    temperature: q("temperature", d.temperatureUnit) as Scenario["temperature"],
    kinetics:
      d.kinetics === "direct"
        ? {
            mode: "direct",
            ks: q("ks", d.ksUnit) as { value: number; unit: "m/s" | "cm/s" },
          }
        : {
            mode: "arrhenius",
            A: q("A", d.AUnit) as { value: number; unit: "m/s" | "cm/s" },
            Ea: q("Ea", d.EaUnit) as {
              value: number;
              unit: "J/mol" | "kJ/mol";
            },
          },
    mass_transfer_coefficient: q(
      "hg",
      d.hgUnit,
    ) as Scenario["mass_transfer_coefficient"],
    concentration:
      d.concentration === "direct"
        ? {
            mode: "direct",
            Cg: q("Cg", "mol/m^3") as { value: number; unit: "mol/m^3" },
          }
        : {
            mode: "ideal_gas",
            total_pressure: q("pressure", d.pressureUnit) as {
              value: number;
              unit: "Pa" | "Torr";
            },
            mole_fraction: Number(d.y),
            gas_temperature: { value: Number(d.Tg), unit: "K" },
          },
    growth_conversion:
      d.beta === "" ? null : { value: Number(d.beta), unit: "m^3/mol" },
    duration:
      d.duration === ""
        ? null
        : (q("duration", d.durationUnit) as {
            value: number;
            unit: "s" | "min";
          }),
    process_pressure:
      d.concentration === "ideal_gas" || d.processPressure === ""
        ? null
        : (q("processPressure", d.processPressureUnit) as {
            value: number;
            unit: "Pa" | "Torr";
          }),
    flow:
      d.flow === ""
        ? null
        : {
            value: Number(d.flow),
            unit: "sccm",
            standard_temperature: { value: Number(d.flowT), unit: "K" },
            standard_pressure: {
              value: Number(d.flowP),
              unit: (d.flowPUnit || "Pa") as "Pa" | "Torr",
            },
            gas_label: d.gasLabel,
          },
    registry_snapshot:
      d.material === "synthetic" ? cap.synthetic_registry : cap.registry,
    parameter_references: JSON.parse(
      d.parameterReferences || "[]",
    ) as Scenario["parameter_references"],
    sweep:
      d.sweep === "on"
        ? {
            start: { value: Number(d.start), unit: "degC" },
            stop: { value: Number(d.stop), unit: "degC" },
            count: Number(d.count),
            gas_temperature_policy: "fixed",
          }
        : null,
    spatial:
      d.spatial === "on"
        ? {
            model_id: "prescribed-radial-v1",
            radius: { value: Number(d.radius), unit: "mm" },
            edge_exclusion: { value: Number(d.edge), unit: "mm" },
            nr: Number(d.nr),
            ntheta: Number(d.ntheta),
            delta_T_edge_K: Number(d.deltaT),
            concentration_edge_fraction: Number(d.aC),
            transport_edge_fraction: Number(d.ah),
          }
        : null,
    notes: d.notes,
  };
}
export function missingFields(d: Draft) {
  const keys = [
    "temperature",
    "hg",
    ...(d.kinetics === "direct" ? ["ks"] : ["A", "Ea"]),
    ...(d.concentration === "direct" ? ["Cg"] : ["pressure", "y", "Tg"]),
    ...(d.sweep === "on" ? ["start", "stop", "count"] : []),
    ...(d.spatial === "on"
      ? ["radius", "edge", "nr", "ntheta", "deltaT", "aC", "ah"]
      : []),
    ...(d.flow !== "" ? ["flowT", "flowP", "gasLabel"] : []),
  ];
  return keys.filter((k) => !d[k]?.trim());
}
