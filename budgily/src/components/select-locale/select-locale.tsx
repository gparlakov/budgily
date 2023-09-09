import { QRL, component$, useStylesScoped$ } from '@builder.io/qwik';
import { AutocompleteRoot, AutocompleteLabel, AutocompleteTrigger, AutocompleteInput, AutocompleteButton, AutocompleteListbox, AutocompleteOption } from '@qwik-ui/headless';

import styles from './select-locale.scss?inline';
import localesJSON from './locales.json?inline';
import { skipped } from '../../core/date-parser';

export type Locale = string;
export type Language = string;
export type Country = string;
export type LanguageSlashCountry = `${Language} / ${Country}`

export type Props = {
  selected?: string;
  preferred?: string[];
  onSelect$: QRL<(v: string) => void>
}
export const SelectLocale = component$(({ selected, preferred, onSelect$ }: Props) => {
  useStylesScoped$(styles);

  return (
    <AutocompleteRoot class="relative">
      <AutocompleteLabel class="text-inherit font-semibold">
        Select Locale
      </AutocompleteLabel>
      <AutocompleteTrigger class="flex max-w-xs items-center rounded-sm border-[#7d95b3] border-[1px] relative">
        <AutocompleteInput class="w-full bg-inherit px-2 pr-6" value={selected}/>
        <AutocompleteButton class="w-6 h-6 group absolute right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke-width="2"
            class="stroke-black group-aria-expanded:-rotate-180 transition-transform duration-[450ms]"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </AutocompleteButton>
      </AutocompleteTrigger>
      <AutocompleteListbox class="w-full max-w-sm max-h-[20rem] px-4 py-2 mt-2 rounded-sm border-[1px] bg-white overflow-auto">
        {Object.entries(localesJSON)
        // if preferred
          .filter(([locale]) => !preferred || preferred.includes(locale))
          .map(([key, value]) =>
            <AutocompleteOption class="rounded-sm px-2 hover:bg-[#496080] focus:bg-[#496080]"
              key={key} optionValue={`${value} ${key}`} aria-selected={selected === key}
              onClick$={() => onSelect$(key)}
              onKeyDown$={(e) => e.key === 'Enter' && onSelect$(key)}
              disabled={skipped.includes(key)}
            >{value} {skipped.includes(key) && 'Not Supported'}</AutocompleteOption>
          )}
      </AutocompleteListbox>
    </AutocompleteRoot>
  )
});
