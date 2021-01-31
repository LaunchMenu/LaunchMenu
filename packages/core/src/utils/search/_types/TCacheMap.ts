/**
 * A type to create nested cache maps
 */
export type TCacheMap<K extends any[], V> = K extends [infer K1, ...infer KRest]
    ? Map<K1, TCacheMap<KRest, V>>
    : V;
