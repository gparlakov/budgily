import { Movement, Pagination, Sort } from '../../generated/graphql';
import { ClientContextType } from '../core/types';
import { gqlCall } from '../core/gql-call';

export function getDskReportsV2(
  clientContext: ClientContextType,
  controller?: AbortController
): (filter: {
  categories?: string[];
  from?: Date;
  to?: Date;
}) => Promise<{ data?: { movements: { movements: Movement[]; page: Pagination; sort: Sort } }; errors?: unknown[] }> {
  return ({ from, categories, to } = {}) =>
    fetch(clientContext.uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: `
        query GetAllMovements {
          movements(filter: {${from ? `fromDate: "${from.toISOString()}"` : ''}${
          to ? `toDate: "${to.toISOString()}"` : ''
        }${
          Array.isArray(categories) && categories.length > 0
            ? `categories: [${categories.map((c) => `"${c}"`).join(',')}]`
            : ''
        }
            }) {
              movements {
                date,
                amount,
                description,
                type,
                id
                categories {
                  name
                }
              }
              page {
                totalCount
                count
                currentPage 
                pageCount
              }
              sort {
                field
                desc
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
    return gqlCall<{ movements: { movements: Movement[] } }>(
      JSON.stringify({
        query: `
        query GetAllMovements {
          movements(filter: {id: ["${id}"]}) {
            movements {
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
        }
    `,
      }),
      clientContext,
      controller
    );
  };
}
