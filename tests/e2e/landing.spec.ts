import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [320, 375, 768, 1440]) {
  test(`landing, 3D controls and studio entry at ${width}px`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Small scale. Deeper insight.",
      }),
    ).toBeVisible();
    const pause = page.getByRole("button", { name: "Pause rotation" });
    await pause.click();
    await expect(
      page.getByRole("button", { name: "Resume rotation" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".wafer-spin")).toHaveCSS(
      "animation-play-state",
      "paused",
    );
    await page.getByRole("button", { name: "Top view", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Top view", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Top view", exact: true }).click();
    await expect(page.getByRole("button", { name: "Top view", exact: true })).toHaveAttribute("aria-pressed", "false");
    for (const theme of ["light", "dark"]) {
      if (theme === "dark")
        await page.getByRole("button", { name: "Use dark theme" }).click();
      const layout = await page.evaluate(() => ({
        pageWidth: document.documentElement.scrollWidth,
        viewport: innerWidth,
        outside: Array.from(document.querySelectorAll('main *')).filter(element => element.getBoundingClientRect().right > innerWidth + 1).slice(0, 8).map(element => ({ tag: element.tagName, className: element.className, right: Math.round(element.getBoundingClientRect().right) })),
      }));
      expect(layout.pageWidth <= layout.viewport, JSON.stringify(layout)).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page
        .getByRole("img", { name: /quartz deposition chamber/ })
        .scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          page
            .getByRole("img", { name: /quartz deposition chamber/ })
            .evaluate((img: HTMLImageElement) => img.naturalWidth),
        )
        .toBeGreaterThan(0);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: `outputs/qa/landing-${width}-${theme}.png`,
        fullPage: true,
        animations: "disabled",
      });
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(".wafer-spin")).toHaveCSS(
      "animation-name",
      "none",
    );
    await page.getByRole("link", { name: "Enter the studio" }).click();
    await expect(page).toHaveURL(/\/workbench$/);
    await expect(page.getByText("Material values not supplied")).toBeVisible();
    expect(errors).toEqual([]);
  });
}
