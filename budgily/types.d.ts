export declare global {
  export interface Window {
    dataLayer: [string | object, string | object | number][];
  }
}

window.dataLayer = window.dataLayer || [];
