import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
test("complete study, stale snapshot, radial fields, export/import/recompute", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/workbench");
  await expect(page.getByText("Material values not supplied")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Run simulation", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Use synthetic demo" }).click();
  await expect(
    page.getByRole("button", { name: "Run simulation", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Run simulation", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Deposition regime" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("img", { name: /Temperature sweep/ })
      .locator(".js-plotly-plot"),
  ).toBeVisible();
  await expect(
    page
      .getByText(
        "Synthetic numerical demonstration; not material or process data.",
        { exact: true },
      )
      .first(),
  ).toBeVisible();
  await page
    .getByLabel("Surface reaction coefficient kₛ", { exact: true })
    .fill("3");
  await expect(
    page.getByText("Inputs changed.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keep for comparison" }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Project JSON" }).click(),
  ]);
  await fs.mkdir("outputs/qa", { recursive: true });
  await download.saveAs("outputs/qa/browser-export.synthetic.json");
  const json = JSON.parse(
    await fs.readFile("outputs/qa/browser-export.synthetic.json", "utf8"),
  );
  expect(json.snapshots[0].original_request.kinetics.ks.value).toBe(2);
  expect(json.snapshots[0].scalar.flux.value).toBeCloseTo(6);
  const [csvDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "CSV + metadata", exact: true }).click(),
  ]);
  await csvDownload.saveAs("outputs/qa/browser-csv.synthetic.zip");
  expect(
    (await fs.readFile("outputs/qa/browser-csv.synthetic.zip"))
      .subarray(0, 2)
      .toString(),
  ).toBe("PK");
  await page.getByText("Radial uniformity extension", { exact: true }).click();
  await page.getByLabel("Enable prescribed radial fields").check();
  await page
    .getByLabel("Concentration edge fraction aC", { exact: true })
    .fill(".2");
  await page
    .getByRole("button", { name: "Run simulation", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Local fields & uniformity" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("img", { name: /Prescribed radial flux map/ })
      .locator(".js-plotly-plot"),
  ).toBeVisible();
  await page
    .getByRole("img", { name: /Prescribed radial flux map/ })
    .screenshot({ path: "outputs/qa/radial-map.png" });
  await page.getByRole("button", { name: "Show radial table" }).click();
  await expect(
    page.getByRole("region", { name: "Radial field data" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keep for comparison" }).click();
  await page.getByRole("link", { name: "Compare studies" }).click();
  await expect(page.getByText("2/4 snapshots · tab memory only")).toBeVisible();
  await page
    .getByLabel("Project JSON file")
    .setInputFiles("outputs/qa/browser-export.synthetic.json");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Replace studies" }).click();
  await expect(
    page.getByText(/Saved snapshot · untrusted imported data/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Recompute", exact: true }).click();
  await expect(
    page.getByText(/Saved snapshot · untrusted imported data/),
  ).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("link", { name: "Load inputs", exact: true }).click();
  await expect(
    page.getByLabel("Surface reaction coefficient kₛ", { exact: true }),
  ).toHaveValue("2");
  await page
    .getByRole("button", { name: "Run simulation", exact: true })
    .click();
    await expect(page.getByText('Inputs changed.',{exact:true})).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Deposition regime" }),
  ).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "outputs/CVD-Studio-preview.png" });
  expect(errors).toEqual([]);
});
for (const width of [375, 768, 1440]) {
  test(`responsive and accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/workbench");
    await page.getByRole("button", { name: "Use synthetic demo" }).click();
    await page
      .getByRole("button", { name: "Run simulation", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Deposition regime" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Table", exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
    await page.screenshot({
      path: `outputs/qa/workbench-${width}-light.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Use dark theme" }).click();
    const dark = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(dark.violations).toEqual([]);
    await page.screenshot({
      path: `outputs/qa/workbench-${width}-dark.png`,
      fullPage: true,
    });
  });
}
test("network error preserves result; keyboard and input validation", async ({
  page,
}) => {
  await page.goto("/workbench");
  await page.keyboard.press("Tab");
  await expect(page.getByText("Skip to content")).toBeFocused();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Use synthetic demo" }).click();
  await page
    .getByRole("button", { name: "Run simulation", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Deposition regime" }),
  ).toBeVisible();
  await page.getByLabel('Observable',{exact:true}).selectOption('growth');
  await expect(page.getByRole('heading',{name:'Film growth vs temperature'})).toBeVisible();
  await page.getByText('Growth conversion & time',{exact:false}).click();
  await page.getByLabel('Film conversion β',{exact:true}).fill('');
  await page.getByRole('button',{name:'Run simulation',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Precursor flux vs temperature'})).toBeVisible();
  await expect(page.getByLabel('Observable',{exact:true})).toHaveValue('flux');
  await page
    .getByLabel("Surface reaction coefficient kₛ", { exact: true })
    .fill("-1");
  await page
    .getByRole("button", { name: "Run simulation", exact: true })
    .click();
  await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Deposition regime" }),
  ).toBeVisible();
  await page
    .getByLabel("Surface reaction coefficient kₛ", { exact: true })
    .fill("2");
  await page.route("**/api/v1/simulations", (r) => r.abort());
  await page
    .getByRole("button", { name: "Run simulation", exact: true })
    .click();
  await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Deposition regime" }),
  ).toBeVisible();
});

test("explicit user inputs, missing beta, zero-field metrics and timeout", async ({
  page,
}) => {
  await page.goto("/workbench");
  await page.getByLabel("Study context").selectOption("silicon_nitride");
  await page
    .getByLabel("Surface reaction coefficient kₛ", { exact: true })
    .fill(".1");
  await page
    .getByLabel("Mass-transfer coefficient hɡ", { exact: true })
    .fill("1");
  await page
    .getByLabel("Bulk precursor concentration Cɡ", { exact: true })
    .fill("0");
  await page.getByText("Radial uniformity extension", { exact: true }).click();
  await page.getByLabel("Enable prescribed radial fields").check();
  await page.getByLabel("Physical radius", { exact: true }).fill("100");
  await page
    .getByRole("button", { name: "Run simulation", exact: true })
    .click();
  await expect(
    page.getByText(
      "Zero mean: normalized CV and half-range metrics are undefined.",
    ),
  ).toBeVisible();
  await expect(page.getByText("Add β for conversion")).toBeVisible();
  await expect(
    page
      .getByText(
        "User supplied, unverified; experimental validation pending.",
        { exact: true },
      )
      .first(),
  ).toBeVisible();
  await page.route("**/api/v1/simulations", (route) =>
    route.fulfill({
      status: 504,
      contentType: "application/json",
      body: JSON.stringify({
        error: {
          code: "CALCULATION_TIMEOUT",
          message: "Calculation deadline exceeded. Reduce workload and retry.",
          request_id: "00000000-0000-4000-8000-000000000001",
          issues: [],
          retryable: true,
        },
      }),
    }),
  );
  await page
    .getByRole("button", { name: "Run simulation", exact: true })
    .click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Calculation deadline exceeded.",
  );
  await expect(
    page.getByRole("heading", { name: "Deposition regime" }),
  ).toBeVisible();
});

for (const width of [375, 768, 1440])
  test(`supporting pages reflow and evidence at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const [route, name] of [
      ["/compare", "Compare studies"],
      ["/parameters", "Know what is known."],
      ["/learn", "Two resistances. One local flux."],
      ["/about/model", "A transparent local model."],
    ]) {
      await page.goto(route);
      await expect(
        page.getByRole("heading", {
          level: 1,
          name: new RegExp(name.replace(/[.]/g, "\\.")),
        }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      const slug = route.replaceAll("/", "-").slice(1);
      await page.screenshot({
        path: `outputs/qa/${slug}-${width}-light.png`,
        fullPage: true,
      });
      await page.getByRole("button", { name: "Use dark theme" }).click();
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.screenshot({
        path: `outputs/qa/${slug}-${width}-dark.png`,
        fullPage: true,
      });
    }
  });
