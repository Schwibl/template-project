import { expect, test } from '@playwright/test';

test('greets the typed name', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('status')).toHaveText('Hello, world!');
  await page.getByLabel('Name').fill('Ada');
  await expect(page.getByRole('status')).toHaveText('Hello, Ada!');
});
