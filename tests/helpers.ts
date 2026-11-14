import { expect, type Page } from '@playwright/test';

/** The mock API accepts only this code. */
export { MOCK_CODE as CODE } from '../src/lib/api/mock/handlers';

/** Drag a "Slide to …" knob all the way to the right. */
export async function slide(page: Page) {
  const knob = page.getByRole('slider').locator('span').last();
  const box = await knob.boundingBox();
  if (!box) throw new Error('slider knob not visible');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 400, box.y + box.height / 2, { steps: 12 });
  await page.mouse.up();
}

/** Open the listing straight away. */
export async function openListing(page: Page) {
  await page.goto('/developments/cityview?view=listing');
  await expect(page.getByRole('heading', { name: /CityView/ })).toBeVisible();
}

export const button = (page: Page, name: string | RegExp) => page.getByRole('button', { name, exact: typeof name === 'string' });
