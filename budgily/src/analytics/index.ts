type ArrayType<T> = T extends Array<infer R> ? R : never;
// type TagType = ArrayType<typeof window.dataLayer>

// window.dataLayer.push(function() {
//     console.log('---time set')
// })

// declare global {
//     export function gtag(...tag: unknown[]) : void;
// }

// eslint-disable-next-line prefer-rest-params, @typescript-eslint/no-unused-vars
export function gtag(..._args: unknown[]){window.dataLayer.push(arguments);}
