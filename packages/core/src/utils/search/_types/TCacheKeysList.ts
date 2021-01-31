/** The keys input for when getting multiple items from the cache */
export type TCacheKeysList<K extends [any, ...any[]]> = K extends [infer FK] ? FK[] : K[];
