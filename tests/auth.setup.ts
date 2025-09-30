import { test as setup } from "@playwright/test";
import user from "../.auth/user.json";
//This is a built in library in JavaScript to work with the files, right, the files, update, the files
import fs from "fs";

const authFile = ".auth/user.json";

//create a setup block responsible for authentication
setup("authentication", async ({ request }) => {
  //   await page.goto("https://conduit.bondaracademy.com/");
  //   await page.getByText("Sign in").click();
  //   await page.getByRole("textbox", { name: "Email" }).fill("nevenadb@test.com");
  //   await page.getByRole("textbox", { name: "Password" }).fill("12345678");
  //   await page.getByRole("button").click();
  //   await page.waitForResponse("https://conduit-api.bondaracademy.com/api/tags");

  //   await page.context().storageState({ path: authFile });

  //another approach
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

  user.origins[0].localStorage[0].value = accessToken;
  fs.writeFileSync(authFile, JSON.stringify(user));

  process.env["ACCESS_TOKEN"] = accessToken;
});
