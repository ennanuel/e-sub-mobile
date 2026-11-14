import { expect, test } from '@playwright/test';
import { button, CODE, openListing, slide } from './helpers';

test('home page opens the listing with Get started, and back returns', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/developments\/cityview$/);
  await button(page, 'Get started').click();
  await expect(page).toHaveURL(/view=listing/);
  await expect(page.getByText('Starting from')).toBeVisible();
  await expect(page.getByRole('link', { name: /200 sqm/ })).toBeVisible();
  await button(page, 'Back').click();
  await expect(page).toHaveURL(/\/developments\/cityview$/);
  await expect(button(page, 'Get started')).toBeVisible();
});

test('home page opens with a swipe up', async ({ page }) => {
  await page.goto('/developments/cityview');
  await page.waitForLoadState('networkidle');
  const vp = page.viewportSize()!;
  await page.mouse.move(vp.width / 2, vp.height * 0.6);
  await page.mouse.down();
  await page.mouse.move(vp.width / 2, vp.height * 0.15, { steps: 12 });
  await page.mouse.up();
  await expect(page).toHaveURL(/view=listing/);
});

test('listing questions open and close; See all goes to the FAQ', async ({ page }) => {
  await openListing(page);
  const q = button(page, /Where is CityView, Apo Wasa\?/);
  await q.scrollIntoViewIfNeeded();
  await expect(q).toHaveAttribute('aria-expanded', 'false');
  await q.click();
  await expect(q).toHaveAttribute('aria-expanded', 'true');
  const map = page.getByRole('link', { name: /in Google Maps/ });
  await expect(map).toHaveAttribute('href', /google\.com\/maps/);
  await expect(map).toHaveAttribute('target', '_blank');
  await page.getByRole('link', { name: 'See all 20 questions' }).click();
  await expect(page).toHaveURL(/\/faq$/);
});

test('FAQ search highlights matches and opens answers that match', async ({ page }) => {
  await page.goto('/developments/cityview/faq');
  await page.getByLabel('Search the questions').fill('tit');
  await expect(page.locator('mark')).toHaveCount(2);
  await expect(button(page, /What title is on the land\?/)).toBeVisible();
  // "tit" is only in the answer here ("institutions"), so the answer opens.
  await expect(button(page, /What can I do with a commercial plot\?/)).toHaveAttribute('aria-expanded', 'true');
  await page.getByLabel('Search the questions').fill('zzzz');
  await expect(page.getByText('No question matches that.')).toBeVisible();
  await page.getByLabel('Search the questions').fill('');
  await page.getByRole('button', { name: 'Building', exact: true }).click();
  await expect(page.locator('[aria-expanded]')).toHaveCount(4);
});

test('papers: slide, email, wrong code, right code, name, view-only notice, open a paper', async ({ page }) => {
  await openListing(page);
  await page.getByRole('link', { name: /Documents to read/ }).click();
  await expect(page.getByRole('heading', { name: 'Paperwork' })).toBeVisible();
  await slide(page);

  await page.getByLabel('Email address').fill('ada@example.com');
  await button(page, 'Next').click();
  await expect(page.getByRole('heading', { name: 'Enter the code' })).toBeVisible();
  await page.getByLabel('6-digit code').fill('111111');
  await expect(page.getByText('That code is not right.')).toBeVisible();
  await page.getByLabel('6-digit code').fill(CODE);

  await expect(page.getByRole('heading', { name: 'What’s your name?' })).toBeVisible();
  await page.getByLabel('First name').fill('ada');
  await page.getByLabel('Last name').fill('okafor');
  await button(page, 'Next').click();

  await expect(page.getByRole('heading', { name: /View\s*only/ })).toBeVisible();
  await expect(page.getByText(/Opened for Ada Okafor/)).toBeVisible();
  await button(page, 'I understand').click();

  await expect(page.getByRole('heading', { name: /Hi Ada, here are/ })).toBeVisible();
  await button(page, /Open C of O/).click();
  await expect(page).toHaveURL(/doc=cofo/);
  await expect(page.getByAltText('C of O, plot 9142')).toBeVisible();
  await expect(page.getByText('Scroll for plot 9143')).toBeVisible();
  await expect(page.locator('b', { hasText: 'ADA OKAFOR' }).first()).toBeAttached();
});
