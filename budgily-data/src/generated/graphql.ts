/* eslint-disable */
import { GraphQLResolveInfo } from 'graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Categorize = {
  category?: InputMaybe<CategoryInput>;
  categoryId?: InputMaybe<Scalars['Int']>;
  movementIds: Array<Scalars['String']>;
};

export type Category = {
  __typename?: 'Category';
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  movementIds: Array<Scalars['String']>;
  name: Scalars['String'];
};

export type CategoryInput = {
  description: Scalars['String'];
  name: Scalars['String'];
};

export type Movement = {
  __typename?: 'Movement';
  account?: Maybe<Scalars['String']>;
  amount: Scalars['Float'];
  categories?: Maybe<Array<Maybe<Category>>>;
  date: Scalars['String'];
  description: Scalars['String'];
  id: Scalars['String'];
  opposite?: Maybe<Scalars['String']>;
  raw: Scalars['String'];
  type: MovementType;
};

export type MovementFilter = {
  amountMax?: InputMaybe<Scalars['Float']>;
  amountMin?: InputMaybe<Scalars['Float']>;
  categories?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  fromDate?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Array<Scalars['String']>>;
  search?: InputMaybe<Scalars['String']>;
  toDate?: InputMaybe<Scalars['String']>;
};

export enum MovementType {
  Credit = 'CREDIT',
  Debit = 'DEBIT'
}

export type MovementsQueryResponse = {
  __typename?: 'MovementsQueryResponse';
  movements: Array<Maybe<Movement>>;
  page: Pagination;
  sort?: Maybe<Sort>;
};

export type Mutation = {
  __typename?: 'Mutation';
  categorize?: Maybe<Category>;
};


export type MutationCategorizeArgs = {
  input?: InputMaybe<Categorize>;
};

export type Pagination = {
  __typename?: 'Pagination';
  count: Scalars['Int'];
  currentPage: Scalars['Int'];
  pageCount: Scalars['Int'];
  totalCount: Scalars['Int'];
};

export type PaginationInput = {
  currentPage?: InputMaybe<Scalars['Int']>;
  pageCount?: InputMaybe<Scalars['Int']>;
};

export type Query = {
  __typename?: 'Query';
  categories: Array<Maybe<Category>>;
  hello?: Maybe<Scalars['String']>;
  movements?: Maybe<MovementsQueryResponse>;
};


export type QueryMovementsArgs = {
  filter?: InputMaybe<MovementFilter>;
  pagination?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<SortInput>;
};

export type Sort = {
  __typename?: 'Sort';
  desc?: Maybe<Scalars['Boolean']>;
  field: Scalars['String'];
};

export type SortInput = {
  desc?: InputMaybe<Scalars['Boolean']>;
  field: Scalars['String'];
};

export type GetAllMovementsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllMovementsQuery = { __typename?: 'Query', movements?: { __typename?: 'MovementsQueryResponse', movements: Array<{ __typename?: 'Movement', date: string, description: string, amount: number, type: MovementType } | null> } | null };


export const GetAllMovementsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAllMovements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"movements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"movements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]} as unknown as DocumentNode<GetAllMovementsQuery, GetAllMovementsQueryVariables>;


export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Categorize: Categorize;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Category: ResolverTypeWrapper<Category>;
  CategoryInput: CategoryInput;
  Movement: ResolverTypeWrapper<Movement>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  MovementFilter: MovementFilter;
  MovementType: MovementType;
  MovementsQueryResponse: ResolverTypeWrapper<MovementsQueryResponse>;
  Mutation: ResolverTypeWrapper<{}>;
  Pagination: ResolverTypeWrapper<Pagination>;
  PaginationInput: PaginationInput;
  Query: ResolverTypeWrapper<{}>;
  Sort: ResolverTypeWrapper<Sort>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  SortInput: SortInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Categorize: Categorize;
  Int: Scalars['Int'];
  String: Scalars['String'];
  Category: Category;
  CategoryInput: CategoryInput;
  Movement: Movement;
  Float: Scalars['Float'];
  MovementFilter: MovementFilter;
  MovementsQueryResponse: MovementsQueryResponse;
  Mutation: {};
  Pagination: Pagination;
  PaginationInput: PaginationInput;
  Query: {};
  Sort: Sort;
  Boolean: Scalars['Boolean'];
  SortInput: SortInput;
};

export type CategoryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  movementIds?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MovementResolvers<ContextType = any, ParentType extends ResolversParentTypes['Movement'] = ResolversParentTypes['Movement']> = {
  account?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  categories?: Resolver<Maybe<Array<Maybe<ResolversTypes['Category']>>>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  opposite?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  raw?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['MovementType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MovementsQueryResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['MovementsQueryResponse'] = ResolversParentTypes['MovementsQueryResponse']> = {
  movements?: Resolver<Array<Maybe<ResolversTypes['Movement']>>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Pagination'], ParentType, ContextType>;
  sort?: Resolver<Maybe<ResolversTypes['Sort']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  categorize?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType, Partial<MutationCategorizeArgs>>;
};

export type PaginationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Pagination'] = ResolversParentTypes['Pagination']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  currentPage?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  categories?: Resolver<Array<Maybe<ResolversTypes['Category']>>, ParentType, ContextType>;
  hello?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  movements?: Resolver<Maybe<ResolversTypes['MovementsQueryResponse']>, ParentType, ContextType, Partial<QueryMovementsArgs>>;
};

export type SortResolvers<ContextType = any, ParentType extends ResolversParentTypes['Sort'] = ResolversParentTypes['Sort']> = {
  desc?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  field?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Category?: CategoryResolvers<ContextType>;
  Movement?: MovementResolvers<ContextType>;
  MovementsQueryResponse?: MovementsQueryResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Pagination?: PaginationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Sort?: SortResolvers<ContextType>;
};


export const namedOperations = {
  Query: {
    GetAllMovements: 'GetAllMovements'
  }
}