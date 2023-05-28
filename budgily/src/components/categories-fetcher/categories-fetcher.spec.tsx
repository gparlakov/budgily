import { createDOM } from '@builder.io/qwik/testing';
import { test, expect } from 'vitest';
import { CategoriesFetcher } from './categories-fetcher';

test(`[CategoriesFetcher Component]: Should render`, async () => {
  const { screen, render } = await createDOM();
  await render(<CategoriesFetcher />);
  expect(screen.innerHTML).toContain('CategoriesFetcher works!');
});
