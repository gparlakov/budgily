import { Category, Movement, MutationResolvers, QueryResolvers } from '@codedoc1/budgily-data';
import { max } from 'd3';

let getCats: () => Promise<Category[]>;

async function loadCategories(): Promise<Category[]> {
  if (typeof getCats != 'function') {
    getCats = await import('./read-categories').then((v) => v.readCats);
  }

  return getCats();
}

let storeCats: (c: Category[]) => void;
async function storeCatsFn(c: Category[]): Promise<void> {
  if (typeof storeCats != 'function') {
    storeCats = await import('./store-categories').then((v) => v.storeCats);
  }

  storeCats(c);
  getCats = () => Promise.resolve(c);
}

export function getCategoriesByMovement(): QueryResolvers['categories'] {
  return (parent: Movement) => {
    return loadCategories()
      .then((cs) =>
        parent != null
          ? cs.filter((c) => (Array.isArray(c.movementIds) ? c.movementIds.includes(parent.id) : false))
          : cs
      );
  };
}

export function getAllCategories() {
  return loadCategories();
}

export function categorize(): MutationResolvers['categorize'] {
  return async (_parent, args) => {
    const { category, categoryId, movementIds } = args.input;
    if (!Array.isArray(movementIds)) {
      throw new Error(`Expected an array of movements but got ${movementIds}`);
    }
    if (typeof category === 'object' && category == null) {
      throw new Error('Expected a category but got empty (null|undefined)');
    }
    if (typeof category === 'object' && category?.name == null) {
      throw new Error('Can not create a category without a name');
    }

    let cats = await loadCategories();

    if (typeof categoryId === 'number' && cats.find((c) => c.id === categoryId) == null) {
      throw new Error(
        `Could not find category with id ${categoryId}. Please create a new one or provide a correct category id`
      );
    }

    const isNewCategory = typeof category === 'object' && Array.isArray(movementIds) && category?.name != null;
    let id = categoryId;
    if (isNewCategory) {
      id = (max(cats.map((c) => c.id)) ?? 0) + 1;
      cats = [
        ...cats,
        {
          ...category,
          // next id
          id,
          // add movementIds to category (set makes for unique ids only)
          movementIds: [...new Set([...movementIds, ...movementIds])],
        },
      ];
    } else {
      id = categoryId;
      cats = cats.map((c) =>
        c.id === categoryId ? { ...c, movementIds: [...new Set([...c.movementIds, ...movementIds])] } : c
      );
    }

    // fire and forget - server will keep running and finish the save
    storeCatsFn(cats);

    return cats.find((c) => c.id === id);
  };
}
