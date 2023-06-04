import { gqlCall } from '../core/gql-call';
import { ClientContextType } from '../core/types';


export type CategorizeInput = {
  name: string,
  description?: string;
  movementId: string;
} | {
  id: string;
  movementId: string;
}

export function categorize(clientContext: ClientContextType, controller?: AbortController) {
  return ({ movementId, ...input }: CategorizeInput) => {
    const catInput = 'id' in input
    ? `categoryId: ${input.id}`  // existing
    : `category: { name: "${input.name}", description: "${input.description}" }`; // new category

    return gqlCall<{ categorize: { name: string, id?: string } }>(
      JSON.stringify({
        query: `
        mutation Category {
          categorize(input: { ${catInput}, movementIds: ["${movementId}"]}) {
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
}

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
