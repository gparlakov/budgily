import { server$ } from '@builder.io/qwik-city';
import { getAllCategories, categorize } from './categories';

export const getCategories = server$(async function () {
  return getAllCategories();
});

export const doCategorize = server$(categorize)
