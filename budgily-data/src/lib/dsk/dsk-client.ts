import { Movement } from '../../generated/graphql';
import { ClientContextType } from '../core/types';

export function getDskReportsV2(
  clientContext: ClientContextType,
  controller?: AbortController
): (from: Date) => Promise<{ data?: { movements: Movement[] }; errors?: unknown[] }> {
  return (from: Date) => fetch(clientContext.uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: `
        query GetAllMovements {
          movements(filter: {fromDate: "${from.toISOString()}" }) {
            date,
            amount,
            description,
            type,
            id
            categories {
              name
            }
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

export function getMovementById(clientContext: ClientContextType, controller?: AbortController) {
  return (id: string) => {
    return gqlCall<{ movements: Movement[] }>(
      JSON.stringify({
        query: `
        query GetAllMovements {
          movements(filter: {id: ["${id}"]}) {
            id,
            account
            amount
            date
            description
            opposite
            type
            raw
            categories {
              description
              movementIds
              name
              id
            }
          }
        }
    `,
      }),
      clientContext,
      controller
    );
  };
}

export function categorize(clientContext: ClientContextType, controller?: AbortController) {
  return (name: string, movementId: string, description?: string) =>
    gqlCall<{ categorize: { name: string } }>(
      JSON.stringify({
        query: `
        mutation Category {
          categorize(input: {category: {name: "${name}", description: "${description}" }, movementIds: ["${movementId}"]}) {
            movementIds
            id
            name
            description
          }
        }
  `,
      }),
      clientContext,
      controller
    );
}

export function getCategories(clientContext: ClientContextType, controller?: AbortController) {
  return () =>
    gqlCall<{ categories: Array<{ name: string; movementIds: string[]; id: string; description?: string }> }>(
      JSON.stringify({
        query: `
        query Categories {
          categories {
            movementIds
            id
            name
            description
          }
        }
  `,
      }),
      clientContext,
      controller
    );
}

function gqlCall<T>(
  body: string,
  clientContext: ClientContextType,
  controller?: AbortController
): Promise<{ data?: T; errors?: unknown[] }> {
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
