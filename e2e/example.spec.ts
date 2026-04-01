import { test, expect } from '@playwright/test'

test('homepage loads and has title', async ({ page }) => {
  await page.goto('http://localhost:5174')

  await expect(page).toHaveTitle(/./)
})
