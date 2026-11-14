import { expect, test, type Page } from '@playwright/test';
import { button, CODE, openListing, slide } from './helpers';

async function toTerms(page: Page, plan: string) {
  await openListing(page);
  await page.getByRole('link', { name: /^200 sqm/ }).click();
  await expect(page.getByRole('heading', { name: 'Residential plot' })).toBeVisible();
  await page.getByRole('radio', { name: plan }).click();
  await button(page, plan === 'Outright' ? 'Pay ₦9.9M' : 'Start this plan').click();
  await expect(page.getByRole('heading', { name: 'Read, then slide' })).toBeVisible();
}

test('plot page shows LCR plan prices', async ({ page }) => {
  await openListing(page);
  await page.getByRole('link', { name: /^300 sqm/ }).click();
  await expect(page.getByText('₦12.6M').first()).toBeVisible();
  await page.getByRole('radio', { name: '18 months' }).click();
  await expect(page.getByText('Initial deposit')).toBeVisible();
  await expect(page.getByText('₦1.5M').first()).toBeVisible();
  await expect(page.getByText('₦17.1M')).toBeVisible();
  await expect(page).toHaveURL(/plan=18/);
});

test('terms stay locked until read to the end', async ({ page }) => {
  await toTerms(page, '12 months');
  const slider = page.getByRole('slider');
  await expect(slider).toHaveAttribute('aria-disabled', 'true');
  await slide(page);
  await expect(page.getByText('Please read all the terms first')).toBeVisible();
  await expect(page).toHaveURL(/\/buy\/terms$/);
  await page.locator('p', { hasText: 'You accept the information, FAQ and terms' }).scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 4000);
  await expect(slider).not.toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByText('Slide to agree')).toBeVisible();
});

test('full purchase on a 12 month plan', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => undefined);
  await toTerms(page, '12 months');
  await page.locator('p', { hasText: 'You accept the information, FAQ and terms' }).scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 4000);
  await expect(page.getByText('Slide to agree')).toBeVisible();
  await slide(page);

  await expect(page).toHaveURL(/\/buy\/email$/);
  await page.getByLabel('Email address').fill('tobi@example.com');
  await button(page, 'Next').click();
  await expect(page).toHaveURL(/\/buy\/verify$/);
  await page.getByLabel('6-digit code').fill(CODE);

  await expect(page).toHaveURL(/\/buy\/details$/);
  await expect(page.getByText('CityView · 200 sqm · 12 months')).toBeVisible();

  // Basic info: required fields are checked before moving on.
  await button(page, 'Next: More info').click();
  await expect(page.getByLabel('First name')).toHaveAttribute('aria-invalid', 'true');
  await page.setInputFiles('input[type=file][accept="image/*"]', 'public/mock/realtor.jpg');
  await expect(page.getByText('Added', { exact: true })).toBeVisible();
  await page.getByLabel('First name').fill('tobi');
  await page.getByLabel('Last name').fill('adeyemi');
  await page.getByLabel('Phone, after +234').fill('08034127790');
  await expect(page.getByLabel('Phone, after +234')).toHaveValue('803 412 7790');
  await button(page, 'Next: More info').click();

  // More info: address and ID.
  await button(page, 'Next: Next of kin').click();
  await expect(page.getByText('Add a photo of your ID.')).toBeVisible();
  await page.getByLabel('Home address').fill('14 Admiralty Way, Lekki');
  await page.setInputFiles('input[accept="image/*,application/pdf"]', 'public/mock/gate.jpg');
  await expect(page.getByText('ID added')).toBeVisible();
  await button(page, 'Next: Next of kin').click();

  // Next of kin.
  await page.getByLabel('Their full name').fill('Ada Adeyemi');
  await page.getByRole('radio', { name: 'Spouse' }).click();
  await page.getByLabel('Their phone, after +234').fill('8031112222');
  await button(page, 'Continue').click();

  await expect(page).toHaveURL(/\/buy\/offer$/);
  await expect(page.getByRole('heading', { name: 'We’ve emailed it to you' })).toBeVisible();
  await expect(page.getByText(/Dear Tobi, thank you for choosing a 200 sqm residential plot/)).toBeVisible();
  await expect(page.getByText('₦9.4M by')).toBeVisible();
  await button(page, 'Proceed to payment').click();

  await expect(page).toHaveURL(/\/buy\/pay$/);
  await expect(page.getByText('₦2,500,000')).toBeVisible();
  await expect(page.getByText('0885 375 920')).toBeVisible();
  await button(page, 'Copy GTBank account number').click();
  await expect(page.getByRole('status')).toContainText('Account number');
  await button(page, 'I’ve made the transfer').click();

  await expect(page).toHaveURL(/\/buy\/thank-you$/);
  await expect(page.getByText('Tobi', { exact: true })).toBeVisible();
  await button(page, 'Back to Homepage').click();
  await expect(page).toHaveURL(/\/developments\/cityview$/);
});

test('buying steps without the earlier steps go back to the listing', async ({ page }) => {
  for (const step of ['terms', 'email', 'verify', 'details', 'offer', 'pay', 'thank-you']) {
    await page.goto(`/developments/cityview/buy/${step}`);
    await expect(page).toHaveURL(/view=listing/);
  }
});

test('unknown development shows not found', async ({ page }) => {
  const res = await page.goto('/developments/nowhere');
  expect(res?.status()).toBe(404);
  await expect(page.getByText('This page isn’t here.')).toBeVisible();
});
