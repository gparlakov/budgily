import { Movement, MovementType } from '../../generated/graphql';
import { ClientContext } from '../core/types';
import { group } from 'd3';

export function getDskReportsV2(
  clientContext: ClientContext,
  controller?: AbortController
): Promise<{ data?: { movements: Movement[] }; errors?: unknown[] }> {
  return fetch(clientContext.uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: `
        query GetAllMovements {
          movements {
            date,
            amount,
            description,
            type
          }
        }
      `,
    }),
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
