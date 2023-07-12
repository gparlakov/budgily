
import { dskMovements } from './dsk/dsk-movements';
import { getAllCategories } from './categories/categories';
import { writeFile } from 'fs/promises';

export function importFile() {
  return dskMovements()
    .then((fs) => fs.flatMap(defaultDSKMapper))
    .then((ms) => {
      // include cats so we can filter by them
      const cats = getAllCategories() ?? [];
      return ms.map((m) => {
        m.categories = cats
          .filter((c) => c.movementIds.includes(m.id))
          .map(({ id, name }) => ({ id, name, movementIds: [] }));
        return m;
      });
    })
    .then(dedupe)
    .then((result) => writeFile('db.json', JSON.stringify(result, null, 2)));
}


importFile();
