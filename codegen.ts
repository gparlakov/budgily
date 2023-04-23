
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "./budgily-data/schema/budgily.graphql",
  documents: ["./budgily-data/schema/movements-op.graphql"],
  generates: {
    "./budgily-data/src/generated/": {
      plugins: ["typescript-resolvers", "named-operations-object"],
      preset: 'client'
    }
  }
};

export default config;
