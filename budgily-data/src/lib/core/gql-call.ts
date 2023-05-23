import { ClientContextType } from './types';

export function gqlCall<T>(
  body: string,
  clientContext: ClientContextType,
  controller?: AbortController): Promise<{ data?: T; errors?: unknown[]; }> {
  return fetch(clientContext.uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body,
    signal: controller?.signal,
  }).then((r) => {
    if (r.status === 200) {
      return r.json();
    }
    console.log(r.headers);
    return r.body
      ?.getReader()
      .read()
      .then((v) => {
        throw new Error(`An error occurred: , /n ${r.statusText} /n${String.fromCodePoint(...(v.value ?? []))}`);
      });
  });
}
