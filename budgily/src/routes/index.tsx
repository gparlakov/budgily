import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate, type DocumentHead } from "@builder.io/qwik-city";



export default component$(() => {
  const nav = useNavigate()
  useVisibleTask$(() => {
    console.log('ll')
    nav('/reports');
  });
  return <></>;
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
