import { test, expect } from "@playwright/test";
import tags from "../test-data/tags.json";

test.beforeEach(async ({ page }) => {
  //So to create a mock we need to type command await page dot route and inside of the route.
  //First argument we provide the URL that we want to intercept Go into the networking tab and first URL.
  await page.route("*/**/api/tags", async (route) => {
    await route.fulfill({
      body: JSON.stringify(tags),
    });
  });

  await page.goto("https://conduit.bondaracademy.com/");
});

test("has title", async ({ page }) => {
  await expect(page.locator(".navbar-brand")).toHaveText("conduit");
});
