import { component$, useContextProvider, useStyles$ } from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

import globalStyles from './global.scss?inline';
import { ClientContext, createClientContext } from './core/client.context';
const base = process.env.BUDGILY_BASE ?? '/';

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */
  useStyles$(globalStyles);

  useContextProvider(ClientContext, createClientContext());

  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <base href={base} />
        <link rel="manifest" href="manifest.json" />
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  );
});
