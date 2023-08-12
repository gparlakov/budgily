import { component$ } from '@builder.io/qwik';
import { DocumentSignature } from 'budgily/src/core/xml/document-signature';
import { Parsed } from 'budgily/src/core/xml/reader';
import { VisualizeXML } from './visualizer';

export interface SelectedLocaleProps {
    file: Document;
    recognized: Record<string, Parsed>;
    signature: DocumentSignature;
}
export const SelectedLocale = component$(({ recognized, ...rest }: SelectedLocaleProps) => {

    return <VisualizeXML first={1} {...rest}>
        {Object.entries(recognized).map(([tag, p]) => {
            switch (p.type) {
                case 'amount':
                    return <div q: slot={tag}>{p.value}</div>
                case 'date':
                    return <div q: slot={tag}>{p.value.toLocaleDateString()}</div>
                default:
                    return '';
            }
        })

        }
    </VisualizeXML>
})
