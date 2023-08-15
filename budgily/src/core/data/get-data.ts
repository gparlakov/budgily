import { getMovementsFromLocalStorageOrWellKnown } from '@codedoc1/budgily-data-client';
import { debounce } from '../debounce';

const debounceMovementMillis = 300;
export const debouncedGetAllMovements = debounce(getMovementsFromLocalStorageOrWellKnown, debounceMovementMillis);
