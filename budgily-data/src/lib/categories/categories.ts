import { gqlCall } from '../core/gql-call';
import { ClientContextType } from '../core/types';

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
