import { component$, useContextProvider, useStyles$, useVisibleTask$ } from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";
import { QwikPartytown } from './components/partytown/partytown';

import globalStyles from './global.scss?inline';
import { ClientContext, createClientContext } from './core/client.context';
import { gtag } from './analytics';
const base = process.env.BUDGILY_BASE ?? '/';

export type RootProps = {
  runGTag?: boolean;
}
export default component$(({ runGTag }: RootProps) => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */
  useStyles$(globalStyles);

  useContextProvider(ClientContext, createClientContext());

  useVisibleTask$(() => {
    if (runGTag) {
      window.dataLayer = window.dataLayer || [];

      gtag('js', new Date());
      gtag('config', 'G-L31J2Q7NQ5');
      console.log('--- initialized data layer', window.dataLayer)
    }
  })

  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <base href={base} />
        <link rel="manifest" href="manifest.json" />
        {/* <QwikPartytown forward={['dataLayer.push']} /> */}
        <script
          async
          // will do nothing unless partytown active b/c of the type - text/partytown
          // type="text/partytown"
          src="https://www.googletagmanager.com/gtag/js?id=G-L31J2Q7NQ5"
        />
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  );
});
