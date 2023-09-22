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
      console.log('pushing out')
      // pushing out to datalayer

    }
  })

  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <base href={base} />
        <link rel="manifest" href="manifest.json" />

        <script dangerouslySetInnerHTML="
          window.dataLayer = window.dataLayer || [];
          console.log('--- initialized data layer', window.dataLayer)
          window.dataLayer.push('js', new Date());
          window.dataLayer.push('config', 'G-L31J2Q7NQ5');
        "/>
        {/* <QwikPartytown forward={['dataLayer.push']} /> */}
        <script
          async
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
