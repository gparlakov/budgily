type ArrayType<T> = T extends Array<infer R> ? R : never;
type TagType = ArrayType<typeof window.dataLayer>

window.dataLayer.push(function() {
    console.log('---time set')
})

export function tag(tag: TagType) {
    window.dataLayer.push(tag);
}
