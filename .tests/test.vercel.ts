import { expect, Page } from "@playwright/test";
import getPort from "get-port";

import { matchLine, testTemplate, urlRegex } from "./utils";

const test = testTemplate("vercel");

test("typecheck", async ({ $ }) => {
  await $(`pnpm typecheck`);
});

test("dev", async ({ page, $ }) => {
  const port = await getPort();
  const dev = $(`pnpm dev`, { env: { PORT: String(port) } });

  const url = await matchLine(dev.stdout, urlRegex.custom);
  await workflow({ page, url });
  expect(dev.buffer.stderr).toBe("");
});

test("build", async ({ $ }) => {
  await $(`pnpm build`);
});

async function workflow({ page, url }: { page: Page; url: string }) {
  await page.goto(url);
  await expect(page).toHaveTitle(/New React Router App/);
  await page.getByRole("link", { name: "React Router Docs" }).waitFor();
  await page.getByRole("link", { name: "Join Discord" }).waitFor();
  expect(page.errors).toStrictEqual([]);
}
