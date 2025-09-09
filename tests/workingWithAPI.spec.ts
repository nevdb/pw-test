import { test, expect, request } from "@playwright/test";
import tags from "../test-data/tags.json";

test.beforeEach(async ({ page }) => {
  await page.route("*/**/api/tags", async (route) => {
    await route.fulfill({
      body: JSON.stringify(tags),
    });
  });

  await page.goto("https://conduit.bondaracademy.com/");
  await page.getByText("Sign in").click();
  await page.getByRole("textbox", { name: "Email" }).fill("nevenadb@test.com");
  await page.getByRole("textbox", { name: "Password" }).fill("12345678");
  await page.getByRole("button").click();
});

test("has title", async ({ page }) => {
  await page.route("*/**/api/articles*", async (route) => {
    //1.get the response
    const response = await route.fetch();
    const responseBody = await response.json();
    //2.update the response body
    responseBody.articles[0].title = "This is a MOCK test title";
    responseBody.articles[0].description = "This is a MOCK description";

    //3.fulfill the modified response as a desired response to the application.
    await route.fulfill({
      body: JSON.stringify(responseBody),
    });
  });

  await page.getByText("Global Feed").click();
  await expect(page.locator(".navbar-brand")).toHaveText("conduit");
  await expect(page.locator("app-article-list h1").first()).toContainText(
    "This is a MOCK test title"
  );
  await expect(page.locator("app-article-list p").first()).toContainText(
    "This is a MOCK description"
  );
});

test("delete article", async ({ page, request }) => {
  const response = await request.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      //request body in the request in other frameworks is 'body', but in PW is 'data'
      data: {
        user: { email: "nevenadb@test.com", password: "12345678" },
      },
    }
  );

  const responseBody = await response.json();
  const accessToken = responseBody.user.token;

  const articleResponse = await request.post(
    "https://conduit-api.bondaracademy.com/api/articles/",
    {
      data: {
        article: {
          title: "New article 5",
          description: "new 2",
          body: "new text",
          tagList: [],
        },
      },
      headers: {
        Authorization: `Token ${accessToken}`,
      },
    }
  );
  expect(articleResponse.status()).toEqual(201);

  await page.getByText("Global Feed").click();
  await page.getByText("New article 4").click();
  await page.getByRole("button", { name: "Delete Article" }).first().click();

  await expect(page.locator("app-article-list h1").first()).not.toContainText(
    "New article 3"
  );
});
