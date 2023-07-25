import { createDOM } from '@builder.io/qwik/testing';
import { test, expect } from 'vitest';
import { SelectLocale } from './select-locale';

test(`[SelectLocale Component]: Should render`, async () => {
  const { screen, render } = await createDOM();
  await render(<SelectLocale />);
  expect(screen.innerHTML).toContain('SelectLocale works!');
});
