import { expect, Page } from "@playwright/test";
import getPort from "get-port";

import { matchLine, testTemplate, urlRegex } from "./utils";

const test = testTemplate("cloudflare");

test("typecheck", async ({ $ }) => {
  await $(`pnpm typecheck`);
});

test("dev", async ({ page, $ }) => {
  const port = await getPort();
  const dev = $(`pnpm dev --port ${port}`);

  const url = await matchLine(dev.stdout, urlRegex.viteDev);
  await workflow({ page, url });
});

test("build + start", async ({ page, $ }) => {
  await $(`pnpm build`);

  const port1 = await getPort();
  const port2 = await getPort();
  const start = $(`pnpm start --port ${port1} --inspector-port ${port2}`);

  const url = await matchLine(start.stdout, urlRegex.wrangler);
  await workflow({ page, url });
});

async function workflow({ page, url }: { page: Page; url: string }) {
  await page.goto(url);
  await expect(page).toHaveTitle(/New React Router App/);
  await page.getByRole("link", { name: "React Router Docs" }).waitFor();
  await page.getByRole("link", { name: "Join Discord" }).waitFor();
  expect(page.errors).toStrictEqual([]);
}
