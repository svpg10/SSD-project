# Scientific model and units — cvd-resistance-v1

## 1. Supplied equation and dimensional meaning

PS-64 gives `r = ks hg/(ks+hg) Cg`. Adopt ks and hg in m/s and bulk limiting-precursor concentration Cg in mol/m³. Then r has units mol/(m² s). Call it **J**, precursor-consumption molar flux, in the API; display “r (precursor flux)” when relating it to the problem statement. PS-64 does not itself disambiguate flux vs thickness rate.

For a stagnant film and first-order surface sink, let Cs be the surface concentration. At steady state:

```
J = hg (Cg - Cs) = ks Cs
Cs = hg Cg / (ks + hg)
keff = ks hg / (ks + hg) = 1/(1/ks + 1/hg)
J = keff Cg
```

This is an algebraic derivation under the stated assumptions, not an experimental fit. It predicts `0≤Cs≤Cg`, `0≤J≤min(ks,hg)Cg` and linearity in Cg. With Cg=0, J=0 and any growth is zero. Version 1 requires strictly positive ks/hg; a zero coefficient is invalid rather than an undefined 0/0 case.

Compute stably as `keff = min(ks,hg)/(1 + min(ks,hg)/max(ks,hg))`, avoiding a potentially overflowing product. Check every intermediate/output for finiteness and fail explicitly on overflow or unacceptable underflow. Compute the regime in log space if the coefficient ratio would overflow.

## 2. Regimes

Define Da=ks/hg, surface resistance Rs=1/ks and gas resistance Rg=1/hg. Report `surface_resistance_fraction=hg/(ks+hg)` and `gas_resistance_fraction=ks/(ks+hg)`, calculated stably and summing to one.

| Da | Class | Interpretation |
|---|---|---|
| Da < 0.1 | reaction_limited | J approximately ks Cg |
| 0.1 ≤ Da ≤ 10 | mixed | Both resistances matter |
| Da > 10 | mass_transfer_limited | J approximately hg Cg |

Thresholds are product classification conventions, not supplied PS-64 numbers. They are fixed in model version 1 and displayed in the UI. At Da=1 both resistance fractions are 0.5. A higher temperature is not, by itself, proof of a transport-limited regime. Spatial results report local regimes and area fractions; a scalar label must not conceal mixed spatial behavior.

## 3. Temperature and Arrhenius kinetics

Support direct ks or `ks(Ts)=A exp[-Ea/(R Ts)]`. Ts is absolute substrate temperature in K; A has units m/s for this specific first-order model; Ea is J/mol; R=8.31446261815324 J/(mol K), derived from the exact SI NA and kB. This numerical constant is not a material parameter. See the [IUPAC definition](https://goldbook.iupac.org/terms/view/A00446/plain) and [NIST constant record](https://physics.nist.gov/cgi-bin/cuu/Value?r).

`Ts_K = Ts_degC + 273.15`; study bounds are 873.15–1023.15 K. Use Pint's absolute-temperature conversion; a temperature difference uses delta units. Do not multiply an offset Celsius quantity inside an exponential. For direct ks, substrate temperature is metadata only and the sweep can be flat; display that explanation instead of inventing dependence. For Ea=0, Arrhenius ks=A. Positive Ea means ks rises with Ts when other inputs are fixed.

## 4. Concentration and process controls

Branch A: user supplies direct Cg. Pressure, flow and gas temperature are metadata and do not alter J through an undocumented relation.

Branch B: ideal gas `Cg = y P/(R Tg)` with total pressure P in Pa, limiting-precursor mole fraction y in [0,1] and gas temperature Tg in K. Tg is independently supplied and remains fixed while Ts is swept in version 1. Do not assume Tg=Ts. y is not inferred from total flow; mixed feed composition must be supplied.

hg is direct and constant in the baseline/sweep. A possible future closure `hg=D/delta` requires a sourced diffusivity and film thickness, continuum applicability, geometry and operating conditions; it is **not implemented or implied** in version 1. Gas flow affects neither hg nor Cg in this version. If users record sccm, also record the standard temperature and pressure; do not convert it to molar or actual volumetric flow without those reference conditions. Numeric flow and pressure constraints remain null until sourced.

## 5. Flux → growth → thickness

Define explicit beta = (mol deposited formula units / mol precursor consumed) × (Mfilm/rhofilm), in m³/mol precursor. Then:

```
growth_m_s = beta J
growth_nm_min = growth_m_s × 1e9 × 60
thickness_m = growth_m_s × duration_s
```

beta can be entered directly with provenance. The registry records how it was obtained; no default stoichiometric yield is assigned. Mfilm is kg/mol of deposited formula units, rhofilm is kg/m³, and their composition/phase must match the film. Do not reuse Si constants for Si₃N₄. Nitride deposition can involve multiple reactants and non-first-order kinetics; the present single limiting-precursor coefficient is an effective simplification that needs independent justification. If beta is missing, return growth and thickness as null with `GROWTH_CONVERSION_MISSING`. If duration is missing, return thickness as null even when growth exists.

## 6. Temperature sweep

Inclusive linearly spaced Ts values from supplied start to stop; require start<stop and 2–501 points, all within the study window. Re-evaluate ks per point, preserve hg, concentration branch, Tg and other inputs. The base scalar run uses its own Ts; sweep fields override only Ts. Plot J vs °C always; plot growth vs °C if beta exists; optional log-J vs 1/T is valid only for positive finite J. A direct coefficient run is not an Arrhenius fit. Do not force a plateau: varying Cg, hg or beta would alter trends and must be modeled explicitly in a later version.

## 7. Transparent radial uniformity extension — prescribed-radial-v1

This is a prescribed local-field sensitivity study on a single disk. It does not solve momentum, energy, diffusion, axial depletion or chamber mass balance. Local independent calculations cannot demonstrate gas conservation. Do not claim wafer prediction, CFD, edge physics or batch uniformity from this extension.

Inputs: physical radius R>0, excluded edge e with 0≤e<R, nr radial cells, ntheta angular display sectors; ΔTs (K temperature difference), aC and ah (dimensionless). Let usable radius Ru=R-e; for radial cell i=0…nr−1:

```
u_i = (i+0.5)/nr
rho_i = Ru sqrt(u_i)
theta_j = 2 pi (j+0.5)/ntheta
q_i = (rho_i/R)^2
Ts_i = Ts_base + delta_T_edge_K q_i
Cg_i = Cg_base (1 + aC q_i)
hg_i = hg_base (1 + ah q_i)
ks_i = Arrhenius(Ts_i) or the direct ks
J_i = keff(ks_i,hg_i) Cg_i
```

The gradient coefficients describe differences at the physical edge R, even when that edge is excluded. Radial cell edges are Ru sqrt(i/nr). Every cell-sector has equal area `pi Ru²/(nr ntheta)`. All sectors at a given radius share the same result; rotation has no physical significance. The map must not imply asymmetric flow or additional angular physics. Store radial arrays once; tile only for rendering.

Require every retained local Ts in the study window, Cg_i≥0 and hg_i>0. Also validate the prescribed full physical disk fields: 1+aC≥0, 1+ah>0 and both endpoint temperatures within 600–750°C, so edge exclusion cannot conceal an invalid field. Zero gradients recover the scalar result exactly. No clipping to pass validation. If direct ks is used, ΔTs changes displayed temperature but not ks; warn `DIRECT_KS_TEMPERATURE_INDEPENDENT`.

## 8. Uniformity statistics

Let zi be J_i or growth_i (record observable), wi=1/nr, mean=sum(wi zi), sigma=sqrt(sum(wi(zi−mean)²)). Report min, max, mean, population sigma, `cv_percent=100 sigma/mean`, and `half_range_percent=100(max−min)/(2 mean)`. These are different definitions; do not label either simply “uniformity %”. Min/max are **sampled cell-center** extrema. No unweighted uniform-radius averaging. ntheta does not improve radial convergence. Report usable area and edge exclusion.

If mean=0: sigma=0 for a zero field; CV and half-range are null with `ZERO_MEAN_UNIFORMITY_UNDEFINED`. Never coerce them to zero. Negative values fail upstream. To assess discretization, compare nr=64,128,256 on valid smooth test fields; no convergence claim from a colorful map alone.

## 9. Interpretation and uncertainty

Distinguish software verification (equations implemented correctly), model applicability (assumptions fit a case), and experimental validation (independent measurements agree within predeclared criteria). v1 has no experimental validation data. Do not generate error bars, posterior distributions or confidence claims. Sensitivity to a user-selected gradient is not statistical uncertainty. Future uncertainty propagation needs sourced distributions, correlations and recorded random seeds.
