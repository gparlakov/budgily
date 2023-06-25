import { gqlCall } from '../core/gql-call';
import { ClientContextType } from '../core/types';

export type CategorizeInput =
  | {
      name: string;
      description?: string;
      movementId: string | string[];
    }
  | {
      id: string;
      movementId: string | string[];
    };

export function categorize(clientContext: ClientContextType, controller?: AbortController) {
  return ({ movementId, ...input }: CategorizeInput) => {
    const catInput =
      'id' in input
        ? `categoryId: ${input.id}` // existing
        : `category: { name: "${input.name}", description: "${input.description}" }`; // new category

    return gqlCall<CategorizeResponse>(
      JSON.stringify({
        query: `
        mutation Category {
          categorize(input: { ${catInput}, movementIds: ["${
          Array.isArray(movementId) ? movementId.join('","') : movementId
        }"]}) {
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
  };
}

export interface CategorizeResponse { categorize: { name: string; id?: string } };

export function getCategories(clientContext: ClientContextType, controller?: AbortController) {
  return () =>
    gqlCall<{ categories: Array<{ name: string; id: number; description?: string }> }>(
      JSON.stringify({
        query: `
        query Categories {
          categories {
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
